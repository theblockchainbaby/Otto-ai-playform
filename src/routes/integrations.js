const express = require('express');
const router = express.Router();

/**
 * CRM/DMS Integration API Routes
 * 
 * These endpoints allow external CRM/DMS systems to integrate with Otto AI
 * without rebuilding their existing infrastructure.
 */

// Middleware for API authentication
const authenticateAPI = (req, res, next) => {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key required'
        });
    }
    
    // TODO: Validate API key against database
    // For now, accept any key for demo purposes
    req.apiKey = apiKey;
    next();
};

/**
 * POST /api/v1/integrations/customers/sync
 * Sync customer data from external CRM to Otto AI
 */
router.post('/customers/sync', authenticateAPI, async (req, res) => {
    try {
        const {
            externalId,
            firstName,
            lastName,
            email,
            phone,
            address,
            metadata
        } = req.body;

        // Validate required fields
        if (!externalId || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'externalId, firstName, and lastName are required'
            });
        }

        // TODO: Implement actual database sync
        const customer = {
            id: `otto_${Date.now()}`,
            externalId,
            firstName,
            lastName,
            email,
            phone,
            address,
            metadata,
            syncedAt: new Date().toISOString(),
            source: metadata?.source || 'EXTERNAL_CRM'
        };

        res.status(200).json({
            success: true,
            message: 'Customer synced successfully',
            data: customer
        });
    } catch (error) {
        console.error('Customer sync error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to sync customer data'
        });
    }
});

/**
 * POST /api/v1/integrations/vehicles/sync
 * Sync vehicle inventory from external DMS to Otto AI
 */
router.post('/vehicles/sync', authenticateAPI, async (req, res) => {
    try {
        const {
            externalId,
            vin,
            make,
            model,
            year,
            price,
            status,
            metadata
        } = req.body;

        if (!externalId || !vin) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'externalId and vin are required'
            });
        }

        const vehicle = {
            id: `otto_vehicle_${Date.now()}`,
            externalId,
            vin,
            make,
            model,
            year,
            price,
            status,
            metadata,
            syncedAt: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'Vehicle synced successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Vehicle sync error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to sync vehicle data'
        });
    }
});

/**
 * POST /api/v1/integrations/leads/create
 * Create a new lead in Otto AI from external CRM
 */
router.post('/leads/create', authenticateAPI, async (req, res) => {
    try {
        const {
            customerId,
            source,
            vehicleInterest,
            notes,
            priority,
            metadata
        } = req.body;

        const lead = {
            id: `otto_lead_${Date.now()}`,
            customerId,
            source,
            vehicleInterest,
            notes,
            priority: priority || 'medium',
            status: 'new',
            metadata,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: lead
        });
    } catch (error) {
        console.error('Lead creation error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create lead'
        });
    }
});

/**
 * POST /api/v1/integrations/calls/log
 * Log a call from Otto AI back to external CRM
 */
router.post('/calls/log', authenticateAPI, async (req, res) => {
    try {
        const {
            customerId,
            duration,
            transcript,
            sentiment,
            outcome,
            metadata
        } = req.body;

        const callLog = {
            id: `otto_call_${Date.now()}`,
            customerId,
            duration,
            transcript,
            sentiment,
            outcome,
            metadata,
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'Call logged successfully',
            data: callLog
        });
    } catch (error) {
        console.error('Call logging error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to log call'
        });
    }
});

/**
 * GET /api/v1/integrations/webhooks/events
 * Get list of available webhook events
 */
router.get('/webhooks/events', authenticateAPI, (req, res) => {
    const events = [
        {
            event: 'call.started',
            description: 'Triggered when Otto AI starts a call',
            payload: {
                callId: 'string',
                customerId: 'string',
                phoneNumber: 'string',
                timestamp: 'ISO8601'
            }
        },
        {
            event: 'call.completed',
            description: 'Triggered when a call is completed',
            payload: {
                callId: 'string',
                customerId: 'string',
                duration: 'number',
                transcript: 'string',
                sentiment: 'string',
                outcome: 'string'
            }
        },
        {
            event: 'lead.created',
            description: 'Triggered when a new lead is created',
            payload: {
                leadId: 'string',
                customerId: 'string',
                source: 'string',
                priority: 'string'
            }
        },
        {
            event: 'appointment.scheduled',
            description: 'Triggered when an appointment is scheduled',
            payload: {
                appointmentId: 'string',
                customerId: 'string',
                scheduledTime: 'ISO8601',
                type: 'string'
            }
        },
        {
            event: 'customer.updated',
            description: 'Triggered when customer data is updated',
            payload: {
                customerId: 'string',
                changes: 'object',
                updatedAt: 'ISO8601'
            }
        }
    ];

    res.status(200).json({
        success: true,
        events
    });
});

/**
 * POST /api/v1/integrations/webhooks/register
 * Register a webhook endpoint for receiving Otto AI events
 */
router.post('/webhooks/register', authenticateAPI, async (req, res) => {
    try {
        const { url, events, secret } = req.body;

        if (!url || !events || !Array.isArray(events)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'url and events array are required'
            });
        }

        const webhook = {
            id: `webhook_${Date.now()}`,
            url,
            events,
            secret,
            active: true,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            message: 'Webhook registered successfully',
            data: webhook
        });
    } catch (error) {
        console.error('Webhook registration error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to register webhook'
        });
    }
});

/**
 * GET /api/v1/integrations/health
 * Health check endpoint for integration status
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            customers: '/api/v1/integrations/customers/sync',
            vehicles: '/api/v1/integrations/vehicles/sync',
            leads: '/api/v1/integrations/leads/create',
            calls: '/api/v1/integrations/calls/log',
            webhooks: '/api/v1/integrations/webhooks/register'
        }
    });
});

module.exports = router;

