# Otto Outbound Calling - Implementation Summary

## 🎯 What We Built

A complete **outbound calling system** that enables Otto to proactively call customers from Google Sheets lists, orchestrated via n8n workflows. The system handles appointment reminders, service follow-ups, and sales outreach with intelligent conversation management.

---

## 📁 New Files Created

### Core Services
1. **`src/services/elevenLabsOutboundService.js`** (192 lines)
   - ElevenLabs API integration for outbound conversations
   - WebSocket management for real-time audio streaming
   - Conversation data collection (transcripts, audio, outcomes)
   - Functions: `createOutboundAgent()`, `getOutboundSignedUrl()`, `startOutboundConversation()`, `getConversationTranscript()`

2. **`src/services/twilioOutboundService.js`** (142 lines)
   - Twilio outbound calling API wrapper
   - Campaign management with rate limiting
   - Answering machine detection (AMD)
   - Call recording and status tracking
   - Functions: `makeOutboundCall()`, `makeOutboundCampaign()`, `getCallDetails()`, `getCallRecording()`, `hangupCall()`

3. **`src/services/googleSheetsService.js`** (170 lines)
   - Google Sheets API integration
   - Campaign contact list management
   - Status tracking and updates
   - Call result logging
   - Functions: `getCampaignContacts()`, `updateContactStatus()`, `appendCallResult()`, `getFollowupContacts()`

4. **`src/services/outboundCampaignService.js`** (240 lines)
   - Campaign orchestration layer
   - Contact filtering and validation
   - Call scheduling and rate limiting
   - Time-based restrictions (calling hours)
   - Campaign status tracking
   - Functions: `startCampaign()`, `runCampaign()`, `stopCampaign()`, `getCampaignStatus()`, `handleCallCompleted()`

### Routes
5. **`src/routes/twilioOutbound.js`** (380 lines)
   - Twilio webhook handlers for outbound calls
   - TwiML generation for WebSocket media streaming
   - Status callbacks (initiated, answered, completed)
   - AMD callbacks (human vs voicemail detection)
   - Recording callbacks
   - WebSocket endpoint for bidirectional audio
   - Audio conversion (PCM ↔ mulaw) with upsampling/downsampling

6. **`src/routes/n8nWebhooks.js`** (updated)
   - Added outbound campaign triggers
   - Campaign status endpoints
   - Stop campaign endpoint
   - Otto status check

### Database
7. **`prisma/schema.prisma`** (updated)
   - Added `OutboundCampaign` model
   - Added `OutboundCall` model
   - Added `CampaignType` enum
   - Added `CampaignStatus` enum

### Documentation
8. **`OUTBOUND_CALLING_SETUP.md`** (500+ lines)
   - Complete setup guide with step-by-step instructions
   - ElevenLabs agent configuration
   - Google Sheets template
   - n8n workflow setup
   - Environment variables
   - Testing procedures
   - Troubleshooting guide
   - Compliance checklist (TCPA, DNC)

### Scripts
9. **`setup-outbound.sh`**
   - Automated setup script
   - Dependency installation
   - Environment validation
   - Prisma migration
   - API connection tests

10. **`test-outbound-api.sh`**
    - API endpoint testing
    - Campaign creation and management
    - Status checking

---

## 🔧 System Architecture

```
┌─────────────────┐
│   n8n Workflow  │ ← Triggers campaigns on schedule
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  outboundCampaignService.js         │
│  - Orchestrates entire campaign     │
│  - Manages rate limiting            │
│  - Enforces calling hours           │
└────────┬────────────────────────────┘
         │
         ├──────────────────────────┐
         ↓                          ↓
┌─────────────────┐      ┌──────────────────┐
│ Google Sheets   │      │ Twilio API       │
│ - Read contacts │      │ - Place calls    │
│ - Update status │      │ - AMD detection  │
│ - Log results   │      │ - Record calls   │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ↓
                         ┌──────────────────┐
                         │ Twilio Webhooks  │
                         │ - TwiML routing  │
                         │ - Media streams  │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         ↓                  ↓
                  ┌─────────────┐   ┌──────────────┐
                  │ ElevenLabs  │   │ PostgreSQL   │
                  │ - AI voice  │   │ - Call logs  │
                  │ - Transcripts│   │ - Campaigns  │
                  └─────────────┘   └──────────────┘
```

