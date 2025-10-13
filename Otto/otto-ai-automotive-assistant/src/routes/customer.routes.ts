import { Router } from 'express';
import { 
    createCustomer, 
    getCustomers, 
    getCustomerById, 
    updateCustomer, 
    deleteCustomer 
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateCustomer } from '../middleware/validation.middleware';

const router = Router();

// Route to create a new customer
router.post('/', authenticate, validateCustomer, createCustomer);

// Route to get all customers
router.get('/', authenticate, getCustomers);

// Route to get a customer by ID
router.get('/:id', authenticate, getCustomerById);

// Route to update a customer
router.put('/:id', authenticate, validateCustomer, updateCustomer);

// Route to delete a customer
router.delete('/:id', authenticate, deleteCustomer);

export default router;