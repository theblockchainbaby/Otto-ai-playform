import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/emergency-calls - List emergency calls with filtering
router.get('/', async (req, res) => {
    try {
        const {
            search,
            callType,
            priority,
            status,
            customerId,
            handlerId,
            page = '1',
            limit = '10'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { description: { contains: search as string, mode: 'insensitive' } },
                { symptoms: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
                { customer: { 
                    OR: [
                        { firstName: { contains: search as string, mode: 'insensitive' } },
                        { lastName: { contains: search as string, mode: 'insensitive' } },
                        { email: { contains: search as string, mode: 'insensitive' } }
                    ]
                }}
            ];
        }

        if (callType) where.callType = callType;
        if (priority) where.priority = priority;
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;
        if (handlerId) where.handlerId = handlerId;

        const [emergencyCalls, total] = await Promise.all([
            prisma.emergencyCall.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true
                        }
                    },
                    vehicle: {
                        select: {
                            id: true,
                            make: true,
                            model: true,
                            year: true,
                            color: true,
                            vin: true
                        }
                    },
                    handler: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    serviceRequest: {
                        select: {
                            id: true,
                            requestNumber: true,
                            status: true
                        }
                    }
                },
                orderBy: { receivedAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.emergencyCall.count({ where })
        ]);

        res.json({
            emergencyCalls,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching emergency calls:', error);
        res.status(500).json({ error: 'Failed to fetch emergency calls' });
    }
});

// GET /api/emergency-calls/:id - Get single emergency call
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const emergencyCall = await prisma.emergencyCall.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                handler: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                serviceRequest: {
                    include: {
                        serviceProvider: true,
                        statusUpdates: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!emergencyCall) {
            return res.status(404).json({ error: 'Emergency call not found' });
        }

        res.json(emergencyCall);
    } catch (error) {
        console.error('Error fetching emergency call:', error);
        res.status(500).json({ error: 'Failed to fetch emergency call' });
    }
});

// POST /api/emergency-calls - Create new emergency call
router.post('/', async (req, res) => {
    try {
        const {
            callType,
            priority = 'MEDIUM',
            description,
            symptoms,
            vehicleInfo,
            latitude,
            longitude,
            address,
            landmark,
            customerId,
            vehicleId,
            handlerId
        } = req.body;

        // Validate required fields
        if (!callType || !description || !customerId) {
            return res.status(400).json({ 
                error: 'Missing required fields: callType, description, customerId' 
            });
        }

        // Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Create emergency call
        const emergencyCall = await prisma.emergencyCall.create({
            data: {
                callType,
                priority,
                description,
                symptoms,
                vehicleInfo,
                latitude,
                longitude,
                address,
                landmark,
                customerId,
                vehicleId,
                handlerId: handlerId || req.user.id
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                vehicle: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                        color: true
                    }
                },
                handler: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.status(201).json(emergencyCall);
    } catch (error) {
        console.error('Error creating emergency call:', error);
        res.status(500).json({ error: 'Failed to create emergency call' });
    }
});

// PUT /api/emergency-calls/:id - Update emergency call
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            priority,
            description,
            symptoms,
            vehicleInfo,
            latitude,
            longitude,
            address,
            landmark,
            handlerId,
            notes,
            estimatedArrival,
            actualArrival
        } = req.body;

        // Check if emergency call exists
        const existingCall = await prisma.emergencyCall.findUnique({
            where: { id }
        });

        if (!existingCall) {
            return res.status(404).json({ error: 'Emergency call not found' });
        }

        // Prepare update data
        const updateData: any = {};
        
        if (status !== undefined) {
            updateData.status = status;
            
            // Set timestamps based on status
            if (status === 'DISPATCHED' && !existingCall.dispatchedAt) {
                updateData.dispatchedAt = new Date();
            } else if (status === 'ARRIVED' && !existingCall.arrivedAt) {
                updateData.arrivedAt = new Date();
            } else if (status === 'COMPLETED' && !existingCall.completedAt) {
                updateData.completedAt = new Date();
            }
        }

        if (priority !== undefined) updateData.priority = priority;
        if (description !== undefined) updateData.description = description;
        if (symptoms !== undefined) updateData.symptoms = symptoms;
        if (vehicleInfo !== undefined) updateData.vehicleInfo = vehicleInfo;
        if (latitude !== undefined) updateData.latitude = latitude;
        if (longitude !== undefined) updateData.longitude = longitude;
        if (address !== undefined) updateData.address = address;
        if (landmark !== undefined) updateData.landmark = landmark;
        if (handlerId !== undefined) updateData.handlerId = handlerId;
        if (notes !== undefined) updateData.notes = notes;
        if (estimatedArrival !== undefined) updateData.estimatedArrival = new Date(estimatedArrival);
        if (actualArrival !== undefined) updateData.actualArrival = new Date(actualArrival);

        const emergencyCall = await prisma.emergencyCall.update({
            where: { id },
            data: updateData,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                vehicle: {
                    select: {
                        id: true,
                        make: true,
                        model: true,
                        year: true,
                        color: true
                    }
                },
                handler: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.json(emergencyCall);
    } catch (error) {
        console.error('Error updating emergency call:', error);
        res.status(500).json({ error: 'Failed to update emergency call' });
    }
});

// DELETE /api/emergency-calls/:id - Delete emergency call
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if emergency call exists
        const existingCall = await prisma.emergencyCall.findUnique({
            where: { id },
            include: { serviceRequest: true }
        });

        if (!existingCall) {
            return res.status(404).json({ error: 'Emergency call not found' });
        }

        // Don't allow deletion if there's an active service request
        if (existingCall.serviceRequest && 
            !['COMPLETED', 'CANCELLED', 'FAILED'].includes(existingCall.serviceRequest.status)) {
            return res.status(400).json({ 
                error: 'Cannot delete emergency call with active service request' 
            });
        }

        await prisma.emergencyCall.delete({
            where: { id }
        });

        res.json({ message: 'Emergency call deleted successfully' });
    } catch (error) {
        console.error('Error deleting emergency call:', error);
        res.status(500).json({ error: 'Failed to delete emergency call' });
    }
});

// GET /api/emergency-calls/stats/overview - Get emergency call statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            totalCalls,
            activeCalls,
            completedToday,
            averageResponseTime,
            callsByType,
            callsByPriority,
            callsByStatus
        ] = await Promise.all([
            // Total calls
            prisma.emergencyCall.count(),
            
            // Active calls (not completed, cancelled, or failed)
            prisma.emergencyCall.count({
                where: {
                    status: {
                        notIn: ['COMPLETED', 'CANCELLED', 'FAILED']
                    }
                }
            }),
            
            // Completed today
            prisma.emergencyCall.count({
                where: {
                    status: 'COMPLETED',
                    completedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            
            // Average response time (in minutes)
            prisma.emergencyCall.aggregate({
                where: {
                    dispatchedAt: { not: null },
                    receivedAt: { not: null }
                },
                _avg: {
                    // This would need a computed field in a real implementation
                    // For now, we'll calculate it differently
                }
            }),
            
            // Calls by type
            prisma.emergencyCall.groupBy({
                by: ['callType'],
                _count: { callType: true }
            }),
            
            // Calls by priority
            prisma.emergencyCall.groupBy({
                by: ['priority'],
                _count: { priority: true }
            }),
            
            // Calls by status
            prisma.emergencyCall.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);

        res.json({
            totalCalls,
            activeCalls,
            completedToday,
            averageResponseTime: 12, // Placeholder - would calculate from actual data
            callsByType,
            callsByPriority,
            callsByStatus
        });
    } catch (error) {
        console.error('Error fetching emergency call statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
