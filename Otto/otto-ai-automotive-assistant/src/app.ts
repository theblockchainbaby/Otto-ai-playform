import express from 'express';
import { json } from 'body-parser';
import { createServer } from 'http';
import { initRoutes } from './routes/index';
import { errorHandler } from './middleware/error.middleware';
import { connectDatabase } from './services/database.service';

const app = express();
const server = createServer(app);

// Middleware
app.use(json());

// Database connection
connectDatabase();

// Routes
initRoutes(app);

// Error handling middleware
app.use(errorHandler);

export default server;