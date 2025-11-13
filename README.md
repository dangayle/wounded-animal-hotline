# Wounded Animal Hotline 🐾

**An AI-powered voice hotline for Eastern Washington wildlife emergencies**

Submission for [Twilio Web Dev Challenge Hackathon S2.E11: ConversationRelay Challenge](https://www.twilio.com/blog)

## The Problem

When you find an injured or orphaned wild animal, every minute counts. But figuring out who to call isn't straightforward:

- Different counties have different resources
- Wildlife rehabilitators specialize in different species
- Some services are 24/7, others are business hours only
- Google searching wastes precious time
- Rural areas often lack clear guidance

**In Eastern Washington's vast rural landscape, this problem is even more acute.**

## The Solution

A phone hotline powered by AI that:

1. ✅ **Answers immediately** - No waiting, no menus, just conversation
2. 🗺️ **Routes intelligently** - Based on your location, the animal type, and time of day
3. 📞 **Provides direct contacts** - Wildlife rehabilitators, WDFW offices, emergency vets
4. 🤖 **Understands context** - Distinguishes between true emergencies and "baby animal is fine" situations
5. 🌲 **Covers the region** - 11 counties from Spokane to Canada, Wenatchee to Idaho

## How It Works

```
┌─────────────────┐
│  You find a     │
│  wounded animal │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Call the hotline       │
│  (Twilio Phone Number)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AI conversation begins │
│  (ConversationRelay +   │
│   Anthropic Claude)     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AI asks:               │
│  • Where are you?       │
│  • What kind of animal? │
│  • What's the condition?│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Smart routing logic    │
│  filters 30+ contacts   │
│  by location, type,     │
│  time, urgency          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  You get the right      │
│  phone number(s) to     │
│  call immediately       │
└─────────────────────────┘
```

## Technology Stack

- **[Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversational-relay)** - Bidirectional voice conversation
- **[Anthropic Claude](https://www.anthropic.com/)** - AI conversation handling
- **[Twilio Functions](https://www.twilio.com/docs/serverless/functions-assets)** - Serverless hosting
- **GitHub Actions** - Automated deployment
- **Node.js** - Runtime environment

## Coverage Area

### Eastern Washington Region

**Counties Covered:**
- Spokane
- Stevens
- Pend Oreille
- Ferry
- Lincoln
- Adams
- Whitman
- Chelan
- Okanogan
- Douglas
- Grant

### Contact Database

**21 verified contacts** organized by service type and geographic coverage:

- **24/7 Emergency Wildlife Services (1)**
  - WSU Veterinary Teaching Hospital (Pullman) - Primary wildlife medical facility for Eastern WA

- **Wildlife Rehabilitation Centers (2)**
  - Central Washington Wildlife Hospital (Ephrata) - Licensed rehab for small mammals/birds
  - Blue Mountain Wildlife (Pendleton, OR) - Raptor specialist serving SE WA/NE OR

- **Emergency Veterinary Clinics (2)**
  - Pet Emergency Clinic (Spokane) - 24/7 wildlife stabilization for transfer
  - Animal Hospital of Omak - Wildlife stabilization during business hours

- **Government Wildlife Services (4)**
  - WDFW Enforcement Dispatch - 24/7 statewide enforcement
  - Washington State Patrol (911) - Highway/public safety threats
  - WDFW Eastern Region Office (Spokane Valley)
  - WDFW North Central Region Office (Ephrata)

- **Domestic Animal Control (2)**
  - SCRAPS (Spokane County) - Emergency dispatch available 24/7
  - Wenatchee Valley Humane Society (Chelan/Douglas Counties)

- **County Sheriff Offices (9)**
  - Coverage for: Okanogan, Stevens, Pend Oreille, Ferry, Lincoln, Garfield, Columbia, Walla Walla, Asotin

- **Information Resources (1)**
  - WA Department of Health Rabies Information

#### Database Schema

The contact database uses a **versioned JSON schema** (v1.4.0) with strict validation:

**Required Fields:**
- `name` - Organization name
- `phone` - Primary contact number (E.164 format)
- `location` - Physical address (with optional lat/long coordinates)
- `coverage` - Counties/jurisdictions served
- `hours` - Human-readable hours of operation
- `services` - Array of standardized service types
- `animal_types` - Array of animal categories
- `handles_rabies_vector_species` - Boolean flag for safety triage
- `notes` - Special instructions or limitations

**Optional Fields:**
- `emergency_phone` - Dedicated emergency line
- `non_emergency_phone` - Business hours line
- `url` - Official website
- `email` - Contact email

**Service Types:** `unsafe_animal_response`, `emergency_wildlife_medical`, `non_emergency_wildlife_rehab`, `wildlife_stabilization`, `veterinary_services`, `domestic_animal_control`, `livestock_control`, `rabies_information`, `general_information`, `law_enforcement`

**Animal Types:** `large_mammals`, `small_mammals`, `raptors`, `songbirds`, `bats`, `reptiles`, `domestic_pets`, `livestock`, `raccoons`, `coyotes`, `skunks`

**Geographic Data:**
- 18 contacts include GPS coordinates (lat/long) for distance-based routing
- All contacts include full physical addresses
- Enables AI to route callers to nearest appropriate facility

## Project Structure

```
wounded-animal-hotline/
├── .github/
│   └── workflows/
│       └── twilio.yml              # Auto-deploy to Twilio
├── src/
│   ├── assets/
│   │   ├── contacts.json           # Wildlife contact database (21 contacts)
│   │   ├── contact.schema.json     # JSON Schema v1.4.0 for validation
│   │   └── system-prompt.txt       # AI conversation prompt
│   ├── functions/
│   │   ├── incoming-call.js        # Call handler & ConversationRelay setup
│   │   ├── conversation-relay.js   # Main AI conversation logic
│   │   ├── send-sms.js             # Optional SMS follow-up
│   │   └── helpers/
│   │       └── contact-lookup.js   # Smart contact filtering
│   └── package.json                # Dependencies
├── BUILD_PLAN.md                   # Detailed build phases
└── README.md                       # This file
```

## Build Plan

This project is organized into **7 phases** tracked as GitHub Issues:

1. **[Phase 1: Project Setup & Dependencies](../../issues/1)** - ✅ **COMPLETED**
2. **[Phase 2: Create Comprehensive Contact Database](../../issues/2)** - ✅ **COMPLETED**
3. **[Phase 3: Design AI System Prompt](../../issues/3)** - ✅ **COMPLETED**
4. **[Phase 4.1: Build Incoming Call Handler](../../issues/4)** - ✅ **COMPLETED**
5. **[Phase 4.2: Build Conversation Relay Webhook](../../issues/5)** - ✅ **COMPLETED**
6. **[Phase 4.3: Build Contact Lookup Utility](../../issues/6)** - ✅ **COMPLETED**
7. **[Phase 4.4: Build SMS Follow-Up Handler](../../issues/7)** - 30 min (optional)
8. **[Phase 5: Testing & Refinement](../../issues/8)** - 1 hour
9. **[Phase 6: Documentation & Deployment](../../issues/9)** - 30 min
10. **[Phase 7: Hackathon Submission](../../issues/10)** - 15 min

**Total Estimated Time:** ~5-6 hours

See [BUILD_PLAN.md](BUILD_PLAN.md) for comprehensive details.

## Environment Variables

Required for deployment:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Set these in:
- GitHub Secrets (for CI/CD)
- Twilio Functions Environment Variables (for runtime)

## Local Development

### Prerequisites

- Node.js 18+
- Twilio CLI
- Twilio account with ConversationRelay enabled
- Anthropic API key

### Setup

```bash
# Clone the repository
git clone https://github.com/dangayle/wounded-animal-hotline.git
cd wounded-animal-hotline

# Install Twilio CLI
npm install -g twilio-cli

# Install serverless plugin
twilio plugins:install @twilio-labs/plugin-serverless

# Navigate to src directory
cd src

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Run locally
twilio serverless:start
```

### Testing

```bash
# Test locally with Twilio CLI
twilio serverless:start

# Deploy to Twilio
twilio serverless:deploy
```

## Deployment

Automatic deployment via GitHub Actions on push to `main`:

```yaml
# .github/workflows/twilio.yml
on:
  push:
    branches: [main]
```

Manual deployment:

```bash
cd src
twilio serverless:deploy
```

## Adding/Updating Contacts

The contact database follows a strict JSON schema. Edit `src/assets/contacts.json`:

```json
{
  "$schema": "./contact.schema.json",
  "contacts": [
    {
      "name": "WSU Veterinary Teaching Hospital",
      "phone": "+15093350711",
      "emergency_phone": "+15093350711",
      "non_emergency_phone": "+15093350711",
      "url": "https://hospital.vetmed.wsu.edu",
      "email": "cole.buser@wsu.edu",
      "location": {
        "address": "205 Ott Road, Pullman, WA 99164",
        "latitude": 46.7279052,
        "longitude": -117.1586738
      },
      "coverage": ["All of Eastern Washington"],
      "hours": "24/7",
      "services": [
        "emergency_wildlife_medical",
        "non_emergency_wildlife_rehab",
        "wildlife_stabilization",
        "veterinary_services"
      ],
      "animal_types": [
        "large_mammals",
        "small_mammals",
        "raptors",
        "songbirds",
        "bats",
        "reptiles"
      ],
      "handles_rabies_vector_species": true,
      "notes": "Primary wildlife medical facility for Eastern WA. Call ahead to coordinate arrival."
    }
  ]
}
```

**Required Fields:**
- `name` - Official organization name
- `phone` - Primary contact (E.164 format: +1XXXXXXXXXX)
- `location` - Object with required `address`, optional `latitude`/`longitude`
- `coverage` - Array of counties/jurisdictions served
- `hours` - Human-readable hours (e.g., "24/7", "Mon-Fri 8 AM - 5 PM")
- `services` - Array from enum (see schema for valid values)
- `animal_types` - Array from enum (see schema for valid values)
- `handles_rabies_vector_species` - Boolean (true/false)
- `notes` - Special instructions or important details

**Optional Fields:**
- `emergency_phone` - Dedicated emergency line
- `non_emergency_phone` - Business hours line
- `url` - Official website
- `email` - Contact email address

**Validation:**
All contacts must validate against `contact.schema.json` (v1.4.0). The schema enforces:
- E.164 phone number format
- Valid URL and email formats
- No additional properties beyond those defined
- Required fields are present

See `src/assets/contact.schema.json` for complete schema specification.

## How the AI Works

The system prompt guides Claude to:

1. **Assess the situation quickly** - Is this truly an emergency?
2. **Gather key information** - Location, animal type, condition
3. **Provide safety guidance** - Don't touch wildlife, watch for danger
4. **Route intelligently** - Filter contacts by all criteria
5. **Deliver clearly** - Phone numbers spoken slowly and clearly
6. **Handle edge cases** - Baby animals often don't need "rescue"

## Key Features

### 🎯 Smart Routing

Contacts are filtered and prioritized by:
- Geographic proximity (county-based)
- Animal specialty (raptors, bats, mammals, etc.)
- Time of day (24/7 vs business hours)
- Urgency level (immediate danger vs routine)

### 🕐 Time-Aware

- **Business hours (8am-5pm weekdays):** All contacts available
- **After hours:** Prioritizes 24/7 emergency services
- **Weekends:** Same as after hours

### 🦅 Specialty Matching

- **Raptors** → Specialist raptor rehabilitation centers
- **Bats** → Bat-specific services (rabies protocols)
- **Large mammals** → WDFW regional offices
- **Unknown** → Generalist wildlife services

### 🚨 Emergency Handling

For immediate life-threatening situations:
- Directs to 911 first
- Then provides wildlife-specific backup contacts
- Includes safety warnings (dangerous animals, rabies risk)

## Safety & Legal

⚠️ **Important Disclaimers:**

- This is a **routing and information service**, not emergency dispatch
- For life-threatening situations, **always call 911 first**
- **Do not touch wildlife** without professional guidance
- **Rabies risk** - bats, raccoons, foxes, skunks can carry rabies
- **It's illegal** to rehabilitate wildlife without a permit in Washington State

## Future Enhancements

- [ ] SMS delivery of contact info
- [ ] Multi-language support (Spanish)
- [ ] Integration with WDFW real-time data
- [ ] Voicemail system for after-hours callbacks
- [ ] Photo submission via MMS for species identification
- [ ] Expanded coverage to other Washington regions
- [ ] Analytics dashboard for call patterns
- [ ] Web interface for contact database management

## Contributing

This project was built for the Twilio ConversationRelay Hackathon, but contributions are welcome!

### Adding Contacts

Know of a wildlife rehabilitator or service we're missing? Open a Pull Request with updated `contacts.json`.

### Expanding Coverage

Want to add another region? Fork the repo and adapt for your area!

### Reporting Issues

Found a bug or have a suggestion? [Open an issue](../../issues).

## Resources

- [WDFW Licensed Rehabilitator Directory](https://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find)
- [Washington Wildlife Rehabilitation Association](https://www.wwrawildlife.org/)
- [WSU Wildlife Rehabilitation Center](https://vetmed.wsu.edu/departments/veterinary-clinical-sciences/wildlife/)
- [Twilio ConversationRelay Docs](https://www.twilio.com/docs/voice/conversational-relay)

## Credits

**Built by:** [Dan Gayle](https://github.com/dangayle)

**For:** Twilio Web Dev Challenge Hackathon S2.E11

**Powered by:**
- Twilio ConversationRelay
- Anthropic Claude
- Eastern Washington wildlife organizations

**Special thanks to:**
- All the wildlife rehabilitators and veterinarians who do this critical work
- WDFW for maintaining the rehabilitator network
- WSU Wildlife Rehabilitation Center for 24/7 emergency services

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contact

Questions? Reach out:
- GitHub Issues: [wounded-animal-hotline/issues](../../issues)
- Twitter: [@dangayle](https://twitter.com/dangayle)

---

**Remember:** If you find injured wildlife, stay calm, call for help, and don't touch the animal unless instructed by a professional. 🐾