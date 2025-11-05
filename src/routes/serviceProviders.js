const express = require('express');
const router = express.Router();

// Mock service providers data
const serviceProvidersStore = Array.from({ length: 52 }, (_, i) => ({
  id: `provider_${String(i + 1).padStart(3, '0')}`,
  name: `Service Provider ${i + 1}`,
  type: ['TOWING', 'REPAIR_SHOP', 'PARTS_SUPPLIER', 'INSURANCE', 'DETAILING'][i % 5],
  status: 'ACTIVE',
  phone: `(555) ${String(200 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
  email: `provider${i + 1}@example.com`,
  address: `${i + 1} Service Street, City, ST 12345`,
  rating: 3 + (i % 3),
  createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
}));

// GET /api/service-providers - List all service providers
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProviders = serviceProvidersStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      serviceProviders: paginatedProviders,
      pagination: {
        total: serviceProvidersStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(serviceProvidersStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({ error: 'Failed to fetch service providers' });
  }
});

module.exports = router;

