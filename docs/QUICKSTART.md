# Quickstart Guide 🚀

Get the Wounded Animal Hotline up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Twilio account created
- [ ] Twilio CLI installed
- [ ] Anthropic API key obtained
- [ ] GitHub repository cloned

## Step 1: Install Twilio CLI (5 minutes)

```bash
# Install Twilio CLI
npm install -g twilio-cli

# Login to your Twilio account
twilio login

# Install serverless plugin
twilio plugins:install @twilio-labs/plugin-serverless

# Verify installation
twilio serverless:list
```

## Step 2: Get Your API Keys (5 minutes)

### Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token** from the dashboard
3. Buy a phone number (if you don't have one):
   - Go to Phone Numbers → Buy a Number
   - Search for a number in your region
   - Purchase it

### Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy and save it securely

## Step 3: Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/dangayle/wounded-animal-hotline.git
cd wounded-animal-hotline

# Navigate to src directory
cd src

# Install dependencies
npm install
```

## Step 4: Configure Environment (3 minutes)

Create `.env` file in the `src/` directory:

```bash
# src/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security Note:** Never commit `.env` to Git. It's already in `.gitignore`.

## Step 5: Test Locally (5 minutes)

```bash
# From src/ directory
twilio serverless:start

# Output will show:
# ┌────────────────────────────────────────────┐
# │                                            │
# │   Twilio functions available:              │
# │   http://localhost:3000/incoming-call      │
# │   http://localhost:3000/conversation-relay │
# │                                            │
# └────────────────────────────────────────────┘
```

Test the functions:

```bash
# In another terminal, test incoming-call endpoint
curl http://localhost:3000/incoming-call
```

## Step 6: Deploy to Twilio (5 minutes)

```bash
# From src/ directory
twilio serverless:deploy

# Copy the deployed URL from output
# Example: https://wounded-animal-hotline-1234-dev.twil.io
```

## Step 7: Configure Phone Number (2 minutes)

1. Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Scroll to **Voice Configuration**
4. Set "A CALL COMES IN" to:
   - **Webhook**
   - `https://your-domain.twil.io/incoming-call`
   - **HTTP POST**
5. Click **Save**

## Step 8: Test the Hotline! (2 minutes)

Call your Twilio phone number and test:

```
Scenario 1: Injured deer in Spokane
- "I found a deer that was hit by a car in Spokane"
- Expected: WSU Wildlife Center, WDFW Spokane office

Scenario 2: Baby bird
- "I found a baby bird on the ground in my yard"
- Expected: Education about baby birds, local rehabilitators
```

## GitHub Actions Setup (Optional, 5 minutes)

For automatic deployment on every push:

1. Go to your GitHub repository → Settings → Secrets
2. Add three secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `ANTHROPIC_API_KEY`
3. Push to main branch - deployment happens automatically!

## Quick Commands Reference

```bash
# Start local development
cd src && twilio serverless:start

# Deploy to Twilio
cd src && twilio serverless:deploy

# View Twilio logs (real-time)
twilio serverless:logs

# List deployed services
twilio serverless:list

# Remove deployment
twilio serverless:remove
```

## Troubleshooting

### "Cannot find module 'twilio'"
```bash
cd src
npm install
```

### "Unauthorized" error during deploy
```bash
twilio login
# Re-enter your credentials
```

### "Function not found" when calling
- Double-check your phone number configuration in Twilio Console
- Ensure the webhook URL matches your deployed domain
- Verify the function name is correct (`/incoming-call`)

### AI not responding
- Check ANTHROPIC_API_KEY is set correctly
- Verify API key has credits/is active
- Check Twilio logs: `twilio serverless:logs`

### No contacts returned
- Verify `contacts.json` is in `src/assets/`
- Check the file is marked as "Private" in Twilio Console
- Ensure JSON syntax is valid

## Development Workflow

### Making Changes

1. **Edit code** in `src/functions/` or `src/assets/`
2. **Test locally**: `twilio serverless:start`
3. **Deploy**: `twilio serverless:deploy`
4. **Test on phone**: Call your Twilio number

### Adding Contacts

1. Edit `src/assets/contacts.json`
2. Add new contact object
3. Deploy: `twilio serverless:deploy`
4. Test with relevant scenario

### Updating AI Prompt

1. Edit `src/assets/system-prompt.txt`
2. Test changes locally first
3. Deploy and test with various scenarios
4. Iterate based on call quality

## Project Phases (Follow GitHub Issues)

Work through issues in order:

- [ ] [Issue #1: Project Setup](../../issues/1) ← START HERE
- [ ] [Issue #2: Contact Database](../../issues/2)
- [ ] [Issue #3: AI System Prompt](../../issues/3)
- [ ] [Issue #4: Incoming Call Handler](../../issues/4)
- [ ] [Issue #5: Conversation Relay Webhook](../../issues/5)
- [ ] [Issue #6: Contact Lookup Utility](../../issues/6)
- [ ] [Issue #7: SMS Follow-Up](../../issues/7) (optional)
- [ ] [Issue #8: Testing & Refinement](../../issues/8)
- [ ] [Issue #9: Documentation & Deployment](../../issues/9)
- [ ] [Issue #10: Hackathon Submission](../../issues/10)

## Next Steps

1. ✅ Complete Phase 1 (Project Setup)
2. ✅ Start building the contact database
3. ✅ Design your AI prompt
4. ✅ Build the core functions
5. ✅ Test thoroughly
6. ✅ Deploy and submit!

## Getting Help

- **Twilio Discord**: Join the hackathon channel
- **GitHub Issues**: [Create an issue](../../issues)
- **Documentation**: See [BUILD_PLAN.md](BUILD_PLAN.md)
- **Twilio Docs**: [ConversationRelay Guide](https://www.twilio.com/docs/voice/conversational-relay)

## Tips for Success

1. **Start simple** - Get basic call flow working first
2. **Test often** - Make a test call after every major change
3. **Use logs** - `twilio serverless:logs` is your friend
4. **Keep responses concise** - TTS works best with short, clear sentences
5. **Handle errors gracefully** - Always have a fallback (general WDFW contact)
6. **Document as you go** - Update README with any changes

## Estimated Timeline

- Setup & First Deployment: **30 minutes**
- Contact Database: **1 hour**
- AI Prompt Design: **30 minutes**
- Core Functions: **2 hours**
- Testing & Polish: **1 hour**
- Documentation: **30 minutes**

**Total: 5-6 hours for complete hackathon submission**

---

**Ready to build?** Start with [Issue #1: Project Setup](../../issues/1) 🚀