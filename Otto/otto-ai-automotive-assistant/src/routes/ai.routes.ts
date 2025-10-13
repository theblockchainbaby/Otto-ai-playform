import { Router } from 'express';
import { analyzeMessage, generateResponse, transcribeCall, assistAgent } from '../controllers/ai.controller';
import { validateMessage } from '../middleware/validation.middleware';

const router = Router();

// Route for analyzing messages
router.post('/messages/analyze', validateMessage, analyzeMessage);

// Route for generating responses
router.post('/messages/generate-response', validateMessage, generateResponse);

// Route for transcribing calls
router.post('/calls/transcribe', transcribeCall);

// Route for real-time agent assistance
router.post('/calls/agent-assistance', assistAgent);

export default router;