const express = require('express');
const router = express.Router();

// Mock campaigns data
const campaignsStore = Array.from({ length: 23 }, (_, i) => ({
  id: `campaign_${String(i + 1).padStart(3, '0')}`,
  name: `Campaign ${i + 1}`,
  type: ['EMAIL', 'SMS', 'SOCIAL_MEDIA', 'DIRECT_MAIL'][i % 4],
  status: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'][i % 4],
  startDate: new Date(Date.now() - (23 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  targetAudience: `Segment ${i + 1}`,
  budget: (i + 1) * 1000,
  createdAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString()
}));

// GET /api/campaigns - List all campaigns
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCampaigns = campaignsStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      campaigns: paginatedCampaigns,
      pagination: {
        total: campaignsStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(campaignsStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

module.exports = router;

