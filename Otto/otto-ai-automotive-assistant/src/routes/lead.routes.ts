import { Router } from 'express';
import { createLead, getLeads, updateLead, deleteLead } from '../controllers/lead.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { leadValidationSchema } from '../utils/validation.util';

const router = Router();

// Route to create a new lead
router.post('/', authMiddleware, validationMiddleware(leadValidationSchema), createLead);

// Route to get all leads
router.get('/', authMiddleware, getLeads);

// Route to update a lead by ID
router.put('/:id', authMiddleware, validationMiddleware(leadValidationSchema), updateLead);

// Route to delete a lead by ID
router.delete('/:id', authMiddleware, deleteLead);

export default router;