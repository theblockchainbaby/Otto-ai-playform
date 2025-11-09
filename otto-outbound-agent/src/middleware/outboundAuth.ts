import { Request, Response, NextFunction } from 'express';

const outboundAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.OUTBOUND_API_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid API Key' });
  }

  next();
};

export default outboundAuth;