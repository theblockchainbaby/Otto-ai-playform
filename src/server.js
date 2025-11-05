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

// Media Stream Proxy - Bridge Twilio Media Streams to ElevenLabs WebSocket
const WebSocket = require('ws');
const http = require('http');
const expressWs = require('express-ws');

// Create HTTP server for WebSocket upgrade
const server = http.createServer(app);

// Enable express-ws on the main app (required for Render)
expressWs(app, server);
console.log('✅ Express-WS enabled on main app');

// Import Twilio routes (new implementation with chunked audio)
const twilioModule = require('./routes/twilio');
const twilioRoutes = twilioModule; // The default export is the router
const handleMediaStreamConnection = twilioModule.handleMediaStreamConnection; // Named export

app.use('/api/twilio', twilioRoutes);
app.locals.prisma = prisma; // Make prisma available to routes
console.log('✅ Twilio routes loaded');

// Create WebSocket server for fallback
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  console.log('🔌 WebSocket upgrade request received');
  console.log('📍 URL:', request.url);
  
  const pathname = new URL(request.url, 'http://localhost').pathname;
  console.log('📍 Pathname:', pathname);

  if (pathname === '/api/twilio/media-stream') {
    console.log('✅ Upgrading to WebSocket for media stream');
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('✅ WebSocket upgrade complete, calling handler');
      handleMediaStreamConnection(ws, request);
    });
  } else {
    console.log('❌ Unknown WebSocket path, destroying socket');
    socket.destroy();
  }
});

// API endpoint to fetch conversations from ElevenLabs
app.get('/api/elevenlabs/conversations', async (req, res) => {
  try {
    const agentId = 'agent_3701k70bz4gcfd6vq1bkh57d15bw'; // Correct agent ID
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey) {
      return res.status(400).json({
        success: false,
        error: 'ElevenLabs API key not configured'
      });
    }

    // Fetch conversations from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}/conversations`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.conversations?.length || 0} conversations from ElevenLabs`);

    res.json({
      success: true,
      conversations: data.conversations || [],
      total: data.conversations?.length || 0
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get a specific conversation from ElevenLabs
app.get('/api/elevenlabs/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey) {
      return res.status(400).json({
        success: false,
        error: 'ElevenLabs API key not configured'
      });
    }

    // Fetch specific conversation from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched conversation ${conversationId}`);

    res.json({
      success: true,
      conversation: data
    });
  } catch (error) {
    console.error('❌ Error fetching conversation:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
  console.log(`📞 Twilio webhook: https://ottoagent.net/api/twilio/otto/incoming`);
  console.log(`📡 WebSocket media stream: wss://ottoagent.net/api/twilio/media-stream`);
  console.log(`✅ WebSocket server ready for media streaming`);
});

module.exports = app;
