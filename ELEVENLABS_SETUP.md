# ElevenLabs Voice AI Setup Guide

## Current Status
✅ Voice call endpoint working with AWS Polly fallback
❌ ElevenLabs Otto AI agent not activated (missing API key)

## What You Need
- **ElevenLabs API Key** from https://elevenlabs.io/app/settings/api-keys
- **Agent ID**: `agent_3701k70bz4gcfd6vq1bkh57d15bw` (already configured)

---

## Step 1: Get Your ElevenLabs API Key

1. Go to https://elevenlabs.io/app/settings/api-keys
2. Copy your API key (starts with `sk_...`)
3. Keep it secure - don't share publicly

---

## Step 2: Add to Render Environment Variables

### Via Render Dashboard:
1. Go to https://dashboard.render.com
2. Find your **Otto AI** service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `ELEVENLABS_API_KEY`
   - **Value**: `sk_your_api_key_here`
6. Click **Save Changes**
7. Render will automatically redeploy (takes ~2 minutes)

### Via Render CLI (Alternative):
```bash
# Install Render CLI if not already installed
brew install render

# Add environment variable
render env set ELEVENLABS_API_KEY=sk_your_api_key_here

# Trigger deployment
render deploy
```

---

## Step 3: Add to Local .env File (For Testing)

Create or edit `.env` file in project root:

```bash
# Add to .env file
ELEVENLABS_API_KEY=sk_your_api_key_here
```

Then restart your local server:
```bash
npm start
```

---

## Step 4: Test ElevenLabs Voice Call

After API key is added to Render, test the upgraded voice call:

```bash
curl -X POST https://ottoagent.net/api/twilio/reminder-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "York",
    "customerPhone": "+19163337305",
    "appointmentDate": "2025-10-23",
    "appointmentTime": "14:00",
    "appointmentType": "ElevenLabs Voice Test"
  }'
```

**Expected Result**: You'll receive a call with Otto AI's natural conversational voice instead of robotic Polly voice.

---

## Step 5: Add to n8n Workflow (If Not Already Set)

Your n8n "Make Follow-up Call" node needs:

1. **Node Type**: HTTP Request or ElevenLabs Node
2. **URL**: `https://api.elevenlabs.io/v1/convai/conversation`
3. **Headers**:
   - `xi-api-key`: `{{ $env.ELEVENLABS_API_KEY }}`
   - `Content-Type`: `application/json`
4. **Body**:
```json
{
  "agent_id": "agent_3701k70bz4gcfd6vq1bkh57d15bw",
  "phone_number": "{{ $json.customer.phone }}",
  "first_message": "Hello {{ $json.customer.name }}, this is Otto from AutoLux. I'm calling about your {{ $json.appointmentType }} appointment on {{ $json.appointmentDate }} at {{ $json.appointmentTime }}."
}
```

---

## Differences: AWS Polly vs ElevenLabs

### Current (AWS Polly Fallback):
- ❌ Robotic voice quality
- ❌ No conversational AI
- ❌ Simple DTMF input only (press 1 or 2)
- ❌ Can't handle natural responses

### With ElevenLabs Otto AI:
- ✅ Natural human-like voice
- ✅ Conversational AI understands context
- ✅ Can answer questions naturally
- ✅ Handles "I need to reschedule" vs "I'm good"
- ✅ Real-time voice interaction
- ✅ Learns from conversations

---

## Troubleshooting

### Call still uses Polly voice after adding key:
1. Check Render logs: `render logs --tail`
2. Verify environment variable is set correctly
3. Ensure no typos in key name (`ELEVENLABS_API_KEY`)
4. Restart Render service manually

### ElevenLabs API errors:
1. Verify API key is valid: https://elevenlabs.io/app/settings/api-keys
2. Check account has credits/active subscription
3. Verify agent ID exists: `agent_3701k70bz4gcfd6vq1bkh57d15bw`
4. Check ElevenLabs status: https://status.elevenlabs.io

### WebSocket connection fails:
- Ensure Twilio account supports Media Streams
- Check firewall/network settings
- Verify WSS protocol is allowed

---

## Cost Considerations

**ElevenLabs Conversational AI Pricing** (as of Oct 2025):
- ~$0.06 per minute of conversation
- Average call: 2-3 minutes = $0.12-$0.18 per call
- Includes voice generation + AI processing

**Comparison**:
- AWS Polly: ~$0.004 per request (cheaper but basic)
- ElevenLabs: Premium quality, conversational AI

---

## Next Steps After Setup

1. ✅ Add `ELEVENLABS_API_KEY` to Render
2. ✅ Wait for automatic redeploy (~2 min)
3. ✅ Test voice call with curl command above
4. ✅ Verify Otto AI natural voice works
5. ✅ Update n8n workflow to use ElevenLabs
6. ✅ Test full workflow end-to-end

---

**Ready to upgrade?** Get your API key from ElevenLabs and add it to Render now!
