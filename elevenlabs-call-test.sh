#!/bin/bash

# ElevenLabs Outbound Call Test
echo "📞 ElevenLabs Conversational AI - Outbound Call Test"
echo "====================================================="
echo ""
echo "   Agent: Otto AI (agent_3701k70bz4gcfd6vq1bkh57d15bw)"
echo "   Calling: +19163337305"
echo "   Method: ElevenLabs API Direct"
echo ""

read -p "🎙️  Make a call to your phone now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Initiating call..."
    echo ""
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST 'https://api.elevenlabs.io/v1/convai/conversation/phone' \
      -H 'xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038' \
      -H 'Content-Type: application/json' \
      -d '{
        "agent_id": "agent_2201k8q07eheexe8j4vkt0b9vecb",
        "phone_number": "+19163337305",
        "first_message": "Hi York! This is Otto from AutoLux calling to test our voice AI system. How are you doing today?"
      }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "   Response Code: $HTTP_CODE"
    echo "   Response: $BODY"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo "✅ SUCCESS! Call initiated via ElevenLabs!"
        echo ""
        echo "📱 Check your phone: +19163337305"
        echo "   You should receive a call from Otto AI"
        echo ""
        echo "🎙️  Otto will say:"
        echo "   'Hi York! This is Otto from AutoLux calling to test"
        echo "   our voice AI system. How are you doing today?'"
    else
        echo "❌ Call failed!"
        echo ""
        echo "Possible issues:"
        echo "  - API key invalid or expired"
        echo "  - Agent ID incorrect"
        echo "  - Phone number format issue"
        echo "  - ElevenLabs account credits depleted"
        echo ""
        echo "Check ElevenLabs dashboard: https://elevenlabs.io/app"
    fi
else
    echo "   Cancelled."
fi

echo ""
echo "====================================================="
