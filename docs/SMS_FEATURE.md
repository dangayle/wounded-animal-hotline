# SMS Follow-Up Feature

## Overview

The SMS follow-up feature sends contact information to callers via text message after their call with the Wounded Animal Hotline. This provides a convenient reference so callers don't need to write down phone numbers during the conversation.

**Status:** ✅ Implemented (Optional feature)

## How It Works

### User Experience Flow

1. **Caller contacts hotline** - Makes a voice call to get wildlife assistance
2. **AI provides information** - Claude gives verbal contact recommendations
3. **Opt-in prompt** - AI asks: "Would you like me to text you this information for your reference?"
4. **Caller responds** - Yes/No (verbal response during call)
5. **SMS sent** - If yes, text message is sent to caller's phone after providing info
6. **Reference received** - Caller gets SMS with up to 3 contacts, hours, and reference number

### SMS Message Format

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for [animal type] in [county]:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. Central Washington Wildlife Hospital
   509-754-4244 (Mon-Sat 9 AM - 5 PM)

3. WDFW Eastern Region Office
   509-892-1001 (Mon-Fri 8 AM - 5 PM)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #A1B2C
```

### Key Features

- **Opt-in only** - Callers must explicitly agree to receive SMS
- **Automatic phone detection** - Uses caller's phone number from call metadata
- **Character-optimized** - Messages stay within SMS segment limits (typically 1-2 segments)
- **Reference numbers** - Each call gets a unique 5-character reference ID
- **Link included** - Direct link to WDFW rehabilitator directory
- **Contact limit** - Maximum 3 contacts to keep message concise

## Configuration

### Environment Variables Required

The SMS feature requires three Twilio credentials to be configured in Cloudflare Worker environment:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15095551234
```

### Setting Environment Variables

#### Via Wrangler CLI (Recommended for secrets)

```bash
# Navigate to src directory
cd src

# Set secrets
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER
```

#### Via Cloudflare Dashboard

1. Go to Workers & Pages → Your Worker
2. Click Settings → Variables
3. Add environment variables:
   - `TWILIO_ACCOUNT_SID` (Encrypted)
   - `TWILIO_AUTH_TOKEN` (Encrypted)
   - `TWILIO_PHONE_NUMBER` (Encrypted)

#### Via wrangler.toml (Not recommended for production)

```toml
[vars]
TWILIO_PHONE_NUMBER = "+15095551234"

# DO NOT put sensitive credentials in wrangler.toml
# Use wrangler secret put for ACCOUNT_SID and AUTH_TOKEN
```

### Obtaining Twilio Credentials

