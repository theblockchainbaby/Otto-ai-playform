import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all campaigns with filtering and pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            page = '1',
            limit = '20',
            search = '',
            type,
            status,
            isActive
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Search across name and description
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Filters
        if (type) where.type = type;
        if (status) where.status = status;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                include: {
                    creator: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    steps: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            order: true,
                            name: true,
                            type: true,
                            channel: true,
                            delayDays: true,
                            delayHours: true
                        }
                    },
                    _count: {
                        select: { executions: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.campaign.count({ where })
        ]);

        res.json({
            campaigns,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get campaign by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                steps: {
                    orderBy: { order: 'asc' }
                },
                executions: {
                    include: {
                        customer: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        },
                        executor: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    },
                    orderBy: { startedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});

// Create new campaign
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            name,
            description,
            type,
            triggerEvent,
            triggerConditions,
            isActive = false,
            startDate,
            endDate,
            steps = []
        } = req.body;

        // Validation
        if (!name || !type || !triggerEvent) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, triggerEvent' 
            });
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                description,
                type,
                status: 'DRAFT',
                triggerEvent,
                triggerConditions,
                isActive,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                creatorId: req.user.id,
                steps: {
                    create: steps.map((step: any, index: number) => ({
                        order: index + 1,
                        name: step.name,
                        type: step.type,
                        delayDays: step.delayDays || 0,
                        delayHours: step.delayHours || 0,
                        subject: step.subject,
                        content: step.content,
                        channel: step.channel,
                        conditions: step.conditions
                    }))
                }
            },
            include: {
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// Update campaign
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            type,
            status,
            triggerEvent,
            triggerConditions,
            isActive,
            startDate,
            endDate
        } = req.body;

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                name,
                description,
                type,
                status,
                triggerEvent,
                triggerConditions,
                isActive,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                updatedAt: new Date()
            },
            include: {
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        res.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// Delete campaign
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        await prisma.campaign.delete({
            where: { id }
        });

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// Activate/Deactivate campaign
router.post('/:id/toggle', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { isActive: true }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: {
                isActive: !campaign.isActive,
                status: !campaign.isActive ? 'ACTIVE' : 'PAUSED'
            }
        });

        res.json(updatedCampaign);
    } catch (error) {
        console.error('Error toggling campaign:', error);
        res.status(500).json({ error: 'Failed to toggle campaign' });
    }
});

// Trigger campaign execution for a specific customer
router.post('/:id/execute', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { customerId, leadId, appointmentId, triggerData } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'customerId is required' });
        }

        // Check if campaign is active
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: { steps: { orderBy: { order: 'asc' } } }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (!campaign.isActive) {
            return res.status(400).json({ error: 'Campaign is not active' });
        }

        // Create campaign execution
        const execution = await prisma.campaignExecution.create({
            data: {
                campaignId: id,
                customerId,
                leadId,
                appointmentId,
                executorId: req.user.id,
                triggerData,
                stepExecutions: {
                    create: campaign.steps.map(step => ({
                        stepId: step.id,
                        scheduledAt: new Date(Date.now() + (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000))
                    }))
                }
            },
            include: {
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                stepExecutions: {
                    include: {
                        step: true
                    }
                }
            }
        });

        res.status(201).json(execution);
    } catch (error) {
        console.error('Error executing campaign:', error);
        res.status(500).json({ error: 'Failed to execute campaign' });
    }
});

// Get campaign statistics
router.get('/stats/overview', async (req: AuthenticatedRequest, res) => {
    try {
        const [
            totalCampaigns,
            activeCampaigns,
            totalExecutions,
            completedExecutions,
            campaignsByType,
            executionsByStatus
        ] = await Promise.all([
            prisma.campaign.count(),
            prisma.campaign.count({
                where: { isActive: true }
            }),
            prisma.campaignExecution.count(),
            prisma.campaignExecution.count({
                where: { status: 'COMPLETED' }
            }),
            prisma.campaign.groupBy({
                by: ['type'],
                _count: { id: true }
            }),
            prisma.campaignExecution.groupBy({
                by: ['status'],
                _count: { id: true }
            })
        ]);

        res.json({
            totalCampaigns,
            activeCampaigns,
            totalExecutions,
            completedExecutions,
            campaignsByType,
            executionsByStatus
        });
    } catch (error) {
        console.error('Error fetching campaign statistics:', error);
        res.status(500).json({ error: 'Failed to fetch campaign statistics' });
    }
});

export default router;
