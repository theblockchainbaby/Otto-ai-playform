# Otto AI - Trigger Event Test Summary

## Trigger Event Execution Report
**Date:** October 15, 2025
**Test Type:** n8n Appointment Booking Workflow

---

## Attempted Webhook Trigger

### Endpoint
```
POST https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

### Payload Structure (Based on n8n Workflow)
```json
{
  "customer": {
    "id": "cust_demo_001",
    "name": "Michael Rodriguez",
    "phone": "+15551234567",
    "email": "michael.rodriguez@example.com"
  },
  "intent": {
    "appointmentType": "Oil Change & Inspection",
    "preferredDate": "2025-10-22",
    "preferredTime": "10:30",
    "notes": "Customer requested via Otto AI call - routine maintenance"
  },
  "callId": "call_demo_001"
}
```

### Current Status
❌ **Webhook Validation Error**: "Missing required fields - Phone number and date are required"

---

## Analysis

The webhook is returning a validation error, which suggests:

1. **Possible Causes:**
   - The n8n workflow might have additional validation nodes before processing
   - The webhook might be expecting fields at the root level (not nested)
   - The workflow might not be active in n8n
   - There might be custom JavaScript code validating the input

2. **Expected Workflow Steps** (from n8n-workflow-complete-followups.json):
   ```
   1. Webhook receives appointment request
   2. Create appointment in Otto AI API
   3. Send confirmation SMS via Twilio
   4. Wait 24 hours
   5. Send reminder call via ElevenLabs
   6. Wait for appointment time
   7. Send post-appointment follow-up
   ```

---

## Troubleshooting Steps

### Option 1: Check n8n Workflow Status
1. Log into your n8n instance: https://dualpay.app.n8n.cloud
2. Verify the workflow "Otto - Appointment Booking with SMS & Voice Follow-ups" is **Active**
3. Check if there are any error notifications

### Option 2: Test with n8n Test Webhook
1. Open the workflow in n8n editor
2. Click on the "Webhook - Appointment Request" node
3. Use the "Listen for Test Event" feature
4. Send test data through the n8n UI

### Option 3: Check Webhook URL
The workflow file shows:
- Path: `otto/appointment-request`
- Full URL should be: `https://dualpay.app.n8n.cloud/webhook/otto/appointment-request`

Verify this matches your n8n webhook configuration.

---

## Alternative: Manual Trigger via n8n UI

Since the webhook validation is failing, you can manually trigger the workflow:

1. Go to n8n: https://dualpay.app.n8n.cloud
2. Open workflow: "Otto - Appointment Booking with SMS & Voice Follow-ups"
3. Click "Execute Workflow" button
4. Provide test data in the webhook node
5. Monitor execution in real-time

---

## Successful Trigger Would Execute:

### Step 1: Create Appointment
```http
POST https://ottoagent.net/api/appointments
Content-Type: application/json

{
  "title": "Oil Change & Inspection - Michael Rodriguez",
  "type": "Oil Change & Inspection",
  "startTime": "2025-10-22T10:30:00Z",
  "endTime": "2025-10-22T10:30:00Z",
  "customerId": "cust_demo_001",
  "notes": "Customer requested via Otto AI call - routine maintenance"
}
```

### Step 2: Send Confirmation SMS
```
To: +15551234567
From: +18884118568
Message: "Hi Michael Rodriguez! Your Oil Change & Inspection appointment 
is confirmed for 2025-10-22 at 10:30. See you soon! - Otto AI"
```

### Step 3: Wait 24 Hours
*Workflow pauses for 24 hours*

### Step 4: Send Reminder Call (ElevenLabs)
*AI voice call reminder 24 hours before appointment*

### Step 5: Post-Appointment Follow-up
*SMS sent after appointment completion asking for feedback*

---

## Next Steps

1. **Verify n8n Workflow is Active**
   - Check workflow status in n8n dashboard
   - Ensure all credentials are configured:
     - Otto AI API Key
     - Twilio Account
     - ElevenLabs API Key

2. **Test Individual Nodes**
   - Test each node in the workflow separately
   - Verify API endpoints are accessible
   - Check authentication tokens are valid

3. **Review Workflow Logs**
   - Check n8n execution history
   - Look for error messages
   - Verify webhook is receiving requests

4. **Update Webhook Validation**
   - If there's custom validation code, update it to match expected format
   - Or modify the calling application to send data in the expected format

---

## Contact Information

**n8n Instance:** dualpay.app.n8n.cloud
**Otto AI API:** https://ottoagent.net
**Support:** Contact your n8n administrator to activate/troubleshoot the workflow

---

## Sample cURL Commands for Testing

### Test Webhook (Current Format)
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "id": "cust_001",
      "name": "John Doe",
      "phone": "+15551234567",
      "email": "john@example.com"
    },
    "intent": {
      "appointmentType": "Service",
      "preferredDate": "2025-10-22",
      "preferredTime": "14:00",
      "notes": "Test"
    },
    "callId": "call_001"
  }'
```

### Test Otto AI API Directly
```bash
curl -X POST https://ottoagent.net/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Appointment",
    "type": "Service",
    "startTime": "2025-10-22T14:00:00Z",
    "endTime": "2025-10-22T15:00:00Z",
    "customerId": "cust_001",
    "notes": "Test appointment"
  }'
```

---

**Status:** Awaiting n8n workflow activation or validation fix
**Last Updated:** October 15, 2025