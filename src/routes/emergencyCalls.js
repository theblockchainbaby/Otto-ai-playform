const express = require('express');
const router = express.Router();

// Mock emergency calls data
const emergencyCallsStore = Array.from({ length: 147 }, (_, i) => ({
  id: `emergency_${String(i + 1).padStart(3, '0')}`,
  type: ['ROADSIDE_ASSISTANCE', 'ACCIDENT', 'BREAKDOWN', 'TOWING'][i % 4],
  status: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'][i % 4],
  priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
  customerId: `cust_${String((i % 100) + 1).padStart(3, '0')}`,
  location: `Location ${i + 1}`,
  description: `Emergency call description ${i + 1}`,
  createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
  resolvedAt: i % 4 === 2 ? new Date(Date.now() - i * 60 * 60 * 1000).toISOString() : null
}));

// GET /api/emergency-calls - List all emergency calls
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCalls = emergencyCallsStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      emergencyCalls: paginatedCalls,
      pagination: {
        total: emergencyCallsStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(emergencyCallsStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching emergency calls:', error);
    res.status(500).json({ error: 'Failed to fetch emergency calls' });
  }
});

module.exports = router;

