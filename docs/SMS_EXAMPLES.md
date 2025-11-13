# SMS Follow-Up Examples

This document provides real-world examples of the SMS follow-up feature in action.

## Example Conversations

### Example 1: Injured Raptor in Spokane

**Conversation Flow:**

```
AI: Hello, this is the Wounded Animal Hotline. I'm here to help you find the 
    right resource. What kind of animal is it, and where are you located?

Caller: I found a hawk on the side of the road in Spokane. It looks injured.

AI: Are you safe and at a safe distance from the animal?

Caller: Yes, I'm in my car watching it from about 20 feet away.

AI: Good. Can you describe what you're seeing? Is the hawk moving?

Caller: It's sitting there, one wing looks weird, like it's drooping.

AI: Okay, that sounds like it needs professional help. The best contact for 
    raptors in Spokane is WSU Veterinary Teaching Hospital at five zero nine, 
    three three five, zero seven one one. That's 509-335-0711. They're available 
    24/7. Call them first before attempting to transport the bird.

AI: Would you like me to text you this information for your reference?

Caller: Yes, that would be great!

AI: Perfect, I'll send that to you right after our call. You'll receive the 
    contact information along with a reference number.

AI: Do you have any other questions?

Caller: No, I think I'm good. Thank you!

AI: You're welcome. You'll receive the text shortly. Good luck with the hawk!
```

**SMS Sent:**

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for raptor in Spokane:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. Pet Emergency Clinic
   509-326-6670 (24/7)

3. WDFW Eastern Region Office
   509-892-1001 (Mon-Fri 8 AM - 5 PM)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #A7B2C
```

---

### Example 2: Baby Deer - No SMS Needed

**Conversation Flow:**

```
AI: Hello, this is the Wounded Animal Hotline. What kind of animal is it, 
    and where are you located?

Caller: There's a baby deer in my yard in Chelan. It's been here for hours.

AI: Are you safe and at a safe distance?

Caller: Yes, I'm just watching from my window.

AI: Good. Is the fawn injured, or does it appear healthy?

Caller: It looks fine, just sitting there.

AI: That's actually very normal behavior. Mother deer leave their fawns alone 
    for hours while they feed. The fawn is likely not orphaned. I recommend 
    observing from a distance. If it's still there after 24 hours or if you 
    see obvious injury, call WDFW at 509-667-6675.

AI: Would you like me to text you this information?

Caller: No, I think I'm good. Thanks for letting me know!

AI: You're welcome! Thank you for caring about wildlife.
```

**SMS:** Not sent (caller declined)

---

### Example 3: Bat Found - Rabies Vector Species

**Conversation Flow:**

```
AI: Hello, this is the Wounded Animal Hotline. What kind of animal is it, 
    and where are you located?

Caller: I found a bat in my garage in Pullman.

AI: Are you safe? Have you touched the bat or been bitten or scratched?

Caller: No, I haven't touched it. Just found it hanging on the wall.

AI: Good, please do not touch it. Bats can carry rabies. For bat situations 
    in Pullman, contact WSU Veterinary Teaching Hospital at 509-335-0711. 
    They handle rabies vector species. That's five zero nine, three three five, 
    zero seven one one.

AI: Would you like me to text you this contact information?

Caller: Yes please.

AI: I'll send that right away. Remember - do not touch the bat.
```

**SMS Sent:**

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for bat in Whitman:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. WDFW Eastern Region Office
   509-892-1001 (Mon-Fri 8 AM - 5 PM)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #D9F3K
```

---

## Code Examples

### Sending SMS Programmatically

```javascript
// Example: Send SMS from Cloudflare Worker
import { sendFollowUpSMS } from './send-sms.js';

// In your handler
const result = await sendFollowUpSMS(env, {
  to: '+15095551234',
  contacts: [
    {
      name: 'WSU Veterinary Teaching Hospital',
      phone: '+15093350711',
      hours: '24/7'
    },
    {
      name: 'Pet Emergency Clinic',
      phone: '+15093266670',
      hours: '24/7'
    }
  ],
  animalType: 'hawk',
  county: 'Spokane',
  callSid: 'CA1234567890'
});

if (result.success) {
  console.log('SMS sent:', result.messageSid);
} else {
  console.error('SMS failed:', result.error);
}
```

### Testing SMS Formatting

```javascript
// Example: Test message formatting locally
const { formatContactsSMS, estimateSMSSegments } = require('./functions/helpers/sms-formatter');

const contacts = [
  {
    name: 'WSU Veterinary Teaching Hospital',
    phone: '+15093350711',
    hours: '24/7'
  }
];

const message = formatContactsSMS(contacts, {
  animalType: 'raptor',
  county: 'Spokane',
  callSid: 'CA1234567890'
});

console.log('Message preview:');
console.log(message);

const segments = estimateSMSSegments(message);
console.log(`\nSegments: ${segments.segments}`);
console.log(`Characters: ${segments.length}`);
console.log(`Encoding: ${segments.type}`);
```

**Output:**

```
Message preview:
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for raptor in Spokane:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #67890

Segments: 2
Characters: 247
Encoding: GSM-7
```

---

## API Request Examples

### Direct API Call

