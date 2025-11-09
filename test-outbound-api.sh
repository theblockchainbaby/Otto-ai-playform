#!/bin/bash

# Otto Outbound - API Test Script
# Tests all outbound calling endpoints

BASE_URL="${BASE_URL:-https://ottoagent.net}"

echo "🧪 Otto Outbound API Tests"
echo "Testing against: $BASE_URL"
echo "================================"
echo ""

# Test 1: Otto Status
echo "1️⃣  Testing Otto Status..."
curl -s "$BASE_URL/api/n8n/otto-status" | jq .
echo ""

# Test 2: Start Test Campaign
echo "2️⃣  Starting Test Campaign..."
CAMPAIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/n8n/trigger-outbound-campaign" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "API Test Campaign",
    "campaignType": "GENERAL",
    "sheetName": "Outbound Campaigns",
    "delayBetweenCalls": 5
  }')

echo "$CAMPAIGN_RESPONSE" | jq .

# Extract campaign ID
CAMPAIGN_ID=$(echo "$CAMPAIGN_RESPONSE" | jq -r '.data.campaignId // empty')

if [ -z "$CAMPAIGN_ID" ]; then
  echo "❌ Campaign creation failed"
  exit 1
fi

echo "✅ Campaign ID: $CAMPAIGN_ID"
echo ""

# Test 3: Wait and check status
echo "3️⃣  Waiting 10 seconds for campaign to process..."
sleep 10

echo "4️⃣  Checking Campaign Status..."
curl -s "$BASE_URL/api/n8n/campaign-results/$CAMPAIGN_ID" | jq .
echo ""

# Test 4: Stop campaign
echo "5️⃣  Stopping Campaign..."
curl -s -X POST "$BASE_URL/api/n8n/stop-campaign/$CAMPAIGN_ID" | jq .
echo ""

echo "================================"
echo "✅ API Tests Complete"
echo ""
echo "Manual Tests:"
echo "1. Check Google Sheets for updated contact status"
echo "2. Verify calls were recorded in database:"
echo "   psql -c 'SELECT * FROM outbound_calls ORDER BY initiated_at DESC LIMIT 5;'"
echo "3. Listen to call recordings in Twilio Console"
