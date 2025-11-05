# Otto AI Platform - AI Coding Agent Instructions

## Project Overview

Otto AI is an **enterprise-grade automotive dealership management platform** powered by ElevenLabs conversational AI for intelligent phone call handling, appointment scheduling, and complete business automation. The platform combines a Node.js/Express backend with a vanilla JavaScript frontend, integrated with n8n workflows for automation.

**Live Production:** https://ottoagent.net | **Phone:** +1 (888) 411-8568

## Architecture & Core Components

### 1. Backend Stack
- **Node.js + Express + TypeScript** - REST API server (`src/server.ts`)
- **Prisma ORM** - Database management with PostgreSQL
- **AI Integration Layer** - ElevenLabs (Otto agent), OpenAI GPT-4, Twilio
- **Authentication** - JWT-based with role-based access control

### 2. Otto AI Agent Architecture
Otto is a **custom ElevenLabs conversational AI agent** (ID: `agent_3701k70bz4gcfd6vq1bkh57d15bw`) that:
- Handles inbound customer calls via Twilio
- Uses **ONE intelligent webhook** (`/api/twilio/otto/ai-router`) that routes ALL requests through GPT-4 intent analysis
- Automatically triggers n8n workflows for appointment booking, SMS/email confirmations, calendar events
- Extracts and decodes VINs from customer conversations for vehicle data enrichment

**Key Pattern:** Instead of multiple webhooks, Otto uses a **single AI router** that analyzes intent and dynamically routes to appropriate workflows (see `OTTO_AI_ROUTER_SETUP.md`).

### 3. n8n Workflow Integration
Critical workflows in project root (`n8n-workflow-*.json`):
- `otto-ai-router.json` - Main routing hub with GPT-4 intent analysis
- `appointment-booking.json` - Creates calendar events, sends SMS/email confirmations
- `complete-followups.json` - 24-hour wait → reminder SMS → follow-up call with Otto's voice

**n8n Instance:** https://dualpay.app.n8n.cloud

### 4. Database Architecture
Complex Prisma schema (`prisma/schema.prisma`) with 20+ models including:
- **Customer/Vehicle/Lead/Call/Appointment** - Core CRM entities
- **Message/Task/Campaign** - Communication and workflow automation
- **EmergencyCall/ServiceRequest/ServiceProvider** - Roadside assistance system
- **Enums:** 30+ enums for statuses, types, priorities (e.g., `AppointmentStatus`, `CallDirection`)

## Critical Developer Workflows

### Starting Development
```bash
# ALWAYS use Prisma commands for database:
npm run db:generate    # Generate Prisma client after schema changes
npm run db:migrate     # Create and apply migrations
npm run db:push        # Push schema changes (dev only)

# Start server (NO hot reload - restart manually)
npm run dev            # Runs src/server.js via node directly
```

### Working with Routes
Routes are in `src/routes/` with **dual file structure**:
- `.ts` files - TypeScript implementations (primary)
- `.js` files - Some legacy JavaScript routes (e.g., `customers.js`, `auth.js`)

**Convention:** All routes use Express Router pattern. Protected routes require `authMiddleware` from `src/middleware/auth.ts`.

Example route structure:
```typescript
import express from 'express';
const router = express.Router();

// GET /api/appointments
router.get('/', authMiddleware, async (req, res) => { /* ... */ });

export default router;
```

### Twilio Webhooks (NO AUTH)
`src/routes/twilioWebhooks.ts` - **Critical:** These routes must NOT use `authMiddleware` as Twilio calls them directly. Endpoints:
- `POST /api/twilio/otto/incoming` - Receives inbound calls
- `POST /api/twilio/reminder-call` - Automated reminder calls from n8n
- Responses MUST be TwiML XML format

### VIN Decoding Integration
New feature (`vinDecodingService.js`) - Automatically extracts VINs from text and decodes via:
1. NHTSA API (free, primary)
2. VinAudit API (commercial fallback)
3. RapidAPI (secondary fallback)

**Endpoints:** `POST /api/vin/decode`, `POST /api/vin/extract`, `GET /api/vin/validate/:vin`

## Project-Specific Conventions

