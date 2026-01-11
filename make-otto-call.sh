#!/bin/bash

# Make an outbound call using Otto via Twilio + ElevenLabs
# This uses your Twilio number to initiate the call, then connects to ElevenLabs

echo "📞 Otto Outbound Call via Twilio + ElevenLabs"
echo "=============================================="
echo ""

# Configuration
TWILIO_ACCOUNT_SID="ACafc412b62982312dc2efebaff233cf9f"
TWILIO_AUTH_TOKEN="32c6e878cdc5707707980e6d6272f713"
TWILIO_PHONE_NUMBER="+19257226886"
OTTO_AGENT_ID="agent_2201k8q07eheexe8j4vkt0b9vecb"
ELEVENLABS_API_KEY="sk_64305b5b131e2caedf2232a75e7237521c63f71a0b5c49e9"

# Get phone number from user
read -p "Enter phone number to call (E.164 format, e.g., +19163337305): " TO_NUMBER

if [ -z "$TO_NUMBER" ]; then
    echo "❌ Phone number is required"
    exit 1
fi

# Get custom message (optional)
read -p "Enter custom first message (or press Enter for default): " CUSTOM_MESSAGE

if [ -z "$CUSTOM_MESSAGE" ]; then
    CUSTOM_MESSAGE="Hi! This is Otto from AutoLux calling to test our new AI agent. How are you doing today?"
fi

echo ""
echo "🔄 Initiating call from $TWILIO_PHONE_NUMBER to $TO_NUMBER..."
echo "🤖 Using Otto Agent: $OTTO_AGENT_ID"
echo ""

# Create TwiML that connects to ElevenLabs
TWIML_URL="https://ottoagent.net/api/twilio/voice"

# Make the call via Twilio
RESPONSE=$(curl -s -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json" \
  --data-urlencode "Url=$TWIML_URL" \
  --data-urlencode "To=$TO_NUMBER" \
  --data-urlencode "From=$TWILIO_PHONE_NUMBER" \
  --data-urlencode "StatusCallback=https://ottoagent.net/api/twilio/status" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN")

# Parse response
CALL_SID=$(echo "$RESPONSE" | grep -o '"sid":"[^"]*' | head -1 | cut -d'"' -f4)
STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
ERROR_MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CALL_SID" ]; then
    echo "✅ Call initiated successfully!"
    echo ""
    echo "📱 Call Details:"
    echo "   Call SID: $CALL_SID"
    echo "   Status: $STATUS"
    echo "   From: $TWILIO_PHONE_NUMBER"
    echo "   To: $TO_NUMBER"
    echo ""
    echo "🎯 The call will connect to Otto agent when answered"
    echo "🔗 Track call status: https://console.twilio.com/us1/monitor/logs/calls/$CALL_SID"
else
    echo "❌ Call failed!"
    echo "Error: $ERROR_MESSAGE"
    echo ""
    echo "Full Response:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
fi

echo ""
echo "=============================================="
echo "💡 Tips:"
echo "1. Answer the call to talk with Otto"
echo "2. Otto will use the new agent: agent_2201k8q07eheexe8j4vkt0b9vecb"
echo "3. Check Twilio console for call logs"
echo "4. Check ElevenLabs dashboard for conversation analytics"
echo ""

