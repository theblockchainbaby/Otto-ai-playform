const express = require('express');
const router = express.Router();

// Get prisma from app.locals
function getPrisma(req) {
  return req.app.locals.prisma;
}

// Get all customers with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma(req);
    if (!prisma) {
      // Return mock data if database is not available
      return res.json({
        customers: [
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
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const assignedToId = req.query.assignedToId || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: { vehicles: true, leads: true, calls: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
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
    const prisma = getPrisma(req);
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        vehicles: true,
        leads: {
          include: {
            vehicle: true,
            assignedTo: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        calls: {
          include: {
            agent: {
              select: { id: true, firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

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
    const prisma = getPrisma(req);
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { firstName, lastName, email, phone, address, city, state, zipCode, dateOfBirth } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName and lastName are required' });
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const prisma = getPrisma(req);
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const { firstName, lastName, email, phone, address, city, state, zipCode, dateOfBirth, assignedToId } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

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
    const prisma = getPrisma(req);
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    await prisma.customer.delete({
      where: { id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

