import { Request, Response, NextFunction } from 'express';

const RATE_LIMIT = 100; // Maximum requests per time window
const TIME_WINDOW = 60 * 1000; // Time window in milliseconds (1 minute)

const requestCounts: { [key: string]: number } = {};
const requestTimestamps: { [key: string]: number } = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;

  const currentTime = Date.now();

  // Initialize request count and timestamp for the IP
  if (!requestCounts[ip]) {
    requestCounts[ip] = 0;
    requestTimestamps[ip] = currentTime;
  }

  // Check if the time window has passed
  if (currentTime - requestTimestamps[ip] > TIME_WINDOW) {
    requestCounts[ip] = 1; // Reset count
    requestTimestamps[ip] = currentTime; // Reset timestamp
  } else {
    requestCounts[ip] += 1; // Increment count
  }

  // Check if the rate limit has been exceeded
  if (requestCounts[ip] > RATE_LIMIT) {
    return res.status(429).json({ success: false, message: 'Rate limit exceeded. Please try again later.' });
  }

  next(); // Proceed to the next middleware or route handler
};