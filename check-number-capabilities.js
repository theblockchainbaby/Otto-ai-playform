const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkNumberCapabilities() {
  try {
    console.log('🔍 Checking phone number capabilities...\n');
    
    const numbers = await client.incomingPhoneNumbers.list();
    
    for (const number of numbers) {
      console.log('📞', number.phoneNumber);
      console.log('   Friendly Name:', number.friendlyName);
      console.log('   Voice Enabled:', number.capabilities.voice);
      console.log('   SMS Enabled:', number.capabilities.sms);
      console.log('   Voice URL:', number.voiceUrl || 'Not configured');
      console.log('   Voice Method:', number.voiceMethod);
      console.log('   SID:', number.sid);
      
      // Fetch detailed info
      const details = await client.incomingPhoneNumbers(number.sid).fetch();
      console.log('   Emergency Enabled:', details.emergencyStatus || 'N/A');
      console.log('   Address SID:', details.addressSid || 'Not required');
      console.log('   Bundle SID:', details.bundleSid || 'Not required');
      console.log('');
    }
    
    console.log('💡 All these numbers should work for outbound calls.');
    console.log('   If error 21210 persists, contact Twilio Support:');
    console.log('   https://www.twilio.com/help/contact');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
  }
}

checkNumberCapabilities();
