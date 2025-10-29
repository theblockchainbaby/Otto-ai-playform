# Test Voice Follow-up Call NOW

## Quick Test - Bypass Wait

### Method 1: Test Just the Voice Call Node
1. Open n8n workflow in UI
2. Find the **"Make Follow-up Call"** node
3. Click on it
4. Click **"Execute Node"** button (top right)
5. You should receive a call from +18884118568

---

## Method 2: Skip the 24 Hour Wait

### Edit Workflow to Test Immediately:
1. In n8n workflow UI
2. Find the **"Wait 24 Hours"** node
3. **Delete** it or **disconnect** it
4. Connect **"Send Confirmation SMS"** output directly to **"Send 24hr Reminder SMS"** input
5. Save workflow
6. Trigger again with:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "14:00",
    "name": "York",
    "email": "york@eliteeighth.com",
    "appointmentType": "Voice Call Test",
    "notes": "Testing immediate voice call"
  }'
```

---

## Method 3: Test Call Endpoint Directly (Most Reliable)

Your server has `/api/twilio/reminder-call` endpoint. Test ElevenLabs integration directly:

```bash
curl -X POST https://ottoagent.net/api/twilio/reminder-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "York",
    "customerPhone": "+19163337305",
    "appointmentDate": "2025-10-23",
    "appointmentTime": "14:00",
    "appointmentType": "Voice Call Test"
  }'
```

You should receive a call from **+18884118568** with Otto AI voice agent speaking.

---

## ElevenLabs Voice Call Configuration

The "Make Follow-up Call" node in n8n should be configured with:

- **Agent ID**: `agent_3701k70bz4gcfd6vq1bkh57d15bw`
- **From Number**: `+18884118568` (your Twilio number)
- **To Number**: `{{ $('Webhook - Appointment Request').item.json.customer.phone }}`
  - **Note**: This needs to be fixed to `{{ $json.phone }}` after data transformation fix

---

## Troubleshooting

### If call doesn't come through:
1. Check n8n execution log for "Make Follow-up Call" node
2. Verify ElevenLabs API credentials are set in n8n
3. Check Twilio account balance and number permissions
4. Verify +19163337305 can receive calls from +18884118568

### Expected Call Flow:
1. Otto AI voice agent introduces itself
2. Confirms appointment details (date, time, type)
3. Asks if customer needs to reschedule
4. Records response and updates system

---

**Recommendation**: Use **Method 3** (direct endpoint test) to isolate voice functionality from n8n workflow issues.
