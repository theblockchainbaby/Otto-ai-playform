import express, { Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get all vehicles with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']),
  query('make').optional().isString(),
  query('model').optional().isString(),
  query('year').optional().isInt(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const make = req.query.make as string;
    const model = req.query.model as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (year) where.year = year;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      vehicles,
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

// Get vehicle by ID
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        leads: {
          include: {
            customer: {
              select: { id: true, firstName: true, lastName: true },
            },
            assignedTo: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw createError('Vehicle not found', 404);
    }

    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
});

// Create new vehicle
router.post('/', [
  body('vin').trim().isLength({ min: 17, max: 17 }),
  body('make').trim().isLength({ min: 1 }),
  body('model').trim().isLength({ min: 1 }),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('color').optional().isString(),
  body('mileage').optional().isInt({ min: 0 }),
  body('price').optional().isDecimal(),
  body('status').optional().isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']),
  body('description').optional().isString(),
  body('features').optional().isArray(),
  body('customerId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = await prisma.vehicle.create({
      data: req.body,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
});

// Update vehicle
router.put('/:id', [
  body('vin').optional().trim().isLength({ min: 17, max: 17 }),
  body('make').optional().trim().isLength({ min: 1 }),
  body('model').optional().trim().isLength({ min: 1 }),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('color').optional().isString(),
  body('mileage').optional().isInt({ min: 0 }),
  body('price').optional().isDecimal(),
  body('status').optional().isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']),
  body('description').optional().isString(),
  body('features').optional().isArray(),
  body('customerId').optional().isString(),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: req.body,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
});

// Delete vehicle
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.vehicle.delete({
      where: { id },
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
