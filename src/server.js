const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize database connection (optional for now)
let prisma = null;
try {
  const { PrismaClient } = require('@prisma/client');
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
    console.log('✅ Database connection initialized');
  } else {
    console.log('⚠️  No DATABASE_URL provided, running without database');
  }
} catch (error) {
  console.log('⚠️  Prisma not available, running in basic mode:', error.message);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Don't upgrade insecure requests in development
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));
app.use(cors({
  origin: process.env.DOMAIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Import and use auth routes if database is available
if (prisma) {
  try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
  } catch (error) {
    console.log('⚠️  Could not load auth routes:', error.message);
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    }
  } catch (error) {
    console.log('Database health check failed:', error.message);
  }

  res.json({
    success: true,
    message: '🤖 Otto AI Platform is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    features: {
      database: !!prisma,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY
    }
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Otto AI API is operational',
    features: [
      'AI-powered phone calls',
      'Customer management',
      'Appointment scheduling',
      'Lead tracking',
      'Emergency assistance',
      'CRM/DMS Integrations'
    ]
  });
});

// Appointments API
app.post('/api/appointments', async (req, res) => {
  try {
    const { title, type, startTime, endTime, customerId, notes } = req.body;
    
    console.log('📅 Appointment request received:', { title, type, startTime, customerId });
    
    // Validate required fields
    if (!title || !type || !startTime || !customerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'type', 'startTime', 'customerId']
      });
    }
    
    // If database is available, create appointment in database
    if (prisma) {
      try {
        const appointment = await prisma.appointment.create({
          data: {
            title,
            type,
            startTime: new Date(startTime),
            endTime: new Date(endTime || startTime),
            duration: 60, // default 60 minutes
            status: 'SCHEDULED',
            customerId,
            notes: notes || '',
            description: notes || ''
          }
        });
        
        console.log('✅ Appointment created in database:', appointment.id);
        
        return res.json({
          success: true,
          id: appointment.id,
          appointmentId: appointment.id,
          title: appointment.title,
          startTime: appointment.startTime,
          status: appointment.status,
          message: 'Appointment created successfully'
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        // Fall through to mock response
      }
    }
    
    // Mock response if database not available
    const appointmentId = `appt_${Date.now()}`;
    console.log('⚠️  No database - returning mock appointment:', appointmentId);
    
    res.json({
      success: true,
      id: appointmentId,
      appointmentId,
      title,
      type,
      startTime,
      endTime: endTime || startTime,
      customerId,
      notes,
      status: 'SCHEDULED',
      message: 'Appointment created successfully (mock - no database)'
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
      message: error.message
    });
  }
});

// VIN Decoding API
const vinDecodingService = require('./services/vinDecodingService');

app.post('/api/vin/decode', async (req, res) => {
  try {
    const { vin, source = 'auto' } = req.body;

    if (!vin) {
      return res.status(400).json({
        success: false,
        error: 'VIN is required'
      });
    }

    // Validate VIN format
    if (!vinDecodingService.validateVIN(vin)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid VIN format. VIN must be 17 characters (alphanumeric, no I/O/Q)'
      });
    }

    const decodedData = await vinDecodingService.decodeVin(vin, source);

    res.json({
      success: true,
      data: decodedData,
      formatted: vinDecodingService.formatForCRM(decodedData)
    });
  } catch (error) {
    console.error('VIN decode error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to decode VIN',
      message: error.message
    });
  }
});

app.post('/api/vin/extract', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const vin = vinDecodingService.extractVINFromText(text);

    if (!vin) {
      return res.json({
        success: true,
        vin: null,
        message: 'No VIN found in text'
      });
    }

    // Automatically decode the extracted VIN
    const decodedData = await vinDecodingService.decodeVin(vin);

    res.json({
      success: true,
      vin: vin,
      decoded: decodedData,
      formatted: vinDecodingService.formatForCRM(decodedData)
    });
  } catch (error) {
    console.error('VIN extraction error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to extract and decode VIN',
      message: error.message
    });
  }
});

app.get('/api/vin/validate/:vin', (req, res) => {
  try {
    const { vin } = req.params;
    const isValid = vinDecodingService.validateVIN(vin);

    res.json({
      success: true,
      vin: vin,
      valid: isValid,
      message: isValid ? 'Valid VIN format' : 'Invalid VIN format'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate VIN'
    });
  }
});

// Integration API routes
const integrationsRouter = require('./routes/integrations');
app.use('/api/v1/integrations', integrationsRouter);

// n8n Webhook routes
const n8nWebhooksRouter = require('./routes/n8nWebhooks');
app.use('/api/n8n', n8nWebhooksRouter);

// Twilio webhook routes
// POST /api/twilio/reminder-call - Handle automated reminder calls from n8n
app.post('/api/twilio/reminder-call', (req, res) => {
  try {
    const { name, type, time } = req.query;

    console.log('Reminder call:', { name, type, time });

    // Generate Otto's reminder message with ElevenLabs voice
    const reminderMessage = `Hello ${name || 'valued customer'}, this is Otto from AutoLux. I'm calling to remind you about your ${type || 'service'} appointment tomorrow at ${time}. Please press 1 to confirm your appointment, or press 2 if you need to reschedule. Thank you!`;

    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();

    // Use ElevenLabs Conversational AI for natural interaction
    if (process.env.ELEVENLABS_API_KEY) {
      // Connect to Otto AI agent for interactive conversation
      const connect = twiml.connect();
      const stream = connect.stream({
        url: 'wss://api.elevenlabs.io/v1/convai/conversation/ws'
      });
      stream.parameter({
        name: 'agent_id',
        value: 'agent_2201k8q07eheexe8j4vkt0b9vecb'
      });
      stream.parameter({
        name: 'authorization',
        value: `Bearer ${process.env.ELEVENLABS_API_KEY}`
      });
      stream.parameter({
        name: 'first_message',
        value: reminderMessage
      });
    } else {
      // Fallback to basic TwiML with gather
      const gather = twiml.gather({
        numDigits: 1,
        action: '/api/twilio/reminder-response',
        method: 'POST',
        timeout: 10
      });
      gather.say({ voice: 'Polly.Matthew-Neural' }, reminderMessage);

      // If no input, repeat the message
      twiml.say({ voice: 'Polly.Matthew-Neural' }, 'We did not receive your response. Please call us back to confirm your appointment. Goodbye!');
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling reminder call:', error);

    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your time. We look forward to seeing you at your appointment.');

    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// POST /api/twilio/reminder-response - Handle reminder call responses
app.post('/api/twilio/reminder-response', (req, res) => {
  try {
    const { Digits, CallSid } = req.body;

    console.log('Reminder response:', { Digits, CallSid });

    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();

    if (Digits === '1') {
      twiml.say({ voice: 'Polly.Matthew-Neural' }, 'Perfect! Your appointment is confirmed. We look forward to seeing you. Have a great day!');
    } else if (Digits === '2') {
      twiml.say({ voice: 'Polly.Matthew-Neural' }, 'No problem. Please call us at 1-888-411-8568 to reschedule your appointment. Thank you!');
    } else {
      twiml.say({ voice: 'Polly.Matthew-Neural' }, 'We did not understand your response. Please call us at 1-888-411-8568. Thank you!');
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling reminder response:', error);

    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your time. Goodbye!');

    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Basic Twilio incoming call endpoint
app.post('/api/twilio/otto/incoming', (req, res) => {
  console.log('Incoming Twilio webhook:', req.body);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! You've reached Otto AI. We're currently setting up our system. Please call back soon!</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Catch all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Otto AI Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database: ${prisma ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
