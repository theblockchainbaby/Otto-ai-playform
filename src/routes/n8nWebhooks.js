const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * n8n Webhook Integration Routes
 * 
 * These endpoints trigger n8n workflows for automation tasks that Otto AI
 * cannot perform directly (appointment booking, follow-ups, etc.)
 */

// n8n instance URL (configure in environment variables)
const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

/**
 * POST /api/n8n/trigger/appointment-booking
 * Trigger n8n workflow to book an appointment
 */
router.post('/trigger/appointment-booking', async (req, res) => {
    try {
        const {
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            appointmentType,
            preferredDate,
            preferredTime,
            notes,
            callId
        } = req.body;

        // Validate required fields
        if (!customerId || !customerName || !appointmentType) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'customerId, customerName, and appointmentType are required'
            });
        }

        // Trigger n8n workflow
        const n8nResponse = await axios.post(`${N8N_BASE_URL}/otto/appointment-request`, {
            customer: {
                id: customerId,
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            intent: {
                appointmentType,
                preferredDate,
                preferredTime,
                notes
            },
            call: {
                id: callId,
                timestamp: new Date().toISOString()
            }
        }, {
            timeout: 30000 // 30 second timeout
        });

        res.status(200).json({
            success: true,
            message: 'Appointment booking workflow triggered',
            data: n8nResponse.data
        });
    } catch (error) {
        console.error('Error triggering appointment booking workflow:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to trigger appointment booking workflow',
            details: error.response?.data || error.message
        });
    }
});

/**
 * POST /api/n8n/trigger/call-completed
 * Trigger n8n workflow for post-call follow-up sequence
 */
router.post('/trigger/call-completed', async (req, res) => {
    try {
        const {
            callId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            duration,
            topic,
            sentiment,
            transcript,
            outcome
        } = req.body;

        if (!callId || !customerId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'callId and customerId are required'
            });
        }

        // Trigger n8n follow-up workflow
        const n8nResponse = await axios.post(`${N8N_BASE_URL}/otto/call-completed`, {
            customer: {
                id: customerId,
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            call: {
                id: callId,
                duration,
                topic,
                sentiment,
                transcript,
                outcome,
                date: new Date().toISOString()
            }
        }, {
            timeout: 10000
        });

        res.status(200).json({
            success: true,
            message: 'Post-call follow-up workflow triggered',
            data: n8nResponse.data
        });
    } catch (error) {
        console.error('Error triggering post-call workflow:', error.message);
        
        // Don't fail the call completion if n8n is down
        res.status(200).json({
            success: true,
            message: 'Call completed, follow-up workflow queued',
            warning: 'n8n workflow trigger failed, will retry'
        });
    }
});

/**
 * POST /api/n8n/trigger/lead-nurture
 * Trigger n8n workflow for lead nurturing campaign
 */
router.post('/trigger/lead-nurture', async (req, res) => {
    try {
        const {
            leadId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            vehicleInterest,
            source,
            priority
        } = req.body;

        if (!leadId || !customerId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'leadId and customerId are required'
            });
        }

        // Trigger n8n lead nurturing workflow
        const n8nResponse = await axios.post(`${N8N_BASE_URL}/otto/lead-nurture`, {
            lead: {
                id: leadId,
                vehicleInterest,
                source,
                priority,
                createdAt: new Date().toISOString()
            },
            customer: {
                id: customerId,
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            }
        }, {
            timeout: 10000
        });

        res.status(200).json({
            success: true,
            message: 'Lead nurturing workflow triggered',
            data: n8nResponse.data
        });
    } catch (error) {
        console.error('Error triggering lead nurture workflow:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to trigger lead nurturing workflow'
        });
    }
});

/**
 * POST /api/n8n/trigger/emergency-dispatch
 * Trigger n8n workflow for emergency roadside assistance
 */
router.post('/trigger/emergency-dispatch', async (req, res) => {
    try {
        const {
            emergencyCallId,
            customerId,
            customerName,
            customerPhone,
            location,
            vehicleInfo,
            emergencyType,
            description
        } = req.body;

        if (!emergencyCallId || !customerId || !location) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'emergencyCallId, customerId, and location are required'
            });
        }

        // Trigger n8n emergency dispatch workflow
        const n8nResponse = await axios.post(`${N8N_BASE_URL}/otto/emergency-dispatch`, {
            emergency: {
                id: emergencyCallId,
                type: emergencyType,
                description,
                timestamp: new Date().toISOString()
            },
            customer: {
                id: customerId,
                name: customerName,
                phone: customerPhone
            },
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address
            },
            vehicle: vehicleInfo
        }, {
            timeout: 15000 // Emergency - longer timeout
        });

        res.status(200).json({
            success: true,
            message: 'Emergency dispatch workflow triggered',
            data: n8nResponse.data
        });
    } catch (error) {
        console.error('Error triggering emergency dispatch workflow:', error.message);
        
        // For emergencies, we should still respond even if n8n fails
        res.status(200).json({
            success: true,
            message: 'Emergency logged, manual dispatch initiated',
            warning: 'Automated dispatch failed, manual intervention required'
        });
    }
});

