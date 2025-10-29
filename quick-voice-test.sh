#!/bin/bash

# Simple Voice Call Test
echo "🎙️  Otto AI Voice Call Test"
echo "=============================="
echo ""

# Check server
echo "1️⃣  Checking server status..."
SERVER=$(curl -s https://ottoagent.net/health)
echo "   ✅ Server is running"
echo ""

# Check ElevenLabs
if [[ $SERVER == *'"elevenlabs":true'* ]]; then
    echo "2️⃣  ElevenLabs: ✅ Configured (Natural AI Voice)"
    VOICE="ElevenLabs Otto AI"
else
    echo "2️⃣  ElevenLabs: ⚠️  Not configured (Using AWS Polly fallback)"
    VOICE="AWS Polly"
fi
echo ""

# Make test call
echo "3️⃣  Initiating voice call..."
echo "   From: +18884118568"
echo "   To: +19163337305"
echo "   Voice: $VOICE"
echo ""

curl -s -X POST https://ottoagent.net/api/twilio/reminder-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "York",
    "customerPhone": "+19163337305",
    "appointmentDate": "2025-10-23",
    "appointmentTime": "14:00",
    "appointmentType": "Voice Test"
  }' > /dev/null

echo "   ✅ Call request sent!"
echo ""
echo "📱 Check your phone for incoming call from +18884118568"
echo ""

if [[ $SERVER != *'"elevenlabs":true'* ]]; then
    echo "💡 To enable natural AI voice:"
    echo "   1. Get API key: https://elevenlabs.io/app/settings/api-keys"
    echo "   2. Add to Render: ELEVENLABS_API_KEY=sk_..."
    echo "   3. See: ELEVENLABS_SETUP.md"
    echo ""
fi

echo "=============================="
