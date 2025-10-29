# n8n + ElevenLabs Otto Agent Integration Guide

## 🎯 Overview

This guide shows you how to connect your **new ElevenLabs Otto agent** (`agent_2201k8q07eheexe8j4vkt0b9vecb`) with your **n8n workflow** at `https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK`.

---

## ✅ What's Already Configured

### **Local Environment (.env)**
- ✅ ElevenLabs API Key: `sk_069522a3e143c120684fe6924fa8791093d6fea95c699038`
- ✅ New Agent ID: `agent_2201k8q07eheexe8j4vkt0b9vecb`
- ✅ n8n Webhook URL: `https://dualpay.app.n8n.cloud/webhook`
- ✅ Twilio Integration: Configured

### **Updated Files**
- ✅ `src/services/elevenLabsService.ts` - New agent ID
- ✅ `src/server.js` - New agent ID
- ✅ `src/routes/twilioWebhooks.ts` - New agent ID
- ✅ `elevenlabs-call-test.sh` - New agent ID

---

## 🔧 Step 1: Update Render.com Production Environment

Go to your Render.com dashboard and update the environment variable:

1. Navigate to: https://dashboard.render.com/
2. Select your Otto AI service
3. Go to **Environment** tab
4. Update or add:
   ```
   ELEVENLABS_API_KEY=sk_069522a3e143c120684fe6924fa8791093d6fea95c699038
   ```
5. Click **Save Changes**
6. Render will automatically redeploy

---

## 🔗 Step 2: Configure n8n Workflow

### **Your n8n Workflow URL:**
https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK

### **A. Add ElevenLabs Credentials to n8n**

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "ElevenLabs" or create an **HTTP Request** credential
4. Add your API key:
   ```
   API Key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038
   ```

### **B. Create Webhook Trigger Node**

Add a **Webhook** node to receive events from Otto:

**Webhook Settings:**
- **HTTP Method**: POST
- **Path**: `otto/call-completed` (or your preferred path)
- **Response Mode**: Immediately
- **Response Code**: 200

**Webhook URL will be:**
```
https://dualpay.app.n8n.cloud/webhook/otto/call-completed
```

### **C. Add Twilio Call Node (Recommended for Outbound Calls)**

For outbound calls, use **Twilio** to initiate the call, which then connects to ElevenLabs:

**Node Configuration:**
```json
{
  "method": "POST",
  "url": "https://api.twilio.com/2010-04-01/Accounts/ACafc412b62982312dc2efebaff233cf9f/Calls.json",
  "authentication": "basicAuth",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/x-www-form-urlencoded"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "Url",
        "value": "https://ottoagent.net/api/twilio/voice"
      },
      {
        "name": "To",
        "value": "={{ $json.customer.phone }}"
      },
      {
        "name": "From",
        "value": "+18884118568"
      },
      {
        "name": "StatusCallback",
        "value": "https://ottoagent.net/api/twilio/status"
      }
    ]
  }
}
```

**Basic Auth Credentials:**
- Username: `ACafc412b62982312dc2efebaff233cf9f`
- Password: `32c6e878cdc5707707980e6d6272f713`

**How it works:**
1. n8n calls Twilio API to initiate call
2. Twilio calls the customer's phone
3. When answered, Twilio fetches TwiML from `https://ottoagent.net/api/twilio/voice`
4. TwiML connects the call to ElevenLabs Otto agent
5. Customer talks with Otto AI

---

## 📞 Step 3: Common n8n Workflow Patterns

### **Pattern 1: Appointment Reminder Call**

**Trigger:** Schedule (Cron)
**Flow:**
1. **Schedule Trigger** - Run daily at 9 AM
2. **HTTP Request** - Get appointments from Otto API
   ```
   GET https://ottoagent.net/api/appointments?date=tomorrow
   ```
3. **Loop Over Items** - For each appointment
4. **HTTP Request** - Make Twilio call (connects to Otto)
   ```
   POST https://api.twilio.com/2010-04-01/Accounts/ACafc412b62982312dc2efebaff233cf9f/Calls.json

   Body (x-www-form-urlencoded):
   - Url: https://ottoagent.net/api/twilio/voice
   - To: {{ $json.customer.phone }}
   - From: +18884118568
   - StatusCallback: https://ottoagent.net/api/twilio/status
   ```

   The TwiML at `/api/twilio/voice` will automatically connect to Otto agent `agent_2201k8q07eheexe8j4vkt0b9vecb`

### **Pattern 2: Post-Call Follow-up**

**Trigger:** Webhook from Otto
**Flow:**
1. **Webhook** - Receive call completion event
   ```
   POST https://dualpay.app.n8n.cloud/webhook/otto/call-completed
   ```
