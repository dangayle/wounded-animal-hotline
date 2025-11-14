/**
 * Wounded Animal Hotline - Cloudflare Worker with WebSocket Support
 *
 * Handles Twilio ConversationRelay WebSocket connections and integrates with
 * Anthropic Claude for AI-powered wildlife triage conversations.
 */

import Anthropic from '@anthropic-ai/sdk';
import contactsJson from './assets/contacts.json' assert { type: 'json' };
import systemPromptTxt from './assets/system-prompt.txt';
import { sendFollowUpSMS } from './send-sms.js';

// Debug logging
console.log('contactsJson imported:', typeof contactsJson, contactsJson);
console.log('contactsJson.contacts:', contactsJson?.contacts);
console.log('contactsJson.contacts.length:', contactsJson?.contacts?.length);

/**
 * Get current Pacific timezone date/time
 */
function getPacificDateTime() {
  const now = new Date();
  const options = {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return now.toLocaleString('en-US', options);
}

/**
 * Build conversation context with contacts database
 */
function buildConversationContext() {
  const datetime = getPacificDateTime();
  console.log('buildConversationContext - contactsJson:', contactsJson);
  const contactCount = contactsJson?.contacts?.length || 0;
  console.log('buildConversationContext - contactCount:', contactCount);

  return `
CURRENT CONTEXT:
- Date/Time: ${datetime} (Pacific Time)
- Channel: voice (phone call via ConversationRelay)
- Available contacts: ${contactCount} wildlife resources in database

CONTACT DATABASE:
${JSON.stringify(contactsJson, null, 2)}

Remember: Keep responses SHORT (2-3 sentences max, under 100 words) for voice clarity.
Format phone numbers for speech: "five zero nine, three three five, zero seven one one"
Always repeat phone numbers twice.
`;
}

/**
 * Handle incoming call - Return TwiML to start ConversationRelay
 */
function handleIncomingCall(request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Cloudflare Workers automatically handle wss:// protocol
  const conversationRelayUrl = baseUrl.replace('https:', 'wss:').replace('http:', 'ws:') + '/conversation-relay';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay url="${conversationRelayUrl}" ttsProvider="Google" voice="en-AU-Chirp3-HD-Charon" language="en-AU" transcriptionProvider="deepgram" transcriptionModel="nova-2-conversationalai" dtmfDetection="false" debug="false"/>
  </Connect>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' }
  });
}

/**
 * Handle setup message from Twilio
 */
async function handleSetup(ws, message, memory) {
  console.log('Setup received:', {
    sessionId: message.sessionId,
    callSid: message.callSid,
    from: message.from,
    to: message.to
  });

  // Store caller information in memory for SMS follow-up
  memory.callerNumber = message.from;
  memory.twilioNumber = message.to;
  memory.callSid = message.callSid;
  memory.smsOptIn = false;

  // Send initial greeting
  const initialMessage = "Hello, this is the Wounded Animal Hotline. I'm here to help you find the right resource. What kind of animal is it, and where are you located?";

  try {
    const wsMessage = JSON.stringify({
      type: 'text',
      token: initialMessage,
      last: true
    });
    console.log('Sending initial greeting:', wsMessage);
    ws.send(wsMessage);
  } catch (error) {
    console.error('Error sending initial greeting:', error);
  }
}

/**
 * Handle prompt message (user spoke)
 */
