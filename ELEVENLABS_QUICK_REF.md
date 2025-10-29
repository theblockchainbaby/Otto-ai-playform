# 🎙️ ElevenLabs Otto AI - Quick Reference

## ✅ COMPLETED SETUP

### Local Environment (.env)
```bash
ELEVENLABS_API_KEY="sk_069522a3e143c120684fe6924fa8791093d6fea95c699038"
```

### Otto AI Agent Details
- **Agent ID**: `agent_3701k70bz4gcfd6vq1bkh57d15bw`
- **Test URL**: https://elevenlabs.io/app/talk-to?agent_id=agent_3701k70bz4gcfd6vq1bkh57d15bw
- **Phone**: +18884118568 (Twilio)

---

## 🚀 PRODUCTION DEPLOYMENT (Render)

### Add to Render Environment:
1. **Dashboard**: https://dashboard.render.com/
2. **Key**: `ELEVENLABS_API_KEY`
3. **Value**: `sk_069522a3e143c120684fe6924fa8791093d6fea95c699038`
4. **Save** → Auto-redeploy (~2 min)

---

## 🧪 TESTING COMMANDS

### Quick Voice Test
```bash
./quick-voice-test.sh
```

### Full n8n Workflow Test
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

### Check Production Status
```bash
curl -s https://ottoagent.net/health | grep elevenlabs
# Should show: "elevenlabs":true
```

---

## 📋 VOICE CAPABILITIES

### Current (AWS Polly Fallback)
- ❌ Robotic voice
- ❌ No conversation
- ❌ DTMF only (press 1/2)

### With ElevenLabs (After Render Setup)
- ✅ Natural human voice
- ✅ Conversational AI
- ✅ Understands natural speech
- ✅ Can answer questions
- ✅ Real-time interaction

---

## 🔧 TROUBLESHOOTING

### Voice still robotic after Render deploy?
```bash
# Check Render logs
render logs --tail

# Verify environment variable
curl -s https://ottoagent.net/health | jq .features.elevenlabs
```

### Test agent directly (browser)
https://elevenlabs.io/app/talk-to?agent_id=agent_3701k70bz4gcfd6vq1bkh57d15bw

### Check ElevenLabs account
- Dashboard: https://elevenlabs.io/
- API Keys: https://elevenlabs.io/app/settings/api-keys
- Usage: Check if you have remaining credits

---

## 📞 EXPECTED CALL FLOW

1. **Phone rings**: From +18884118568
2. **Otto introduces**: "Hi! This is Otto from AutoLux..."
3. **Confirms details**: Your appointment details
4. **Asks question**: "Are you still available?"
5. **Handles response**: Natural conversation
6. **Confirms action**: "Great! I've confirmed your appointment."

---

## 📚 DOCUMENTATION

- **Setup Guide**: `ELEVENLABS_SETUP.md`
- **Render Instructions**: `RENDER_ADD_ELEVENLABS.md`
- **Voice Testing**: `TEST_VOICE_CALL_NOW.md`
- **n8n Workflow**: `N8N_TEST_WITHOUT_WAIT.md`

---

## ⏱️ TIMELINE

- ✅ **Local Setup**: Complete
- ⏳ **Render Deployment**: ~5 minutes (your action needed)
- ✅ **Testing Scripts**: Ready
- ⏳ **n8n Integration**: After Render deploy

---

**Next Action**: Add `ELEVENLABS_API_KEY` to Render Dashboard → https://dashboard.render.com/
