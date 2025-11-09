# 🚀 Otto AI Outbound Calling System - Complete Review

## 📋 System Overview

You've built a **sophisticated outbound calling system** that integrates:
- **ElevenLabs Conversational AI** for natural voice conversations
- **Twilio** for telephony infrastructure
- **Google Sheets** for campaign contact management
- **PostgreSQL/Prisma** for call tracking and analytics
- **n8n** for workflow automation

---

## ✅ What's Already Implemented

### 1. **Database Schema** ✅
**File:** `prisma/schema.prisma`

#### OutboundCampaign Model
```prisma
model OutboundCampaign {
  id          String   @id @default(cuid())
  name        String
  type        CampaignType
  dealershipId String?
  googleSheetId String?
  status      CampaignStatus @default(PENDING)
  
  totalContacts    Int @default(0)
  contactsCalled   Int @default(0)
  contactsCompleted Int @default(0)
  contactsFailed   Int @default(0)
  
  startedAt    DateTime?
  completedAt  DateTime?
  scheduledTime DateTime?
  
  settings     Json? // { delayBetweenCalls, callDuringHours, maxAttemptsPerContact, recordCalls }
  
  calls OutboundCall[]
}
```

#### OutboundCall Model
```prisma
model OutboundCall {
  id          String   @id @default(cuid())
  callSid     String   @unique
  
  customerName  String
  customerPhone String
  customerEmail String?
  
  status      String   // INITIATED, RINGING, ANSWERED, COMPLETED, FAILED, NO_ANSWER, BUSY
  direction   String   @default("OUTBOUND")
  
  initiatedAt DateTime @default(now())
  answeredAt  DateTime?
  completedAt DateTime?
  
  duration    Int?     // in seconds
  answeredBy  String?  // human, machine_start, machine_end_beep, etc.
  
  recordingUrl String?
  recordingSid String?
  recordingDuration Int?
  
  transcript  String?
  outcome     String?  // HUMAN_ANSWERED, VOICEMAIL, NO_ANSWER, BUSY, FAILED
  notes       String?
  
  campaign    OutboundCampaign? @relation(fields: [campaignId], references: [id])
  campaignId  String?
}
```

**Campaign Types:**
- `APPOINTMENT_REMINDER` - Remind customers of upcoming appointments
- `SERVICE_FOLLOWUP` - Follow up after service visits
- `SALES_OUTREACH` - Reach out to leads
- `CUSTOMER_SATISFACTION` - Post-purchase satisfaction surveys
- `PAYMENT_REMINDER` - Payment due reminders
- `GENERAL` - General purpose campaigns

**Campaign Status:**
- `PENDING` → `RUNNING` → `COMPLETED` / `STOPPED` / `FAILED`

---

### 2. **Service Layer** ✅

#### A. **ElevenLabsOutboundService** (`src/services/elevenLabsOutboundService.js`)
**Purpose:** Manage ElevenLabs Conversational AI for outbound calls

**Key Methods:**
- `createOutboundAgent(config)` - Create new AI agent
- `getOutboundSignedUrl(customVariables)` - Get WebSocket URL for conversation
- `startOutboundConversation(config)` - Initiate AI conversation

**Features:**
- WebSocket-based real-time conversation
- Custom variables for personalization (customer name, campaign type, etc.)
- Audio streaming (PCM 16kHz)
- Transcript capture
- Conversation outcome tracking

#### B. **TwilioOutboundService** (`src/services/twilioOutboundService.js`)
**Purpose:** Handle Twilio telephony for outbound calls

**Key Methods:**
- `makeOutboundCall(config)` - Initiate single outbound call
- `makeOutboundCampaign(contacts, campaignConfig)` - Batch calling with rate limiting
- `getCallDetails(callSid)` - Fetch call status and details
- `getCallRecording(callSid)` - Get recording URL
- `hangupCall(callSid)` - Terminate active call

**Features:**
- Answering Machine Detection (AMD)
- Call recording
- Status callbacks
- Rate limiting (30s default between calls)
- Voicemail detection

#### C. **GoogleSheetsService** (`src/services/googleSheetsService.js`)
**Purpose:** Manage campaign contacts via Google Sheets

**Key Methods:**
- `getCampaignContacts(sheetName)` - Read contact list
- `updateContactStatus(rowNumber, status, notes)` - Update call status
- `appendCallResult(callData)` - Log call results
- `createCampaignInDatabase(config)` - Create campaign record

**Features:**
- Public sheet access (CSV export) OR private API access
- Real-time status updates
- Call result logging
- Contact validation

#### D. **OutboundCampaignService** (`src/services/outboundCampaignService.js`)
**Purpose:** Orchestrate entire outbound campaign workflow

**Key Methods:**
- `startCampaign(campaignConfig)` - Start new campaign
- `runCampaign(campaignId, contacts, config)` - Execute campaign
- `stopCampaign(campaignId)` - Stop running campaign
- `getCampaignStatus(campaignId)` - Get campaign progress
- `handleCallCompleted(callSid, callData)` - Process completed calls

**Features:**
- Campaign state management
- Rate limiting and scheduling
- Call result tracking
- Google Sheets integration
- Database persistence