async function handlePrompt(ws, message, env, memory) {
  const userMessage = message.voicePrompt || '';
  console.log('User said:', userMessage);

  // Validate Anthropic API key
  const anthropicApiKey = env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    ws.send(JSON.stringify({
      type: 'text',
      token: "I apologize, but the service is currently unavailable. Please try again later.",
      last: true
    }));
    return;
  }

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Build conversation history
    const conversationHistory = memory.messages || [];
    const MAX_HISTORY_LENGTH = 10;
    const limitedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);

    const messages = [
      ...limitedHistory,
      {
        role: 'user',
        content: userMessage,
      }
    ];

    // Build system prompt with current context
    const conversationContext = buildConversationContext();
    const fullSystemPrompt = `${systemPromptTxt}\n\n${conversationContext}`;

    // Call Claude API
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      temperature: 0.7,
      system: fullSystemPrompt,
      messages: messages,
    });

    // Extract response text
    const assistantMessage = claudeResponse.content[0].text;
    console.log('Claude response:', assistantMessage);

    // Update memory
    memory.messages = [
      ...limitedHistory,
      {
        role: 'user',
        content: userMessage,
      },
      {
        role: 'assistant',
        content: assistantMessage,
      }
    ];

    // If SMS opt-in was confirmed and we have contact info, trigger SMS sending
    if (memory.smsOptIn && !memory.smsSent && memory.callerNumber) {
      // Extract animal type and county from conversation if available
      const animalType = memory.animalType || null;
      const county = memory.county || null;
      const contacts = memory.providedContacts || [];

      if (contacts.length > 0) {
        console.log('Triggering SMS send to:', memory.callerNumber);

        // Send SMS asynchronously (don't wait for completion)
        sendFollowUpSMS(env, {
          to: memory.callerNumber,
          from: memory.twilioNumber,
          contacts: contacts,
          animalType: animalType,
          county: county,
          callSid: memory.callSid
        }).then(result => {
          if (result.success) {
            console.log('SMS sent successfully:', result.messageSid);
            memory.smsSent = true;
          } else {
            console.error('SMS send failed:', result.error);
          }
        }).catch(error => {
          console.error('SMS send error:', error);
        });
      }
    }

    // Send response back over WebSocket
    try {
      const message = JSON.stringify({
        type: 'text',
        token: assistantMessage,
        last: true
      });
      console.log('Sending Claude response via WebSocket');
      ws.send(message);
    } catch (error) {
      console.error('Error sending Claude response:', error);
    }

  } catch (error) {
    console.error('Error calling Claude API:', error);
    try {
      ws.send(JSON.stringify({
        type: 'text',
        token: "I apologize, I'm having trouble processing that. Could you please repeat?",
        last: true
      }));
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
}

/**
 * Handle interrupt message (user interrupted AI)
 */
function handleInterrupt(ws, message) {
  console.log('User interrupted:', {
    utteranceUntilInterrupt: message.utteranceUntilInterrupt,
    durationMs: message.durationUntilInterruptMs
  });
  // Interrupt acknowledged - no response needed, Twilio handles stopping speech
  // Keep the WebSocket open and wait for the next prompt
}

/**
 * Handle DTMF message (keypad press)
 */
function handleDtmf(ws, message) {
  const digit = message.digit;
  console.log('DTMF received:', digit);
  // Could handle keypad input here if needed in the future
}

/**
 * Handle error message from Twilio
 */
function handleError(ws, message) {
  console.error('ConversationRelay error:', message.description);
}

/**
 * Process incoming WebSocket message
 */
async function handleWebSocketMessage(ws, messageData, env, memory) {
  try {
    const message = JSON.parse(messageData);
    console.log('Received message type:', message.type);

    switch (message.type) {
      case 'setup':
        await handleSetup(ws, message, memory);
        break;

      case 'prompt':
        await handlePrompt(ws, message, env, memory);
        break;

      case 'interrupt':
        handleInterrupt(ws, message);
        break;

      case 'dtmf':
        handleDtmf(ws, message);
        break;

      case 'error':
        handleError(ws, message);
        break;

      default:
        console.log('Unknown message type:', message.type, 'Full message:', message);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error, 'Stack:', error.stack);
      try {
        ws.send(JSON.stringify({
          type: 'text',
          token: "I apologize, I'm having technical difficulties. Please try again.",
          last: true
        }));
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
}

/**
 * Main Worker export
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Protocol',
    };

    // Handle OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (request.method === 'GET' && path === '/') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'wounded-animal-hotline-relay',
          version: '1.0.0',
          endpoints: ['/incoming-call', '/conversation-relay', '/send-sms'],
          contactsLoaded: contactsJson?.contacts?.length || 0,
          promptLoaded: systemPromptTxt ? true : false,
          features: ['WebSocket', 'ConversationRelay', 'Anthropic Claude', 'Wildlife Triage', 'SMS Follow-up']
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Incoming call handler - returns TwiML
    if (request.method === 'POST' && path === '/incoming-call') {
      return handleIncomingCall(request);
    }

    // SMS follow-up endpoint
    if (request.method === 'POST' && path === '/send-sms') {
      try {
        const body = await request.json();
        const { to, from, contacts, animalType, county, callSid } = body;

        // Validate required fields
        if (!to || !from || !contacts || contacts.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Missing required fields: to, from, contacts'
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }

        // Send SMS
        const result = await sendFollowUpSMS(env, {
          to,
          from,
          contacts,
          animalType,
          county,
          callSid
        });

        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      } catch (error) {
        console.error('Error in SMS endpoint:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || 'Failed to process SMS request'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

    // WebSocket endpoint for ConversationRelay
    if (path === '/conversation-relay') {
      const upgradeHeader = request.headers.get('Upgrade');

      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', {
          status: 426,
          headers: corsHeaders
        });
      }

      // Create WebSocket pair
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // Accept the server-side WebSocket
      server.accept();

      // Initialize conversation memory
      const memory = {
        messages: []
      };

      // Set up WebSocket event handlers
      server.addEventListener('message', async (event) => {
        try {
          await handleWebSocketMessage(server, event.data, env, memory);
        } catch (error) {
          console.error('Fatal error in message handler:', error);
        }
      });

      server.addEventListener('close', (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      });

      server.addEventListener('error', (event) => {
        console.error('WebSocket error event:', event);
      });

      // Return the client-side WebSocket to complete the upgrade
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found', path: path }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};
