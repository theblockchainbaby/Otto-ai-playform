import express, { Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get all leads with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
  query('source').optional().isIn(['WEBSITE', 'PHONE_CALL', 'EMAIL', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'ADVERTISEMENT']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('assignedToId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const source = req.query.source as string;
    const priority = req.query.priority as string;
    const assignedToId = req.query.assignedToId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          vehicle: {
            select: { id: true, make: true, model: true, year: true, vin: true },
          },
          _count: {
            select: { calls: true },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get lead by ID
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        vehicle: true,
        calls: {
          include: {
            agent: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw createError('Lead not found', 404);
    }

    res.json({ lead });
  } catch (error) {
    next(error);
  }
});

// Create new lead
router.post('/', [
  body('customerId').isString(),
  body('source').isIn(['WEBSITE', 'PHONE_CALL', 'EMAIL', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'ADVERTISEMENT']),
  body('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('notes').optional().isString(),
  body('followUpDate').optional().isISO8601(),
  body('vehicleId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadData = {
      ...req.body,
      assignedToId: req.user?.id, // Assign to current user by default
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
    };

    const lead = await prisma.lead.create({
      data: leadData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, vin: true },
        },
      },
    });

    res.status(201).json({
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
});

// Update lead
router.put('/:id', [
  body('source').optional().isIn(['WEBSITE', 'PHONE_CALL', 'EMAIL', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'ADVERTISEMENT']),
  body('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('notes').optional().isString(),
  body('followUpDate').optional().isISO8601(),
  body('assignedToId').optional().isString(),
  body('vehicleId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : undefined,
    };

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, vin: true },
        },
      },
    });

    res.json({
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.lead.delete({
      where: { id },
    });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