2. **Function** - Analyze call outcome
3. **Switch** - Based on call result:
   - **Appointment Booked** → Send confirmation email
   - **Needs Follow-up** → Create task
   - **Emergency** → Alert team

### **Pattern 3: Lead Nurture Campaign**

**Trigger:** New lead created
**Flow:**
1. **Webhook** - New lead event
2. **Wait** - 1 hour
3. **HTTP Request** - Make welcome call via ElevenLabs
4. **Wait** - 24 hours
5. **HTTP Request** - Send follow-up SMS via Twilio
6. **Wait** - 3 days
7. **HTTP Request** - Make check-in call via ElevenLabs

---

## 🔌 Step 4: Otto API Endpoints for n8n

Your Otto server exposes these endpoints for n8n integration:

### **Trigger Appointment Booking**
```bash
POST https://ottoagent.net/api/n8n/trigger/appointment-booking
Content-Type: application/json

{
  "customerId": "customer_id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+19163337305",
  "appointmentType": "Service",
  "preferredDate": "2024-01-15",
  "preferredTime": "10:00 AM",
  "notes": "Oil change requested",
  "callId": "call_id"
}
```

### **Trigger Post-Call Follow-up**
```bash
POST https://ottoagent.net/api/n8n/trigger/call-completed
Content-Type: application/json

{
  "customerId": "customer_id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+19163337305",
  "callId": "call_id",
  "duration": 180,
  "topic": "Service inquiry",
  "sentiment": "POSITIVE",
  "transcript": "Call transcript...",
  "outcome": "APPOINTMENT_BOOKED"
}
```

### **Trigger Lead Nurture**
```bash
POST https://ottoagent.net/api/n8n/trigger/lead-nurture
Content-Type: application/json

{
  "leadId": "lead_id",
  "customerId": "customer_id",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+19163337305",
  "vehicleInterest": "Mercedes S-Class",
  "source": "Website",
  "priority": "HIGH"
}
```

---

## 🧪 Step 5: Test the Integration

### **Test 1: Make a Test Call from n8n**

In your n8n workflow, add a **Manual Trigger** node and test:

```bash
curl -X POST 'https://api.elevenlabs.io/v1/convai/conversation/phone' \
  -H 'xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "agent_2201k8q07eheexe8j4vkt0b9vecb",
    "phone_number": "+19163337305",
    "first_message": "Hi! This is Otto calling from n8n to test the integration. Can you hear me?"
  }'
```

### **Test 2: Trigger from Otto Server**

```bash
curl -X POST 'http://localhost:3000/api/n8n/trigger/appointment-booking' \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "test_123",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+19163337305",
    "appointmentType": "Service",
    "preferredDate": "2024-01-15",
    "preferredTime": "10:00 AM"
  }'
```

---

## 📊 Step 6: Monitor and Debug

### **Check n8n Execution Logs**
1. Go to your workflow in n8n
2. Click **Executions** tab
3. View success/failure status
4. Check error messages

### **Check Otto Server Logs**
```bash
# View server logs
tail -f logs/otto-server.log

# Or check console output
npm start
```

### **Check ElevenLabs Dashboard**
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Select your agent: `agent_2201k8q07eheexe8j4vkt0b9vecb`
3. View call history and analytics

---

## 🚀 Next Steps

1. ✅ **Update Render.com** environment variables
2. ✅ **Configure n8n** workflow with new agent ID
3. ✅ **Test integration** with a test call
4. ✅ **Set up monitoring** for call success/failure
5. ✅ **Create workflows** for:
   - Appointment reminders
   - Lead follow-ups
   - Emergency call routing
   - Post-service surveys

---

## 📝 Important Notes

- **Agent ID**: `agent_2201k8q07eheexe8j4vkt0b9vecb` (NEW)
- **Old Agent ID**: `agent_3701k70bz4gcfd6vq1bkh57d15bw` (DEPRECATED)
- **API Key**: Keep secure, never commit to Git
- **Rate Limits**: ElevenLabs has rate limits, add delays in n8n workflows
- **Cost**: Monitor ElevenLabs usage to control costs

---

## 🆘 Troubleshooting

### **Issue: Calls not connecting**
- ✅ Verify agent ID is correct
- ✅ Check API key is valid
- ✅ Ensure phone number format is E.164 (+1XXXXXXXXXX)

### **Issue: n8n webhook not receiving data**
- ✅ Check webhook URL is correct
- ✅ Verify n8n workflow is active
- ✅ Check Otto server logs for errors

### **Issue: Agent not responding correctly**
- ✅ Check agent configuration in ElevenLabs dashboard
- ✅ Verify first_message is being sent
- ✅ Test agent directly in ElevenLabs interface

---

**Need Help?** Check the logs or test the integration step by step!

