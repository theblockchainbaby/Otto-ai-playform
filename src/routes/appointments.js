const express = require('express');
const router = express.Router();

// In-memory storage for appointments
const appointmentsStore = [
  {
    id: 'apt_001',
    title: 'Test Drive - Tesla Model 3',
    description: 'Customer interested in electric vehicles',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
    duration: 60,
    type: 'TEST_DRIVE',
    status: 'SCHEDULED',
    location: 'Main Showroom',
    notes: 'Customer prefers morning appointments',
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
      lastName: 'Johnson'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'apt_002',
    title: 'Sales Consultation - BMW X5',
    description: 'Luxury SUV consultation',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 45 minutes later
    duration: 45,
    type: 'SALES_CONSULTATION',
    status: 'SCHEDULED',
    location: 'Office 2',
    notes: 'Interested in financing options',
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
      lastName: 'Chen'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'apt_003',
    title: 'Service Appointment - Oil Change',
    description: 'Regular maintenance service',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 minutes later
    duration: 30,
    type: 'SERVICE_APPOINTMENT',
    status: 'CONFIRMED',
    location: 'Service Bay 3',
    notes: 'Customer requested early morning slot',
    customer: {
      id: 'cust_003',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@email.com',
      phone: '(555) 345-6789'
    },
    vehicle: {
      id: 'veh_003',
      year: 2023,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      vin: 'WDDWF4HB1KR123456'
    },
    assignedTo: {
      id: 'user_003',
      firstName: 'David',
      lastName: 'Martinez'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/appointments - List all appointments with pagination
router.get('/', (req, res) => {
  try {
    const { search, status, type, assignedToId, page = 1, limit = 10 } = req.query;
    
    let filteredAppointments = [...appointmentsStore];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAppointments = filteredAppointments.filter(apt =>
        apt.title.toLowerCase().includes(searchLower) ||
        apt.customer.firstName.toLowerCase().includes(searchLower) ||
        apt.customer.lastName.toLowerCase().includes(searchLower) ||
        apt.customer.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }
    
    if (type) {
      filteredAppointments = filteredAppointments.filter(apt => apt.type === type);
    }
    
    if (assignedToId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.assignedTo?.id === assignedToId);
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      appointments: paginatedAppointments,
      pagination: {
        total: filteredAppointments.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredAppointments.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', (req, res) => {
  try {
    const appointment = appointmentsStore.find(apt => apt.id === req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments - Create new appointment
router.post('/', (req, res) => {
  try {
    const appointmentData = req.body;
    
    const newAppointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...appointmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointmentsStore.push(newAppointment);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', (req, res) => {
  try {
    const index = appointmentsStore.findIndex(apt => apt.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const updatedAppointment = {
      ...appointmentsStore[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    appointmentsStore[index] = updatedAppointment;
    
    res.setHeader('Content-Type', 'application/json');
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', (req, res) => {
  try {
    const index = appointmentsStore.findIndex(apt => apt.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    appointmentsStore.splice(index, 1);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;

