# Add ElevenLabs API Key to Render - INSTRUCTIONS

## Your ElevenLabs API Key
```
sk_069522a3e143c120684fe6924fa8791093d6fea95c699038
```

## Step-by-Step Instructions

### 1. Go to Render Dashboard
https://dashboard.render.com/

### 2. Find Your Otto AI Service
- Look for your deployed service (probably named "otto-ai-playform" or similar)
- Click on it to open service details

### 3. Add Environment Variable
1. Click on **"Environment"** tab in the left sidebar
2. Scroll to **"Environment Variables"** section
3. Click **"Add Environment Variable"** button
4. Fill in:
   - **Key**: `ELEVENLABS_API_KEY`
   - **Value**: `sk_069522a3e143c120684fe6924fa8791093d6fea95c699038`
5. Click **"Save Changes"**

### 4. Wait for Auto-Redeploy
- Render will automatically redeploy your service (~2-3 minutes)
- You'll see "Deploy in progress..." banner
- Wait until it shows "Live" status

### 5. Test Natural Voice
After deployment completes, run:
```bash
./quick-voice-test.sh
```

You should now see:
```
2️⃣  ElevenLabs: ✅ Configured (Natural AI Voice)
```

And receive a call with **natural conversational AI voice** instead of robotic Polly!

---

## Alternative: Use Render CLI (Faster)

If you have Render CLI installed:
```bash
# Login to Render
render login

# List your services
render services list

# Add environment variable (replace SERVICE_ID with your actual ID)
render env set ELEVENLABS_API_KEY=sk_069522a3e143c120684fe6924fa8791093d6fea95c699038 --service-id YOUR_SERVICE_ID

# Trigger manual deploy
render deploy --service-id YOUR_SERVICE_ID
```

---

## Verification

After adding the key, verify it's working:

1. **Check health endpoint**:
```bash
curl -s https://ottoagent.net/health | grep elevenlabs
```
Should show: `"elevenlabs":true`

2. **Test voice call**:
```bash
./quick-voice-test.sh
```

3. **Test via n8n workflow**:
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "14:00",
    "name": "York",
    "appointmentType": "ElevenLabs Test"
  }'
```

---

## What Changes After Adding Key?

### Before (AWS Polly):
- 🤖 Robotic voice: "Hello valued customer..."
- ❌ No conversational ability
- ❌ Can only handle DTMF (press 1 or 2)

### After (ElevenLabs Otto AI):
- 🎙️ Natural human voice: "Hi! This is Otto from AutoLux..."
- ✅ Conversational AI - understands natural speech
- ✅ Can answer questions: "What time was that again?"
- ✅ Handles responses: "I need to reschedule" vs "Yes, I'm coming"
- ✅ Real-time interaction via WebSocket

---

**⏱️ Estimated Time**: 5 minutes total (2 min to add + 3 min for redeploy)

**Ready?** Go to https://dashboard.render.com/ now!
