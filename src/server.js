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

    // Use Twilio SDK to generate TwiML
    const twilio = require('twilio');
    const agentId = 'agent_2201k8q07eheexe8j4vkt0b9vecb';
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    console.log('🤖 Agent ID:', agentId);
    console.log('🔑 ElevenLabs API Key present:', elevenLabsKey ? 'YES' : 'NO');

    // Use direct WebSocket connection to ElevenLabs with query parameters
    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();

    // Build WebSocket URL with query parameters
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation/ws?agent_id=${agentId}&xi-api-key=${elevenLabsKey}`;

    const stream = connect.stream({
      url: wsUrl
    });

    const twimlString = twiml.toString();
    console.log('📤 Sending TwiML with direct WebSocket');
    console.log('📄 TwiML:', twimlString);

    res.type('text/xml');
    res.send(twimlString);
  } catch (error) {
    console.error('❌ Error in /api/twilio/voice:', error);

    const twilio = require('twilio');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Hello, this is Otto from AutoLux. We are experiencing technical difficulties. Please call back shortly.');

    res.type('text/xml');
    res.send(response.toString());
  }
});

// Twilio webhook endpoint - Otto incoming calls
app.post('/api/twilio/otto/incoming', async (req, res) => {
  try {
    const { From, To, CallSid, CallerName } = req.body;

    console.log('🔊 Otto incoming call:', { From, To, CallSid, CallerName });

    // Log call to database if available
    let customer = null;
    if (prisma && From) {
      try {
        customer = await prisma.customer.findFirst({
          where: { phone: From },
          include: {
            vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
            appointments: { take: 3, orderBy: { createdAt: 'desc' } }
          }
        });

        // Create call record
        if (customer) {
          await prisma.call.create({
            data: {
              direction: 'INBOUND',
              status: 'RINGING',
              outcome: `Otto AI Agent - Call from ${From}`,
              startedAt: new Date(),
              customerId: customer.id,
              notes: `Otto AI Agent call - Twilio CallSid: ${CallSid}, Caller: ${CallerName || 'Unknown'}`
            }
          });
          console.log('✅ Call logged to database');
        }
      } catch (dbError) {
        console.error('❌ Database error (non-fatal):', dbError.message);
        // Continue even if database fails
      }
    }

    // Generate TwiML that connects to media stream proxy
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();

    // Connect to our media stream proxy endpoint
    const proxyUrl = `wss://${req.get('host')}/api/twilio/media-stream?callSid=${CallSid}`;
    console.log('📡 Media stream proxy URL:', proxyUrl);

    const stream = connect.stream({
      url: proxyUrl
    });

    const twimlString = twiml.toString();
    console.log('📤 Sending TwiML with media stream proxy');
    console.log('📄 TwiML:', twimlString);

    res.type('text/xml');
    res.send(twimlString);
  } catch (error) {
    console.error('❌ Error in /api/twilio/otto/incoming:', error);

    const twilio = require('twilio');
    const response = new twilio.twiml.VoiceResponse();
    response.say('Hello, this is Otto from AutoLux. We are experiencing technical difficulties. Please call back shortly.');

    res.type('text/xml');
    res.send(response.toString());
  }
});

// Media Stream Proxy - Bridge Twilio Media Streams to ElevenLabs
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server for WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/api/twilio/media-stream' });

// Store active connections
const activeStreams = new Map();

wss.on('connection', async (twilioWs, req) => {
  const callSid = req.url.split('callSid=')[1];
  console.log(`📱 Twilio Media Stream connected: ${callSid}`);

  let elevenLabsWs = null;
  const agentId = 'agent_2201k8q07eheexe8j4vkt0b9vecb';
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  try {
    // Get signed URL from ElevenLabs
    const signedUrlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsKey
        }
      }
    );

    if (!signedUrlResponse.ok) {
      throw new Error(`Failed to get signed URL: ${signedUrlResponse.statusText}`);
    }

    const { signed_url } = await signedUrlResponse.json();
    console.log(`🤖 Got signed URL for ${callSid}`);

    // Connect to ElevenLabs
    elevenLabsWs = new WebSocket(signed_url);

    elevenLabsWs.on('open', () => {
      console.log(`🤖 Connected to ElevenLabs for ${callSid}`);
      activeStreams.set(callSid, { twilioWs, elevenLabsWs });
    });

    elevenLabsWs.on('message', (data) => {
      // Forward ElevenLabs audio to Twilio
      if (twilioWs.readyState === WebSocket.OPEN) {
        try {
          // ElevenLabs sends binary audio data
          // Wrap it in Twilio media format
          const mediaMessage = {
            event: 'media',
            streamSid: callSid,
            media: {
              payload: data.toString('base64')
            }
          };
          twilioWs.send(JSON.stringify(mediaMessage));
        } catch (error) {
          console.error(`Error forwarding audio from ElevenLabs: ${error.message}`);
        }
      }
    });

    elevenLabsWs.on('close', () => {
      console.log(`🤖 ElevenLabs connection closed for ${callSid}`);
      if (twilioWs.readyState === WebSocket.OPEN) {
        twilioWs.close();
      }
      activeStreams.delete(callSid);
    });

    elevenLabsWs.on('error', (error) => {
      console.error(`🤖 ElevenLabs error for ${callSid}:`, error.message);
    });

    // Handle Twilio messages
    twilioWs.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        if (message.event === 'media' && message.media && elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
          // Forward Twilio audio to ElevenLabs
          const audioBuffer = Buffer.from(message.media.payload, 'base64');
          elevenLabsWs.send(audioBuffer);
        } else if (message.event === 'start') {
          console.log(`📞 Media stream started for ${callSid}`);
        } else if (message.event === 'stop') {
          console.log(`📞 Media stream stopped for ${callSid}`);
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            elevenLabsWs.close();
          }
        }
      } catch (error) {
        console.error(`Error parsing Twilio message: ${error.message}`);
      }
    });

    twilioWs.on('close', () => {
      console.log(`📱 Twilio connection closed for ${callSid}`);
      if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
        elevenLabsWs.close();
      }
      activeStreams.delete(callSid);
    });

    twilioWs.on('error', (error) => {
      console.error(`📱 Twilio error for ${callSid}:`, error.message);
    });

  } catch (error) {
    console.error(`❌ Error setting up media stream for ${callSid}:`, error.message);
    twilioWs.close();
  }
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

// Start server with WebSocket support
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Otto AI Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 WebSocket media stream: wss://localhost:${PORT}/api/twilio/media-stream`);
});

module.exports = app;
