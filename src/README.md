# Wounded Animal Hotline - Cloudflare Worker

This directory contains the Cloudflare Worker implementation for the Wounded Animal Hotline ConversationRelay system.

## Architecture

```
┌─────────────────┐
│  Caller dials   │
│  +15092108184   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Twilio Phone Number                │
│  Configured to call:                │
│  /incoming-call endpoint            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Cloudflare Worker                  │
│  wounded-animal-hotline-relay       │
│                                     │
│  Endpoints:                         │
│  • GET  /                          │
│    (health check)                   │
│  • POST /incoming-call             │
│    (returns TwiML to start relay)   │
│  • POST /conversation-relay        │
│    (handles ConversationRelay       │
│     webhook events)                 │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Anthropic Claude API               │
│  claude-3-5-haiku-20241022          │
│  (AI conversation processing)       │
└─────────────────────────────────────┘
```

## Files

- `index.js` - Main Cloudflare Worker code
- `wrangler.toml` - Wrangler configuration
- `package.json` - Dependencies
- `assets/contacts.json` - Wildlife contacts database (21 entries)
- `assets/system-prompt.txt` - AI system prompt (450 lines)
- `assets/contact.schema.json` - JSON schema for contacts

## Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Wrangler CLI** installed (`npm install -g wrangler`)
3. **Anthropic API Key** for Claude
4. **Twilio Account** with ConversationRelay enabled
5. **Node.js 18+**

## Setup & Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Set Secrets (Environment Variables)

The worker requires the Anthropic API key as a secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
# When prompted, paste your Anthropic API key
```

### 4. Deploy to Cloudflare

```bash
npm run deploy
# or
wrangler deploy
```

After deployment, note the Worker URL (e.g., `https://wounded-animal-hotline-relay.your-subdomain.workers.dev`)

### 5. Configure Twilio Phone Number

Update your Twilio phone number to point to the Worker:

```bash
# Via Twilio CLI
twilio phone-numbers:update PNe135398f85c88d6cecb924d5c78be4c4 \
  --voice-url="https://wounded-animal-hotline-relay.dan-gayle.workers.dev/incoming-call"
```

