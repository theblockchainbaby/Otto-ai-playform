import express, { Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get all calls with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('direction').optional().isIn(['INBOUND', 'OUTBOUND']),
  query('status').optional().isIn(['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER']),
  query('customerId').optional().isString(),
  query('agentId').optional().isString(),
  query('leadId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const direction = req.query.direction as string;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const agentId = req.query.agentId as string;
    const leadId = req.query.leadId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (agentId) where.agentId = agentId;
    if (leadId) where.leadId = leadId;

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          agent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          lead: {
            select: { id: true, status: true, priority: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.call.count({ where }),
    ]);

    res.json({
      calls,
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

// Get call by ID
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        customer: true,
        agent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          include: {
            vehicle: {
              select: { id: true, make: true, model: true, year: true, vin: true },
            },
          },
        },
      },
    });

    if (!call) {
      throw createError('Call not found', 404);
    }

    res.json({ call });
  } catch (error) {
    next(error);
  }
});

// Create new call
router.post('/', [
  body('customerId').isString(),
  body('direction').isIn(['INBOUND', 'OUTBOUND']),
  body('status').optional().isIn(['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER']),
  body('duration').optional().isInt({ min: 0 }),
  body('recording').optional().isURL(),
  body('transcript').optional().isString(),
  body('summary').optional().isString(),
  body('sentiment').optional().isString(),
  body('outcome').optional().isString(),
  body('notes').optional().isString(),
  body('scheduledAt').optional().isISO8601(),
  body('startedAt').optional().isISO8601(),
  body('endedAt').optional().isISO8601(),
  body('leadId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const callData = {
      ...req.body,
      agentId: req.user?.id, // Assign to current user by default
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      startedAt: req.body.startedAt ? new Date(req.body.startedAt) : null,
      endedAt: req.body.endedAt ? new Date(req.body.endedAt) : null,
    };

    const call = await prisma.call.create({
      data: callData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        agent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          select: { id: true, status: true, priority: true },
        },
      },
    });

    res.status(201).json({
      message: 'Call created successfully',
      call,
    });
  } catch (error) {
    next(error);
  }
});

// Update call
router.put('/:id', [
  body('direction').optional().isIn(['INBOUND', 'OUTBOUND']),
  body('status').optional().isIn(['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER']),
  body('duration').optional().isInt({ min: 0 }),
  body('recording').optional().isURL(),
  body('transcript').optional().isString(),
  body('summary').optional().isString(),
  body('sentiment').optional().isString(),
  body('outcome').optional().isString(),
  body('notes').optional().isString(),
  body('scheduledAt').optional().isISO8601(),
  body('startedAt').optional().isISO8601(),
  body('endedAt').optional().isISO8601(),
  body('agentId').optional().isString(),
  body('leadId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      startedAt: req.body.startedAt ? new Date(req.body.startedAt) : undefined,
      endedAt: req.body.endedAt ? new Date(req.body.endedAt) : undefined,
    };

    const call = await prisma.call.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        agent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        lead: {
          select: { id: true, status: true, priority: true },
        },
      },
    });

    res.json({
      message: 'Call updated successfully',
      call,
    });
  } catch (error) {
    next(error);
  }
});

// Delete call
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.call.delete({
      where: { id },
    });

    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