---

### 3. **API Routes** ✅

#### A. **Twilio Outbound Routes** (`src/routes/twilioOutbound.js`)

**Endpoints:**

1. **POST `/api/twilio/outbound/twiml`**
   - Generates TwiML to connect call to WebSocket
   - Passes custom variables (customer name, campaign type)

2. **WebSocket `/api/twilio/outbound/media-stream`**
   - Bidirectional audio streaming
   - Twilio ↔ ElevenLabs audio bridge
   - Audio format conversion (mulaw 8kHz ↔ PCM 16kHz)

3. **POST `/api/twilio/outbound/status-callback`**
   - Tracks call status changes
   - Updates database on completion

4. **POST `/api/twilio/outbound/amd-callback`**
   - Answering Machine Detection results
   - Handles voicemail vs human detection

5. **POST `/api/twilio/outbound/recording-callback`**
   - Receives recording URL when call completes
   - Stores in database

**Audio Conversion:**
- Twilio uses **mulaw 8kHz**
- ElevenLabs uses **PCM 16kHz**
- Real-time conversion in both directions

#### B. **n8n Webhook Routes** (`src/routes/n8nWebhooks.js`)

**Endpoints:**

1. **POST `/api/n8n/trigger-outbound-campaign`**
   - Trigger campaign from n8n workflow
   - Parameters: campaignName, campaignType, dealershipId, sheetName, etc.

2. **GET `/api/n8n/campaign-results/:campaignId`**
   - Get campaign progress and results
   - Returns: status, totalContacts, contactsCalled, completionRate

3. **POST `/api/n8n/stop-campaign/:campaignId`**
   - Stop running campaign

4. **GET `/api/n8n/otto-status`**
   - Health check for outbound system
   - Verifies all services are configured

---

### 4. **Environment Configuration** ✅

**Current `.env` Settings:**
```env
# Outbound Calling Configuration
ELEVENLABS_OUTBOUND_AGENT_ID="agent_8401k9gvthgyepjth51ya2sfh2k2"
TWILIO_OUTBOUND_NUMBER="+19257226886"
GOOGLE_SHEETS_CAMPAIGN_ID="1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w"
GOOGLE_SHEETS_CREDENTIALS=""  # Needs to be added
BASE_URL="https://ottoagent.net"
```

---

## 🔧 What Needs to Be Done

### 1. **Run Database Migration** 🔴 CRITICAL
```bash
npx prisma migrate dev --name add_outbound_calling
npx prisma generate
```

### 2. **Set Up Google Sheets** 🟡 IMPORTANT

**Option A: Public Access (Easier)**
- Make sheet publicly viewable
- Use CSV export URL
- Already implemented in code

**Option B: Service Account (More Secure)**
1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account
4. Download credentials JSON
5. Add to `.env` as `GOOGLE_SHEETS_CREDENTIALS`

**Sheet Structure:**
```
Sheet: "Outbound Campaigns"
Columns: Name | Phone | Email | Status | Last Called | Notes
```

### 3. **Test the System** 🟢 READY

Create test script to verify everything works.

---

## 📊 System Flow

```
1. n8n Workflow Triggers Campaign
   ↓
2. OutboundCampaignService.startCampaign()
   ↓
3. GoogleSheetsService.getCampaignContacts()
   ↓
4. For each contact:
   ├─ TwilioOutboundService.makeOutboundCall()
   ├─ Twilio calls customer
   ├─ TwiML connects to WebSocket
   ├─ ElevenLabs AI converses with customer
   ├─ Audio streams bidirectionally
   ├─ Call completes
   ├─ Recording saved
   ├─ Status updated in database
   └─ Google Sheets updated
   ↓
5. Campaign completes
```

---

## 🎯 Next Steps

1. ✅ **Review this document** - Understand the architecture
2. 🔴 **Run database migration** - Add tables to database
3. 🟡 **Configure Google Sheets** - Set up contact management
4. 🟢 **Create test campaign** - Verify end-to-end flow
5. 🔵 **Build UI** - Dashboard for campaign management
6. 🟣 **Deploy to production** - Push to ottoagent.net

---

## 💡 Key Features

✅ **Answering Machine Detection** - Otto knows when to leave voicemail
✅ **Call Recording** - All calls recorded and stored
✅ **Rate Limiting** - Configurable delays between calls
✅ **Campaign Tracking** - Real-time progress monitoring
✅ **Google Sheets Integration** - Easy contact management
✅ **n8n Automation** - Trigger campaigns from workflows
✅ **Database Persistence** - Full call history and analytics
✅ **WebSocket Streaming** - Real-time AI conversations

---

## 🚨 Important Notes

1. **Twilio Costs:** Outbound calls cost ~$0.01-0.02/minute
2. **ElevenLabs Costs:** Conversational AI usage-based pricing
3. **Compliance:** Ensure TCPA compliance for outbound calling
4. **Testing:** Test with your own number first
5. **Rate Limits:** Respect carrier rate limits (30s between calls recommended)

---

Ready to continue? Let me know which step you want to tackle next! 🚀

