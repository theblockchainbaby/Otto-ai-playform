const express = require('express');
const router = express.Router();

// Mock messages data
const messagesStore = Array.from({ length: 1247 }, (_, i) => ({
  id: `msg_${String(i + 1).padStart(4, '0')}`,
  content: `Sample message content ${i + 1}`,
  channel: ['SMS', 'EMAIL', 'CHAT', 'PHONE'][i % 4],
  direction: i % 3 === 0 ? 'INBOUND' : 'OUTBOUND',
  status: ['SENT', 'DELIVERED', 'READ', 'PENDING'][i % 4],
  customerId: `cust_${String((i % 100) + 1).padStart(3, '0')}`,
  createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
}));

// GET /api/messages - List all messages
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedMessages = messagesStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      messages: paginatedMessages,
      pagination: {
        total: messagesStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(messagesStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;

