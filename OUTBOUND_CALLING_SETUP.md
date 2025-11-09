# Otto Outbound Calling System - Complete Setup Guide

## 📞 Overview

Otto's outbound calling system enables proactive customer outreach for appointment reminders, service follow-ups, and marketing campaigns. The system integrates:

- **ElevenLabs Conversational AI** - Otto's voice and intelligence
- **Twilio** - Telephony infrastructure for outbound calls
- **Google Sheets** - Campaign contact list management
- **n8n Workflows** - Campaign orchestration and automation
- **PostgreSQL** - Call logging and campaign tracking

---

## 🛠️ Prerequisites

1. **ElevenLabs Account**
   - API key with conversational AI access
   - Create a separate outbound agent (different from inbound Otto)

2. **Twilio Account**
   - Account SID and Auth Token
   - Phone number configured for outbound calling
   - Sufficient credit for campaign volume

3. **Google Sheets**
   - Service account credentials (JSON file)
   - Sheet with campaign contacts

4. **n8n Instance**
   - Access to https://dualpay.app.n8n.cloud
   - Webhook URLs configured

---

## 📋 Step 1: Create ElevenLabs Outbound Agent

### 1.1 Create New Agent
```bash
# Visit ElevenLabs Console
https://elevenlabs.io/app/conversational-ai

# Click "Create New Agent"
# Name: "Otto Outbound Agent"
```

### 1.2 Configure System Prompt
```
You are Otto, an AI assistant calling on behalf of [Dealership Name]. You're making an outbound call to a customer.

CRITICAL RULES:
- Be warm, professional, and respectful
- Identify yourself immediately: "Hi, this is Otto calling from [Dealership Name]"
- State the purpose of your call clearly
- If voicemail detected, leave a concise message with callback number
- Handle objections gracefully - never be pushy
- Respect do-not-call requests immediately
- Keep calls under 2 minutes unless customer engages

CALL TYPES:
- APPOINTMENT_REMINDER: Remind about upcoming service appointment
- SERVICE_FOLLOWUP: Follow up after recent service visit
- SALES_OUTREACH: Inform about vehicle availability or promotions
- PAYMENT_REMINDER: Gentle reminder about outstanding balance

You have access to customer context via custom variables:
- customer_name: Customer's name
- vehicle_info: Vehicle make/model/year
- service_type: Type of service
- last_service: Last service date
- campaign_type: Purpose of this call

Always use natural conversational flow. If customer is busy, offer to call back at a better time.
```

### 1.3 Configure Voice
- Voice: Choose Otto's voice (e.g., "Daniel" or your custom voice)
- Stability: 0.7
- Similarity: 0.8
- Style: 0.0

### 1.4 Save Agent ID
Copy the agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxxxxx`)

---

## 📋 Step 2: Configure Google Sheets Integration

### 2.1 Create Service Account
```bash
# Go to Google Cloud Console
https://console.cloud.google.com

# Enable Google Sheets API
# Create Service Account
# Download JSON credentials
```

### 2.2 Set Up Campaign Sheet
Create a Google Sheet with these columns:

| Column | Description |
|--------|-------------|
| A: Name | Customer full name |
| B: Phone | Phone number (any format) |
| C: Email | Email address (optional) |
| D: Status | PENDING, CALLED, COMPLETED, FAILED, DO_NOT_CALL |
| E: LastContactDate | ISO date of last contact |
| F: Notes | Call notes or outcome |
| G: VehicleYear | Vehicle year (optional) |
| H: VehicleMake | Vehicle make (optional) |
| I: VehicleModel | Vehicle model (optional) |
| J: ServiceType | Service type (optional) |
| K: LastServiceDate | Last service date (optional) |

**Sheet Name:** `Outbound Campaigns`

### 2.3 Share Sheet with Service Account
```
# In your Google Sheet:
1. Click "Share"
2. Add the service account email (from JSON file)
   Format: xxxx@xxx.iam.gserviceaccount.com
3. Grant "Editor" permission
```

---

## 📋 Step 3: Environment Variables

Add these to your `.env` file:

```bash
# ElevenLabs Outbound
ELEVENLABS_OUTBOUND_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Outbound
TWILIO_OUTBOUND_NUMBER=+18884118568  # Your outbound calling number

