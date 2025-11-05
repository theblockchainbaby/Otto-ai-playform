const express = require('express');
const router = express.Router();

// Mock users data
const usersStore = [
  {
    id: 'user_001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@dealership.com',
    role: 'Sales Manager',
    phone: '(555) 100-0001',
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@dealership.com',
    role: 'Sales Representative',
    phone: '(555) 100-0002',
    status: 'active',
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_003',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@dealership.com',
    role: 'Sales Representative',
    phone: '(555) 100-0003',
    status: 'active',
    createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_004',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@dealership.com',
    role: 'Service Manager',
    phone: '(555) 100-0004',
    status: 'active',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_005',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@dealership.com',
    role: 'General Manager',
    phone: '(555) 100-0005',
    status: 'active',
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/users - List all users
router.get('/', (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    
    let filteredUsers = [...usersStore];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      users: paginatedUsers,
      pagination: {
        total: filteredUsers.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredUsers.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = usersStore.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

