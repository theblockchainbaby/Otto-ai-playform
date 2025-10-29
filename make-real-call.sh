#!/bin/bash

# Direct Twilio Call Test with ElevenLabs
echo "📞 Making actual Twilio call with Otto AI voice..."
echo ""

# Note: This requires Twilio credentials
# The /api/twilio/reminder-call endpoint just returns TwiML, it doesn't make calls
# We need to either:
# 1. Use Twilio API directly to initiate a call
# 2. Test through n8n workflow
# 3. Use Twilio's test credentials

echo "⚠️  The /api/twilio/reminder-call endpoint only returns TwiML (call instructions)"
echo "   It doesn't actually initiate calls - Twilio does that."
echo ""
echo "To make an actual call, you need to:"
echo ""
echo "1️⃣  Test via n8n workflow (RECOMMENDED):"
echo "   curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{"
echo "       \"phone\": \"+19163337305\","
echo "       \"date\": \"2025-10-23\","
echo "       \"time\": \"14:00\","
echo "       \"name\": \"York\","
echo "       \"appointmentType\": \"Voice Test\""
echo "     }'"
echo ""
echo "2️⃣  OR: Use Twilio API directly to initiate call"
echo "   (Requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN)"
echo ""

# Check if we have Twilio credentials
if [ -f .env ]; then
    source .env
    if [ ! -z "$TWILIO_ACCOUNT_SID" ] && [ ! -z "$TWILIO_AUTH_TOKEN" ]; then
        echo "✅ Found Twilio credentials"
        echo ""
        read -p "Make a real call now using Twilio API? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📞 Initiating call..."
            
            curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json" \
              --data-urlencode "Url=https://ottoagent.net/api/twilio/reminder-call?name=York&type=Voice%20Test&time=2:00%20PM" \
              --data-urlencode "To=+19163337305" \
              --data-urlencode "From=+18884118568" \
              -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
            
            echo ""
            echo "✅ Call initiated! Check your phone: +19163337305"
        fi
    fi
fi

echo ""
echo "=============================="
