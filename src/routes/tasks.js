const express = require('express');
const router = express.Router();

// Mock tasks data
const tasksStore = Array.from({ length: 89 }, (_, i) => ({
  id: `task_${String(i + 1).padStart(3, '0')}`,
  title: `Task ${i + 1}`,
  description: `Description for task ${i + 1}`,
  status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][i % 3],
  priority: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
  assignedToId: `user_${String((i % 5) + 1).padStart(3, '0')}`,
  dueDate: new Date(Date.now() + (i - 44) * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
}));

// GET /api/tasks - List all tasks
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = tasksStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      tasks: paginatedTasks,
      pagination: {
        total: tasksStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(tasksStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

module.exports = router;

