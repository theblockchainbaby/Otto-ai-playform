require('dotenv').config();
const GoogleSheetsService = require('./src/services/googleSheetsService');
const ElevenLabsOutboundService = require('./src/services/elevenLabsOutboundService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

async function makeTestCall() {
  console.log('📞 Otto Outbound Test Call');
  console.log('==========================\n');
  
  // Initialize services
  const sheetsService = new GoogleSheetsService();
  const elevenLabsService = new ElevenLabsOutboundService(
    process.env.ELEVENLABS_API_KEY,
    process.env.ELEVENLABS_OUTBOUND_AGENT_ID
  );
  const twilioService = new TwilioOutboundService(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_OUTBOUND_NUMBER,
    elevenLabsService
  );
  
  try {
    // Get contacts from sheet
    console.log('📊 Loading contacts from Google Sheets...');
    const contacts = await sheetsService.getCampaignContacts('Sheet1');
    
    if (contacts.length === 0) {
      console.error('❌ No contacts found in sheet');
      return;
    }
    
    // Use first contact
    const contact = contacts[0];
    console.log(`\n✅ Found contact: ${contact.name} (${contact.phone})\n`);
    
    // Prepare custom variables for Otto
    const customVariables = {
      customer_name: contact.name,
      customer_phone: contact.phone,
      customer_email: contact.email || 'N/A',
      vehicle_info: `${contact.customFields.vehicleYear || ''} ${contact.customFields.vehicleMake || ''} ${contact.customFields.vehicleModel || ''}`.trim() || 'Unknown vehicle',
      service_type: contact.customFields.serviceType || 'general service',
      last_service: contact.customFields.lastServiceDate || 'unknown',
      campaign_type: 'TEST_CALL'
    };
    
    console.log('🎙️  Custom variables for Otto:');
    console.log(JSON.stringify(customVariables, null, 2));
    console.log('');
    
    // Make the call
    console.log('📞 Initiating call via Twilio...\n');
    
    const result = await twilioService.makeOutboundCall({
      toNumber: contact.phone,
      customerName: contact.name,
      customerId: 'test-' + Date.now(),
      campaignType: 'TEST_CALL',
      recordCall: true
    });
    
    if (result.success) {
      console.log('✅ Call initiated successfully!');
      console.log(`   Call SID: ${result.callSid}`);
      console.log(`   Status: ${result.status}`);
      console.log(`\n📱 Otto is now calling ${contact.name} at ${contact.phone}`);
      console.log('   Answer the call to hear Otto speak!');
      console.log(`\n🎧 Check call status in Twilio Console:`);
      console.log(`   https://console.twilio.com/us1/monitor/logs/calls/${result.callSid}`);
    } else {
      console.error('❌ Call failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
  }
}

makeTestCall();
