import { Router } from 'express';
import { 
    createAppointment, 
    getAppointments, 
    getAppointmentById, 
    updateAppointment, 
    deleteAppointment 
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateAppointment } from '../middleware/validation.middleware';

const router = Router();

// Route to create a new appointment
router.post('/', authenticate, validateAppointment, createAppointment);

// Route to get all appointments
router.get('/', authenticate, getAppointments);

// Route to get a specific appointment by ID
router.get('/:id', authenticate, getAppointmentById);

// Route to update an existing appointment
router.put('/:id', authenticate, validateAppointment, updateAppointment);

// Route to delete an appointment
router.delete('/:id', authenticate, deleteAppointment);

export default router;