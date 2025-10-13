import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import vehicleRoutes from './routes/vehicles';
import leadRoutes from './routes/leads';
import callRoutes from './routes/calls';
import appointmentRoutes from './routes/appointments';
import messageRoutes from './routes/messages';
import taskRoutes from './routes/tasks';
import campaignRoutes from './routes/campaigns';
import emergencyCallRoutes from './routes/emergencyCalls';
import serviceRequestRoutes from './routes/serviceRequests';
import serviceProviderRoutes from './routes/serviceProviders';
import aiMessageRoutes from './routes/aiMessages';
import aiCallRoutes from './routes/aiCalls';
import twilioWebhookRoutes from './routes/twilioWebhooks';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
})); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(limiter); // Rate limiting
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static('public'));

// Serve audio files for ElevenLabs TTS
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// Redirect root to main dashboard
app.get('/', (_req, res) => {
  res.redirect('/autolux-dashboard.html');
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/leads', authMiddleware, leadRoutes);
app.use('/api/calls', authMiddleware, callRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/campaigns', authMiddleware, campaignRoutes);
app.use('/api/emergency-calls', authMiddleware, emergencyCallRoutes);
app.use('/api/service-requests', authMiddleware, serviceRequestRoutes);
app.use('/api/service-providers', authMiddleware, serviceProviderRoutes);
app.use('/api/ai', authMiddleware, aiMessageRoutes);
app.use('/api/ai/calls', authMiddleware, aiCallRoutes);
app.use('/api/twilio', twilioWebhookRoutes); // No auth middleware for Twilio webhooks

// 404 handler
app.use('*', (req, res) => {
  // For API routes, return JSON error
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      error: 'Route not found',
      message: `The requested route ${req.originalUrl} does not exist.`,
    });
  } else {
    // For web routes, serve custom 404 page
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Otto AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
