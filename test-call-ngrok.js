// Manual env loading with ngrok URL override
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.TWILIO_AUTH_TOKEN;
delete process.env.TWILIO_OUTBOUND_NUMBER;
delete process.env.ELEVENLABS_OUTBOUND_AGENT_ID;
delete process.env.BASE_URL;

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      value = value.replace(/^["'](.*)["'].*$/, '$1');
      process.env[key] = value;
    }
  }
});

// Override BASE_URL to use ngrok
process.env.BASE_URL = 'https://8cfe0bd425ef.ngrok-free.app';

console.log('🔍 Environment loaded:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('ELEVENLABS_OUTBOUND_AGENT_ID:', process.env.ELEVENLABS_OUTBOUND_AGENT_ID);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('');

const GoogleSheetsService = require('./src/services/googleSheetsService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

async function makeTestCall() {
  console.log('📞 Otto Outbound Test Call (via ngrok)');
  console.log('=========================================\n');
  
  const twilioService = new TwilioOutboundService();
  const sheetsService = new GoogleSheetsService();
  
  try {
    console.log('📊 Loading contacts from Google Sheets...');
    const contacts = await sheetsService.getCampaignContacts('Sheet1');
    
    const contact = contacts[0];
    console.log(`\n✅ Found contact: ${contact.name} (${contact.phone})\n`);
    
    console.log('📞 Initiating call via Twilio...');
    console.log(`   TwiML URL will be: ${process.env.BASE_URL}/api/twilio/outbound/twiml\n`);
    
    const result = await twilioService.makeOutboundCall({
      toNumber: contact.phone,
      customerName: contact.name,
      customerId: 'test-' + Date.now(),
      campaignType: 'TEST_CALL',
      recordCall: true
    });

    console.log('✅ Call initiated successfully!');
    console.log(`   Call SID: ${result.callSid}`);
    console.log(`   From: ${result.from}`);
    console.log(`   To: ${result.to}`);
    console.log(`\n📱 Otto is now calling ${contact.name} at ${contact.phone}`);
    console.log(`\n🌐 Twilio will fetch TwiML from:`);
    console.log(`   ${process.env.BASE_URL}/api/twilio/outbound/twiml`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeTestCall();
