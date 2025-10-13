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
app.use(helmet());
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

// Twilio webhook endpoint (basic)
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Otto AI Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
