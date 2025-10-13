// Controller exports for Otto AI Platform

import { Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const healthCheck = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Otto AI Platform is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
};
