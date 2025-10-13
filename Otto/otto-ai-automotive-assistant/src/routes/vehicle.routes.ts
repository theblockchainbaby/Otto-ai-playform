import { Router } from 'express';
import { 
    createVehicle, 
    getVehicles, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle 
} from '../controllers/vehicle.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateVehicle } from '../middleware/validation.middleware';

const router = Router();

// Route to create a new vehicle
router.post('/', authenticate, validateVehicle, createVehicle);

// Route to get all vehicles
router.get('/', authenticate, getVehicles);

// Route to get a vehicle by ID
router.get('/:id', authenticate, getVehicleById);

// Route to update a vehicle by ID
router.put('/:id', authenticate, validateVehicle, updateVehicle);

// Route to delete a vehicle by ID
router.delete('/:id', authenticate, deleteVehicle);

export default router;