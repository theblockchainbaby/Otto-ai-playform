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

// Rate limiting - relaxed for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (very generous for dev)
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Disable caching in development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve client-side utility scripts and styles from src/utils
app.use('/src/utils', express.static(path.join(__dirname, 'utils')));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Prisma Client
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Database connection initialized');
  console.log('📊 DATABASE_URL present:', process.env.DATABASE_URL ? 'YES' : 'NO');
} catch (error) {
  console.error('⚠️  Database initialization failed:', error.message);
  console.log('⚠️  Running in mock data mode');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🤖 Otto AI Platform is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import customers routes
const customersRoutes = require('./routes/customers');
app.use('/api/customers', customersRoutes);
console.log('✅ Customers routes loaded');

// Import auth routes (mock mode)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️  Could not load auth routes:', error.message);
}

// Import vehicles routes
try {
  const vehiclesRoutes = require('./routes/vehicles');
  app.use('/api/vehicles', vehiclesRoutes);
  console.log('✅ Vehicles routes loaded');
} catch (error) {
  console.log('⚠️  Could not load vehicles routes:', error.message);
}

// Import AI routes
try {
  const aiRoutes = require('./routes/ai');
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes loaded');
} catch (error) {
  console.log('⚠️  Could not load AI routes:', error.message);
}

// Import appointments routes
try {
  const appointmentsRoutes = require('./routes/appointments');
  app.use('/api/appointments', appointmentsRoutes);
  console.log('✅ Appointments routes loaded');
} catch (error) {
  console.log('⚠️  Could not load appointments routes:', error.message);
}

// Import leads routes
try {
  const leadsRoutes = require('./routes/leads');
  app.use('/api/leads', leadsRoutes);
  console.log('✅ Leads routes loaded');
} catch (error) {
  console.log('⚠️  Could not load leads routes:', error.message);
}

// Import calls routes
try {
  const callsRoutes = require('./routes/calls');
  app.use('/api/calls', callsRoutes);
  console.log('✅ Calls routes loaded');
} catch (error) {
  console.log('⚠️  Could not load calls routes:', error.message);
}

// Import users routes
try {
  const usersRoutes = require('./routes/users');
  app.use('/api/users', usersRoutes);
  console.log('✅ Users routes loaded');
} catch (error) {
  console.log('⚠️  Could not load users routes:', error.message);
}

// Import messages routes
try {
  const messagesRoutes = require('./routes/messages');
  app.use('/api/messages', messagesRoutes);
  console.log('✅ Messages routes loaded');
} catch (error) {
  console.log('⚠️  Could not load messages routes:', error.message);
}

// Import tasks routes
try {
  const tasksRoutes = require('./routes/tasks');
  app.use('/api/tasks', tasksRoutes);
  console.log('✅ Tasks routes loaded');
} catch (error) {
  console.log('⚠️  Could not load tasks routes:', error.message);
}

// Import campaigns routes
try {
  const campaignsRoutes = require('./routes/campaigns');
  app.use('/api/campaigns', campaignsRoutes);
  console.log('✅ Campaigns routes loaded');
} catch (error) {
  console.log('⚠️  Could not load campaigns routes:', error.message);
}

// Import emergency calls routes
try {
  const emergencyCallsRoutes = require('./routes/emergencyCalls');
  app.use('/api/emergency-calls', emergencyCallsRoutes);
  console.log('✅ Emergency calls routes loaded');
} catch (error) {
  console.log('⚠️  Could not load emergency calls routes:', error.message);
}

// Import service requests routes
try {
  const serviceRequestsRoutes = require('./routes/serviceRequests');
  app.use('/api/service-requests', serviceRequestsRoutes);
  console.log('✅ Service requests routes loaded');
} catch (error) {
  console.log('⚠️  Could not load service requests routes:', error.message);
}

// Import service providers routes
try {
  const serviceProvidersRoutes = require('./routes/serviceProviders');
  app.use('/api/service-providers', serviceProvidersRoutes);
  console.log('✅ Service providers routes loaded');
} catch (error) {
  console.log('⚠️  Could not load service providers routes:', error.message);
}

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
      'Emergency assistance'
    ]
  });
});

// Twilio webhook endpoint - ElevenLabs Otto
app.post('/api/twilio/voice', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    console.log('🔊 Incoming call to Otto:', { From, To, CallSid });

    // Log call to database if available
    if (prisma) {
      try {
        const customer = await prisma.customer.findFirst({
          where: { phone: From }
        });

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
          console.log('✅ Call logged to database');
        } else {
          console.log('ℹ️  Customer not found, call not logged');
        }
      } catch (dbError) {
        console.error('❌ Database error (non-fatal):', dbError.message);
      }
    } else {
      console.log('⚠️  Database not available, skipping call logging');
    }

    // Generate TwiML for ElevenLabs - Try Twilio-specific endpoint
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const agentId = 'agent_2201k8q07eheexe8j4vkt0b9vecb';

    console.log('🔑 ElevenLabs API Key present:', elevenLabsKey ? 'YES' : 'NO');
    console.log('🔑 Key starts with:', elevenLabsKey ? elevenLabsKey.substring(0, 8) + '...' : 'MISSING');
    console.log('🤖 Agent ID:', agentId);

    // Try using ElevenLabs' Twilio-specific WebSocket endpoint
    // This endpoint is specifically designed for Twilio Media Streams
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}">
            <Parameter name="xi-api-key" value="${elevenLabsKey}" />
        </Stream>
    </Connect>
</Response>`;

    console.log('📤 Sending TwiML response to Twilio');
    console.log('📄 TwiML:', twiml);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ Error connecting to Otto:', error);

    const twilio = require('twilio');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Hello, this is Otto from AutoLux. We are experiencing technical difficulties. Please call back shortly.');

    res.type('text/xml');
    res.send(response.toString());
  }
});

// Twilio webhook endpoint (basic - old)
app.post('/api/twilio/otto/incoming', (req, res) => {
  console.log('Incoming Twilio webhook:', req.body);

  // Basic TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! You've reached Otto AI. We're currently setting up our system. Please call back soon!</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// Catch all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/otto-dashboard.html'));
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Otto AI Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