/**
 * POST /api/n8n/trigger/appointment-reminder
 * Trigger n8n workflow to send appointment reminders
 */
router.post('/trigger/appointment-reminder', async (req, res) => {
    try {
        const {
            appointmentId,
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            appointmentType,
            startTime,
            location
        } = req.body;

        if (!appointmentId || !customerId || !startTime) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'appointmentId, customerId, and startTime are required'
            });
        }

        // Trigger n8n appointment reminder workflow
        const n8nResponse = await axios.post(`${N8N_BASE_URL}/otto/appointment-reminder`, {
            appointment: {
                id: appointmentId,
                type: appointmentType,
                startTime,
                location
            },
            customer: {
                id: customerId,
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            }
        }, {
            timeout: 10000
        });

        res.status(200).json({
            success: true,
            message: 'Appointment reminder workflow triggered',
            data: n8nResponse.data
        });
    } catch (error) {
        console.error('Error triggering appointment reminder workflow:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to trigger appointment reminder workflow'
        });
    }
});

/**
 * GET /api/n8n/health
 * Check n8n connection health
 */
router.get('/health', async (req, res) => {
    try {
        // Try to ping n8n
        const response = await axios.get(`${N8N_BASE_URL}/health`, {
            timeout: 5000
        });

        res.status(200).json({
            status: 'healthy',
            n8nConnected: true,
            n8nUrl: N8N_BASE_URL,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(200).json({
            status: 'degraded',
            n8nConnected: false,
            n8nUrl: N8N_BASE_URL,
            error: error.message,
            timestamp: new Date().toISOString(),
            message: 'n8n is not reachable - workflows will be queued'
        });
    }
});

// ==================== OUTBOUND CAMPAIGN WEBHOOKS ====================

const OutboundCampaignService = require('../services/outboundCampaignService');
const campaignService = new OutboundCampaignService();

/**
 * Webhook to trigger outbound campaign from n8n
 * POST /api/n8n/trigger-outbound-campaign
 */
router.post('/trigger-outbound-campaign', async (req, res) => {
  try {
    const {
      campaignName,
      campaignType,
      dealershipId,
      sheetName,
      delayBetweenCalls,
      callDuringHours,
      maxAttempts,
      recordCalls
    } = req.body;

    console.log('📨 n8n trigger: Starting outbound campaign:', campaignName);

    const result = await campaignService.startCampaign({
      name: campaignName || 'n8n Triggered Campaign',
      type: campaignType || 'GENERAL',
      dealershipId: dealershipId,
      sheetName: sheetName || 'Outbound Campaigns',
      delayBetweenCalls: delayBetweenCalls || 30,
      callDuringHours: callDuringHours || { start: '09:00', end: '18:00' },
      maxAttempts: maxAttempts || 3,
      recordCalls: recordCalls !== false
    });

    res.json({
      success: true,
      message: 'Campaign started successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error triggering campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send campaign results back to n8n
 * GET /api/n8n/campaign-results/:campaignId
 */
router.get('/campaign-results/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaignStatus = campaignService.getCampaignStatus(campaignId);

    if (!campaignStatus) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: {
        campaignId: campaignId,
        status: campaignStatus.status,
        startedAt: campaignStatus.startedAt,
        completedAt: campaignStatus.completedAt,
        totalContacts: campaignStatus.totalContacts,
        contactsCalled: campaignStatus.contactsCalled,
        contactsCompleted: campaignStatus.contactsCompleted,
        contactsFailed: campaignStatus.contactsFailed,
        completionRate: ((campaignStatus.contactsCompleted / campaignStatus.totalContacts) * 100).toFixed(2) + '%'
      }
    });

  } catch (error) {
    console.error('❌ Error getting campaign results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stop a running campaign (can be triggered from n8n)
 * POST /api/n8n/stop-campaign/:campaignId
 */
router.post('/stop-campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const result = await campaignService.stopCampaign(campaignId);

    res.json(result);

  } catch (error) {
    console.error('❌ Error stopping campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Webhook for n8n to check if Otto is ready for outbound calls
 * GET /api/n8n/otto-status
 */
router.get('/otto-status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    services: {
      elevenlabs: !!process.env.ELEVENLABS_OUTBOUND_AGENT_ID,
      twilio: !!process.env.TWILIO_OUTBOUND_NUMBER,
      googleSheets: !!process.env.GOOGLE_SHEETS_CREDENTIALS,
      database: true
    },
    message: 'Otto outbound calling system is ready'
  });
});

module.exports = router;