```bash
# Send SMS via Worker endpoint
curl -X POST https://wounded-animal-hotline-relay.your-worker.workers.dev/send-sms \
  -H "Content-Type: application/json" \
  -d '{
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
    "animalType": "small mammal",
    "county": "Grant",
    "callSid": "CA1234567890abcdef"
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "messageSid": "SM1234567890abcdef1234567890abcdef",
  "status": "queued",
  "to": "+15095551234",
  "from": "+15095554321"
}
```

**Response (Error - Invalid Number):**

```json
{
  "success": false,
  "error": "Invalid phone number",
  "code": 21211
}
```

---

## Edge Cases

### Caller Declines SMS

```
AI: Would you like me to text you this information for your reference?

Caller: No thanks, I wrote it down.

AI: No problem. Do you have any other questions?
```

**Result:** SMS not sent, conversation continues normally.

---

### After Hours - Limited Contacts

**Scenario:** Call received at 10 PM on Saturday

**SMS Sent:**

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for deer in Stevens:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. WDFW Enforcement Dispatch
   360-902-2936 (24/7)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #K8M2P
```

**Note:** Only 24/7 services included due to time of day.

---

### Multiple Animal Types

**Scenario:** Caller found multiple animals (mother + babies)

**SMS Sent:**

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for small mammals in Okanogan:

1. Central Washington Wildlife Hospital
   509-754-4244 (Mon-Sat 9 AM - 5 PM)

2. WDFW North Central Region Office
   509-754-4624 (Mon-Fri 8 AM - 5 PM)

3. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #T5R9W
```

---

## Character Budget Examples

### Minimal SMS (1 segment - 160 chars)

```
Thanks for calling!

Contact:
1. WSU Vet Hospital
   509-335-0711 (24/7)

More: wdfw.wa.gov/find

Ref: #A1B2C
```

**Segments:** 1 (123 characters)

---

### Standard SMS (2 segments - ~300 chars)

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for raptor in Spokane:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. Pet Emergency Clinic
   509-326-6670 (24/7)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #X7Y2Z
```

**Segments:** 2 (289 characters)

---

### Maximum SMS (3 segments - ~400 chars)

```
Thanks for calling the Wounded Animal Hotline!

Your recommended contacts for small mammals in Spokane:

1. WSU Veterinary Teaching Hospital
   509-335-0711 (24/7)

2. Central Washington Wildlife Hospital
   509-754-4244 (Mon-Sat 9 AM - 5 PM)

3. WDFW Eastern Region Office
   509-892-1001 (Mon-Fri 8 AM - 5 PM)

Find more:
https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find

Ref: #P8Q4R
```

**Segments:** 3 (377 characters)

---

## Troubleshooting Scenarios

### SMS Delivery Failed - Landline

**Scenario:** Caller called from landline

**Worker Log:**
```
Error sending SMS: To number is not a mobile number
Twilio Error Code: 21614
```

**Fallback:** Caller already received information verbally. No retry needed.

---

### SMS Delayed

**Scenario:** SMS sent but delayed by carrier

**Twilio Status Progression:**
1. `queued` - Accepted by Twilio
2. `sending` - Submitted to carrier
3. `sent` - Carrier accepted
4. `delivered` - Confirmed delivered (may take minutes)

**Note:** Caller is not notified of delivery status during call.

---

### Wrong Number Format

**Scenario:** International caller or VoIP number

**Worker Log:**
```
Invalid phone number format
Expected: +1XXXXXXXXXX
Received: +442012345678
```

**Fallback:** SMS not sent. Caller already has info verbally.

---

## Testing Checklist

- [ ] Test with valid US mobile number
- [ ] Test opt-in response ("yes", "yeah", "sure")
- [ ] Test opt-out response ("no", "no thanks")
- [ ] Test with 1 contact (short message)
- [ ] Test with 3 contacts (max length)
- [ ] Test with missing context (no animal type/county)
- [ ] Test reference number generation
- [ ] Test phone number formatting (dashes, parentheses)
- [ ] Test after-hours scenario (limited contacts)
- [ ] Verify WDFW link is clickable
- [ ] Check message arrives within 10 seconds
- [ ] Verify no duplicate sends
- [ ] Test with landline (expect graceful failure)
- [ ] Monitor Twilio logs for errors

---

## Cost Analysis

### Example Costs Per Call Type

**1-Contact SMS (160 chars, 1 segment):**
- Cost: $0.0075
- Use case: Simple referral, single contact

**2-Contact SMS (300 chars, 2 segments):**
- Cost: $0.015
- Use case: Standard call, primary + backup contact

**3-Contact SMS (400 chars, 3 segments):**
- Cost: $0.0225
- Use case: Multiple options, complex situation

**Average per call:** ~$0.015 (assuming 50% opt-in rate)

**Monthly cost (100 calls):** ~$1.50

---

## Best Practices

1. **Always provide information verbally first** - SMS is supplemental
2. **Keep SMS opt-in casual** - "Would you like me to text you this info?"
3. **Don't ask twice** - If declined, move on
4. **Limit to 3 contacts** - Keeps message concise and affordable
5. **Include reference number** - Helps with follow-up if needed
6. **Log but don't block on failures** - Caller already has the info
7. **Test regularly** - Verify SMS delivery to various carriers
8. **Monitor costs** - Track segment counts and delivery rates

---

## Related Documentation

- [SMS Feature Overview](SMS_FEATURE.md)
- [System Prompt](../src/assets/system-prompt.txt)
- [Contact Database](../src/assets/contacts.json)
- [Twilio SMS API Docs](https://www.twilio.com/docs/sms)