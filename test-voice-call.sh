#!/bin/bash

# Otto AI Voice Call Test Script
# Tests voice call functionality with and without ElevenLabs

echo "🎙️  OTTO AI VOICE CALL TEST SUITE"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "📡 Test 1: Server Health Check"
SERVER_HEALTH=$(curl -s https://ottoagent.net/health)
if [[ $SERVER_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not responding${NC}"
    exit 1
fi
echo ""

# Test 2: Check ElevenLabs API Key status
echo "🔑 Test 2: ElevenLabs API Key Check"
if [[ $SERVER_HEALTH == *"elevenlabs"*"true"* ]]; then
    echo -e "${GREEN}✅ ElevenLabs API key is configured${NC}"
    VOICE_TYPE="ElevenLabs Otto AI (Natural Voice)"
else
    echo -e "${YELLOW}⚠️  ElevenLabs API key not found${NC}"
    echo -e "${YELLOW}   Will use AWS Polly fallback voice${NC}"
    VOICE_TYPE="AWS Polly (Robotic Voice)"
fi
echo ""

# Test 3: Test voice call endpoint
echo "📞 Test 3: Voice Call Endpoint Test"
echo "   Voice Type: $VOICE_TYPE"
echo "   Calling: +19163337305"
echo "   From: +18884118568"
echo ""
echo "   Starting call in 3 seconds..."
sleep 1
echo "   2..."
sleep 1
echo "   1..."
sleep 1
echo ""

CALL_RESPONSE=$(curl -s -X POST https://ottoagent.net/api/twilio/reminder-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "York",
    "customerPhone": "+19163337305",
    "appointmentDate": "2025-10-23",
    "appointmentTime": "14:00",
    "appointmentType": "Voice System Test"
  }')

if [[ $CALL_RESPONSE == *"<Response>"* ]]; then
    echo -e "${GREEN}✅ Call initiated successfully${NC}"
    echo ""
    echo "📱 Check your phone: +19163337305"
    echo "   You should receive a call from +18884118568"
    echo ""
    
    # Check voice type in response
    if [[ $CALL_RESPONSE == *"elevenlabs"* ]] || [[ $CALL_RESPONSE == *"convai"* ]]; then
        echo -e "${GREEN}   🎯 Using ElevenLabs Conversational AI${NC}"
    elif [[ $CALL_RESPONSE == *"Polly"* ]]; then
        echo -e "${YELLOW}   ⚠️  Using AWS Polly fallback${NC}"
        echo -e "${YELLOW}   💡 Add ELEVENLABS_API_KEY to Render for natural voice${NC}"
    fi
else
    echo -e "${RED}❌ Call failed${NC}"
    echo "   Response: $CALL_RESPONSE"
fi
echo ""

# Test 4: n8n workflow test (optional)
echo "🔄 Test 4: Full n8n Workflow Test (Optional)"
echo "   This will trigger: Webhook → Appointment → SMS → Wait → Voice Call"
echo ""
read -p "   Run full workflow test? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Triggering n8n workflow..."
    
    N8N_RESPONSE=$(curl -s -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
      -H "Content-Type: application/json" \
      -d '{
        "phone": "+19163337305",
        "date": "2025-10-23",
        "time": "14:00",
        "name": "York",
        "email": "york@eliteeighth.com",
        "appointmentType": "Full Workflow Test",
        "notes": "Testing complete automation with voice call"
      }')
    
    echo -e "${GREEN}✅ Workflow triggered${NC}"
    echo ""
    echo "📋 Expected Timeline:"
    echo "   NOW: Confirmation SMS"
    echo "   +24hr: Reminder SMS + Voice Call"
    echo "   (Or +1min if you modified the wait node)"
    echo ""
    echo "🌐 View execution: https://dualpay.app.n8n.cloud/workflow/executions"
else
    echo "   Skipped."
fi
echo ""

# Summary
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo ""
echo "Server Status: ✅"
echo "Voice System: $VOICE_TYPE"
echo ""
echo "🎯 NEXT STEPS:"
echo ""

if [[ $SERVER_HEALTH == *"elevenlabs"*"true"* ]]; then
    echo "✅ You're all set with ElevenLabs!"
    echo "   Your calls will use natural conversational AI voice."
else
    echo "1. Get ElevenLabs API key: https://elevenlabs.io/app/settings/api-keys"
    echo "2. Add to Render environment: ELEVENLABS_API_KEY=sk_..."
    echo "3. Wait for auto-redeploy (~2 min)"
    echo "4. Run this test again"
    echo ""
    echo "📖 See: ELEVENLABS_SETUP.md for detailed instructions"
fi
echo ""
echo "=================================="
