import { Request, Response } from 'express';
import { Customer } from '../services/customer.service';

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customerData = req.body;
        const newCustomer = await Customer.create(customerData);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error });
    }
};

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving customers', error });
    }
};

// Get a customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer.findById(customerId);
        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving customer', error });
    }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        const updatedData = req.body;
        const updatedCustomer = await Customer.update(customerId, updatedData);
        if (updatedCustomer) {
            res.status(200).json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer', error });
    }
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await Customer.delete(customerId);
        if (deletedCustomer) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};