### Frontend Patterns
- **Pure vanilla JavaScript** - NO frameworks (React, Vue, etc.)
- **Mercedes-Benz inspired design** - Luxury automotive aesthetic
- Files: `public/autolux-dashboard.html`, `public/js/`, `public/css/`
- Static file serving from `public/` directory

### Service Layer Pattern
Services in `src/services/`:
- `elevenLabsService.ts` - ElevenLabs SDK wrapper for Otto agent interactions
- `twilioService.ts` - Twilio client for calls/SMS
- `aiService.ts` - OpenAI GPT-4 integration for message analysis
- `vinDecodingService.js` - VIN extraction and decoding
- `crmIntegrationService.js` - CRM data formatting (Salesforce, HubSpot, etc.)

**Pattern:** Services are singleton classes or exported functions. Import and use directly.

### Environment Variables
Critical env vars (see `.env`):
- `ELEVENLABS_API_KEY` - Otto AI agent access
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `OPENAI_API_KEY` - GPT-4 for intent analysis
- `POSTGRES_URL` - Database connection string
- `JWT_SECRET` - Authentication

### Error Handling
- Use `errorHandler` middleware from `src/middleware/errorHandler.ts`
- Always wrap async routes in try/catch
- Return JSON errors: `{ success: false, error: 'message' }`

## Testing & Debugging

### Manual Testing Otto
```bash
# Test Otto's voice call:
./make-otto-call.sh

# Test ElevenLabs integration:
./elevenlabs-ready.sh

# Test n8n workflow:
curl -X POST https://ottoagent.net/api/n8n/trigger/appointment-booking \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Test User", ...}'
```

### Debugging n8n Workflows
1. Check executions at https://dualpay.app.n8n.cloud/executions
2. Verify webhook URLs match environment config
3. Test workflows independently before Otto integration

## Common Pitfalls & Solutions

1. **Prisma Client Not Found** → Run `npm run db:generate` after schema changes
2. **Twilio Webhooks Failing** → NEVER add `authMiddleware` to Twilio routes
3. **Otto Not Responding** → Verify `ELEVENLABS_API_KEY` and agent ID match production
4. **n8n Workflows Not Triggering** → Check webhook URLs in n8n match deployed domain (ottoagent.net)
5. **Database Migrations** → Always use `npx prisma migrate dev` - never manual SQL
6. **Server Not Reloading** → NO hot reload configured - manually restart after code changes

## Deployment Context

**Platform:** Railway (production) | **Domain:** ottoagent.net (GoDaddy DNS)
- See `DEPLOYMENT.md` for full deployment guide
- Database: PostgreSQL on Railway
- Auto-deploys from GitHub main branch
- SSL/TLS automatically configured

## Integration Endpoints

Key external integrations:
- **ElevenLabs:** https://elevenlabs.io/app/conversational-ai (Otto agent config)
- **Twilio Console:** https://console.twilio.com (phone number config)
- **n8n Workflows:** https://dualpay.app.n8n.cloud/workflows
- **OpenAI:** GPT-4 for message/intent analysis

## Documentation Map

When extending functionality, reference:
- `N8N_COMPLETE_SETUP_GUIDE.md` - Workflow automation patterns
- `CONFIGURE_OTTO_TOOLS.md` - Adding new tools to ElevenLabs
- `VIN_INTEGRATION_SUMMARY.md` - VIN decoding implementation
- `CRM_INTEGRATION_GUIDE.md` - CRM data formatting patterns
- `ELEVENLABS_SETUP.md` - ElevenLabs agent configuration

## Key Files to Understand

| File | Purpose |
|------|---------|
| `src/server.ts` | Main Express app with route registration |
| `prisma/schema.prisma` | Complete database schema (20+ models) |
| `src/routes/twilioWebhooks.ts` | Twilio call handling and TwiML generation |
| `n8n-workflow-otto-ai-router.json` | AI-powered request routing workflow |
| `src/services/elevenLabsService.ts` | Otto AI agent interaction layer |

---

**Remember:** Otto uses intelligent AI routing through a single webhook - avoid adding multiple tool-specific webhooks. Always test with live Otto calls after changes to phone-related features.
