# Update Twilio Webhook for New Otto Agent

## 🚨 Important: Your Webhook Needs Updating!

Looking at your Twilio console screenshot, I noticed your voice webhook is pointing to an **old agent ID**:

**Current Webhook:**
```
https://apius.elevenlabs.io/twilio/inbound_call?agent_id=agent_6201k8j8jwryne1dv...
```

**Should Be (New Otto Agent):**
```
https://apius.elevenlabs.io/twilio/inbound_call?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
```

---

## 🔧 How to Update the Webhook

### **Option 1: Use Your Otto Server (Recommended)**

Your Otto server at `https://ottoagent.net` already has the correct webhook configured with the new agent ID.

**Steps:**
1. Go to Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. Click on your number: `+18884118568`
3. Scroll to **"Voice Configuration"**
4. Under **"A CALL COMES IN"**:
   - Change from: `https://apius.elevenlabs.io/twilio/inbound_call?agent_id=agent_6201k8j8jwryne1dv...`
   - Change to: `https://ottoagent.net/api/twilio/voice`
   - Method: `POST`
5. Click **"Save Configuration"**

**Why this is better:**
- ✅ Uses your own server
- ✅ Already configured with new agent ID
- ✅ You control the logic
- ✅ Can add custom features
- ✅ Logs all calls

---

### **Option 2: Update ElevenLabs Direct Webhook**

If you prefer to use ElevenLabs' direct webhook:

**Steps:**
1. Go to Twilio Console: https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. Click on your number: `+18884118568`
3. Scroll to **"Voice Configuration"**
4. Under **"A CALL COMES IN"**:
   - Update to: `https://apius.elevenlabs.io/twilio/inbound_call?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb`
   - Method: `POST`
5. Click **"Save Configuration"**

---

## 🧪 Test After Updating

### **Test 1: Inbound Call**
```bash
# Call your number from your phone:
+18884118568

# Expected: New Otto agent answers
# You should hear the updated voice and personality
```

### **Test 2: Check Agent ID**
After the call, check ElevenLabs dashboard:
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Look for recent conversations
3. Verify they're under agent: `agent_2201k8q07eheexe8j4vkt0b9vecb`

---

## 📊 Comparison: Otto Server vs Direct ElevenLabs

| Feature | Otto Server | Direct ElevenLabs |
|---------|-------------|-------------------|
| **URL** | `ottoagent.net/api/twilio/voice` | `apius.elevenlabs.io/twilio/inbound_call` |
| **Agent ID** | Configured in code | In URL parameter |
| **Customization** | Full control | Limited |
| **Logging** | Your database | ElevenLabs only |
| **Features** | Can add custom logic | Standard only |
| **Maintenance** | You manage | ElevenLabs manages |
| **Recommended** | ✅ Yes | For simple use |

---

## 🔍 Current Configuration Check

Let me verify what your Otto server is configured to do:

**File:** `src/routes/twilioWebhooks.ts` (line 40-43)
```typescript
stream.parameter({
  name: 'agent_id',
  value: 'agent_2201k8q07eheexe8j4vkt0b9vecb'  // ✅ New agent ID
});
```

**File:** `src/server.js` (line 231-234)
```javascript
stream.parameter({
  name: 'agent_id',
  value: 'agent_2201k8q07eheexe8j4vkt0b9vecb'  // ✅ New agent ID
});
```

**File:** `src/services/elevenLabsService.ts` (line 24-25)
```typescript
private readonly OTTO_AGENT_ID = 'agent_2201k8q07eheexe8j4vkt0b9vecb';  // ✅ New agent ID
```

✅ **Your server is already configured with the new agent ID!**

---

## 🚀 Recommended Action

**Update your Twilio webhook to use your Otto server:**

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. Click: `+18884118568`
3. Voice Configuration → A CALL COMES IN:
   ```
   https://ottoagent.net/api/twilio/voice
   ```
4. Save

**Benefits:**
- ✅ Uses new agent automatically
- ✅ Logs calls to your database
- ✅ Can add custom features later
- ✅ Full control over call flow

---

## 🔗 Quick Links

- **Twilio Phone Numbers**: https://console.twilio.com/us1/develop/phone-numbers/manage/active
- **Otto Agent**: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
- **Your Server**: https://ottoagent.net
- **Server Logs**: Check your Render.com dashboard

---

## ⚠️ Important Note

After updating the webhook, **test immediately** by calling `+18884118568` to ensure:
1. The call connects
2. Otto answers with the new agent
3. The conversation works properly
4. No errors occur

If you encounter issues, you can always revert to the old webhook URL while troubleshooting.

---

**Next Step:** Update the webhook URL in Twilio console, then test by calling your number! 📞

