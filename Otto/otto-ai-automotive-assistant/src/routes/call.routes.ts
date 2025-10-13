import { Router } from 'express';
import { 
    createCallRecord, 
    getCallRecords, 
    getCallRecordById, 
    updateCallRecord, 
    deleteCallRecord 
} from '../controllers/call.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route to create a new call record
router.post('/', authMiddleware, createCallRecord);

// Route to get all call records
router.get('/', authMiddleware, getCallRecords);

// Route to get a specific call record by ID
router.get('/:id', authMiddleware, getCallRecordById);

// Route to update a call record
router.put('/:id', authMiddleware, updateCallRecord);

// Route to delete a call record
router.delete('/:id', authMiddleware, deleteCallRecord);

export default router;