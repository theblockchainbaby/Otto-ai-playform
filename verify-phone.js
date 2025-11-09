// Manual env loading
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.TWILIO_AUTH_TOKEN;

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
      
      if (key === 'TWILIO_ACCOUNT_SID' || key === 'TWILIO_AUTH_TOKEN') {
        process.env[key] = value;
      }
    }
  }
});

const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function verifyPhone() {
  const phoneNumber = '+19184700208'; // York's number
  
  console.log('📱 Starting phone verification for:', phoneNumber);
  console.log('');
  
  try {
    // Check if already verified
    console.log('Checking existing verified numbers...');
    const validationRequests = await client.validationRequests.list({ limit: 20 });
    
    const existing = validationRequests.find(v => v.phoneNumber === phoneNumber);
    if (existing && existing.validationCode) {
      console.log('✅ Phone already has a verification request');
      console.log('   Status:', existing.validationCode ? 'Code sent' : 'Pending');
      return;
    }
    
    // Start verification
    console.log('📤 Sending verification code to', phoneNumber);
    const validationRequest = await client.validationRequests.create({
      phoneNumber: phoneNumber,
      friendlyName: 'York - Otto Testing'
    });
    
    console.log('✅ Verification code sent!');
    console.log(`   Request SID: ${validationRequest.sid}`);
    console.log(`   Phone Number: ${validationRequest.phoneNumber}`);
    console.log('');
    console.log('📱 You should receive a call with a 6-digit verification code.');
    console.log('   Enter the code here when you receive it, or verify in Twilio Console:');
    console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      console.error(`   More info: ${error.moreInfo}`);
    }
    console.log('');
    console.log('💡 You can also verify manually at:');
    console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
  }
}

verifyPhone();