1. **Account SID & Auth Token:**
   - Log in to [Twilio Console](https://console.twilio.com)
   - Dashboard shows Account SID and Auth Token

2. **Phone Number:**
   - Use the existing Twilio phone number for the hotline
   - Must be SMS-enabled (most Twilio numbers are)
   - Format: E.164 format (`+1XXXXXXXXXX`)

## System Prompt Integration

The SMS opt-in is integrated into the conversation flow via the system prompt (`src/assets/system-prompt.txt`):

### Step 6.5: SMS Follow-Up Opt-In

```
After providing contact information, offer to send a text message:

PROMPT: "Would you like me to text you this information for your reference?"

If caller says YES:
- Confirm you'll send the text to the number they called from
- Mark in conversation memory: smsOptIn = true
- Let them know: "I'll send that to you right after our call."

If caller says NO:
- No problem, move to call conclusion
- Do NOT push or ask twice
```

## API Endpoints

### POST /send-sms

Send SMS with contact information.

**Request:**

```json
{
  "to": "+15095551234",
  "contacts": [
    {
      "name": "WSU Veterinary Teaching Hospital",
      "phone": "+15093350711",
      "hours": "24/7"
    },
    {
      "name": "Central Washington Wildlife Hospital",
      "phone": "+15097544244",
      "hours": "Mon-Sat 9 AM - 5 PM"
    }
  ],
  "animalType": "raptor",
  "county": "Spokane",
  "callSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response (Success):**

```json
{
  "success": true,
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "+15095551234",
  "from": "+15095554321"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid phone number",
  "code": 21211
}
```

## Architecture

### File Structure

```
src/
├── send-sms.js                      # Main SMS handler (Worker-compatible)
├── functions/
│   └── helpers/
│       └── sms-formatter.js         # SMS formatting utilities (Node.js)
├── assets/
│   └── system-prompt.txt            # Includes SMS opt-in instructions
└── index.js                         # Worker entry point with /send-sms endpoint
```

### Components

1. **send-sms.js** - Cloudflare Worker module
   - Formats SMS messages
   - Sends via Twilio REST API
   - Handles errors and validation

2. **sms-formatter.js** - Helper utilities (for Node.js environments)
   - Contact formatting functions
   - Phone number normalization
   - Segment estimation

3. **index.js** - Main Worker with SMS integration
   - `/send-sms` POST endpoint
   - Conversation memory tracking
   - Automatic SMS triggering on opt-in

### Conversation Memory Tracking

The Worker tracks SMS opt-in state in the conversation memory object:

```javascript
memory = {
  messages: [...],              // Conversation history
  callerNumber: "+15095551234", // From setup message
  callSid: "CAxxxxxx",          // Call identifier
  smsOptIn: false,              // Changed to true when user agrees
  smsSent: false,               // Prevents duplicate sends
  providedContacts: [...],      // Contacts given to caller
  animalType: "raptor",         // Extracted from conversation
  county: "Spokane"             // Extracted from conversation
}
```

## Testing

### Manual Testing with cURL

```bash
# Test SMS endpoint directly
curl -X POST https://your-worker.workers.dev/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15095551234",
    "contacts": [
      {
        "name": "WSU Veterinary Teaching Hospital",
        "phone": "+15093350711",
        "hours": "24/7"
      }
    ],
    "animalType": "raptor",
    "county": "Spokane",
    "callSid": "CA1234567890"
  }'
```

### Test SMS Formatting (Local)

```javascript
// In Node.js environment
const { formatContactsSMS, estimateSMSSegments } = require('./functions/helpers/sms-formatter');

const contacts = [
  {
    name: "WSU Veterinary Teaching Hospital",
    phone: "+15093350711",
    hours: "24/7"
  }
];

const message = formatContactsSMS(contacts, {
  animalType: "raptor",
  county: "Spokane",
  callSid: "CA1234567890"
});

