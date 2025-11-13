/**
 * Wounded Animal Hotline - Incoming Call Handler
 *
 * This Twilio Function handles incoming voice calls and initiates a ConversationRelay
 * session with Anthropic Claude for AI-powered wildlife triage.
 *
 * Flow:
 * 1. Receive incoming call
 * 2. Return TwiML with ConversationRelay configuration
 * 3. ConversationRelay connects to WebSocket endpoint
 * 4. AI conversation handles wildlife triage and resource routing
 */

const Twilio = require('twilio');

exports.handler = async function(context, event, callback) {
  // Create a new Twilio Response object
  const twiml = new Twilio.twiml.VoiceResponse();

  try {
    // Get the ConversationRelay webhook URL from environment variables
    // This should point to the conversation-relay.js function endpoint
    const conversationRelayUrl = `https://${context.DOMAIN_NAME}/conversation-relay`;

    // Get the Anthropic API key from environment variables
    const anthropicApiKey = context.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      twiml.say('We apologize, but the service is currently unavailable. Please try again later.');
      return callback(null, twiml);
    }

    // Configure ConversationRelay with Claude
    const connect = twiml.connect();
    connect.conversationRelay({
      url: conversationRelayUrl,
      voice: {
        provider: 'amazon-polly',
        voice: 'Joanna',
        engine: 'neural'
      },
      language: 'en-US',
      transcriptionProvider: 'deepgram',
      transcriptionModel: 'nova-2-conversationalai',
      dtmfDetection: false,
      debug: false
    });

    console.log('ConversationRelay initiated for call:', event.CallSid);

  } catch (error) {
    console.error('Error setting up ConversationRelay:', error);
    twiml.say('We apologize, but we encountered an error. Please try again later.');
  }

  // Return the TwiML response
  return callback(null, twiml);
};
