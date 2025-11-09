const express = require('express');
const twilio = require('twilio');

const router = express.Router();

// Twilio webhook endpoint for handling outbound call status updates
router.post('/outbound/call-status', async (req, res) => {
  try {
    const { CallSid, CallStatus, From, To } = req.body;

    console.log('📞 Outbound Call Status Update');
    console.log('CallSid:', CallSid);
    console.log('CallStatus:', CallStatus);
    console.log('From:', From);
    console.log('To:', To);

    // Here you would typically log the call status to your database
    // For example, using OutboundCallLog model
    // await OutboundCallLog.create({ CallSid, CallStatus, From, To });

    // Respond with a success message
    res.status(200).send('Status received');
  } catch (error) {
    console.error('❌ Error processing call status update:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Twilio webhook endpoint for logging call results
router.post('/outbound/call-result', async (req, res) => {
  try {
    const { CallSid, RecordingUrl, CallStatus } = req.body;

    console.log('📞 Outbound Call Result');
    console.log('CallSid:', CallSid);
    console.log('RecordingUrl:', RecordingUrl);
    console.log('CallStatus:', CallStatus);

    // Here you would typically log the call result to your database
    // For example, using OutboundCallLog model
    // await OutboundCallLog.create({ CallSid, RecordingUrl, CallStatus });

    // Respond with a success message
    res.status(200).send('Result received');
  } catch (error) {
    console.error('❌ Error processing call result:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;