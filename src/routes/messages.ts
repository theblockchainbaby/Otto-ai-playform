import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all messages with filtering and pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            page = '1',
            limit = '20',
            search = '',
            type,
            channel,
            status,
            direction,
            customerId,
            leadId,
            appointmentId
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Search across content and subject
        if (search) {
            where.OR = [
                { content: { contains: search as string, mode: 'insensitive' } },
                { subject: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Filters
        if (type) where.type = type;
        if (channel) where.channel = channel;
        if (status) where.status = status;
        if (direction) where.direction = direction;
        if (customerId) where.customerId = customerId;
        if (leadId) where.leadId = leadId;
        if (appointmentId) where.appointmentId = appointmentId;

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where,
                include: {
                    sender: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    receiver: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    customer: {
                        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                    },
                    lead: {
                        select: { id: true, status: true, priority: true }
                    },
                    appointment: {
                        select: { id: true, title: true, startTime: true, status: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.message.count({ where })
        ]);

        res.json({
            messages,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get message by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const message = await prisma.message.findUnique({
            where: { id },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                receiver: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                },
                lead: {
                    select: { id: true, status: true, priority: true }
                },
                appointment: {
                    select: { id: true, title: true, startTime: true, status: true }
                }
            }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});

// Create new message
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            type,
            channel,
            subject,
            content,
            direction = 'OUTBOUND',
            customerId,
            receiverId,
            leadId,
            appointmentId,
            taskId
        } = req.body;

        // Validation
        if (!type || !channel || !content || !customerId) {
            return res.status(400).json({ 
                error: 'Missing required fields: type, channel, content, customerId' 
            });
        }

        const message = await prisma.message.create({
            data: {
                type,
                channel,
                subject,
                content,
                direction,
                status: 'PENDING',
                senderId: req.user.id,
                receiverId,
                customerId,
                leadId,
                appointmentId,
                taskId
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                receiver: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });

        // TODO: Trigger actual message sending based on channel
        // This would integrate with email service, Twilio SMS, etc.

        res.status(201).json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Update message status
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { status, readAt, deliveredAt, failedAt, errorMessage } = req.body;

        const message = await prisma.message.update({
            where: { id },
            data: {
                status,
                readAt: readAt ? new Date(readAt) : undefined,
                deliveredAt: deliveredAt ? new Date(deliveredAt) : undefined,
                failedAt: failedAt ? new Date(failedAt) : undefined,
                errorMessage,
                updatedAt: new Date()
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });

        res.json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// Delete message
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        await prisma.message.delete({
            where: { id }
        });

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Mark message as read
router.post('/:id/read', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const message = await prisma.message.update({
            where: { id },
            data: {
                status: 'READ',
                readAt: new Date()
            }
        });

        res.json(message);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// Get message statistics
router.get('/stats/overview', async (req: AuthenticatedRequest, res) => {
    try {
        const [
            totalMessages,
            sentToday,
            pendingMessages,
            failedMessages,
            messagesByChannel,
            messagesByType
        ] = await Promise.all([
            prisma.message.count(),
            prisma.message.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.message.count({
                where: { status: 'PENDING' }
            }),
            prisma.message.count({
                where: { status: 'FAILED' }
            }),
            prisma.message.groupBy({
                by: ['channel'],
                _count: { id: true }
            }),
            prisma.message.groupBy({
                by: ['type'],
                _count: { id: true }
            })
        ]);

        res.json({
            totalMessages,
            sentToday,
            pendingMessages,
            failedMessages,
            messagesByChannel,
            messagesByType
        });
    } catch (error) {
        console.error('Error fetching message statistics:', error);
        res.status(500).json({ error: 'Failed to fetch message statistics' });
    }
});

export default router;
