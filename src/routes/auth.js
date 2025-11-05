const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Mock user store (in-memory)
const mockUsers = [
  {
    id: 'user_001',
    email: 'admin@otto.ai',
    password: '$2a$12$t9Xe5RoSRT3eEcYbtb6ALOToM0JhmN6q2v7D6wN8MwAyTDLfjzkzi', // 'password123'
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true
  },
  {
    id: 'user_002',
    email: 'demo@otto.ai',
    password: '$2a$12$t9Xe5RoSRT3eEcYbtb6ALOToM0JhmN6q2v7D6wN8MwAyTDLfjzkzi', // 'password123'
    firstName: 'Demo',
    lastName: 'User',
    role: 'SALES_REP',
    isActive: true
  }
];

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'SALES_REP', 'SUPPORT']),
], async (req, res, next) => {
  try {
    // In mock mode, registration is disabled
    return res.status(503).json({
      error: 'Registration is disabled in mock data mode. Use demo credentials: demo@otto.ai / password123'
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user in mock store
    const user = mockUsers.find(u => u.email === email);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'otto-ai-secret-key-dev-only';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Get current user endpoint
router.get('/me', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'otto-ai-secret-key-dev-only';

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Get user from mock store
    const user = mockUsers.find(u => u.id === decoded.id);

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found or inactive' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
});

module.exports = router;