console.log(message);
console.log(estimateSMSSegments(message));
```

### Integration Testing

1. **Call the hotline** with a test phone number
2. **Answer questions** about animal type and location
3. **Wait for opt-in prompt**: "Would you like me to text you this information?"
4. **Say "yes"** clearly
5. **Check phone** for SMS within 10 seconds
6. **Verify SMS content**:
   - Contains correct contacts
   - Phone numbers formatted properly
   - Reference number included
   - WDFW link present

## Message Optimization

### SMS Segment Limits

- **GSM-7 encoding**: 160 chars (single), 153 chars (multi-segment)
- **Unicode encoding**: 70 chars (single), 67 chars (multi-segment)

### Current Implementation

- Limits to **3 contacts maximum** (keeps under 2 segments typically)
- Uses standard ASCII characters (GSM-7)
- Abbreviates where possible (e.g., "Mon-Fri" instead of "Monday-Friday")
- Typical message size: **200-300 characters** (2 segments)

### Character Budget

```
Greeting:                    ~50 chars
Context line:                ~40 chars
Contact 1:                   ~50 chars
Contact 2:                   ~50 chars
Contact 3:                   ~50 chars
WDFW link:                   ~100 chars
Reference number:            ~15 chars
--------------------------------
Total:                       ~355 chars (3 segments)
```

## Error Handling

### Twilio API Errors

Common error codes and handling:

| Code  | Error                    | Handling                                    |
|-------|--------------------------|---------------------------------------------|
| 21211 | Invalid phone number     | Log error, inform caller verbally           |
| 21408 | Permission denied        | Check account settings, log error           |
| 21610 | Unsubscribed recipient   | Respect opt-out, don't retry                |
| 30003 | Unreachable destination  | Log error, caller still has verbal info     |
| 30004 | Message blocked          | Carrier blocked, nothing to do              |
| 30005 | Unknown destination      | Invalid number format                       |

### Graceful Degradation

SMS failure **does not impact call quality**:

1. SMS send happens **asynchronously** (doesn't block conversation)
2. Caller already received info **verbally** during call
3. Failed SMS is **logged** but doesn't throw errors to user
4. AI confirms SMS will be sent, but actual delivery is best-effort

## Security Considerations

### Phone Number Privacy

- Caller's number is only stored in **memory** (not persisted)
- SMS sends use caller's own number (no collection/storage)
- Reference numbers are **non-sequential** (last 5 chars of Call SID)

### Credential Security

- **Never commit** `TWILIO_AUTH_TOKEN` to git
- Use **Cloudflare Secrets** for sensitive values
- Rotate credentials periodically
- Use **separate Twilio projects** for dev/staging/production

### Rate Limiting

Consider implementing rate limits:

- Max 1 SMS per phone number per hour (prevent spam)
- Max 10 SMS per Call SID (prevent loops)
- Monitor Twilio usage for anomalies

## Cost Considerations

### Twilio SMS Pricing (US)

- **Outbound SMS**: ~$0.0075 per segment (U.S. carriers)
- **Average cost per call**: $0.015 - $0.0225 (2-3 segments)
- **Estimated monthly cost** (100 calls): $1.50 - $2.25

### Optimization Tips

- Keep messages under 160 chars when possible (1 segment)
- Use abbreviations: "Mon-Fri" vs "Monday through Friday"
- Limit to 3 contacts max
- Consider opt-in rate (not everyone wants SMS)

## Future Enhancements

### Potential Improvements

- [ ] **Multi-language support** - Spanish SMS templates
- [ ] **MMS with maps** - Include location maps for contacts
- [ ] **Delivery receipts** - Track SMS delivery status
- [ ] **Follow-up prompts** - "Reply HELP for more info"
- [ ] **Contact cards** - vCard format for easy saving
- [ ] **Analytics** - Track opt-in rate, delivery success
- [ ] **Retry logic** - Automatic retry on transient failures
- [ ] **Custom short links** - Branded URL shortener

### Known Limitations

- No delivery confirmation to caller during call
- Can't send SMS to landlines (handled gracefully)
- Character limits may truncate long contact names
- No support for international numbers (U.S. only)

## Troubleshooting

### SMS Not Received

1. **Check Twilio logs**: Console → Monitor → Logs → Messaging
2. **Verify phone number format**: Must be E.164 (`+1XXXXXXXXXX`)
3. **Confirm credentials**: Test with Twilio API Explorer
4. **Check carrier**: Some carriers block automated SMS
5. **Review delivery status**: Twilio provides detailed status

### Common Issues

**Issue**: "SMS service not configured" error

**Solution**: Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in Worker environment

---

**Issue**: SMS never triggers even with opt-in

**Solution**: Check Worker logs for memory state. Verify `memory.smsOptIn` is set to `true` and `memory.providedContacts` has data.

---

**Issue**: SMS sends but message is blank

**Solution**: Verify contacts array has required fields (`name`, `phone`, `hours`)

---

**Issue**: "Invalid phone number" error

**Solution**: Ensure caller's number is in E.164 format. Twilio setup message should provide this automatically.

## Support

For issues with:
- **Twilio API**: [Twilio Support](https://support.twilio.com)
- **Cloudflare Workers**: [Cloudflare Developers Discord](https://discord.gg/cloudflaredev)
- **This feature**: Open an issue on GitHub

## References

- [Twilio Messaging API Docs](https://www.twilio.com/docs/sms)
- [Cloudflare Workers Fetch API](https://developers.cloudflare.com/workers/runtime-apis/fetch/)
- [SMS Character Encoding](https://www.twilio.com/docs/glossary/what-is-gsm-7-character-encoding)
- [Twilio Error Codes](https://www.twilio.com/docs/api/errors)