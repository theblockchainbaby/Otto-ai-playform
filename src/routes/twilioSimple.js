const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/twilio/voice - Simple endpoint that connects directly to ElevenLabs Otto
router.post('/voice', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    console.log('Incoming call to Otto:', { From, To, CallSid });

    // Log call to database (simple version)
    try {
      // Look up customer by phone number
      const customer = await prisma.customer.findFirst({
        where: { phone: From }
      });

      // Create call record
      if (customer) {
        await prisma.call.create({
          data: {
            direction: 'INBOUND',
            status: 'RINGING',
            outcome: 'Otto AI Agent',
            startedAt: new Date(),
            customerId: customer.id,
            notes: `Twilio CallSid: ${CallSid}`
          }
        });
      }
    } catch (dbError) {
      console.error('Database error (non-fatal):', dbError);
      // Continue even if database fails
    }

    // Generate TwiML that connects directly to ElevenLabs Otto agent
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();

    // Connect to ElevenLabs Conversational AI
    const connect = twiml.connect();
    const stream = connect.stream({
      url: 'wss://api.elevenlabs.io/v1/convai/conversation/ws'
    });

    // Configure Otto agent
    stream.parameter({
      name: 'agent_id',
      value: 'agent_2201k8q07eheexe8j4vkt0b9vecb'
    });
    stream.parameter({
      name: 'authorization',
      value: `Bearer ${process.env.ELEVENLABS_API_KEY}`
    });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error connecting to Otto:', error);

    // Fallback
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Hello, this is Otto from AutoLux. We are experiencing technical difficulties. Please call back shortly.');

    res.type('text/xml');
    res.send(twiml.toString());
  }
});

module.exports = router;

