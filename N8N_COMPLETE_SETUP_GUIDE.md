# 🚀 Complete n8n Setup Guide - SMS & Voice Follow-ups

## ✅ What You'll Build

An automated workflow that:
1. ✅ **Books appointments** when Otto AI identifies customer intent
2. ✅ **Sends instant SMS confirmation** via Twilio
3. ✅ **Waits 24 hours** automatically
4. ✅ **Sends reminder SMS** 24 hours before appointment
5. ✅ **Makes follow-up call** with Otto's voice (ElevenLabs + Twilio)

---

## 📋 Prerequisites

### **1. Your Credentials (Already Configured)**

✅ **Twilio:**
- Account SID: `ACafc412b62982312dc2efebaff233cf9f`
- Auth Token: `32c6e878cdc5707707980e6d6272f713`
- Phone Number: `+18884118568`

✅ **ElevenLabs:**
- API Key: `sk_069522a3e143c120684fe6924fa8791093d6fea95c699038`
- Otto Agent ID: `agent_3701k70bz4gcfd6vq1bkh57d15bw`

✅ **n8n:**
- Instance: `https://dualpay.app.n8n.cloud`
- Webhook Base: `https://dualpay.app.n8n.cloud/webhook`

---

## 🎯 Step-by-Step Setup

### **Step 1: Import the Workflow into n8n**

1. **Open n8n:** Go to https://dualpay.app.n8n.cloud

2. **Create New Workflow:**
   - Click **"+ Add workflow"** (top right)
   - Click **"..."** menu → **"Import from File"**

3. **Import the JSON:**
   - Select the file: `n8n-workflow-complete-followups.json`
   - Click **"Import"**

4. **Workflow Imported!** You should now see 7 nodes:
   - Webhook - Appointment Request
   - Create Appointment in Otto AI
   - Send Confirmation SMS
   - Wait 24 Hours
   - Send 24hr Reminder SMS
   - Make Follow-up Call (Otto Voice)
   - Respond to Webhook

---

### **Step 2: Configure Credentials**

#### **A. Otto AI API Key**

1. Click on **"Create Appointment in Otto AI"** node
2. Under **"Credential for Header Auth"**, click **"Create New"**
3. Fill in:
   - **Name:** `Otto AI API Key`
   - **Value:** `Bearer test_api_key_12345` (for now)
4. Click **"Save"**

#### **B. Twilio Account**

1. Click on **"Send Confirmation SMS"** node
2. Under **"Credential for Twilio"**, click **"Create New"**
3. Fill in:
   - **Credential Name:** `Twilio Account`
   - **Account SID:** `ACafc412b62982312dc2efebaff233cf9f`
   - **Auth Token:** `32c6e878cdc5707707980e6d6272f713`
4. Click **"Save"**

**Note:** The same Twilio credential will be used for all Twilio nodes (SMS and voice calls)

---

### **Step 3: Activate the Workflow**

1. Click the **"Inactive"** toggle at the top to make it **"Active"**
2. The workflow is now live and listening for webhooks!

---

### **Step 4: Deploy Backend Changes**

The reminder call endpoint has been added to your backend. Let's deploy it:

```bash
git add .
git commit -m "Add Twilio reminder call endpoint with ElevenLabs voice"
git push origin main
```

Wait 2-3 minutes for Render to deploy.

---

## 🧪 Testing the Complete Workflow

### **Test 1: Trigger Appointment Booking**

```bash
curl -X POST https://ottoagent.net/api/n8n/trigger/appointment-booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_customer_123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+15551234567",
    "appointmentType": "oil change",
    "preferredDate": "2025-10-20",
    "preferredTime": "14:00",
    "notes": "Regular maintenance",
    "callId": "test_call_456"
  }'
```

**What Should Happen:**
1. ✅ Otto AI sends data to n8n webhook
2. ✅ n8n creates appointment in Otto AI
3. ✅ **Instant SMS sent:** "Hi John Doe! Your oil change appointment is confirmed for 2025-10-20 at 14:00. See you soon! - Otto AI"
4. ✅ Workflow waits 24 hours
5. ✅ **24hr Reminder SMS sent:** "Reminder: John Doe, your appointment is tomorrow at 14:00. Reply CONFIRM to confirm or CANCEL to reschedule. - Otto AI"
6. ✅ **Follow-up call made:** Otto's voice calls the customer with appointment reminder

---

### **Test 2: Check n8n Execution**

1. Go to https://dualpay.app.n8n.cloud
2. Click **"Executions"** tab (top)
3. You should see your test execution
4. Click on it to see:
   - ✅ Webhook received
   - ✅ Appointment created
   - ✅ SMS sent
   - ⏳ Waiting (will show "Waiting" status for 24 hours)

---

### **Test 3: Test Reminder Call Directly**

To test the voice call without waiting 24 hours:

