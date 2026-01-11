# Otto AI Platform - AI Coding Agent Instructions

## Project Overview

Otto AI is an **enterprise-grade automotive dealership management platform** powered by ElevenLabs conversational AI. The system handles phone calls, appointment scheduling, and complete business automation through a Node.js/Express backend with vanilla JavaScript frontend, orchestrated by n8n workflows.

**Live Production:** https://ottoagent.net | **Phone:** +1 (888) 411-8568

## Architecture & Critical Patterns

### The Otto AI Agent Flow
Otto (`agent_2201k8q07eheexe8j4vkt0b9vecb`) is an ElevenLabs conversational AI connected via WebSocket:

1. **Twilio receives call** → Sends to `/api/twilio/voice` (NO auth middleware)
2. **TwiML response** → Streams audio to `wss://api.elevenlabs.io/v1/convai/conversation/ws`
3. **Otto converses** → Extracts intent, calls ONE webhook: `/otto/ai-router`
4. **GPT-4 analyzes** → Routes to correct n8n workflow (appointments, service, etc.)
5. **Actions execute** → Google Calendar, SMS/Email confirmations, database updates

**Critical:** Never add `authMiddleware` to `/api/twilio/*` routes - Twilio can't authenticate.

### Dual Runtime Environment
The codebase runs **both TypeScript and JavaScript**:
- **Entry point:** `src/server.js` (JavaScript) loaded by `npm run dev`
- **Type definitions:** `src/server.ts` exists but isn't the runtime file
- **Routes:** Mixed `.ts` (type-safe) and `.js` (legacy) - both work
- **No build step:** Code runs directly via node, no hot reload

**Pattern:** When editing routes, check if `.js` or `.ts` version is actually loaded in `src/server.js`.

### Database Access Pattern
**Always run Prisma commands before code changes involving the database:**
```bash
npm run db:generate  # MUST run after schema.prisma changes
npm run db:migrate   # Create migration (dev)
npm run db:push      # Quick schema sync (dev only, no migration history)
```

