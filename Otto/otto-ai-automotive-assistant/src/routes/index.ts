import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import vehicleRoutes from './vehicle.routes';
import leadRoutes from './lead.routes';
import callRoutes from './call.routes';
import appointmentRoutes from './appointment.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Combine all routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/leads', leadRoutes);
router.use('/calls', callRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/ai', aiRoutes);

export default router;