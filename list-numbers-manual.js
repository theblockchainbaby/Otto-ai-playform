// Manual env loading like test-call-manual-env.js
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

console.log('🔍 Using credentials:');
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'NOT SET');
console.log('');

const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function listNumbers() {
  try {
    console.log('📱 Fetching phone numbers from Twilio...\n');
    
    const numbers = await client.incomingPhoneNumbers.list();
    
    if (numbers.length === 0) {
      console.log('⚠️  No phone numbers found in your account');
      return;
    }
    
    console.log(`✅ Found ${numbers.length} phone number(s):\n`);
    
    numbers.forEach((number, i) => {
      console.log(`${i + 1}. ${number.phoneNumber}`);
      console.log(`   Friendly Name: ${number.friendlyName || 'N/A'}`);
      console.log(`   Capabilities: Voice=${number.capabilities.voice}, SMS=${number.capabilities.sms}`);
      console.log(`   SID: ${number.sid}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      console.error(`   More info: ${error.moreInfo}`);
    }
  }
}

listNumbers();
