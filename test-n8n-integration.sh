#!/bin/bash

echo "🧪 Testing n8n Otto Outbound Integration"
echo "========================================="

BASE_URL="https://ottoagent.net"

echo ""
echo "1️⃣ Testing: Otto Status Check"
echo "-----------------------------------"
curl -X GET "$BASE_URL/api/n8n/otto-status" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""
echo "2️⃣ Testing: Get Contacts from Google Sheets"
echo "-----------------------------------"
curl -X GET "$BASE_URL/api/n8n/outbound/contacts?sheetName=Sheet1" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""
echo "3️⃣ Testing: Start Campaign (DRY RUN - Check Response Only)"
echo "-----------------------------------"
echo "This will actually start a campaign! Press Ctrl+C to cancel, or Enter to continue..."
read

curl -X POST "$BASE_URL/api/n8n/outbound/start-campaign" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Test Campaign from CLI",
    "campaignType": "SALES_OUTREACH",
    "sheetName": "Sheet1",
    "delayBetweenCalls": 30,
    "dealershipName": "Test Dealership"
  }' | jq '.'

echo ""
echo ""
echo "✅ Tests complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Import n8n-workflow-otto-outbound-daily.json into your n8n instance"
echo "  2. Configure the schedule trigger (currently set to weekdays at 9 AM)"
echo "  3. Test manually by clicking 'Execute Workflow' in n8n"
echo "  4. Monitor campaign progress in Render logs or Twilio console"
