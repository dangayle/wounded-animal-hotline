# Wounded Animal Hotline - Comprehensive Build Plan

## Project Overview
Build an AI-powered voice hotline using Twilio ConversationRelay to help people in Eastern Washington quickly find the right contact when they discover injured or orphaned wildlife.

**Target Region:** Eastern Washington (Spokane to Canada, Wenatchee to Idaho border)
**AI Provider:** Anthropic Claude
**Deployment:** Twilio Functions via GitHub Actions
**Timeline:** 4-6 hours of active development

---

## Phase 1: Project Setup & Dependencies (30 minutes)

### 1.1 Initialize Twilio Serverless Project
- Create `package.json` with Twilio serverless dependencies
- Configure Twilio runtime environment
- Set up project structure for Functions and Assets

**Deliverables:**
- `src/package.json`
- `.twilioserverlessrc` (optional config)

### 1.2 Environment Variables Setup
Required variables (already set in GitHub Secrets):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `ANTHROPIC_API_KEY`

---

## Phase 2: Contact Database Creation (1 hour)

### 2.1 Research and Compile Wildlife Contacts
Comprehensive list for Eastern Washington region covering:

**Counties:** Spokane, Stevens, Pend Oreille, Ferry, Lincoln, Adams, Whitman, Chelan, Okanogan, Douglas, Grant

**Contact Categories:**
1. **24/7 Emergency Wildlife Services**
   - WSU Wildlife Rehabilitation Center (Pullman) - 509-335-0711
   - Washington State Patrol - 509-456-4101 (wildlife on highways)

2. **Wildlife Rehabilitation Centers**
   - WSU Wildlife Rehabilitation Center (Pullman) - 509-335-0711
   - Hunter Veterinary Clinic (Spokane - Raptors only) - 509-327-9354
   - Central Washington Wildlife Hospital (Ephrata) - 509-450-7016

3. **WDFW Regional Offices**
   - Region 1 Eastern (Spokane) - 509-892-1001
   - Region 2 North Central (Ephrata) - 509-754-4624
   - WDFW Enforcement Dispatch - 360-902-2936

4. **Emergency Veterinary Clinics** (for stabilization)
   - Pet Emergency Clinic (Spokane) - 509-326-6670 (24/7)
   - Animal Emergency Clinic (Spokane Valley) - 509-535-8743
   - Echo Ridge Veterinary Hospital (Colville/Stevens County) - 509-675-8522

5. **Animal Control by County** (domestic animals, may assist with wildlife)
   - Spokane County (SCRAPS) - 509-477-2533
   - Okanogan County - Via county sheriff dispatch

6. **Additional Resources**
   - WDFW Wildlife Rehabilitator Directory
   - Washington Wildlife Rehabilitation Association (WWRA)

### 2.2 Create Structured Contact Database
JSON structure with:
- Contact name and organization
- Phone number
- Service area (counties)
- Animal types accepted
- Hours of operation
- Specialty notes
- Priority/urgency level

**Deliverable:** `src/assets/contacts.json`

---

## Phase 3: AI System Prompt Design (30 minutes)

### 3.1 Conversation Flow Design
1. Greeting and situation assessment
2. Location gathering (city/county)
3. Animal type identification
4. Condition assessment (injured vs. orphaned)
5. Time-sensitive routing
6. Provide appropriate contact(s)
7. Follow-up instructions

### 3.2 System Prompt Creation
Design comprehensive prompt covering:
- Role: Compassionate wildlife triage specialist
- Task: Gather info quickly, route to correct resource
- Tone: Calm, reassuring, efficient
- Key questions to ask
- When to escalate to emergency services
- Safety instructions for callers
- Special considerations (baby animals, dangerous animals, etc.)

**Deliverable:** `src/assets/system-prompt.txt`

---

## Phase 4: Twilio Functions Development (2 hours)

### 4.1 Incoming Call Handler
**File:** `src/functions/incoming-call.js`

Responsibilities:
- Receive incoming calls to Twilio number
- Initialize ConversationRelay session
- Set up AI configuration with Anthropic
- Handle initial greeting
- Route to conversation handler

Key features:
- TwiML VoiceResponse configuration
- ConversationRelay setup with correct webhook URLs
- Error handling for failed initialization

### 4.2 Conversation Relay Webhook
**File:** `src/functions/conversation-relay.js`

Responsibilities:
- Process ConversationRelay events
- Send conversation to Claude API
- Parse caller's responses
- Extract key information (location, animal type, urgency)
- Query contact database for appropriate resources
- Format responses for TTS (Text-to-Speech)
- Handle conversation state

Key features:
- Integration with Anthropic Claude API
- Dynamic contact lookup based on criteria
- Conversation memory/context management
- Graceful error handling and fallbacks
- End-of-call SMS summary option

### 4.3 Contact Lookup Utility
**File:** `src/functions/helpers/contact-lookup.js`

Responsibilities:
- Load contacts.json from Assets
- Filter contacts by:
  - Geographic location (county/region)
  - Animal type
  - Time of day (24/7 vs business hours)
  - Urgency level
- Return prioritized list of contacts

### 4.4 SMS Follow-Up Handler (Optional)
**File:** `src/functions/send-sms.js`

Responsibilities:
- Send SMS with contact info after call
- Include link to WDFW rehabilitator directory
- Provide reference number

---

## Phase 5: Testing & Refinement (1 hour)

### 5.1 Local Testing
- Test Functions locally with Twilio CLI
- Validate contact data structure
- Test AI prompt responses
- Verify ConversationRelay configuration