# Google Sheets
GOOGLE_SHEETS_CAMPAIGN_ID=1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"..."}' # Entire JSON file as string

# n8n (already configured)
N8N_WEBHOOK_URL=https://dualpay.app.n8n.cloud/webhook

# Base URL for callbacks
BASE_URL=https://ottoagent.net  # Or your domain
```

---

## 📋 Step 4: Database Migration

```bash
# Generate Prisma client with new models
npm run db:generate

# Create migration
npx prisma migrate dev --name add_outbound_campaigns

# Apply migration to production
npx prisma migrate deploy
```

---

## 📋 Step 5: Install Dependencies

```bash
# Install new dependencies
npm install googleapis ws axios
```

---

## 📋 Step 6: n8n Workflow Setup

### 6.1 Create Outbound Campaign Workflow

1. Visit: https://dualpay.app.n8n.cloud/workflows
2. Create new workflow: "Otto Outbound Campaign Manager"

**Workflow Structure:**
```
[Webhook Trigger] 
    ↓
[HTTP Request: Start Campaign]
    POST https://ottoagent.net/api/n8n/trigger-outbound-campaign
    Body: {
      "campaignName": "{{$json.campaignName}}",
      "campaignType": "{{$json.campaignType}}",
      "sheetName": "Outbound Campaigns",
      "delayBetweenCalls": 30,
      "callDuringHours": { "start": "09:00", "end": "18:00" }
    }
    ↓
[Wait 30 minutes]
    ↓
[HTTP Request: Get Campaign Results]
    GET https://ottoagent.net/api/n8n/campaign-results/{{$json.campaignId}}
    ↓
[Send Email: Campaign Report]
    Subject: Campaign {{$json.campaignName}} Results
    Body: 
      - Total Contacts: {{$json.totalContacts}}
      - Called: {{$json.contactsCalled}}
      - Completed: {{$json.contactsCompleted}}
      - Failed: {{$json.contactsFailed}}
      - Completion Rate: {{$json.completionRate}}
```

### 6.2 Save Webhook URL
Copy the production webhook URL for triggering campaigns.

---

## 📋 Step 7: Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Add Otto outbound calling system"
git push origin main

# Railway will auto-deploy
# Or manually deploy on Render
```

---

## 📋 Step 8: Test Outbound System

### 8.1 Add Test Contact to Google Sheets
```
Name: Test User
Phone: YOUR_PHONE_NUMBER
Email: test@example.com
Status: PENDING
```

### 8.2 Trigger Test Campaign via API
```bash
curl -X POST https://ottoagent.net/api/n8n/trigger-outbound-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Test Campaign",
    "campaignType": "GENERAL",
    "sheetName": "Outbound Campaigns",
    "delayBetweenCalls": 5
  }'
```

### 8.3 Monitor Campaign
```bash
# Check campaign status
curl https://ottoagent.net/api/n8n/campaign-results/{CAMPAIGN_ID}

# Check Otto status
curl https://ottoagent.net/api/n8n/otto-status
```

### 8.4 Verify Call Flow
1. You should receive a call within seconds
2. Otto should identify itself
3. Conversation should feel natural
4. Call should be recorded (if enabled)
5. Google Sheets status should update to "CALLED"

---

## 📋 Step 9: Production Checklist

### Before launching real campaigns:

- [ ] **Test with multiple phone numbers** (landline, mobile, VoIP)
- [ ] **Verify answering machine detection** works correctly
- [ ] **Check call quality** - clear audio, no static, proper timing
- [ ] **Review recordings** - ensure Otto follows script
- [ ] **Test do-not-call** - add contact with status "DO_NOT_CALL"
- [ ] **Verify time restrictions** - test outside calling hours
- [ ] **Check rate limiting** - ensure 30s delay between calls
- [ ] **Review Google Sheets updates** - status changes correctly
- [ ] **Test campaign stop** - can halt mid-campaign
- [ ] **Verify database logging** - all calls recorded properly

### Compliance Requirements:

