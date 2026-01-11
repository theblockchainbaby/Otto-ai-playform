require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = '+18884118568'; // Trying the Toll-Free number
const toNumber = '+12792159834';   // Jr Sims

const client = twilio(accountSid, authToken);

console.log(`Attempting to send SMS from ${fromNumber} to ${toNumber}...`);

client.messages
  .create({
     body: 'Hi Jr Sims! This is a test from the Toll-Free number. Your appointment is confirmed.',
     from: fromNumber,
     to: toNumber
   })
  .then(message => {
      console.log(`✅ Message sent to Twilio! SID: ${message.sid}`);
      console.log('Check your phone now.');
  })
  .catch(error => {
    console.error('❌ Failed to send message:');
    console.error(error.message);
    console.error('Code:', error.code);
  });
