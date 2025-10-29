#!/bin/bash

# Test New ElevenLabs Agent Integration
# Agent ID: agent_2201k8q07eheexe8j4vkt0b9vecb

echo "🧪 Testing New ElevenLabs Otto Agent"
echo "======================================"
echo ""
echo "Agent ID: agent_2201k8q07eheexe8j4vkt0b9vecb"
echo "Agent URL: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb"
echo ""

# Test 1: Make a test call
echo "📞 Test 1: Making a test call to your phone..."
echo ""

read -p "Enter your phone number (E.164 format, e.g., +19163337305): " PHONE_NUMBER

if [ -z "$PHONE_NUMBER" ]; then
    echo "❌ Phone number is required"
    exit 1
fi

echo ""
echo "🔄 Initiating call to $PHONE_NUMBER..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST 'https://api.elevenlabs.io/v1/convai/conversation/phone' \
  -H 'xi-api-key: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038' \
  -H 'Content-Type: application/json' \
  -d "{
    \"agent_id\": \"agent_2201k8q07eheexe8j4vkt0b9vecb\",
    \"phone_number\": \"$PHONE_NUMBER\",
    \"first_message\": \"Hi! This is Otto from AutoLux calling to test our new AI agent integration. How are you doing today?\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Response Code: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Call initiated successfully!"
    echo "📱 You should receive a call shortly from Otto"
    echo ""
    echo "Conversation ID: $(echo $BODY | grep -o '"conversation_id":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ Call failed with status code: $HTTP_CODE"
    echo "Error: $BODY"
fi

echo ""
echo "======================================"
echo "🔗 Next Steps:"
echo "1. Answer the call and test the conversation"
echo "2. Configure n8n workflow at: https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK"
echo "3. Update Render.com environment variables"
echo "4. Read N8N_ELEVENLABS_INTEGRATION.md for full setup"
echo ""

