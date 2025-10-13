import { Request, Response } from 'express';
import { analyzeMessage, generateResponse } from '../services/ai.service';

// Controller for handling AI-related requests
export const analyzeMessageController = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const analysisResult = await analyzeMessage(message);
        res.status(200).json(analysisResult);
    } catch (error) {
        res.status(500).json({ error: 'Error analyzing message' });
    }
};

export const generateResponseController = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const response = await generateResponse(message);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error generating response' });
    }
};