### 5.2 Integration Testing
- Deploy to Twilio
- Make test calls from different scenarios:
  - Injured deer in Spokane County
  - Baby bird in Okanogan County
  - Raptor hit by car (urgent)
  - After-hours call
- Test edge cases and error scenarios

### 5.3 Refinement
- Adjust AI prompt based on test results
- Optimize response times
- Fine-tune TTS output formatting
- Update contact priorities

---

## Phase 6: Documentation & Deployment (30 minutes)

### 6.1 README Documentation
Update README.md with:
- Project description and purpose
- How it works (architecture overview)
- Contact database structure
- How to add/update contacts
- Deployment instructions
- Environment variables needed
- Testing guidelines

### 6.2 Demo Video/Recording
- Record test call demonstration
- Show different scenarios
- Highlight key features

### 6.3 Final Deployment
- Merge to main branch
- Verify GitHub Actions deployment
- Configure Twilio phone number with deployed Function URL
- Test production deployment

---

## Phase 7: Hackathon Submission (15 minutes)

### 7.1 Submission Checklist
- ✅ Public GitHub repository
- ✅ Deployed to public URL (Twilio)
- ✅ README with clear documentation
- ✅ Uses ConversationRelay
- ✅ Demo video or screenshots
- ✅ Contact database populated

### 7.2 Social Media Post
Reply to Twilio's X post with:
- Project description
- Problem it solves
- GitHub repo link
- Deployed phone number (if public)
- Demo video/GIF
- Relevant hashtags

---

## Technical Architecture

```
┌─────────────────┐
│  Caller Dials   │
│  Twilio Number  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Twilio Phone Number    │
│  (ConversationRelay)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  incoming-call.js       │
│  (Initialize session)   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  ConversationRelay      │
│  (Bidirectional audio)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  conversation-relay.js  │
│  (Process events)       │
└────────┬────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│  Anthropic      │   │  contacts.json   │
│  Claude API     │   │  (Asset)         │
└─────────────────┘   └──────────────────┘
         │
         ▼
┌─────────────────────────┐
│  TTS Response to Caller │
└─────────────────────────┘
```

---

## File Structure

```
wounded-animal-hotline/
├── .github/
│   └── workflows/
│       └── twilio.yml          # GitHub Actions deployment
├── src/
│   ├── assets/
│   │   ├── contacts.json       # Wildlife contact database (private)
│   │   └── system-prompt.txt   # AI system prompt (private)
│   ├── functions/
│   │   ├── incoming-call.js    # Call initialization
│   │   ├── conversation-relay.js # Main conversation handler
│   │   ├── send-sms.js         # Optional SMS follow-up
│   │   └── helpers/
│   │       └── contact-lookup.js # Contact filtering logic
│   └── package.json            # Dependencies
├── README.md
├── BUILD_PLAN.md               # This file
├── hackathon.md
└── hackathon-idea.md
```

---

## Dependencies (package.json)

Required npm packages:
- `twilio` (pre-installed in Twilio Functions)
- `@anthropic-ai/sdk` (Claude API)
- `@twilio-labs/serverless-runtime-types` (TypeScript support, optional)

---

## Key Considerations

### Safety & Legal
- Emphasize "call first" before touching wildlife
- Include warnings about rabies and dangerous animals
- Clarify that hotline is for triage/routing only, not emergency dispatch
- For immediate danger: direct to 911

### User Experience
- Keep conversation brief and focused
- Use natural, conversational language
- Avoid technical jargon
- Provide clear next steps
- Offer to repeat information

### Scalability
- Contact database should be easy to update
- Consider adding more regions in future
- Structure allows for multi-state expansion
- Could integrate with WDFW API if available

### Edge Cases
- Out-of-region calls → provide general WDFW contact
- After-hours → prioritize 24/7 contacts
- Unknown animal type → use general wildlife contacts
- No local rehabilitator → escalate to WSU or regional office
- Immediate danger → direct to 911 or WSP

---

## Success Metrics

1. **Functional Requirements**
   - ✅ Call connects and AI responds
   - ✅ Conversation gathers necessary info
   - ✅ Correct contacts provided based on inputs
   - ✅ Handles edge cases gracefully

2. **Hackathon Requirements**
   - ✅ Uses ConversationRelay
   - ✅ Public GitHub repo
   - ✅ Deployed to public URL
   - ✅ Submitted on time

3. **User Value**
   - Reduces time to find help (vs. Google searching)
   - Provides confidence in correct resource
   - Accessible via simple phone call
   - Works for non-tech-savvy users

---

## Future Enhancements (Post-Hackathon)

1. SMS integration for contact info delivery
2. Multi-language support (Spanish)
3. Integration with WDFW live data
4. Voicemail/callback system for after-hours
5. Analytics dashboard for call patterns
6. Expanded regional coverage
7. Web interface for contact database management
8. Integration with actual wildlife services for real-time availability
9. Photo submission via MMS for identification help
10. Follow-up tracking system

---

## Timeline Summary

| Phase | Duration | Priority |
|-------|----------|----------|
| Project Setup | 30 min | Critical |
| Contact Database | 1 hour | Critical |
| System Prompt | 30 min | Critical |
| Functions Development | 2 hours | Critical |
| Testing | 1 hour | High |
| Documentation | 30 min | High |
| Submission | 15 min | Critical |
| **Total** | **5.25 hours** | |

---

## Notes

- Focus on MVP first, then enhance
- Test early and often
- Keep AI responses concise for TTS
- Prioritize call quality over features
- Document assumptions and limitations
- Have fun! This solves a real problem.

---

**Last Updated:** November 2025
**Hackathon:** Twilio ConversationRelay Challenge S2.E11
**Submission Deadline:** November 21, 2025, 11:59 PM Pacific