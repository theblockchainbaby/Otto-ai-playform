require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const messageSid = process.argv[2];

if (!messageSid) {
    console.log("Please provide a Message SID");
    process.exit(1);
}

console.log(`Checking status for message: ${messageSid}...`);

client.messages(messageSid)
      .fetch()
      .then(message => {
          console.log(`Status: ${message.status}`);
          console.log(`To: ${message.to}`);
          console.log(`From: ${message.from}`);
          console.log(`Body: ${message.body}`);
          if (message.errorCode) {
              console.log(`❌ Error Code: ${message.errorCode}`);
              console.log(`❌ Error Message: ${message.errorMessage}`);
          } else {
              console.log("✅ No error code returned yet.");
          }
      })
      .catch(error => {
          console.error("Error fetching message:", error);
      });
