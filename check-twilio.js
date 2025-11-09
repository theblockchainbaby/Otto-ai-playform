require('dotenv').config();
const twilio = require('twilio');

async function checkTwilioAccount() {
  console.log('🔍 Checking Twilio Account Configuration\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_OUTBOUND_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  
  console.log('Account SID:', accountSid?.substring(0, 10) + '...');
  console.log('Phone Number:', phoneNumber);
  console.log('');
  
  try {
    const client = twilio(accountSid, authToken);
    
    // Check account status
    console.log('📋 Fetching account details...');
    const account = await client.api.accounts(accountSid).fetch();
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    console.log('');
    
    // Check if number exists and its capabilities
    console.log('📞 Checking phone number capabilities...');
    const numbers = await client.incomingPhoneNumbers.list();
    
    const ourNumber = numbers.find(n => n.phoneNumber === phoneNumber);
    
    if (ourNumber) {
      console.log('✅ Number found in account!');
      console.log('   SID:', ourNumber.sid);
      console.log('   Friendly Name:', ourNumber.friendlyName);
      console.log('   Capabilities:');
      console.log('     - Voice:', ourNumber.capabilities.voice);
      console.log('     - SMS:', ourNumber.capabilities.sms);
      console.log('     - MMS:', ourNumber.capabilities.mms);
      console.log('   Voice URL:', ourNumber.voiceUrl || '(not set)');
      console.log('');
      
      if (!ourNumber.capabilities.voice) {
        console.log('⚠️  WARNING: This number does not have voice capability enabled!');
      }
    } else {
      console.log('❌ Number NOT found in your account');
      console.log('');
      console.log('Available numbers in your account:');
      numbers.forEach(n => {
        console.log(`   - ${n.phoneNumber} (${n.friendlyName})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
      console.error('More info:', error.moreInfo);
    }
  }
}

checkTwilioAccount();