- [ ] **TCPA Compliance** - Have prior express consent for all contacts
- [ ] **DNC List** - Cross-reference against Do Not Call registry
- [ ] **Opt-Out Mechanism** - Otto respects immediate opt-out requests
- [ ] **Call Time Restrictions** - No calls before 8am or after 9pm (local time)
- [ ] **Caller ID** - Display dealership name and callback number
- [ ] **Recording Disclosure** - Include in Otto's greeting if required by state

---

## 🎯 Usage Examples

### Example 1: Appointment Reminder Campaign
```json
{
  "campaignName": "Tomorrow's Service Appointments",
  "campaignType": "APPOINTMENT_REMINDER",
  "sheetName": "Outbound Campaigns",
  "delayBetweenCalls": 30,
  "callDuringHours": { "start": "10:00", "end": "17:00" },
  "recordCalls": true
}
```

### Example 2: Service Follow-Up
```json
{
  "campaignName": "Post-Service Satisfaction Check",
  "campaignType": "SERVICE_FOLLOWUP",
  "sheetName": "Recent Service Customers",
  "delayBetweenCalls": 45,
  "callDuringHours": { "start": "09:00", "end": "18:00" },
  "maxAttempts": 2
}
```

### Example 3: Sales Outreach
```json
{
  "campaignName": "New Inventory Alert",
  "campaignType": "SALES_OUTREACH",
  "sheetName": "Interested Buyers",
  "delayBetweenCalls": 60,
  "callDuringHours": { "start": "10:00", "end": "19:00" }
}
```

---

## 🔧 Troubleshooting

### Calls Not Connecting
```bash
# Check Twilio credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_OUTBOUND_NUMBER

# Verify ElevenLabs agent ID
echo $ELEVENLABS_OUTBOUND_AGENT_ID

# Test ElevenLabs API
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_OUTBOUND_AGENT_ID
```

### Google Sheets Not Updating
```bash
# Verify credentials
echo $GOOGLE_SHEETS_CREDENTIALS | jq .client_email

# Check sheet ID
echo $GOOGLE_SHEETS_CAMPAIGN_ID

# Test sheets API access
node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
auth.getClient().then(() => console.log('✅ Sheets API accessible'));
"
```

### Poor Audio Quality
1. Check Twilio Media Streams status
2. Verify WebSocket connections are stable
3. Review audio conversion logs
4. Test with different phone providers

### Campaign Not Starting
```bash
# Check campaign service status
curl https://ottoagent.net/api/n8n/otto-status

# View server logs
railway logs  # or your hosting provider's log command

# Check database connection
npx prisma db pull
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track:
- **Connection Rate**: % of calls that connect
- **Completion Rate**: % of calls that complete successfully
- **Average Duration**: Mean call length
- **Human vs Voicemail**: Answering machine detection accuracy
- **Conversion Rate**: % of calls achieving campaign goal

### Viewing Call Records:
```sql
-- Recent outbound calls
SELECT * FROM outbound_calls 
ORDER BY initiated_at DESC 
LIMIT 50;

-- Campaign summary
SELECT 
  c.name,
  c.total_contacts,
  c.contacts_called,
  c.contacts_completed,
  ROUND((c.contacts_completed::float / c.total_contacts * 100), 2) as completion_rate
FROM outbound_campaigns c
ORDER BY c.started_at DESC;
```

---

## 🚀 Next Steps

1. **Build Dashboard UI** - Campaign management interface
2. **Add SMS Fallback** - If call fails, send SMS
3. **Implement DNC Checking** - Automatic scrubbing
4. **Create Campaign Templates** - Pre-configured campaign types
5. **Add Voicemail Detection Training** - Improve AMD accuracy
6. **Integrate CRM** - Sync with Dealer FX, Salesforce, etc.

---

## 📞 Support

For issues or questions:
- **Technical**: Check logs at `railway logs` or Render dashboard
- **ElevenLabs**: https://elevenlabs.io/support
- **Twilio**: https://support.twilio.com
- **n8n**: https://docs.n8n.io

---

**System Ready!** 🎉

Otto can now make intelligent outbound calls to your customers. Start with small test campaigns and scale as you validate the system.
