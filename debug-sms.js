require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = '+19257226886'; // The number from your n8n screenshot
const toNumber = '+12792159834';   // Jr Sims

const client = twilio(accountSid, authToken);

console.log(`Attempting to send SMS from ${fromNumber} to ${toNumber}...`);

client.messages
  .create({
     body: 'Hi Jr Sims! Your Oil Change is confirmed for 2025-12-18 at 09:00. We look forward to seeing you! (Manual Test)',
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
    if (error.code === 21608) {
        console.log('Hint: This is a verified caller ID error. You might be using a trial account.');
    }
  });
