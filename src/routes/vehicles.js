const express = require('express');
const router = express.Router();

// In-memory storage for vehicles (persists during server session)
let vehiclesStore = [];

// GET all vehicles
router.get('/', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      vehicles: vehiclesStore,
      pagination: {
        page: 1,
        limit: 50,
        total: vehiclesStore.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET vehicle by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = vehiclesStore.find(v => v.id === id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// POST create new vehicle
router.post('/', (req, res) => {
  try {
    const vehicleData = req.body;

    // Generate a unique ID
    const newVehicle = {
      id: `veh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...vehicleData,
      _count: {
        leads: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vehiclesStore.push(newVehicle);

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: newVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT update vehicle
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const index = vehiclesStore.findIndex(v => v.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehiclesStore[index] = {
      ...vehiclesStore[index],
      ...updateData,
      _count: vehiclesStore[index]._count || { leads: 0 },
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: vehiclesStore[index]
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE vehicle
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = vehiclesStore.findIndex(v => v.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    vehiclesStore.splice(index, 1);
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;

