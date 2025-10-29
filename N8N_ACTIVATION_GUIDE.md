# How to Activate Your Otto AI n8n Workflow

## Current Issue
The webhook is rejecting all requests with: 
```
"Missing required fields - Phone number and date are required"
```

This means the n8n workflow is either **not active** or has **validation configured** that we need to adjust.

---

## Steps to Fix

### 1. Log into n8n
Go to: **https://dualpay.app.n8n.cloud**

### 2. Find Your Workflow
Look for: **"Otto - Appointment Booking with SMS & Voice Follow-ups"**

### 3. Check Workflow Status
- At the top right, there should be a toggle switch
- If it says "Inactive" (grayed out), click it to **Activate**
- It should turn green and say "Active"

### 4. Verify Webhook Configuration
Click on the first node: **"Webhook - Appointment Request"**

Check these settings:
- **HTTP Method**: POST
- **Path**: `otto/appointment-request`
- **Response Mode**: "Using 'Respond to Webhook' Node" or "Immediately"

### 5. Remove Any Validation Nodes
Look for any nodes between the Webhook and the main workflow:
- **IF nodes** that check for fields
- **Function nodes** that validate data
- **Set nodes** that transform data

If you see validation that's blocking requests, either:
- Remove it, OR
- Modify it to match our data structure

### 6. Test the Webhook
After activating, n8n will show you the webhook URL. It should be:
```
https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

Click "Listen for Test Event" and then run this command:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "id": "york_123",
      "name": "York",
      "phone": "+19163337305",
      "email": "york@eliteeighth.com"
    },
    "intent": {
      "appointmentType": "oil change",
      "preferredDate": "2025-10-22",
      "preferredTime": "10:00",
      "notes": "Test appointment"
    },
    "callId": "call_test_001"
  }'
```

You should see the data appear in n8n immediately.

### 7. Configure Credentials
Make sure these credentials are set up in n8n:

#### Otto AI API Key
- Go to: **Credentials** menu
- Add new: **HTTP Header Auth**
- Name: "Otto AI API Key"
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_JWT_TOKEN`

#### Twilio Account
- Add new: **Twilio API**
- Account SID: Your Twilio SID
- Auth Token: Your Twilio Auth Token

#### ElevenLabs API
- Add new: **HTTP Header Auth**
- Name: "ElevenLabs API"
- Header Name: `xi-api-key`
- Header Value: Your ElevenLabs API key

### 8. Execute Workflow
Once everything is configured:
1. Click **"Execute Workflow"** button
2. Or send a webhook request
3. Watch the execution in real-time

---

## Expected Successful Response

When properly configured, you should see:

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointmentId": "appt_xxx",
  "smsStatus": "sent",
  "reminderScheduled": true
}
```

---

## Troubleshooting

### Error: "Workflow not found"
- Make sure the workflow is saved
- Check that you're using the correct n8n instance URL

### Error: "Webhook not found"
- Activate the workflow first
- Verify the webhook path matches

### Error: "Missing credentials"
- Go to Credentials section in n8n
- Configure Otto AI, Twilio, and ElevenLabs credentials
- Assign them to the respective nodes

### Error: "API endpoint not responding"
- Check that Otto AI server is running
- Verify the API URL is correct: `https://ottoagent.net/api/appointments`
- Test the endpoint manually first

---

## Quick Test Without n8n

To test if your Otto AI backend is ready, run:

```bash
# Start your local server
npm start

# In another terminal, test the appointment API
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Oil Change - York",
    "type": "oil change",
    "startTime": "2025-10-22T10:00:00Z",
    "endTime": "2025-10-22T11:00:00Z",
    "customerId": "york_123",
    "notes": "Test appointment"
  }'
```

If this works, then your backend is ready and the issue is only with n8n configuration.

---

## Contact Support

If you continue having issues:
- **n8n Support**: support@n8n.io
- **n8n Community**: https://community.n8n.io
- Check n8n execution logs for detailed error messages

---

Once you activate the workflow in n8n, the webhook trigger will work perfectly! 🚀