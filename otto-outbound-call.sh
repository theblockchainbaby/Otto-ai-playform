#!/bin/bash

# Make an outbound call using ElevenLabs Conversational AI
# This uses ElevenLabs' phone number management system

echo "📞 Otto Outbound Call via ElevenLabs"
echo "====================================="
echo ""

# Configuration
ELEVENLABS_API_KEY="sk_069522a3e143c120684fe6924fa8791093d6fea95c699038"
OTTO_AGENT_ID="agent_2201k8q07eheexe8j4vkt0b9vecb"

# Get phone number from user
read -p "Enter phone number to call (E.164 format, e.g., +19163337305): " TO_NUMBER

if [ -z "$TO_NUMBER" ]; then
    echo "❌ Phone number is required"
    exit 1
fi

# Get custom message (optional)
read -p "Enter custom first message (or press Enter for default): " CUSTOM_MESSAGE

if [ -z "$CUSTOM_MESSAGE" ]; then
    CUSTOM_MESSAGE="Hi! This is Otto from AutoLux. I'm calling to test our AI assistant. How are you doing today?"
fi

echo ""
echo "🔄 Initiating call to $TO_NUMBER..."
echo "🤖 Using Otto Agent: $OTTO_AGENT_ID"
echo ""

# Try the signed URL endpoint for outbound calls
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=$OTTO_AGENT_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$OTTO_AGENT_ID\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    SIGNED_URL=$(echo "$BODY" | jq -r '.signed_url // empty')
    
    if [ -n "$SIGNED_URL" ]; then
        echo "✅ Got signed URL for conversation"
        echo "🔗 Signed URL: $SIGNED_URL"
        echo ""
        echo "📱 To make the call, you can:"
        echo "1. Use the ElevenLabs dashboard: https://elevenlabs.io/app/conversational-ai"
        echo "2. Click on your Otto agent"
        echo "3. Use the 'Make a call' feature"
        echo ""
        echo "Or integrate this signed URL into your web app for browser-based calls."
    else
        echo "⚠️  Signed URL method not available"
        echo ""
        echo "📋 Alternative: Use ElevenLabs Dashboard"
        echo "1. Go to: https://elevenlabs.io/app/conversational-ai"
        echo "2. Select Otto agent: $OTTO_AGENT_ID"
        echo "3. Click 'Make a call' or 'Test agent'"
        echo "4. Enter phone number: $TO_NUMBER"
        echo ""
        echo "Response: $BODY"
    fi
else
    echo "⚠️  Direct API call not available (Status: $HTTP_CODE)"
    echo ""
    echo "📋 To make outbound calls with Otto:"
    echo ""
    echo "Option 1: Use ElevenLabs Dashboard (Easiest)"
    echo "  1. Go to: https://elevenlabs.io/app/talk-to?agent_id=$OTTO_AGENT_ID"
    echo "  2. Click the phone icon or 'Call' button"
    echo "  3. Enter phone number: $TO_NUMBER"
    echo "  4. Click 'Call' to initiate"
    echo ""
    echo "Option 2: Use n8n Workflow"
    echo "  1. Go to: https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK"
    echo "  2. Create a webhook that calls ElevenLabs API"
    echo "  3. Trigger the workflow with customer data"
    echo ""
    echo "Option 3: Upgrade Twilio Account"
    echo "  1. Upgrade from test account to paid account"
    echo "  2. Purchase a Twilio phone number"
    echo "  3. Configure it to connect to ElevenLabs"
    echo ""
    echo "Response Details:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi

echo ""
echo "====================================="
echo "📚 Documentation:"
echo "  - Agent URL: https://elevenlabs.io/app/talk-to?agent_id=$OTTO_AGENT_ID"
echo "  - n8n Workflow: https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK"
echo "  - Integration Guide: N8N_ELEVENLABS_INTEGRATION.md"
echo ""

