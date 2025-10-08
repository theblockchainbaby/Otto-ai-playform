import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks with filtering and pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            page = '1',
            limit = '20',
            search = '',
            type,
            priority,
            status,
            assigneeId,
            customerId,
            leadId,
            appointmentId,
            overdue = 'false'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Search across title and description
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Filters
        if (type) where.type = type;
        if (priority) where.priority = priority;
        if (status) where.status = status;
        if (assigneeId) where.assigneeId = assigneeId;
        if (customerId) where.customerId = customerId;
        if (leadId) where.leadId = leadId;
        if (appointmentId) where.appointmentId = appointmentId;

        // Overdue filter
        if (overdue === 'true') {
            where.dueDate = {
                lt: new Date()
            };
            where.status = {
                not: 'COMPLETED'
            };
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    assignee: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    creator: {
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
                    },
                    parentTask: {
                        select: { id: true, title: true, status: true }
                    },
                    subtasks: {
                        select: { id: true, title: true, status: true }
                    },
                    _count: {
                        select: { subtasks: true, messages: true }
                    }
                },
                orderBy: [
                    { priority: 'desc' },
                    { dueDate: 'asc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limitNum
            }),
            prisma.task.count({ where })
        ]);

        res.json({
            tasks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get task by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignee: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                creator: {
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
                },
                parentTask: {
                    select: { id: true, title: true, status: true }
                },
                subtasks: {
                    include: {
                        assignee: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// Create new task
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const {
            title,
            description,
            type,
            priority = 'MEDIUM',
            status = 'PENDING',
            dueDate,
            assigneeId,
            customerId,
            leadId,
            appointmentId,
            parentTaskId,
            isAutomated = false,
            triggerType,
            triggerData
        } = req.body;

        // Validation
        if (!title || !type || !customerId) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, type, customerId' 
            });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                type,
                priority,
                status,
                dueDate: dueDate ? new Date(dueDate) : null,
                assigneeId,
                creatorId: req.user.id,
                customerId,
                leadId,
                appointmentId,
                parentTaskId,
                isAutomated,
                triggerType,
                triggerData
            },
            include: {
                assignee: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            type,
            priority,
            status,
            dueDate,
            assigneeId,
            completedAt
        } = req.body;

        const updateData: any = {
            title,
            description,
            type,
            priority,
            status,
            dueDate: dueDate ? new Date(dueDate) : null,
            assigneeId,
            updatedAt: new Date()
        };

        // Set completedAt when status changes to COMPLETED
        if (status === 'COMPLETED' && !completedAt) {
            updateData.completedAt = new Date();
        } else if (status !== 'COMPLETED') {
            updateData.completedAt = null;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignee: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                customer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        await prisma.task.delete({
            where: { id }
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Get task statistics
router.get('/stats/overview', async (req: AuthenticatedRequest, res) => {
    try {
        const [
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
            tasksByPriority,
            tasksByType,
            tasksByAssignee
        ] = await Promise.all([
            prisma.task.count(),
            prisma.task.count({
                where: { status: 'PENDING' }
            }),
            prisma.task.count({
                where: { status: 'COMPLETED' }
            }),
            prisma.task.count({
                where: {
                    dueDate: { lt: new Date() },
                    status: { not: 'COMPLETED' }
                }
            }),
            prisma.task.groupBy({
                by: ['priority'],
                _count: { id: true }
            }),
            prisma.task.groupBy({
                by: ['type'],
                _count: { id: true }
            }),
            prisma.task.groupBy({
                by: ['assigneeId'],
                _count: { id: true },
                where: { assigneeId: { not: null } }
            })
        ]);

        res.json({
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
            tasksByPriority,
            tasksByType,
            tasksByAssignee
        });
    } catch (error) {
        console.error('Error fetching task statistics:', error);
        res.status(500).json({ error: 'Failed to fetch task statistics' });
    }
});

export default router;