The Prisma schema has **30+ enums** - grep them before adding new status fields. Common gotcha: Using wrong enum value (e.g., `CallStatus.ACTIVE` doesn't exist, use `CallStatus.ANSWERED`).

## Critical Developer Workflows

### Starting Development
```bash
# NEVER skip this after pulling schema changes:
npm run db:generate

# Start server - NO hot reload, restart manually:
npm run dev

# Test Otto voice integration:
./make-otto-call.sh
```

### Working with Twilio Webhooks
**TwiML responses must be valid XML.** Use the `twilio` SDK's VoiceResponse builder:

```javascript
const twilio = require('twilio');
const twiml = new twilio.twiml.VoiceResponse();

// Connect to Otto via WebSocket
const connect = twiml.connect();
const stream = connect.stream({
  url: 'wss://api.elevenlabs.io/v1/convai/conversation/ws'
});
stream.parameter({ name: 'agent_id', value: 'agent_2201k8q07eheexe8j4vkt0b9vecb' });
stream.parameter({ name: 'authorization', value: `Bearer ${process.env.ELEVENLABS_API_KEY}` });

res.type('text/xml');
res.send(twiml.toString());
```

**Never** wrap TwiML routes with `authMiddleware` - stored in `src/routes/twilioSimple.js` and `src/routes/twilioWebhooks.ts`.

### n8n Workflow Pattern
Otto uses **one intelligent webhook** instead of multiple endpoints:
- **Single entry:** `https://dualpay.app.n8n.cloud/webhook/otto/ai-router`
- **GPT-4 intent analysis:** Determines customer intent from conversation
- **Dynamic routing:** Branches to booking, availability, status check, etc.
- **Automated actions:** Calendar events, SMS, email all triggered automatically

To add new Otto capabilities: Update the n8n workflow, NOT ElevenLabs tools config.

### VIN Decoding Integration
Service auto-extracts VINs from text and decodes via cascading APIs:
```javascript
// vinDecodingService.js usage
const vinService = require('./services/vinDecodingService');

// Extract VIN from customer message
const result = await vinService.extractAndDecode("My VIN is 1HGCV41JXMN109186");
// Returns: { vin, decoded: { make, model, year, ... }, formatted: {...} }
```

**API cascade:** NHTSA (free) → VinAudit (paid) → RapidAPI (paid). Never hardcode vehicle data when VIN available.

## Project-Specific Conventions

### Frontend: Pure Vanilla JavaScript
**Zero frameworks** - all client-side code is vanilla JS in `public/js/`. Mercedes-Benz inspired design in `public/css/`. Static files served directly from Express.

### Service Singletons
Services in `src/services/` are **exported instances**, not classes:
```javascript
// CORRECT usage:
const elevenLabsService = require('./services/elevenLabsService');
await elevenLabsService.generateSpeech({...});

// WRONG - don't instantiate:
const service = new ElevenLabsService(); // ❌
```

### Authentication Flow
JWT-based with `authMiddleware` from `src/middleware/auth.ts`:
- **User object injected:** `req.user = { id, email, role }`
- **Role checking:** Use `requireRole(['ADMIN', 'MANAGER'])` middleware
- **Exception:** Twilio/n8n webhooks skip auth entirely

### Environment Variables (Critical)
```bash
# Otto AI Integration
ELEVENLABS_API_KEY=sk_...           # Otto voice agent
ELEVENLABS_OUTBOUND_AGENT_ID=agent_...  # For outbound campaigns

# Twilio Phone System
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+18884118568
TWILIO_OUTBOUND_NUMBER=+19257226886  # Separate number for campaigns

# AI Analysis
OPENAI_API_KEY=sk-...                # GPT-4 for intent routing

# Database
POSTGRES_URL=postgresql://...        # Prisma connection

# Security
JWT_SECRET=...                        # Token signing
BASE_URL=https://ottoagent.net       # For webhook callbacks
```

## Testing & Debugging

### Manual Testing
```bash
# Test Otto call handling:
./make-otto-call.sh

# Test outbound campaigns:
npm run test:outbound +19165551234

# Test Google Sheets integration:
npm run test:sheets-read

# Test VIN decoding:
curl -X POST http://localhost:3000/api/vin/decode \
  -H "Content-Type: application/json" \
  -d '{"vin": "1HGCV41JXMN109186"}'
```

### Debugging Otto Issues
1. **Check Twilio logs:** https://console.twilio.com/us1/monitor/logs/calls
2. **Check n8n executions:** https://dualpay.app.n8n.cloud/executions
3. **Verify webhook URLs** match deployed domain in ElevenLabs config
4. **Test TwiML directly:** POST to `/api/twilio/voice` with Twilio body format

### Common Gotchas

1. **"Prisma Client not found"** → Run `npm run db:generate` after any schema change
2. **Twilio 401 errors** → Route has `authMiddleware` - remove it
3. **Otto not calling webhook** → Check ElevenLabs tool URL matches `BASE_URL` env var
4. **Database enum errors** → Check `prisma/schema.prisma` for valid enum values (30+ enums defined)
5. **Server changes not applying** → No hot reload - manually restart `npm run dev`

## Deployment Context

**Platform:** Railway | **Domain:** ottoagent.net (GoDaddy DNS)
- Auto-deploys from GitHub `main` branch
- Database: PostgreSQL on Railway (auto-provisioned)
- SSL/TLS: Automatic via Railway
- **Required env vars:** Set in Railway dashboard (see `DEPLOYMENT.md`)

**Pre-deploy checklist:**
1. Run `npm run db:generate` locally
2. Test Twilio webhooks with ngrok if changed
3. Verify `BASE_URL` env var matches production domain
4. Check n8n webhook URLs point to production, not localhost

## Integration External Services

| Service | Purpose | Config Location |
|---------|---------|----------------|
| **ElevenLabs** | Otto voice agent | https://elevenlabs.io/app/conversational-ai |
| **Twilio** | Phone system | https://console.twilio.com/us1/develop/phone-numbers/manage/active |
| **n8n** | Workflow automation | https://dualpay.app.n8n.cloud/workflows |
| **OpenAI** | Intent analysis | GPT-4 API, configured in n8n workflows |
| **Google Sheets** | Outbound campaign data | Service account JSON in env var |

## Key Files & Their Roles

| File | Critical Knowledge |
|------|-------------------|
| `src/server.js` | **Runtime entry point** - loads routes, not server.ts |
| `src/routes/twilioSimple.js` | **Main Twilio webhook** - NO auth, TwiML responses only |
| `src/services/elevenLabsService.ts` | Otto WebSocket config, TwiML generation |
| `prisma/schema.prisma` | 20+ models, 30+ enums - check before adding fields |
| `n8n-workflow-otto-ai-router.json` | GPT-4 intent router - edit here for new Otto features |
| `src/services/vinDecodingService.js` | VIN extraction/decoding with API cascade |

## Documentation Navigation

| Task | Reference |
|------|-----------|
| Add Otto capabilities | `OTTO_AI_ROUTER_SETUP.md` |
| Setup outbound campaigns | `OUTBOUND_CALLING_SETUP.md` |
| Configure n8n workflows | `N8N_COMPLETE_SETUP_GUIDE.md` |
| Integrate CRM data | `CRM_INTEGRATION_GUIDE.md` |
| Deploy to production | `DEPLOYMENT.md` |
| VIN decoding features | `VIN_INTEGRATION_SUMMARY.md` |

---

**Remember:** Otto routes ALL requests through ONE intelligent webhook using GPT-4 analysis. Never add multiple tool-specific webhooks to ElevenLabs. Always test live calls after phone-related changes.
