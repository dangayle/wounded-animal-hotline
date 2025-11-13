# Wounded Animal Hotline - Twilio Functions

This directory contains the serverless functions that power the Wounded Animal Hotline voice system using Twilio ConversationRelay and Anthropic Claude.

## Architecture Overview

```
Incoming Call → incoming-call.js (TwiML) → ConversationRelay → conversation-relay.js (WebSocket) → Claude AI
                                                                                                      ↓
                                                                                    Contact Database + System Prompt
```

## Files

### `incoming-call.js`
**Purpose**: Handles incoming voice calls and initiates ConversationRelay session

**Flow**:
1. Receives incoming call webhook from Twilio
2. Returns TwiML with ConversationRelay configuration
3. Configures voice (Amazon Polly Neural - Joanna), transcription (Deepgram), and AI provider (Anthropic)
4. Points ConversationRelay to the `conversation-relay.js` webhook endpoint

**Environment Variables Required**:
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude access
- `DOMAIN_NAME` - Automatically provided by Twilio Functions

**Twilio Webhook Configuration**:
- Set this function as the webhook for "A Call Comes In" on your Twilio phone number
- HTTP Method: POST
- URL: `https://your-service.twil.io/incoming-call`

### `conversation-relay.js`
**Purpose**: Handles ConversationRelay WebSocket events and manages AI conversation

**WebSocket Events Handled**:
- `setup` - Initialize conversation with system prompt and context
- `prompt` - Process user speech input and generate AI response
- `interrupt` - Handle user interruptions
- `dtmf` - Handle DTMF tones (currently disabled)
- `error` - Handle errors gracefully

**Features**:
- Loads system prompt from `/assets/system-prompt.txt`
- Loads contact database from `/assets/contacts.json`
- Provides current Pacific timezone date/time to AI
- Maintains conversation history/memory
- Integrates with Anthropic Claude API
- Formats responses for TTS optimization

**Environment Variables Required**:
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude access

### `helpers/contact-lookup.js`
**Purpose**: Utility functions for filtering and matching wildlife contacts

**Functions**:
- `servesCounty(contact, county)` - Check if contact serves a specific county
- `handlesAnimalType(contact, animalType)` - Check if contact handles animal type
- `providesService(contact, service)` - Check if contact provides service
- `isCurrentlyOpen(contact, time)` - Check if contact is currently open
- `filterContacts(contacts, criteria)` - Filter contacts by multiple criteria
- `getEmergencyContacts(contacts)` - Get 24/7 emergency contacts
- `sortByPriority(contacts)` - Sort contacts by priority
- `formatPhoneForVoice(phone)` - Format phone number for TTS (e.g., "five zero nine, three three five...")
- `formatPhoneForText(phone)` - Format phone number for SMS (e.g., "509-335-0711")

**Usage Example**:

> **Note:** The following example uses `Runtime.getFunctions()` to load helper functions, which is specific to the [Twilio Functions](https://www.twilio.com/docs/runtime/functions) environment. In standard Node.js, you would use `require('./helpers/contact-lookup')` instead.

```javascript
const contactLookup = require(runtime.getFunctions()['helpers/contact-lookup'].path);

// Filter contacts by criteria
const matches = contactLookup.filterContacts(contacts.contacts, {
  county: 'Spokane',
  animalType: 'small_mammals',
  service: 'emergency_wildlife_medical',
  requireOpen: true,
  rabiesVector: false
});

// Sort by priority
const prioritized = contactLookup.sortByPriority(matches);

// Format phone for voice
const spoken = contactLookup.formatPhoneForVoice('+15093350711');
// Returns: "five zero nine, three three five, zero seven one one"
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd src
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `src/` directory:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Deploy to Twilio
```bash
npm run deploy
```

Or using Twilio CLI directly:
```bash
twilio serverless:deploy
```

### 4. Configure Twilio Phone Number
1. Go to Twilio Console → Phone Numbers
2. Select your phone number
3. Under "Voice & Fax", set:
   - "A Call Comes In" → Function
   - Select your service and the `incoming-call` function
   - HTTP POST
4. Save

## Local Development

### Run Locally
```bash
npm start
```

This starts the Twilio Functions local dev server at `http://localhost:3000`

### Test Incoming Call Handler
```bash
curl -X POST http://localhost:3000/incoming-call \
  -d "CallSid=CA1234567890" \
  -d "From=%2B15551234567" \
  -d "To=%2B15099999999"
```

### Test ConversationRelay Webhook
```bash
curl -X POST http://localhost:3000/conversation-relay \
  -H "Content-Type: application/json" \
  -d '{
    "type": "setup",
    "callSid": "CA1234567890"
  }'
```

## ConversationRelay Configuration

### Voice Settings
- **Provider**: Amazon Polly Neural
- **Voice**: Joanna
- **Language**: en-US
- **Engine**: Neural

### Transcription Settings
- **Provider**: Deepgram
- **Model**: nova-2-conversationalai

### AI Provider Settings
- **Provider**: Anthropic
- **Model**: claude-3-5-sonnet-20241022
- **Temperature**: 0.7
- **Max Tokens**: 1024

## Conversation Flow

1. **Safety Assessment** - Immediate safety check
2. **Location Gathering** - County/city for routing
3. **Animal Identification** - Species, size, type
4. **Condition Assessment** - Injury severity, behavior
5. **Intelligent Routing** - Auto-match to best contact
6. **Contact Information** - Provide phone, hours, instructions
7. **Safety Instructions** - Reinforce safety protocols

## Assets Required

The functions expect these assets in `src/assets/`:
- `system-prompt.txt` - Comprehensive AI system prompt (450 lines)
- `contacts.json` - Wildlife contact database (21 contacts)
- `contact.schema.json` - JSON schema for contact validation

## Debugging

### Enable Debug Logging
In `incoming-call.js`, set:
```javascript
conversationRelay.debug = true;
```

### View Logs
```bash
twilio serverless:logs --tail
```

Or in Twilio Console:
- Monitor → Logs → Functions

### Common Issues

**Error: "Unable to connect to websocket URL"**
- Check that `conversation-relay.js` is deployed
- Verify the URL is accessible: `https://your-service.twil.io/conversation-relay`
- Ensure environment variables are set

**Error: "ANTHROPIC_API_KEY not configured"**
- Add API key to Twilio Functions environment variables
- Redeploy after adding

**TTS Voice Configuration Requirements**
- Voice configuration must use an object with `provider`, `voice`, and `engine` properties
- Example (required format): `{ provider: 'amazon-polly', voice: 'Joanna', engine: 'neural' }`

**Timeout Errors**
- Claude API calls can take 2-5 seconds
- Twilio Functions have 10-second timeout for webhooks
- If hitting timeouts, reduce `max_tokens` or optimize prompt

## Performance Considerations

- System prompt is loaded once per webhook invocation (cached in memory during execution)
- Contact database is ~10KB JSON, loaded on each request
- Claude API calls typically take 1-3 seconds
- Total latency: 2-5 seconds per user response

## Security

- API keys stored in Twilio environment variables (encrypted)
- No sensitive data logged
- Conversation history stored in ConversationRelay memory (ephemeral)
- No PII stored or transmitted outside Twilio/Anthropic

## Testing

### Unit Tests
```bash
npm test
```

### Integration Testing
Use Twilio Console → Phone Numbers → Test to make test calls

### Load Testing
- Twilio Functions auto-scale
- Claude API rate limits apply (check Anthropic dashboard)
- Monitor concurrent calls in Twilio Console

## Monitoring

Key metrics to monitor:
- Call duration (avg: 2-5 minutes)
- Function execution time (should be < 5 seconds)
- Error rate (target: < 1%)
- Claude API latency
- Transcription accuracy

## Cost Estimation

Per call costs:
- Twilio voice: ~$0.02/minute
- Twilio ConversationRelay: ~$0.05/minute
- Deepgram transcription: ~$0.01/minute
- Claude API: ~$0.10-0.30/call (varies by length)
- **Total**: ~$0.20-0.50 per call

## Roadmap

Future enhancements:
- [ ] Add conversation analytics
- [ ] Implement sentiment analysis
- [ ] Add multi-language support
- [ ] SMS/text message support
- [ ] Web chat integration
- [ ] Call recording and quality assurance
- [ ] Real-time dashboard for call monitoring

## License

MIT License - See LICENSE file in repository root

## Support

For issues or questions:
- GitHub Issues: https://github.com/dangayle/wounded-animal-hotline/issues
- Documentation: https://github.com/dangayle/wounded-animal-hotline/tree/main/docs