```bash
curl -X POST "https://ottoagent.net/api/twilio/reminder-call?name=John%20Doe&type=oil%20change&time=2:00%20PM" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

This will return TwiML that Twilio uses to make the call with Otto's voice.

---

## 📊 Workflow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│         CUSTOMER CALLS OTTO: +1 (888) 411-8568              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OTTO AI (ElevenLabs Agent)                      │
│         "I need an oil change for tomorrow at 2pm"          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         OTTO BACKEND → n8n Webhook Trigger                   │
│         POST /webhook/otto/appointment-request              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         CREATE APPOINTMENT IN OTTO AI DATABASE               │
│         POST /api/appointments                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         SEND INSTANT SMS CONFIRMATION (Twilio)               │
│         "Hi John! Your oil change is confirmed..."          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         WAIT 24 HOURS (n8n Wait Node)                        │
│         Workflow pauses automatically                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         SEND 24HR REMINDER SMS (Twilio)                      │
│         "Reminder: Your appointment is tomorrow..."         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         MAKE FOLLOW-UP CALL (Twilio + ElevenLabs)            │
│         Otto's voice: "Hello John, this is Otto..."         │
│         Customer can press 1 to confirm, 2 to reschedule    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 How It Works in Production

### **Real Customer Journey:**

1. **Customer calls:** `+1 (888) 411-8568`
2. **Otto answers:** "Hello, this is Otto from AutoLux..."
3. **Customer says:** "I need an oil change tomorrow at 2pm"
4. **Otto understands:** Extracts intent (appointment booking)
5. **Otto triggers n8n:** Sends webhook to n8n
6. **n8n creates appointment:** Stores in database
7. **Instant SMS:** Customer receives confirmation immediately
8. **24 hours later:** Customer receives reminder SMS
9. **Follow-up call:** Otto calls customer to confirm
10. **Customer confirms:** Presses 1 on phone
11. **Appointment confirmed:** Ready to go!

---

## 🔧 Customization Options

### **Change Wait Time**

In the **"Wait 24 Hours"** node:
- Change `amount: 24` to any number
- Change `unit: hours` to `minutes`, `days`, or `weeks`

**Example:** For 1-hour reminder:
```json
{
  "unit": "hours",
  "amount": 1
}
```

### **Customize SMS Messages**

In the **"Send Confirmation SMS"** node, edit the message:
```
Hi {{ $('Webhook - Appointment Request').item.json.customer.name }}! 
Your {{ $('Webhook - Appointment Request').item.json.intent.appointmentType }} 
appointment is confirmed for {{ $('Webhook - Appointment Request').item.json.intent.preferredDate }} 
at {{ $('Webhook - Appointment Request').item.json.intent.preferredTime }}. 
See you soon! - Otto AI
```

### **Customize Voice Message**

Edit the reminder call endpoint in `src/routes/twilioWebhooks.ts`:
```typescript
const reminderMessage = `Hello ${name}, this is Otto from AutoLux. 
I'm calling to remind you about your ${type} appointment tomorrow at ${time}. 
Please press 1 to confirm, or press 2 to reschedule. Thank you!`;
```

---

## 🆘 Troubleshooting

### **Issue: SMS not sending**

**Check:**
1. Twilio credentials are correct in n8n
2. Phone number is in E.164 format: `+15551234567`
3. Twilio account has SMS enabled

**Fix:**
- Go to n8n → Credentials → Twilio Account
- Verify Account SID and Auth Token

---

### **Issue: Voice call not working**

**Check:**
1. ElevenLabs API key is set in Render environment variables
2. Twilio phone number can make outbound calls
3. Reminder call endpoint is deployed

**Fix:**
```bash
# Check if endpoint is live
curl https://ottoagent.net/api/twilio/reminder-call?name=Test&type=service&time=2pm
```

---

### **Issue: Workflow not triggering**

**Check:**
1. Workflow is **Active** (toggle is ON)
2. Webhook URL is correct in Otto AI backend
3. n8n webhook URL is set in Render environment variables

**Fix:**
```bash
# Check n8n connection
curl https://ottoagent.net/api/n8n/health
```

---

## 📚 Next Steps

### **1. Add More Follow-up Sequences**

Create additional workflows for:
- Post-service follow-up (3 days after appointment)
- Lead nurturing (weekly check-ins)
- Birthday greetings
- Service reminders (every 3 months)

### **2. Add Email Notifications**

Add an **"Send Email"** node after appointment creation:
- Use Gmail, Outlook, or SMTP
- Send detailed appointment confirmation with calendar invite

### **3. Integrate with Google Calendar**

Add **"Google Calendar"** node to:
- Check availability before booking
- Create calendar events automatically
- Send calendar invites to customers

### **4. Add CRM Integration**

Connect to your CRM:
- Salesforce
- HubSpot
- Zoho CRM
- Custom CRM via API

---

## ✅ Checklist

- [ ] Import workflow into n8n ✅
- [ ] Configure Otto AI API credential ✅
- [ ] Configure Twilio credential ✅
- [ ] Activate workflow ✅
- [ ] Deploy backend changes ✅
- [ ] Test appointment booking ⏳
- [ ] Test SMS confirmation ⏳
- [ ] Test reminder call ⏳
- [ ] Verify in production ⏳

---

## 🎉 You're All Set!

Your Otto AI system now has:
- ✅ Automated appointment booking
- ✅ Instant SMS confirmations
- ✅ 24-hour reminder SMS
- ✅ Follow-up voice calls with Otto's voice
- ✅ Full integration with Twilio + ElevenLabs

**Total automation time:** ~30 seconds from call to confirmation! 🚀

---

## 📞 Support

**Need help?**
- Check n8n executions for errors
- Review Twilio logs: https://console.twilio.com/
- Check ElevenLabs usage: https://elevenlabs.io/
- Test endpoints: https://ottoagent.net/api/n8n/health

**Everything is ready to go!** 🎯

