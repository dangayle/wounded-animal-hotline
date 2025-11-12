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

30+ verified wildlife contacts including:

- **24/7 Emergency Services**
  - WSU Wildlife Rehabilitation Center (Pullman)
  - Emergency veterinary clinics
  - WDFW Enforcement Dispatch

- **Wildlife Rehabilitation Centers**
  - Licensed state rehabilitators
  - Raptor specialists
  - Regional wildlife hospitals

- **Government Agencies**
  - WDFW Regional Offices
  - County animal control
  - State patrol (for highway wildlife)

- **Veterinary Services**
  - Emergency vets with wildlife experience
  - On-call rural veterinarians

## Project Structure

```
wounded-animal-hotline/
├── .github/
│   └── workflows/
│       └── twilio.yml              # Auto-deploy to Twilio
├── src/
│   ├── assets/
│   │   ├── contacts.json           # Wildlife contact database
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

1. **[Phase 1: Project Setup & Dependencies](../../issues/1)** - 30 min
2. **[Phase 2: Create Comprehensive Contact Database](../../issues/2)** - 1 hour
3. **[Phase 3: Design AI System Prompt](../../issues/3)** - 30 min
4. **[Phase 4.1: Build Incoming Call Handler](../../issues/4)** - 30 min
5. **[Phase 4.2: Build Conversation Relay Webhook](../../issues/5)** - 1.5 hours
6. **[Phase 4.3: Build Contact Lookup Utility](../../issues/6)** - 45 min
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

Edit `src/assets/contacts.json`:

```json
{
  "contacts": [
    {
      "id": "wsu-wildlife",
      "name": "WSU Wildlife Rehabilitation Center",
      "phone": "509-335-0711",
      "counties": ["all"],
      "animalTypes": ["all"],
      "hoursType": "24/7",
      "hours": "24 hours, 7 days a week",
      "priority": 1,
      "notes": "State's only 24/7 wildlife emergency service east of Cascades"
    }
  ]
}
```

**Contact Fields:**
- `id` - Unique identifier
- `name` - Organization name
- `phone` - Contact number
- `counties` - Array of counties served (or ["all"])
- `animalTypes` - Array of specialties (e.g., ["raptors", "mammals"])
- `hoursType` - "24/7", "business", or "on-call"
- `hours` - Human-readable hours
- `priority` - 1 (highest) to 5 (lowest)
- `notes` - Special instructions or limitations

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