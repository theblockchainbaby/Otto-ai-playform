require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_OUTBOUND_NUMBER || process.env.TWILIO_PHONE_NUMBER;
const toNumber = '+12792159834'; // Jr Sims

const client = twilio(accountSid, authToken);

console.log(`Attempting to send SMS from ${fromNumber} to ${toNumber}...`);

client.messages
  .create({
     body: 'This is a direct test message from the Otto AI codebase to verify SMS connectivity.',
     from: fromNumber,
     to: toNumber
   })
  .then(message => console.log(`✅ Message sent! SID: ${message.sid}`))
  .catch(error => {
    console.error('❌ Failed to send message:');
    console.error(error);
  });
