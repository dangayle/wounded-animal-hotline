/**
 * Wounded Animal Hotline - ConversationRelay Webhook Handler
 *
 * This Twilio Function handles WebSocket events from ConversationRelay,
 * managing the AI conversation flow with Anthropic Claude.
 *
 * WebSocket Event Flow:
 * 1. setup - Initialize conversation with system prompt and context
 * 2. prompt - Handle user speech/input
 * 3. interrupt - Handle user interruptions
 * 4. dtmf - Handle DTMF tones (if enabled)
 * 5. error - Handle errors
 */

const Twilio = require("twilio");
const Anthropic = require("@anthropic-ai/sdk");

// Helper to load system prompt from assets
async function loadSystemPrompt(context) {
  try {
    const asset = context.getAssets()["/system-prompt.txt"];
    const filePath = asset.path;
    const fs = require("fs").promises;
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("System prompt file not found:", error);
    } else if (error.code === "EACCES") {
      console.error("Permission denied reading system prompt:", error);
    } else {
      console.error("Error loading system prompt:", error);
    }
    // Fallback to basic system prompt
    return `You are a compassionate wildlife triage specialist for Eastern Washington.
Your goal is to:
1. Ensure caller safety first
2. Gather critical information quickly
3. Route caller to the correct wildlife resource

Always ask about safety first, then location, then animal details.
Keep responses under 100 words for voice clarity.`;
  }
}

// Helper to load contacts database from assets
async function loadContacts(context) {
  try {
    const asset = context.getAssets()["/contacts.json"];
    const filePath = asset.path;
    const fs = require("fs").promises;
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Contacts file not found:", error);
    } else if (error.code === "EACCES") {
      console.error("Permission denied reading contacts:", error);
    } else {
      console.error("Error loading contacts:", error);
    }
    return { contacts: [] };
  }
}

// Helper to format date/time for Pacific timezone
function getPacificDateTime() {
  const now = new Date();
  const options = {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return now.toLocaleString("en-US", options);
}

// Helper to build context for Claude
function buildConversationContext(contacts) {
  const datetime = getPacificDateTime();

  return `
CURRENT CONTEXT:
- Date/Time: ${datetime} (Pacific Time)
- Channel: voice (phone call via ConversationRelay)
- Available contacts: ${contacts.contacts.length} wildlife resources in database

CONTACT DATABASE:
${JSON.stringify(contacts, null, 2)}

Remember: Keep responses SHORT (2-3 sentences max, under 100 words) for voice clarity.
Format phone numbers for speech: "five zero nine, three three five, zero seven one one"
Always repeat phone numbers twice.
`;
}

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  try {
    const eventType = event.type;

    console.log(
      "ConversationRelay event:",
      eventType,
      "CallSid:",
      event.callSid,
    );

    switch (eventType) {
      case "setup":
        await handleSetup(context, event, response, callback);
        break;

      case "prompt":
        await handlePrompt(context, event, response, callback);
        break;

      case "interrupt":
        await handleInterrupt(context, event, response, callback);
        break;

      case "dtmf":
        await handleDtmf(context, event, response, callback);
        break;

      case "error":
        await handleError(context, event, response, callback);
        break;

      default:
        console.log("Unknown event type:", eventType);
        response.setBody({ error: "Unknown event type" });
        response.setStatusCode(400);
        return callback(null, response);
    }
  } catch (error) {
    console.error("Error in conversation-relay handler:", error);
    response.setBody({ error: "Internal server error" });
    response.setStatusCode(500);
    return callback(null, response);
  }
};

/**
 * Handle setup event - Initialize the conversation
 */
