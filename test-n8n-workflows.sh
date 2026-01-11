#!/bin/bash

echo "🔍 Testing n8n Appointment Booking Workflow"
echo "============================================"
echo ""

# Test 1: Use test webhook endpoint (better for debugging)
echo "📋 Test 1: Using n8n TEST webhook (shows full execution data)"
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Will Test",
    "customerPhone": "+19163337305",
    "customerEmail": "test@example.com",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "2:00 PM",
    "appointmentType": "Service Appointment",
    "notes": "Debug test"
  }'

echo ""
echo ""

# Test 2: Try with York's phone from sheet
echo "📋 Test 2: Testing with York's phone from sheet"
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "York",
    "customerPhone": "+19184700208",
    "customerEmail": "york@eliteeighth.com",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "3:00 PM",
    "appointmentType": "Service Appointment",
    "notes": "Testing York phone"
  }'

echo ""
echo ""

# Test 3: Production webhook
echo "📋 Test 3: Testing production webhook"
curl -X POST https://dualpay.app.n8n.cloud/webhook/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Production Test",
    "customerPhone": "+19163337305",
    "customerEmail": "test@example.com",
    "appointmentDate": "2025-11-20",
    "appointmentTime": "4:00 PM",
    "appointmentType": "Service Appointment",
    "notes": "Production endpoint test"
  }'

echo ""
echo ""
echo "✅ Tests completed!"
echo ""
echo "📊 Check n8n executions: https://dualpay.app.n8n.cloud/executions"
echo ""
