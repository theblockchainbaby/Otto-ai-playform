const express = require('express');
const router = express.Router();

// In-memory storage for leads
const leadsStore = [
  {
    id: 'lead_001',
    status: 'NEW',
    priority: 'HIGH',
    source: 'WEBSITE',
    notes: 'Customer very interested in electric vehicles. Prefers test drive on weekends.',
    customer: {
      id: 'cust_001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567'
    },
    vehicle: {
      id: 'veh_001',
      year: 2024,
      make: 'Tesla',
      model: 'Model 3',
      vin: '5YJ3E1EA1KF123456'
    },
    assignedTo: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    _count: {
      calls: 3
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_002',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    source: 'PHONE_INQUIRY',
    notes: 'Looking for family SUV. Budget around $50k. Interested in financing options.',
    customer: {
      id: 'cust_002',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '(555) 234-5678'
    },
    vehicle: {
      id: 'veh_002',
      year: 2024,
      make: 'BMW',
      model: 'X5',
      vin: 'WBAJB1C50KWW12345'
    },
    assignedTo: {
      id: 'user_002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@dealership.com'
    },
    _count: {
      calls: 5
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_003',
    status: 'QUALIFIED',
    priority: 'HIGH',
    source: 'REFERRAL',
    notes: 'Referred by existing customer. Ready to purchase within 2 weeks. Cash buyer.',
    customer: {
      id: 'cust_003',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@email.com',
      phone: '(555) 345-6789'
    },
    vehicle: {
      id: 'veh_003',
      year: 2024,
      make: 'Mercedes-Benz',
      model: 'E-Class',
      vin: 'WDDWF4HB1KR123456'
    },
    assignedTo: {
      id: 'user_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    _count: {
      calls: 7
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_004',
    status: 'NEGOTIATING',
    priority: 'HIGH',
    source: 'WALK_IN',
    notes: 'Negotiating trade-in value. Customer has 2019 Audi A4 to trade. Very close to closing.',
    customer: {
      id: 'cust_004',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.martinez@email.com',
      phone: '(555) 456-7890'
    },
    vehicle: {
      id: 'veh_004',
      year: 2024,
      make: 'Audi',
      model: 'A6',
      vin: 'WAUZZZ4G1KN123456'
    },
    assignedTo: {
      id: 'user_003',
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@dealership.com'
    },
    _count: {
      calls: 12
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_005',
    status: 'NEW',
    priority: 'LOW',
    source: 'SOCIAL_MEDIA',
    notes: 'Just browsing. Not in a rush to buy. Follow up in 2 weeks.',
    customer: {
      id: 'cust_005',
      firstName: 'Amanda',
      lastName: 'Thompson',
      email: 'amanda.thompson@email.com',
      phone: '(555) 567-8901'
    },
    vehicle: {
      id: 'veh_005',
      year: 2024,
      make: 'Lexus',
      model: 'RX 350',
      vin: '2T2BZMCA1KC123456'
    },
    assignedTo: {
      id: 'user_002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@dealership.com'
    },
    _count: {
      calls: 1
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  }
];

// GET /api/leads - List all leads with pagination
router.get('/', (req, res) => {
  try {
    const { search, status, source, assignedToId, page = 1, limit = 10 } = req.query;
    
    let filteredLeads = [...leadsStore];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.customer.firstName.toLowerCase().includes(searchLower) ||
        lead.customer.lastName.toLowerCase().includes(searchLower) ||
        lead.customer.email.toLowerCase().includes(searchLower) ||
        lead.customer.phone.includes(search) ||
        lead.vehicle.make.toLowerCase().includes(searchLower) ||
        lead.vehicle.model.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    
    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }
    
    if (assignedToId) {
      filteredLeads = filteredLeads.filter(lead => lead.assignedTo.id === assignedToId);
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      leads: paginatedLeads,
      pagination: {
        total: filteredLeads.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredLeads.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET /api/leads/:id - Get lead by ID
router.get('/:id', (req, res) => {
  try {
    const lead = leadsStore.find(l => l.id === req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// POST /api/leads - Create new lead
router.post('/', (req, res) => {
  try {
    const leadData = req.body;
    
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...leadData,
      _count: {
        calls: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    leadsStore.push(newLead);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', (req, res) => {
  try {
    const index = leadsStore.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const updatedLead = {
      ...leadsStore[index],
      ...req.body,
      id: req.params.id,
      _count: leadsStore[index]._count, // Preserve call count
      updatedAt: new Date().toISOString()
    };
    
    leadsStore[index] = updatedLead;
    
    res.setHeader('Content-Type', 'application/json');
    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', (req, res) => {
  try {
    const index = leadsStore.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    leadsStore.splice(index, 1);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;

