// Clear any cached modules and reload environment
delete require.cache[require.resolve('dotenv')];
delete require.cache[require.resolve('./src/services/twilioOutboundService')];
delete require.cache[require.resolve('./src/services/elevenLabsOutboundService')];
delete require.cache[require.resolve('./src/services/googleSheetsService')];

require('dotenv').config();

console.log('🔍 Environment Check:');
console.log('TWILIO_OUTBOUND_NUMBER:', process.env.TWILIO_OUTBOUND_NUMBER);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
console.log('');

const GoogleSheetsService = require('./src/services/googleSheetsService');
const ElevenLabsOutboundService = require('./src/services/elevenLabsOutboundService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

async function makeTestCall() {
  console.log('📞 Otto Outbound Test Call');
  console.log('==========================\n');
  
  const sheetsService = new GoogleSheetsService();
  const elevenLabsService = new ElevenLabsOutboundService(
    process.env.ELEVENLABS_API_KEY,
    process.env.ELEVENLABS_OUTBOUND_AGENT_ID
  );
  const twilioService = new TwilioOutboundService();
  
  console.log('Service initialized with number:', twilioService.outboundNumber);
  console.log('');
  
  try {
    console.log('📊 Loading contacts from Google Sheets...');
    const contacts = await sheetsService.getCampaignContacts('Sheet1');
    
    if (contacts.length === 0) {
      console.error('❌ No contacts found in sheet');
      return;
    }
    
    const contact = contacts[0];
    console.log(`\n✅ Found contact: ${contact.name} (${contact.phone})\n`);
    
    console.log('📞 Initiating call via Twilio...\n');
    
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
    console.log(`\n🎧 Check call in Twilio Console:`);
    console.log(`   https://console.twilio.com/us1/monitor/logs/calls/${result.callSid}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeTestCall();