---

## 🔑 Key Features

### ✅ Intelligent Call Routing
- **AI-powered conversations** via ElevenLabs outbound agent
- **Answering machine detection** with appropriate handling
- **Custom variables** passed to each conversation (customer name, vehicle info, etc.)

### ✅ Campaign Management
- **Google Sheets integration** for easy contact list management
- **Rate limiting** to prevent carrier issues (configurable delay between calls)
- **Time restrictions** - no calls outside business hours
- **Status tracking** - PENDING → CALLED → COMPLETED/FAILED
- **Campaign analytics** - completion rates, duration, outcomes

### ✅ Bidirectional Audio
- **Twilio Media Streams** WebSocket integration
- **Audio format conversion** (PCM 16kHz ↔ mulaw 8kHz)
- **Real-time streaming** between customer and ElevenLabs
- **High-quality audio** with proper upsampling/downsampling

### ✅ Compliance & Safety
- **Do-not-call respect** - contacts marked "DO_NOT_CALL" are skipped
- **Call time restrictions** - configurable business hours
- **Manual stop capability** - campaigns can be halted mid-run
- **Opt-out handling** - Otto respects immediate opt-out requests
- **Call recording** - all conversations recorded for quality/compliance

### ✅ n8n Workflow Integration
- **Trigger campaigns** from n8n workflows
- **Campaign status reporting** back to n8n
- **Automated follow-ups** based on call outcomes
- **Email reports** with campaign results

---

## 🌊 Call Flow

```
1. n8n triggers campaign
   ↓
2. Campaign service loads contacts from Google Sheets
   ↓
3. For each contact:
   ├─ Check: Is it within calling hours?
   ├─ Check: Is contact marked DO_NOT_CALL?
   ├─ Create ElevenLabs signed URL with custom variables
   ├─ Initiate Twilio outbound call
   ├─ TwiML routes call to WebSocket media stream
   ├─ Connect Twilio ↔ ElevenLabs (bidirectional audio)
   ├─ AMD detects human vs voicemail
   ├─ Otto conducts conversation
   ├─ Record call audio
   ├─ Log call to database
   ├─ Update Google Sheets status
   ├─ Wait 30 seconds (rate limiting)
   └─ Next contact
   ↓
4. Campaign completes
   ↓
5. Results sent back to n8n
```

---

## 📊 Database Models

### OutboundCampaign
```prisma
- id: String (cuid)
- name: String
- type: CampaignType (APPOINTMENT_REMINDER, SERVICE_FOLLOWUP, etc.)
- dealershipId: String?
- googleSheetId: String?
- status: CampaignStatus (PENDING, ACTIVE, RUNNING, COMPLETED, etc.)
- totalContacts: Int
- contactsCalled: Int
- contactsCompleted: Int
- contactsFailed: Int
- startedAt: DateTime?
- completedAt: DateTime?
- scheduledTime: DateTime?
- settings: Json (delayBetweenCalls, callDuringHours, etc.)
```

### OutboundCall
```prisma
- id: String (cuid)
- callSid: String (unique)
- customerName: String
- customerPhone: String
- customerEmail: String?
- status: String (INITIATED, RINGING, ANSWERED, COMPLETED, FAILED)
- direction: String (OUTBOUND)
- initiatedAt: DateTime
- answeredAt: DateTime?
- completedAt: DateTime?
- duration: Int? (seconds)
- answeredBy: String? (human, machine_start, machine_end_beep, etc.)
- recordingUrl: String?
- recordingSid: String?
- recordingDuration: Int?
- transcript: String?
- outcome: String? (HUMAN_ANSWERED, VOICEMAIL, NO_ANSWER, etc.)
- notes: String?
- campaignId: String?
```

