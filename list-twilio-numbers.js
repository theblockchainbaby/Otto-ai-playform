require('dotenv').config();
const twilio = require('twilio');

async function listAvailableNumbers() {
  console.log('📞 Checking Available Phone Numbers\n');
  
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    console.log('Fetching your Twilio phone numbers...\n');
    
    const numbers = await client.incomingPhoneNumbers.list();
    
    if (numbers.length === 0) {
      console.log('❌ No phone numbers found in your account!');
      console.log('\nYou need to purchase a phone number:');
      console.log('👉 https://console.twilio.com/us1/develop/phone-numbers/manage/search');
      return;
    }
    
    console.log(`✅ Found ${numbers.length} phone number(s):\n`);
    
    numbers.forEach((number, index) => {
      console.log(`${index + 1}. ${number.phoneNumber}`);
      console.log(`   Name: ${number.friendlyName}`);
      console.log(`   SID: ${number.sid}`);
      console.log(`   Voice: ${number.capabilities.voice ? '✅' : '❌'}`);
      console.log(`   SMS: ${number.capabilities.sms ? '✅' : '❌'}`);
      console.log('');
    });
    
    console.log('To use one of these numbers for outbound calling:');
    console.log('Update your .env file:\n');
    console.log(`TWILIO_OUTBOUND_NUMBER="${numbers[0].phoneNumber}"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableNumbers();