async function handleSetup(context, event, response, callback) {
  try {
    // Load system prompt and contacts
    const systemPrompt = await loadSystemPrompt(context);
    const contacts = await loadContacts(context);
    const conversationContext = buildConversationContext(contacts);

    // Combine system prompt with context
    const fullSystemPrompt = `${systemPrompt}\n\n${conversationContext}`;

    // Initial greeting for the caller
    const initialMessage =
      "Hello, this is the Wounded Animal Hotline. I'm here to help you find the right resource. What kind of animal is it, and where are you located?";

    // Return setup configuration (voice is already configured in incoming-call.js)
    response.setBody({
      config: {
        provider: {
          name: "anthropic",
          model: "claude-haiku-4-5",
          temperature: 0.7,
          max_tokens: 1024,
        },
        system: fullSystemPrompt,
        initial_message: initialMessage,
      },
    });

    console.log("Setup complete for call:", event.callSid);
    return callback(null, response);
  } catch (error) {
    console.error("Error in handleSetup:", error);
    response.setBody({
      config: {
        provider: {
          name: "anthropic",
          model: "claude-haiku-4-5",
          temperature: 0.7,
          max_tokens: 1024,
        },
        system:
          "You are a helpful wildlife triage assistant. Keep responses brief.",
        initial_message: "Hello, how can I help you with a wildlife situation?",
      },
    });
    return callback(null, response);
  }
}

/**
 * Handle prompt event - Process user input
 */
async function handlePrompt(context, event, response, callback) {
  try {
    const userMessage = event.voicePrompt || "";
    const conversationHistory = event.memory?.messages || [];

    console.log("User said:", userMessage);

    // Validate Anthropic API key before initializing client
    const anthropicApiKey = context.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      console.error("ANTHROPIC_API_KEY not configured");
      response.setBody({
        response:
          "I apologize, but the service is currently unavailable. Please try again later.",
        memory: event.memory || { messages: [] },
      });
      return callback(null, response);
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Implement conversation memory limit (keep last 10 messages = 5 exchanges)
    const MAX_HISTORY_LENGTH = 10;
    const limitedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);

    // Build messages array for Claude
    const messages = [
      ...limitedHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    // Load system prompt and contacts (cache in memory to avoid repeated file loads)
    const systemPrompt =
      event.memory?.systemPrompt || (await loadSystemPrompt(context));
    const contacts = event.memory?.contacts || (await loadContacts(context));
    const conversationContext = buildConversationContext(contacts);
    const fullSystemPrompt = `${systemPrompt}\n\n${conversationContext}`;

    // Call Claude API
    const claudeResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      temperature: 0.7,
      system: fullSystemPrompt,
      messages: messages,
    });

    // Extract response text
    const assistantMessage = claudeResponse.content[0].text;

    console.log("Claude response:", assistantMessage);

    // Return response with cached resources
    response.setBody({
      response: assistantMessage,
      memory: {
        messages: [
          ...limitedHistory,
          {
            role: "user",
            content: userMessage,
          },
          {
            role: "assistant",
            content: assistantMessage,
          },
        ],
        systemPrompt: systemPrompt,
        contacts: contacts,
      },
    });

    return callback(null, response);
  } catch (error) {
    console.error("Error in handlePrompt:", error);

    // Return error response
    response.setBody({
      response:
        "I apologize, but I'm having trouble processing that. Could you please repeat?",
      memory: event.memory || { messages: [] },
    });

    return callback(null, response);
  }
}

/**
 * Handle interrupt event - User interrupted the AI response
 */
async function handleInterrupt(context, event, response, callback) {
  console.log("User interrupted at:", event.callSid);

  // Acknowledge the interrupt
  response.setBody({
    action: "stop",
    memory: event.memory || { messages: [] },
  });

  return callback(null, response);
}

/**
 * Handle DTMF event - User pressed a key (if DTMF detection enabled)
 */
async function handleDtmf(context, event, response, callback) {
  const digit = event.digit;
  console.log("DTMF received:", digit);

  // For now, just acknowledge
  response.setBody({
    memory: event.memory || { messages: [] },
  });

  return callback(null, response);
}

/**
 * Handle error event - Something went wrong
 */
async function handleError(context, event, response, callback) {
  console.error("ConversationRelay error:", event.error);

  // Return error acknowledgment
  response.setBody({
    response:
      "I apologize, but I'm experiencing technical difficulties. Please try calling again.",
    memory: event.memory || { messages: [] },
  });

  return callback(null, response);
}
