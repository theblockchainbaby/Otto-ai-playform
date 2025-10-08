import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments with filtering and search
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      search,
      status,
      type,
      assignedToId,
      customerId,
      vehicleId,
      startDate,
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
        { customer: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { customer: { email: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (assignedToId) where.assignedToId = assignedToId;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          vehicle: {
            select: { id: true, make: true, model: true, year: true, vin: true }
          }
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, vin: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create new appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startTime,
      endTime,
      duration,
      location,
      notes,
      customerId,
      assignedToId,
      vehicleId
    } = req.body;

    // Validate required fields
    if (!title || !type || !startTime || !endTime || !customerId) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, type, startTime, endTime, customerId' 
      });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        assignedToId: assignedToId || (req as any).user.id,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ 
        error: 'Scheduling conflict: Another appointment exists during this time slot' 
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: duration || Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)),
        location,
        notes,
        customerId,
        assignedToId: assignedToId || (req as any).user.id,
        vehicleId
      },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, vin: true }
        }
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      status,
      startTime,
      endTime,
      duration,
      location,
      notes,
      customerId,
      assignedToId,
      vehicleId,
      reminderSent
    } = req.body;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: req.params.id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check for scheduling conflicts if time is being changed
    if (startTime || endTime) {
      const newStartTime = startTime ? new Date(startTime) : existingAppointment.startTime;
      const newEndTime = endTime ? new Date(endTime) : existingAppointment.endTime;
      const newAssignedToId = assignedToId || existingAppointment.assignedToId;

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: req.params.id },
          assignedToId: newAssignedToId,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({ 
          error: 'Scheduling conflict: Another appointment exists during this time slot' 
        });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(duration && { duration }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(customerId && { customerId }),
        ...(assignedToId && { assignedToId }),
        ...(vehicleId !== undefined && { vehicleId }),
        ...(reminderSent !== undefined && { reminderSent })
      },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, vin: true }
        }
      }
    });

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await prisma.appointment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get available time slots for a specific date and agent
router.get('/availability/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const { assignedToId, duration = '60' } = req.query;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    // Get existing appointments for the day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        assignedToId: assignedToId as string || (req as any).user.id,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        startTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { startTime: 'asc' }
    });

    // Generate available time slots
    const slotDuration = parseInt(duration as string);
    const availableSlots = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      // Check if this slot conflicts with any existing appointment
      const hasConflict = existingAppointments.some(appointment => {
        return (currentTime < appointment.endTime && slotEnd > appointment.startTime);
      });

      if (!hasConflict && slotEnd <= endOfDay) {
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          duration: slotDuration
        });
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
