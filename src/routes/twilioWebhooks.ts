import express from 'express';
import { PrismaClient } from '@prisma/client';
import twilioService from '../services/twilioService';
import elevenLabsService from '../services/elevenLabsService';
import aiService from '../services/aiService';

const router = express.Router();
const prisma = new PrismaClient();

// Store active Otto conversations
const activeOttoConversations = new Map<string, any>();

// Middleware to verify Twilio webhook (optional but recommended for production)
const verifyTwilioWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In production, you should verify the Twilio signature
  // For now, we'll skip verification for development
  next();
};

// POST /api/twilio/voice/incoming - Handle incoming calls
router.post('/voice/incoming', verifyTwilioWebhook, async (req, res) => {
  try {
    const { From, To, CallSid, CallerName } = req.body;
    
    console.log('Incoming call:', { From, To, CallSid, CallerName });

    // Look up customer by phone number
    let customer = null;
    if (From) {
      customer = await prisma.customer.findFirst({
        where: {
          phone: From
        },
        include: {
          vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
          appointments: { take: 3, orderBy: { createdAt: 'desc' } }
        }
      });
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        direction: 'INBOUND',
        status: 'RINGING',
        outcome: 'IN_PROGRESS',
        startedAt: new Date(),
        customerId: customer?.id,
        metadata: {
          twilioCallSid: CallSid,
          callerName: CallerName,
          aiVoiceEnabled: true,
          customerRecognized: !!customer
        }
      }
    });

    // Generate personalized greeting with ElevenLabs voice
    const customerName = customer ? customer.firstName : null;
    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      'greeting',
      undefined,
      customerName,
      {
        numDigits: 1,
        action: `/api/twilio/voice/menu?callId=${call.id}`,
        timeout: 10
      }
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling incoming call:', error);
    
    // Fallback TwiML
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for calling AutoLux Intelligence. Please hold while we connect you.');
    twiml.dial('+1234567890'); // Fallback to human agent
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/menu - Handle main menu selection
router.post('/voice/menu', verifyTwilioWebhook, async (req, res) => {
  try {
    const { Digits, CallSid } = req.body;
    const { callId } = req.query;
    
    console.log('Menu selection:', { Digits, CallSid, callId });

    let scenario: 'sales' | 'service' | 'emergency' | 'appointment' = 'sales';
    let nextAction = '/api/twilio/voice/sales';
    
    switch (Digits) {
      case '1':
        scenario = 'sales';
        nextAction = `/api/twilio/voice/sales?callId=${callId}`;
        break;
      case '2':
        scenario = 'service';
        nextAction = `/api/twilio/voice/service?callId=${callId}`;
        break;
      case '3':
        scenario = 'appointment';
        nextAction = `/api/twilio/voice/appointment?callId=${callId}`;
        break;
      case '9':
        scenario = 'emergency';
        nextAction = `/api/twilio/voice/emergency?callId=${callId}`;
        break;
      default:
        // Invalid selection - repeat menu
        const twiml = await elevenLabsService.generateTwiMLWithVoice(
          'custom',
          'I\'m sorry, I didn\'t understand your selection. Please press 1 for sales, 2 for service, 3 for appointments, or 9 for emergency assistance.',
          undefined,
          {
            numDigits: 1,
            action: `/api/twilio/voice/menu?callId=${callId}`,
            timeout: 10
          }
        );
        
        res.type('text/xml');
        res.send(twiml);
        return;
    }

    // Update call record with selection
    if (callId) {
      await prisma.call.update({
        where: { id: callId as string },
        data: {
          metadata: {
            menuSelection: Digits,
            scenario: scenario,
            updatedAt: new Date().toISOString()
          }
        }
      });
    }

    // Generate appropriate response
    const twiml = await elevenLabsService.generateTwiMLWithVoice(scenario);
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling menu selection:', error);
    
    // Fallback
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Please hold while I connect you with an agent.');
    twiml.dial('+1234567890');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/sales - Handle sales inquiries
router.post('/voice/sales', verifyTwilioWebhook, async (req, res) => {
  try {
    const { callId } = req.query;
    
    // Get customer info if available
    let customer = null;
    if (callId) {
      const call = await prisma.call.findUnique({
        where: { id: callId as string },
        include: { customer: true }
      });
      customer = call?.customer;
    }

    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      'sales',
      undefined,
      customer?.firstName,
      {
        numDigits: 1,
        action: `/api/twilio/voice/sales-options?callId=${callId}`,
        timeout: 15
      }
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling sales call:', error);
    
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Let me connect you with our sales team.');
    twiml.dial('+1234567890');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/service - Handle service inquiries
router.post('/voice/service', verifyTwilioWebhook, async (req, res) => {
  try {
    const { callId } = req.query;
    
    let customer = null;
    if (callId) {
      const call = await prisma.call.findUnique({
        where: { id: callId as string },
        include: { customer: true }
      });
      customer = call?.customer;
    }

    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      'service',
      undefined,
      customer?.firstName,
      {
        numDigits: 1,
        action: `/api/twilio/voice/service-options?callId=${callId}`,
        timeout: 15
      }
    );

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling service call:', error);
    
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Let me connect you with our service department.');
    twiml.dial('+1234567890');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/emergency - Handle emergency calls
router.post('/voice/emergency', verifyTwilioWebhook, async (req, res) => {
  try {
    const { callId } = req.query;
    
    // Mark as high priority emergency
    if (callId) {
      await prisma.call.update({
        where: { id: callId as string },
        data: {
          outcome: 'EMERGENCY',
          metadata: {
            priority: 'CRITICAL',
            emergencyFlag: true,
            escalatedAt: new Date().toISOString()
          }
        }
      });
    }

    let customer = null;
    if (callId) {
      const call = await prisma.call.findUnique({
        where: { id: callId as string },
        include: { customer: true }
      });
      customer = call?.customer;
    }

    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      'emergency',
      undefined,
      customer?.firstName
    );

    // After the message, immediately connect to emergency line
    const twilio = require('twilio');
    const response = new twilio.twiml.VoiceResponse();
    
    // Parse the existing TwiML and add dial
    response.say('Connecting you to emergency roadside assistance now.');
    response.dial('+1234567890'); // Emergency hotline

    res.type('text/xml');
    res.send(response.toString());
  } catch (error) {
    console.error('Error handling emergency call:', error);
    
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('This is an emergency. Connecting you immediately.');
    twiml.dial('+1234567890');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/appointment - Handle appointment scheduling
router.post('/voice/appointment', verifyTwilioWebhook, async (req, res) => {
  try {
    const { callId } = req.query;
    
    let customer = null;
    if (callId) {
      const call = await prisma.call.findUnique({
        where: { id: callId as string },
        include: { customer: true }
      });
      customer = call?.customer;
    }

    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      'appointment',
      undefined,
      customer?.firstName
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling appointment call:', error);
    
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Let me connect you with our appointment scheduling team.');
    twiml.dial('+1234567890');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/voice/status - Handle call status updates
router.post('/voice/status', verifyTwilioWebhook, async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    console.log('Call status update:', { CallSid, CallStatus, CallDuration });

    // Find and update call record
    const call = await prisma.call.findFirst({
      where: {
        metadata: {
          path: ['twilioCallSid'],
          equals: CallSid
        }
      }
    });

    if (call) {
      await prisma.call.update({
        where: { id: call.id },
        data: {
          status: CallStatus === 'completed' ? 'COMPLETED' : CallStatus.toUpperCase(),
          duration: CallDuration ? parseInt(CallDuration) : null,
          endedAt: CallStatus === 'completed' ? new Date() : null,
          metadata: {
            ...call.metadata,
            finalStatus: CallStatus,
            statusUpdatedAt: new Date().toISOString()
          }
        }
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling call status:', error);
    res.status(500).send('Error');
  }
});

// GET /api/twilio/test-voice - Test ElevenLabs voice generation
router.get('/test-voice', async (req, res) => {
  try {
    const { scenario = 'greeting', text, voice } = req.query;
    
    const twiml = await elevenLabsService.generateTwiMLWithVoice(
      scenario as any,
      text as string,
      'John', // Test customer name
      {
        numDigits: 1,
        action: '/api/twilio/voice/menu',
        timeout: 10
      }
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error testing voice:', error);
    res.status(500).json({ error: 'Failed to generate test voice' });
  }
});

// POST /api/twilio/otto/incoming - Handle incoming calls with Otto agent
router.post('/otto/incoming', verifyTwilioWebhook, async (req, res) => {
  try {
    const { From, To, CallSid, CallerName } = req.body;

    console.log('Otto incoming call:', { From, To, CallSid, CallerName });

    // Look up customer by phone number
    let customer = null;
    if (From) {
      customer = await prisma.customer.findFirst({
        where: { phone: From },
        include: {
          vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
          appointments: { take: 3, orderBy: { createdAt: 'desc' } }
        }
      });
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        direction: 'INBOUND',
        status: 'RINGING',
        outcome: 'IN_PROGRESS',
        startedAt: new Date(),
        customerId: customer?.id,
        metadata: {
          twilioCallSid: CallSid,
          callerName: CallerName,
          aiAgent: 'Otto',
          customerRecognized: !!customer
        }
      }
    });

    // Start Otto conversation
    const callContext = {
      call_id: call.id,
      customer_vehicles: customer?.vehicles?.length || 0,
      recent_appointments: customer?.appointments?.length || 0,
      customer_since: customer?.createdAt
    };

    const conversation = await elevenLabsService.startOttoConversation(
      customer?.firstName,
      callContext
    );

    // Store conversation for this call
    activeOttoConversations.set(CallSid, {
      conversationId: conversation.conversation_id,
      callId: call.id,
      customerId: customer?.id
    });

    // Generate TwiML with Otto
    const twiml = elevenLabsService.generateOttoTwiML(
      customer?.firstName,
      callContext
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling Otto incoming call:', error);

    // Fallback TwiML
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello, this is AutoLux. Please hold while we connect you to an agent.</Say>
    <Dial>+1234567890</Dial>
</Response>`;

    res.type('text/xml');
    res.send(fallbackTwiml);
  }
});

// POST /api/twilio/otto/response - Handle Otto conversation responses
router.post('/otto/response', verifyTwilioWebhook, async (req, res) => {
  try {
    const { CallSid, SpeechResult, Confidence } = req.body;

    console.log('Otto response:', { CallSid, SpeechResult, Confidence });

    const conversation = activeOttoConversations.get(CallSid);
    if (!conversation) {
      throw new Error('No active Otto conversation found for this call');
    }

    // Send customer message to Otto
    const ottoResponse = await elevenLabsService.sendMessageToOtto(
      conversation.conversationId,
      SpeechResult || 'Hello'
    );

    // Generate TwiML with Otto's response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${ottoResponse.response}</Say>
    <Gather input="speech" action="/api/twilio/otto/response" method="POST" speechTimeout="3">
        <Say voice="alice">How else can I help you?</Say>
    </Gather>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling Otto response:', error);

    // Fallback TwiML
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, I'm having trouble understanding. Let me connect you to a human agent.</Say>
    <Dial>+1234567890</Dial>
</Response>`;

    res.type('text/xml');
    res.send(fallbackTwiml);
  }
});

// POST /api/twilio/otto/end - Handle call end cleanup
router.post('/otto/end', verifyTwilioWebhook, async (req, res) => {
  try {
    const { CallSid, CallDuration, CallStatus } = req.body;

    console.log('Otto call ended:', { CallSid, CallDuration, CallStatus });

    const conversation = activeOttoConversations.get(CallSid);
    if (conversation) {
      // Update call record
      await prisma.call.update({
        where: { id: conversation.callId },
        data: {
          status: 'COMPLETED',
          duration: parseInt(CallDuration) || 0,
          endedAt: new Date(),
          outcome: 'COMPLETED',
          summary: 'Call handled by Otto AI agent'
        }
      });

      // Clean up conversation
      activeOttoConversations.delete(CallSid);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling Otto call end:', error);
    res.status(500).send('Error');
  }
});

// GET /api/twilio/otto/test - Test Otto integration
router.get('/otto/test', async (req, res) => {
  try {
    const { customerName = 'John', scenario = 'greeting' } = req.query;

    // Test Otto conversation
    const conversation = await elevenLabsService.startOttoConversation(
      customerName as string,
      { test: true, scenario }
    );

    // Test message to Otto
    const testMessage = scenario === 'emergency'
      ? 'My car broke down and I need help'
      : 'I want to buy a new Mercedes';

    const response = await elevenLabsService.sendMessageToOtto(
      conversation.conversation_id,
      testMessage
    );

    res.json({
      success: true,
      conversation,
      testMessage,
      ottoResponse: response,
      twiml: elevenLabsService.generateOttoTwiML(customerName as string)
    });
  } catch (error) {
    console.error('Error testing Otto:', error);
    res.status(500).json({ error: 'Failed to test Otto integration' });
  }
});

export default router;
