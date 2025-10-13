import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validation.middleware';

const router = Router();

// Registration route
router.post('/register', validateRegistration, register);

// Login route
router.post('/login', validateLogin, login);

export default router;