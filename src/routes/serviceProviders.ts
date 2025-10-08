import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// GET /api/service-providers - List service providers with filtering
router.get('/', async (req, res) => {
    try {
        const {
            search,
            type,
            services,
            isActive,
            isAvailable,
            latitude,
            longitude,
            radius = '50', // Default 50 miles
            page = '1',
            limit = '10'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const radiusNum = parseFloat(radius as string);

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
                { city: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
        if (services) {
            where.services = {
                hasSome: Array.isArray(services) ? services : [services]
            };
        }

        let serviceProviders = await prisma.serviceProvider.findMany({
            where,
            include: {
                serviceRequests: {
                    select: {
                        id: true,
                        status: true,
                        customerRating: true
                    }
                },
                reviews: {
                    select: {
                        rating: true,
                        comment: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: limitNum
        });

        // Filter by distance if coordinates provided
        if (latitude && longitude) {
            const lat = parseFloat(latitude as string);
            const lon = parseFloat(longitude as string);
            
            serviceProviders = serviceProviders
                .map(provider => ({
                    ...provider,
                    distance: calculateDistance(lat, lon, provider.latitude, provider.longitude)
                }))
                .filter(provider => provider.distance <= radiusNum)
                .sort((a, b) => a.distance - b.distance);
        }

        const total = await prisma.serviceProvider.count({ where });

        res.json({
            serviceProviders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching service providers:', error);
        res.status(500).json({ error: 'Failed to fetch service providers' });
    }
});

// GET /api/service-providers/:id - Get single service provider
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const serviceProvider = await prisma.serviceProvider.findUnique({
            where: { id },
            include: {
                serviceRequests: {
                    include: {
                        customer: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { requestedAt: 'desc' },
                    take: 10
                },
                reviews: {
                    include: {
                        customer: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!serviceProvider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }

        res.json(serviceProvider);
    } catch (error) {
        console.error('Error fetching service provider:', error);
        res.status(500).json({ error: 'Failed to fetch service provider' });
    }
});

// POST /api/service-providers - Create new service provider
router.post('/', async (req, res) => {
    try {
        const {
            name,
            type,
            phone,
            email,
            address,
            city,
            state,
            zipCode,
            serviceRadius = 25,
            latitude,
            longitude,
            services = [],
            hoursOfOperation
        } = req.body;

        // Validate required fields
        if (!name || !type || !phone || !address || !city || !state || !zipCode || !latitude || !longitude) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, phone, address, city, state, zipCode, latitude, longitude' 
            });
        }

        const serviceProvider = await prisma.serviceProvider.create({
            data: {
                name,
                type,
                phone,
                email,
                address,
                city,
                state,
                zipCode,
                serviceRadius,
                latitude,
                longitude,
                services,
                hoursOfOperation
            }
        });

        res.status(201).json(serviceProvider);
    } catch (error) {
        console.error('Error creating service provider:', error);
        res.status(500).json({ error: 'Failed to create service provider' });
    }
});

// PUT /api/service-providers/:id - Update service provider
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            phone,
            email,
            address,
            city,
            state,
            zipCode,
            serviceRadius,
            latitude,
            longitude,
            services,
            isActive,
            isAvailable,
            hoursOfOperation
        } = req.body;

        // Check if service provider exists
        const existingProvider = await prisma.serviceProvider.findUnique({
            where: { id }
        });

        if (!existingProvider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }

        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (zipCode !== undefined) updateData.zipCode = zipCode;
        if (serviceRadius !== undefined) updateData.serviceRadius = serviceRadius;
        if (latitude !== undefined) updateData.latitude = latitude;
        if (longitude !== undefined) updateData.longitude = longitude;
        if (services !== undefined) updateData.services = services;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (hoursOfOperation !== undefined) updateData.hoursOfOperation = hoursOfOperation;

        const serviceProvider = await prisma.serviceProvider.update({
            where: { id },
            data: updateData
        });

        res.json(serviceProvider);
    } catch (error) {
        console.error('Error updating service provider:', error);
        res.status(500).json({ error: 'Failed to update service provider' });
    }
});

// DELETE /api/service-providers/:id - Delete service provider
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if service provider exists
        const existingProvider = await prisma.serviceProvider.findUnique({
            where: { id },
            include: {
                serviceRequests: {
                    where: {
                        status: {
                            notIn: ['COMPLETED', 'CANCELLED', 'FAILED']
                        }
                    }
                }
            }
        });

        if (!existingProvider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }

        // Don't allow deletion if there are active service requests
        if (existingProvider.serviceRequests.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete service provider with active service requests' 
            });
        }

        await prisma.serviceProvider.delete({
            where: { id }
        });

        res.json({ message: 'Service provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting service provider:', error);
        res.status(500).json({ error: 'Failed to delete service provider' });
    }
});

// GET /api/service-providers/nearby - Find nearby service providers
router.get('/nearby', async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            serviceType,
            radius = '25',
            limit = '10'
        } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ 
                error: 'Missing required parameters: latitude, longitude' 
            });
        }

        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);
        const radiusNum = parseFloat(radius as string);
        const limitNum = parseInt(limit as string);

        // Build where clause
        const where: any = {
            isActive: true,
            isAvailable: true
        };

        if (serviceType) {
            where.services = {
                has: serviceType
            };
        }

        const serviceProviders = await prisma.serviceProvider.findMany({
            where,
            include: {
                serviceRequests: {
                    select: {
                        id: true,
                        status: true,
                        customerRating: true
                    }
                }
            }
        });

        // Calculate distances and filter
        const nearbyProviders = serviceProviders
            .map(provider => ({
                ...provider,
                distance: calculateDistance(lat, lon, provider.latitude, provider.longitude)
            }))
            .filter(provider => provider.distance <= radiusNum)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limitNum);

        res.json(nearbyProviders);
    } catch (error) {
        console.error('Error finding nearby service providers:', error);
        res.status(500).json({ error: 'Failed to find nearby service providers' });
    }
});

// POST /api/service-providers/:id/toggle-availability - Toggle availability
router.post('/:id/toggle-availability', async (req, res) => {
    try {
        const { id } = req.params;

        const serviceProvider = await prisma.serviceProvider.findUnique({
            where: { id }
        });

        if (!serviceProvider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }

        const updatedProvider = await prisma.serviceProvider.update({
            where: { id },
            data: {
                isAvailable: !serviceProvider.isAvailable
            }
        });

        res.json(updatedProvider);
    } catch (error) {
        console.error('Error toggling service provider availability:', error);
        res.status(500).json({ error: 'Failed to toggle availability' });
    }
});

// GET /api/service-providers/stats/overview - Get service provider statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            totalProviders,
            activeProviders,
            availableProviders,
            providersByType,
            averageRating
        ] = await Promise.all([
            // Total providers
            prisma.serviceProvider.count(),
            
            // Active providers
            prisma.serviceProvider.count({
                where: { isActive: true }
            }),
            
            // Available providers
            prisma.serviceProvider.count({
                where: { 
                    isActive: true,
                    isAvailable: true 
                }
            }),
            
            // Providers by type
            prisma.serviceProvider.groupBy({
                by: ['type'],
                _count: { type: true }
            }),
            
            // Average rating
            prisma.serviceProvider.aggregate({
                _avg: { averageRating: true }
            })
        ]);

        res.json({
            totalProviders,
            activeProviders,
            availableProviders,
            providersByType,
            averageRating: averageRating._avg.averageRating || 0
        });
    } catch (error) {
        console.error('Error fetching service provider statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
