const express = require('express');
const router = express.Router();

// Mock service requests data
const serviceRequestsStore = Array.from({ length: 189 }, (_, i) => ({
  id: `service_${String(i + 1).padStart(3, '0')}`,
  type: ['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'INSPECTION', 'REPAIR'][i % 5],
  status: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'][i % 4],
  customerId: `cust_${String((i % 100) + 1).padStart(3, '0')}`,
  vehicleId: `veh_${String((i % 50) + 1).padStart(3, '0')}`,
  scheduledDate: new Date(Date.now() + (i - 94) * 24 * 60 * 60 * 1000).toISOString(),
  description: `Service request description ${i + 1}`,
  estimatedCost: (i + 1) * 50,
  createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString()
}));

// GET /api/service-requests - List all service requests
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedRequests = serviceRequestsStore.slice(startIndex, endIndex);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      serviceRequests: paginatedRequests,
      pagination: {
        total: serviceRequestsStore.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(serviceRequestsStore.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

module.exports = router;

