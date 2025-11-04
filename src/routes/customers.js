const express = require('express');
const router = express.Router();

// In-memory storage for customers (persists during server session)
let customersStore = [
  {
    id: 'cust_001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0101',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    assignedTo: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com'
    },
    _count: {
      calls: 5,
      leads: 2,
      vehicles: 1
    }
  },
  {
    id: 'cust_002',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-0102',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    assignedTo: {
      id: 'user_002',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike@example.com'
    },
    _count: {
      calls: 3,
      leads: 1,
      vehicles: 2
    }
  }
];

// Helper function to generate unique IDs
function generateId() {
  return 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get prisma from app.locals
function getPrisma(req) {
  return req.app.locals.prisma;
}

// Get all customers with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Filter mock data by search if provided
    let filteredCustomers = customersStore;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = customersStore.filter(c =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.phone.includes(search)
      );
    }

    const total = filteredCustomers.length;
    const skip = (page - 1) * limit;
    const paginatedCustomers = filteredCustomers.slice(skip, skip + limit);

    return res.json({
      customers: paginatedCustomers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = customersStore.find(c => c.id === id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, state, zipCode, dateOfBirth } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName and lastName are required' });
    }

    const newCustomer = {
      id: generateId(),
      firstName,
      lastName,
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      dateOfBirth: dateOfBirth || null,
      assignedTo: {
        id: 'user_001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com'
      },
      _count: {
        calls: 0,
        leads: 0,
        vehicles: 0
      }
    };

    customersStore.push(newCustomer);

    res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, city, state, zipCode, dateOfBirth, assignedToId } = req.body;

    const customerIndex = customersStore.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customersStore[customerIndex];

    // Update fields
    if (firstName !== undefined) customer.firstName = firstName;
    if (lastName !== undefined) customer.lastName = lastName;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (state !== undefined) customer.state = state;
    if (zipCode !== undefined) customer.zipCode = zipCode;
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth;

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customerIndex = customersStore.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customersStore.splice(customerIndex, 1);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

