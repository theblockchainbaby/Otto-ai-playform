const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = '+18884118568'; // Your 888 number
const toNumber = '+19184700208';   // Your phone

console.log('🔍 Attempting direct Twilio call...');
console.log('Account SID:', accountSid);
console.log('From:', fromNumber);
console.log('To:', toNumber);
console.log('');

const client = twilio(accountSid, authToken);

client.calls
  .create({
    from: fromNumber,
    to: toNumber,
    url: 'http://demo.twilio.com/docs/voice.xml', // Simple test TwiML
    method: 'GET'
  })
  .then(call => {
    console.log('✅ Call initiated successfully!');
    console.log('Call SID:', call.sid);
    console.log('Status:', call.status);
    console.log('From:', call.from);
    console.log('To:', call.to);
    console.log('\n📱 Check your phone!');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status:', error.status);
    console.error('   More info:', error.moreInfo);
    
    if (error.code === 21210) {
      console.log('\n💡 Error 21210 means the FROM number is not verified.');
      console.log('   Solutions:');
      console.log('   1. Upgrade to a paid Twilio account (if still on trial)');
      console.log('   2. Verify the phone number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('   3. Check Voice Geographic Permissions: https://console.twilio.com/us1/develop/voice/settings/geo-permissions');
    }
  });
