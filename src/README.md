# Wounded Animal Hotline - Source Code

This directory contains the Twilio serverless functions and assets for the Wounded Animal Hotline.

## Directory Structure

```
src/
├── assets/                    # Static assets (protected)
│   ├── contacts.json         # Wildlife contact database
│   └── system-prompt.txt     # AI conversation prompt
├── functions/                # Twilio Functions (endpoints)
│   ├── incoming-call.js      # Call handler & ConversationRelay setup
│   ├── conversation-relay.js # Main AI conversation logic
│   ├── send-sms.js           # Optional SMS follow-up
│   └── helpers/              # Utility modules
│       └── contact-lookup.js # Smart contact filtering
├── .env.example              # Environment variables template
└── package.json              # Project dependencies
```

## Assets

Assets are **protected** resources that are accessible by Functions but not publicly available.

- **contacts.json**: Database of wildlife rehabilitation centers, emergency services, and government agencies
- **system-prompt.txt**: AI system prompt for Claude conversation handling

## Functions

Functions are serverless endpoints hosted on Twilio:

- **incoming-call.js**: Receives incoming calls and initializes ConversationRelay
- **conversation-relay.js**: Processes ConversationRelay events and manages AI conversations
- **send-sms.js**: Sends SMS follow-up messages with contact information (optional)

### Helpers

Helper modules contain reusable logic:

- **contact-lookup.js**: Filters and prioritizes contacts based on location, animal type, urgency, and time of day

## Environment Variables

Required environment variables (see `.env.example`):

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

## Development

### Local Testing

```bash
# Install Twilio CLI (if not already installed)
npm install -g twilio-cli

# Install serverless plugin
twilio plugins:install @twilio-labs/plugin-serverless

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run locally
twilio serverless:start
```

### Deployment

```bash
# Deploy to Twilio
twilio serverless:deploy
```

Or use the automated GitHub Actions workflow (pushes to main branch).

## Dependencies

- **@anthropic-ai/sdk**: Anthropic Claude AI SDK for conversation handling
- **twilio**: Pre-installed in Twilio Functions runtime

## Next Steps

1. ✅ Project setup complete
2. Create contact database (`assets/contacts.json`)
3. Design AI system prompt (`assets/system-prompt.txt`)
4. Build incoming call handler (`functions/incoming-call.js`)
5. Build conversation relay webhook (`functions/conversation-relay.js`)
6. Build contact lookup utility (`functions/helpers/contact-lookup.js`)
7. Test and deploy

## Resources

- [Twilio Functions Documentation](https://www.twilio.com/docs/serverless/functions-assets)
- [Twilio ConversationRelay Documentation](https://www.twilio.com/docs/voice/conversational-relay)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
