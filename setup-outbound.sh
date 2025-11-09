#!/bin/bash

# Otto Outbound Calling - Quick Setup Script
# Run this after configuring environment variables

set -e  # Exit on error

echo "🚀 Otto Outbound Calling System - Setup"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install googleapis ws axios --save

echo ""
echo "✅ Dependencies installed"

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."

MISSING_VARS=()

if [ -z "$ELEVENLABS_OUTBOUND_AGENT_ID" ]; then
    MISSING_VARS+=("ELEVENLABS_OUTBOUND_AGENT_ID")
fi

if [ -z "$TWILIO_OUTBOUND_NUMBER" ]; then
    MISSING_VARS+=("TWILIO_OUTBOUND_NUMBER")
fi

if [ -z "$GOOGLE_SHEETS_CAMPAIGN_ID" ]; then
    MISSING_VARS+=("GOOGLE_SHEETS_CAMPAIGN_ID")
fi

if [ -z "$GOOGLE_SHEETS_CREDENTIALS" ]; then
    MISSING_VARS+=("GOOGLE_SHEETS_CREDENTIALS")
fi

if [ -z "$BASE_URL" ]; then
    MISSING_VARS+=("BASE_URL")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add these to your .env file before running campaigns."
    echo "See OUTBOUND_CALLING_SETUP.md for details."
else
    echo "✅ All required environment variables present"
fi

# Generate Prisma client
echo ""
echo "🗄️  Generating Prisma client with new models..."
npm run db:generate

echo ""
echo "✅ Prisma client generated"

# Create migration (development only)
if [ "$NODE_ENV" != "production" ]; then
    echo ""
    echo "📝 Creating database migration..."
    npx prisma migrate dev --name add_outbound_campaigns --skip-generate
    echo "✅ Migration created"
else
    echo ""
    echo "⚠️  Running in production mode - skipping migration creation"
    echo "   Run 'npx prisma migrate deploy' to apply migrations"
fi

# Test Google Sheets connection
echo ""
echo "🔗 Testing Google Sheets connection..."

node -e "
const { google } = require('googleapis');

async function testSheets() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth: auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_CAMPAIGN_ID
    });
    
    console.log('✅ Google Sheets connected:', response.data.properties.title);
  } catch (error) {
    console.log('❌ Google Sheets connection failed:', error.message);
    console.log('   Check GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_CAMPAIGN_ID');
  }
}

testSheets();
" 2>/dev/null || echo "⚠️  Could not test Google Sheets (may need to configure credentials)"

# Test ElevenLabs connection
echo ""
echo "🎙️  Testing ElevenLabs connection..."

curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_OUTBOUND_AGENT_ID" \
  | jq -r 'if .agent_id then "✅ ElevenLabs agent found: " + .name else "❌ Agent not found" end' \
  2>/dev/null || echo "⚠️  Could not test ElevenLabs (agent ID may not be set)"

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Review OUTBOUND_CALLING_SETUP.md for full configuration"
echo "2. Add test contacts to your Google Sheet"
echo "3. Run test campaign:"
echo ""
echo "   curl -X POST $BASE_URL/api/n8n/trigger-outbound-campaign \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"campaignName\": \"Test\", \"campaignType\": \"GENERAL\"}'"
echo ""
echo "4. Monitor campaign status:"
echo "   curl $BASE_URL/api/n8n/otto-status"
echo ""
echo "Happy calling! 📞"
