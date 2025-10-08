import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Generate unique request number
function generateRequestNumber(): string {
    const prefix = 'SR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// GET /api/service-requests - List service requests with filtering
router.get('/', async (req, res) => {
    try {
        const {
            search,
            type,
            priority,
            status,
            customerId,
            serviceProviderId,
            assignedToId,
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
                { requestNumber: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
                { customer: { 
                    OR: [
                        { firstName: { contains: search as string, mode: 'insensitive' } },
                        { lastName: { contains: search as string, mode: 'insensitive' } }
                    ]
                }}
            ];
        }

        if (type) where.type = type;
        if (priority) where.priority = priority;
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;
        if (serviceProviderId) where.serviceProviderId = serviceProviderId;
        if (assignedToId) where.assignedToId = assignedToId;

        const [serviceRequests, total] = await Promise.all([
            prisma.serviceRequest.findMany({
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
                    serviceProvider: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            phone: true
                        }
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    emergencyCall: {
                        select: {
                            id: true,
                            callType: true,
                            priority: true
                        }
                    }
                },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.serviceRequest.count({ where })
        ]);

        res.json({
            serviceRequests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
});

// GET /api/service-requests/:id - Get single service request
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                serviceProvider: true,
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                dispatcher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                emergencyCall: true,
                statusUpdates: {
                    include: {
                        updatedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        res.json(serviceRequest);
    } catch (error) {
        console.error('Error fetching service request:', error);
        res.status(500).json({ error: 'Failed to fetch service request' });
    }
});

// POST /api/service-requests - Create new service request
router.post('/', async (req, res) => {
    try {
        const {
            type,
            priority = 'MEDIUM',
            description,
            symptoms,
            vehicleInfo,
            latitude,
            longitude,
            address,
            customerId,
            vehicleId,
            emergencyCallId,
            serviceProviderId,
            assignedToId,
            scheduledAt,
            estimatedCost
        } = req.body;

        // Validate required fields
        if (!type || !description || !customerId || !latitude || !longitude || !address) {
            return res.status(400).json({ 
                error: 'Missing required fields: type, description, customerId, latitude, longitude, address' 
            });
        }

        // Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Generate unique request number
        const requestNumber = generateRequestNumber();

        // Create service request
        const serviceRequest = await prisma.serviceRequest.create({
            data: {
                requestNumber,
                type,
                priority,
                description,
                symptoms,
                vehicleInfo,
                latitude,
                longitude,
                address,
                customerId,
                vehicleId,
                emergencyCallId,
                serviceProviderId,
                assignedToId: assignedToId || req.user.id,
                dispatcherId: req.user.id,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                estimatedCost
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
                serviceProvider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Create initial status update
        await prisma.serviceStatusUpdate.create({
            data: {
                serviceRequestId: serviceRequest.id,
                status: 'PENDING',
                message: 'Service request created',
                updatedById: req.user.id
            }
        });

        res.status(201).json(serviceRequest);
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ error: 'Failed to create service request' });
    }
});

// PUT /api/service-requests/:id - Update service request
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            priority,
            description,
            symptoms,
            vehicleInfo,
            serviceProviderId,
            assignedToId,
            scheduledAt,
            estimatedCost,
            actualCost,
            billableHours,
            workPerformed,
            partsUsed,
            notes,
            customerRating,
            customerFeedback
        } = req.body;

        // Check if service request exists
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Prepare update data
        const updateData: any = {};
        
        if (status !== undefined) {
            updateData.status = status;
            
            // Set timestamps based on status
            if (status === 'DISPATCHED' && !existingRequest.dispatchedAt) {
                updateData.dispatchedAt = new Date();
            } else if (status === 'ARRIVED' && !existingRequest.arrivedAt) {
                updateData.arrivedAt = new Date();
            } else if (status === 'IN_PROGRESS' && !existingRequest.startedAt) {
                updateData.startedAt = new Date();
            } else if (status === 'COMPLETED' && !existingRequest.completedAt) {
                updateData.completedAt = new Date();
            }
        }

        if (priority !== undefined) updateData.priority = priority;
        if (description !== undefined) updateData.description = description;
        if (symptoms !== undefined) updateData.symptoms = symptoms;
        if (vehicleInfo !== undefined) updateData.vehicleInfo = vehicleInfo;
        if (serviceProviderId !== undefined) updateData.serviceProviderId = serviceProviderId;
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
        if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
        if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
        if (actualCost !== undefined) updateData.actualCost = actualCost;
        if (billableHours !== undefined) updateData.billableHours = billableHours;
        if (workPerformed !== undefined) updateData.workPerformed = workPerformed;
        if (partsUsed !== undefined) updateData.partsUsed = partsUsed;
        if (notes !== undefined) updateData.notes = notes;
        if (customerRating !== undefined) updateData.customerRating = customerRating;
        if (customerFeedback !== undefined) updateData.customerFeedback = customerFeedback;

        const serviceRequest = await prisma.serviceRequest.update({
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
                serviceProvider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Create status update if status changed
        if (status !== undefined && status !== existingRequest.status) {
            await prisma.serviceStatusUpdate.create({
                data: {
                    serviceRequestId: id,
                    status,
                    message: `Status updated to ${status}`,
                    updatedById: req.user.id
                }
            });
        }

        res.json(serviceRequest);
    } catch (error) {
        console.error('Error updating service request:', error);
        res.status(500).json({ error: 'Failed to update service request' });
    }
});

export default router;
