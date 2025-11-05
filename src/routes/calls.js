const express = require('express');
const router = express.Router();

// In-memory storage for calls
const callsStore = [
  {
    id: 'call_001',
    direction: 'INBOUND',
    status: 'COMPLETED',
    duration: 245,
    sentiment: 'positive',
    summary: 'Customer inquired about Tesla Model 3. Very interested in electric vehicles and sustainability features. Scheduled test drive for next weekend.',
    outcome: 'Test Drive Scheduled',
    notes: 'Customer mentioned trading in 2019 Honda Accord',
    customer: {
      id: 'cust_001',
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com'
    },
    agent: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_002',
    direction: 'OUTBOUND',
    status: 'COMPLETED',
    duration: 180,
    sentiment: 'neutral',
    summary: 'Follow-up call regarding BMW X5 pricing. Customer requested additional information about financing options and warranty coverage.',
    outcome: 'Information Sent',
    notes: 'Send financing calculator and warranty brochure via email',
    customer: {
      id: 'cust_002',
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '(555) 234-5678',
      email: 'emily.davis@email.com'
    },
    agent: {
      id: 'user_002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@dealership.com'
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_003',
    direction: 'INBOUND',
    status: 'COMPLETED',
    duration: 420,
    sentiment: 'positive',
    summary: 'Existing customer called about service appointment. Discussed maintenance schedule and upcoming service specials. Very satisfied with previous service experience.',
    outcome: 'Service Appointment Booked',
    notes: 'Customer loyalty program member - apply 10% discount',
    customer: {
      id: 'cust_003',
      firstName: 'Robert',
      lastName: 'Wilson',
      phone: '(555) 345-6789',
      email: 'robert.wilson@email.com'
    },
    agent: {
      id: 'user_003',
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@dealership.com'
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_004',
    direction: 'INBOUND',
    status: 'COMPLETED',
    duration: 95,
    sentiment: 'negative',
    summary: 'Customer complained about delayed delivery of ordered vehicle. Expressed frustration with lack of communication from sales team.',
    outcome: 'Escalated to Manager',
    notes: 'Manager to call back within 24 hours with delivery update',
    customer: {
      id: 'cust_004',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      phone: '(555) 456-7890',
      email: 'jennifer.martinez@email.com'
    },
    agent: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_005',
    direction: 'OUTBOUND',
    status: 'COMPLETED',
    duration: 310,
    sentiment: 'positive',
    summary: 'Cold call to potential customer from website inquiry. Discussed Lexus RX 350 features and availability. Customer very receptive and interested in luxury features.',
    outcome: 'Appointment Scheduled',
    notes: 'Customer prefers afternoon appointments. Interested in pearl white color.',
    customer: {
      id: 'cust_005',
      firstName: 'Amanda',
      lastName: 'Thompson',
      phone: '(555) 567-8901',
      email: 'amanda.thompson@email.com'
    },
    agent: {
      id: 'user_002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@dealership.com'
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_006',
    direction: 'INBOUND',
    status: 'MISSED',
    duration: 0,
    sentiment: 'neutral',
    summary: 'Missed call - no voicemail left',
    outcome: 'Follow-up Required',
    notes: 'Attempt callback within 2 hours',
    customer: {
      id: 'cust_006',
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '(555) 678-9012',
      email: 'michael.brown@email.com'
    },
    agent: {
      id: 'user_003',
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@dealership.com'
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'call_007',
    direction: 'OUTBOUND',
    status: 'COMPLETED',
    duration: 155,
    sentiment: 'neutral',
    summary: 'Follow-up on test drive experience. Customer enjoyed the drive but wants to compare with competitors before making decision.',
    outcome: 'Follow-up in 1 Week',
    notes: 'Customer visiting other dealerships this week. Call back Friday.',
    customer: {
      id: 'cust_007',
      firstName: 'Lisa',
      lastName: 'Anderson',
      phone: '(555) 789-0123',
      email: 'lisa.anderson@email.com'
    },
    agent: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString()
  }
];

// GET /api/calls - List all calls with pagination
router.get('/', (req, res) => {
  try {
    const { search, status, direction, agentId, page = 1, limit = 10 } = req.query;
    
    let filteredCalls = [...callsStore];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCalls = filteredCalls.filter(call =>
        call.customer.firstName.toLowerCase().includes(searchLower) ||
        call.customer.lastName.toLowerCase().includes(searchLower) ||
        call.customer.phone.includes(search) ||
        call.summary.toLowerCase().includes(searchLower) ||
        call.outcome.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredCalls = filteredCalls.filter(call => call.status === status);
    }
    
    if (direction) {
      filteredCalls = filteredCalls.filter(call => call.direction === direction);
    }
    
    if (agentId) {
      filteredCalls = filteredCalls.filter(call => call.agent.id === agentId);
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCalls = filteredCalls.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      calls: paginatedCalls,
      pagination: {
        total: filteredCalls.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredCalls.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// GET /api/calls/:id - Get call by ID
router.get('/:id', (req, res) => {
  try {
    const call = callsStore.find(c => c.id === req.params.id);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

// POST /api/calls - Create new call
router.post('/', (req, res) => {
  try {
    const callData = req.body;
    
    const newCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...callData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    callsStore.push(newCall);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newCall);
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// PUT /api/calls/:id - Update call
router.put('/:id', (req, res) => {
  try {
    const index = callsStore.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    const updatedCall = {
      ...callsStore[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    callsStore[index] = updatedCall;
    
    res.setHeader('Content-Type', 'application/json');
    res.json(updatedCall);
  } catch (error) {
    console.error('Error updating call:', error);
    res.status(500).json({ error: 'Failed to update call' });
  }
});

// DELETE /api/calls/:id - Delete call
router.delete('/:id', (req, res) => {
  try {
    const index = callsStore.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    callsStore.splice(index, 1);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Error deleting call:', error);
    res.status(500).json({ error: 'Failed to delete call' });
  }
});

module.exports = router;

