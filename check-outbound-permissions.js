const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkPermissions() {
  try {
    console.log('🔍 Checking Twilio Account Configuration...\n');
    
    // Check if outbound calls are enabled
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Account Status:', account.status);
    console.log('   Account Type:', account.type);
    console.log('');
    
    // Try to get outbound caller IDs
    console.log('📞 Checking Verified Caller IDs...');
    const outgoingCallerIds = await client.outgoingCallerIds.list({ limit: 20 });
    
    if (outgoingCallerIds.length === 0) {
      console.log('⚠️  No verified outbound caller IDs found');
      console.log('   This might be why outbound calls are failing!');
    } else {
      console.log(`✅ Found ${outgoingCallerIds.length} verified caller ID(s):\n`);
      outgoingCallerIds.forEach((callerId, i) => {
        console.log(`${i + 1}. ${callerId.phoneNumber}`);
        console.log(`   Friendly Name: ${callerId.friendlyName}`);
        console.log(`   SID: ${callerId.sid}`);
        console.log('');
      });
    }
    
    console.log('\n💡 Note: For outbound calls, you need to either:');
    console.log('   1. Use a Twilio phone number you own (purchased)');
    console.log('   2. Verify the "from" number as an Outgoing Caller ID');
    console.log('\n📱 Your purchased numbers:');
    
    const numbers = await client.incomingPhoneNumbers.list({ limit: 10 });
    numbers.forEach(num => {
      console.log(`   - ${num.phoneNumber} (${num.friendlyName})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
  }
}

checkPermissions();