---

## 🔌 API Endpoints

### Campaign Management
- `POST /api/n8n/trigger-outbound-campaign` - Start new campaign
- `GET /api/n8n/campaign-results/:campaignId` - Get campaign status
- `POST /api/n8n/stop-campaign/:campaignId` - Stop running campaign
- `GET /api/n8n/otto-status` - Check system readiness

### Twilio Webhooks (No Auth)
- `POST /api/twilio/outbound/twiml` - Generate TwiML for call
- `WS /api/twilio/outbound/media-stream` - WebSocket media streaming
- `POST /api/twilio/outbound/status-callback` - Call status updates
- `POST /api/twilio/outbound/amd-callback` - AMD results
- `POST /api/twilio/outbound/recording-callback` - Recording URLs

---

## 🚀 Next Steps

### Immediate (Before Production)
1. **Create ElevenLabs outbound agent** with proper system prompt
2. **Set up Google Sheets service account** and share campaign sheet
3. **Configure environment variables** (see OUTBOUND_CALLING_SETUP.md)
4. **Run database migration** (`npx prisma migrate deploy`)
5. **Test with your phone number** (add to Google Sheets)
6. **Verify call quality** and conversation flow

### Phase 2 (Enhancement)
1. **Build dashboard UI** for campaign management
2. **Add DNC list checking** before each call
3. **Implement SMS fallback** if call fails
4. **Create campaign templates** (common scenarios)
5. **Add voicemail transcription** (analyze voicemail outcomes)
6. **Integrate with CRM** (sync call results to Dealer FX, Salesforce, etc.)

### Phase 3 (Scale)
1. **Multi-dealership support** (separate campaigns per dealership)
2. **A/B testing** (different scripts, voices, timing)
3. **Predictive dialing** (optimize connection rates)
4. **Advanced analytics** (conversion tracking, sentiment analysis)
5. **AI-powered optimization** (best time to call, script improvements)

---

## ⚙️ Configuration Required

Before using the system, configure these environment variables:

```bash
# ElevenLabs
ELEVENLABS_OUTBOUND_AGENT_ID=agent_xxxxxxxx  # Create separate outbound agent

# Twilio
TWILIO_OUTBOUND_NUMBER=+18884118568  # Your outbound number

# Google Sheets
GOOGLE_SHEETS_CAMPAIGN_ID=1SR-OivNGO02...  # Your campaign sheet ID
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account"...}'  # Full JSON

# Server
BASE_URL=https://ottoagent.net  # Your domain for callbacks
```

---

## 📞 Usage Example

```bash
# 1. Add contacts to Google Sheet
# (Name, Phone, Email, Status=PENDING, etc.)

# 2. Trigger campaign via n8n or direct API
curl -X POST https://ottoagent.net/api/n8n/trigger-outbound-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Service Appointment Reminders",
    "campaignType": "APPOINTMENT_REMINDER",
    "sheetName": "Outbound Campaigns",
    "delayBetweenCalls": 30,
    "callDuringHours": {"start": "09:00", "end": "18:00"}
  }'

# 3. Monitor progress
curl https://ottoagent.net/api/n8n/campaign-results/{CAMPAIGN_ID}

# 4. Check Google Sheets for updated statuses
```

---

## 🎉 System Ready!

The Otto outbound calling system is now fully implemented. Run `./setup-outbound.sh` to complete the setup, then follow the testing guide in `OUTBOUND_CALLING_SETUP.md`.

**Key Advantages:**
- ✅ Fully automated campaign execution
- ✅ Natural AI conversations (ElevenLabs)
- ✅ Answering machine detection
- ✅ Easy contact management (Google Sheets)
- ✅ Complete call logging and analytics
- ✅ n8n workflow integration
- ✅ TCPA compliance features
- ✅ High-quality bidirectional audio
- ✅ Scalable architecture

**Total Lines of Code:** ~1,500 lines across 6 new/updated files
