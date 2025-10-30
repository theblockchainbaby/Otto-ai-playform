#!/bin/bash

# Test Otto AI Router Webhook
# This script tests all the different intents

echo "🤖 Testing Otto AI Router Webhook"
echo "=================================="
echo ""

# Your n8n webhook URL
WEBHOOK_URL="https://dualpay.app.n8n.cloud/webhook/otto/ai-router"

echo "📍 Webhook URL: $WEBHOOK_URL"
echo ""

# Test 1: Get Appointments
echo "Test 1: Get Appointments"
echo "------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "customerName": "York",
    "request": "What appointments do I have?"
  }' | jq '.'
echo ""
echo ""

# Test 2: Book Appointment
echo "Test 2: Book Appointment"
echo "------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "customerName": "York",
    "request": "I want to book an oil change for tomorrow at 2 PM",
    "serviceType": "oil change",
    "preferredDate": "2024-11-01",
    "preferredTime": "2:00 PM"
  }' | jq '.'
echo ""
echo ""

# Test 3: Check Availability
echo "Test 3: Check Availability"
echo "--------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "request": "What times are available tomorrow?",
    "preferredDate": "tomorrow"
  }' | jq '.'
echo ""
echo ""

# Test 4: Service Status
echo "Test 4: Service Status"
echo "----------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "request": "Is my car ready?"
  }' | jq '.'
echo ""
echo ""

# Test 5: General Inquiry
echo "Test 5: General Inquiry"
echo "-----------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "request": "What services do you offer?"
  }' | jq '.'
echo ""
echo ""

echo "✅ All tests complete!"
echo ""
echo "Next steps:"
echo "1. Import n8n-workflow-otto-ai-router.json to n8n"
echo "2. Configure credentials (OpenAI, Google Calendar, SMTP, Twilio)"
echo "3. Activate the workflow"
echo "4. Configure the tool in ElevenLabs"
echo "5. Call Otto and test!"