Or via the [Twilio Console](https://console.twilio.com/):
1. Go to Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Under "Voice Configuration":
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-worker-url.workers.dev/incoming-call`
   - **HTTP**: POST

## Local Development

Run the worker locally for testing:

```bash
npm run dev
# or
wrangler dev --local
```

The worker will be available at `http://localhost:8787`

### Testing Locally

**Health Check:**
```bash
curl http://localhost:8787/
```

**Test incoming call endpoint (returns TwiML):**
```bash
curl -X POST http://localhost:8787/incoming-call
```

**Test ConversationRelay webhook:**
```bash
curl -X POST http://localhost:8787/conversation-relay \
  -H "Content-Type: application/json" \
  -d '{
    "type": "setup",
    "callSid": "CAtest123"
  }'
```

## Environment Variables

### Required Secrets
- `ANTHROPIC_API_KEY` - Your Anthropic API key (set via `wrangler secret put`)

### Configuration Variables (wrangler.toml)
- `ENVIRONMENT` - Set to "production" by default

## API Endpoints

### GET /
Health check endpoint. Returns:
```json
{
  "status": "ok",
  "service": "wounded-animal-hotline-relay",
  "version": "1.0.0",
  "endpoints": ["/incoming-call", "/conversation-relay"],
  "contactsLoaded": 21,
  "promptLoaded": true
}
```

### POST /incoming-call
Twilio webhook for incoming calls. Returns TwiML to start ConversationRelay:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay 
      url="https://your-worker.workers.dev/conversation-relay"
      voice="Polly.Joanna-Neural"
      language="en-US"
      transcriptionProvider="deepgram"
      transcriptionModel="nova-2-conversationalai"
    />
  </Connect>
</Response>
```

### POST /conversation-relay
ConversationRelay webhook handler. Processes events:
- `setup` - Initialize conversation with system prompt
- `prompt` - Process user speech via Claude
- `interrupt` - Handle user interruptions
- `dtmf` - Handle keypad input (if enabled)
- `error` - Handle errors

**Example setup event:**
```json
{
  "type": "setup",
  "callSid": "CA1234567890abcdef"
}
```

**Example prompt event:**
```json
{
  "type": "prompt",
  "callSid": "CA1234567890abcdef",
  "voicePrompt": "I found an injured hawk in Spokane",
  "memory": {
    "messages": []
  }
}
```

## Claude Model Configuration

Current model: `claude-3-5-haiku-20241022`
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 1024 (sufficient for voice responses)
- **System Prompt**: 450-line comprehensive wildlife triage prompt
- **Context**: Full contacts database (21 entries) + current date/time

## Contacts Database

The worker bundles `assets/contacts.json` with 21 verified wildlife contacts:
- 1 24/7 emergency facility (WSU Veterinary Teaching Hospital)
- 2 wildlife rehabilitation centers
- 2 emergency veterinary clinics
- 4 government wildlife services
- 2 domestic animal control agencies
- 9 county sheriff offices
- 1 information resource

Coverage: 11 Eastern Washington counties

## Troubleshooting

### Worker deployment fails
```bash
# Check if you're logged in
wrangler whoami

# Re-authenticate
wrangler login

# Check wrangler.toml syntax
wrangler deploy --dry-run
```

### "ANTHROPIC_API_KEY not configured" error
```bash
# Set the secret
wrangler secret put ANTHROPIC_API_KEY

# Verify it's set
wrangler secret list
```

### Twilio returns "Method not allowed"
- Ensure your Twilio webhook is using **POST** method (not GET)
- Check the URL is exactly: `https://your-worker.workers.dev/incoming-call`

### Claude API errors
- Verify model name: `claude-3-5-haiku-20241022` (not `claude-haiku-4-5`)
- Check API key is valid: `curl https://api.anthropic.com/v1/messages --header "x-api-key: $ANTHROPIC_API_KEY"`
- Review Cloudflare Worker logs: `wrangler tail`

### Assets not loading
- Ensure `assets/contacts.json` and `assets/system-prompt.txt` exist
- Check `wrangler.toml` rules configuration
- Verify files are being bundled: `wrangler deploy --dry-run --outdir dist`

### Testing the live worker
```bash
# Health check
curl https://wounded-animal-hotline-relay.dan-gayle.workers.dev/

# View real-time logs
wrangler tail

# Test call (requires Twilio CLI)
twilio phone-numbers:list
# Then call the number from your phone
```

## Monitoring

### View Logs
```bash
# Real-time logs
wrangler tail

# Filter logs
wrangler tail --format pretty
```

### Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Workers & Pages
3. Click on `wounded-animal-hotline-relay`
4. View metrics, logs, and deployments

## Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Authenticated with Cloudflare (`wrangler login`)
- [ ] ANTHROPIC_API_KEY secret set (`wrangler secret put ANTHROPIC_API_KEY`)
- [ ] Worker deployed (`wrangler deploy`)
- [ ] Worker URL noted
- [ ] Twilio phone number updated with `/incoming-call` endpoint
- [ ] Test call made to verify functionality
- [ ] Logs checked for errors (`wrangler tail`)

## Production Notes

- Worker runs on Cloudflare's global edge network (low latency)
- Assets (contacts.json, system-prompt.txt) are bundled at deploy time
- Worker has access to `nodejs_compat` for Node.js APIs
- Conversation history is limited to last 10 messages (5 exchanges) to manage token usage
- All timestamps are in Pacific Time (America/Los_Angeles)

## Migration from Twilio Functions

This project was migrated from Twilio Functions to Cloudflare Workers to support WebSocket connections required by ConversationRelay. Key changes:

1. **Old**: Twilio Functions with `context` and `Runtime` objects
2. **New**: Cloudflare Workers with standard `Request`/`Response` and `env` binding
3. **Old**: Assets loaded via `Runtime.getAssets()`
4. **New**: Assets bundled via Wrangler's import system
5. **Old**: Environment variables via `context.VARIABLE_NAME`
6. **New**: Environment variables via `env.VARIABLE_NAME`

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Twilio ConversationRelay Docs](https://www.twilio.com/docs/voice/conversational-relay)
- [Anthropic Claude API Docs](https://docs.anthropic.com/)

## License

MIT License - See [LICENSE](../LICENSE) file for details