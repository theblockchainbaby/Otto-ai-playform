# ElevenLabs Conversational AI - Outbound Call Setup

## Current Setup Status

✅ **Inbound Calls Work**: You can call +18884118568 and ElevenLabs Otto answers
❌ **Outbound Calls**: Not working - need to configure ElevenLabs to make calls

---

## ElevenLabs Conversational AI Phone Calls

ElevenLabs can make **outbound calls** directly through their API!

### Method 1: Use ElevenLabs API Directly (RECOMMENDED)

Instead of using Twilio to initiate calls, use ElevenLabs API:

**API Endpoint**: `POST https://api.elevenlabs.io/v1/convai/conversation/phone`

**Example Request**:
```bash
curl -X POST 'https://api.elevenlabs.io/v1/convai/conversation/phone' \
  -H 'xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "agent_3701k70bz4gcfd6vq1bkh57d15bw",
    "phone_number": "+19163337305",
    "first_message": "Hi York! This is Otto from AutoLux. I wanted to confirm your appointment for October 23rd at 2 PM. Are you still available?"
  }'
```

This will make ElevenLabs call +19163337305 directly!

---

## Method 2: Configure in n8n Workflow

Update your n8n "Make Follow-up Call" node to use ElevenLabs API instead of Twilio:

**Node Configuration**:
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://api.elevenlabs.io/v1/convai/conversation/phone`
- **Authentication**: None (use header)
- **Headers**:
  ```
  xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "agent_id": "agent_3701k70bz4gcfd6vq1bkh57d15bw",
    "phone_number": "{{ $json.customer.phone }}",
    "first_message": "Hi {{ $json.customer.name }}! This is Otto from AutoLux. I wanted to confirm your {{ $json.appointmentType }} appointment for {{ $json.appointmentDate }} at {{ $json.appointmentTime }}. Are you still available?"
  }
  ```

---

## Test Right Now!

Let me create a test script that uses ElevenLabs API directly:

```bash
#!/bin/bash
echo "📞 Making call via ElevenLabs Conversational AI..."

curl -X POST 'https://api.elevenlabs.io/v1/convai/conversation/phone' \
  -H 'xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "agent_3701k70bz4gcfd6vq1bkh57d15bw",
    "phone_number": "+19163337305",
    "first_message": "Hi York! This is Otto from AutoLux calling to test our voice AI system. Can you hear me clearly?"
  }'

echo ""
echo "✅ Call request sent to ElevenLabs!"
echo "📱 Check your phone: +19163337305"
```

Save as `elevenlabs-call-test.sh` and run it!

---

## Update Server Endpoint (Optional)

If you want to keep using the `/api/twilio/reminder-call` endpoint, we can modify it to use ElevenLabs API instead of returning TwiML:

**Updated server.js**:
```javascript
app.post('/api/twilio/reminder-call', async (req, res) => {
  try {
    const { customerName, customerPhone, appointmentDate, appointmentTime, appointmentType } = req.body;

    // Use ElevenLabs API to make the call
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation/phone', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: 'agent_3701k70bz4gcfd6vq1bkh57d15bw',
        phone_number: customerPhone,
        first_message: `Hi ${customerName}! This is Otto from AutoLux. I wanted to confirm your ${appointmentType} appointment for ${appointmentDate} at ${appointmentTime}. Are you still available?`
      })
    });

    const data = await response.json();
    res.json({ success: true, callId: data.conversation_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Pricing

**ElevenLabs Phone Calls**:
- ~$0.15 per minute (conversational AI included)
- Includes voice generation + AI processing + telephony

**Twilio Alternative**:
- ~$0.01 per minute (just phone connection)
- Would need separate voice AI integration

ElevenLabs is more expensive but handles everything in one API call!

---

## Next Steps

1. ✅ Test with the curl command above
2. ✅ Update n8n workflow to use ElevenLabs API
3. ✅ (Optional) Update server endpoint to use ElevenLabs API

---

**Want me to create the test script and update your server?**
