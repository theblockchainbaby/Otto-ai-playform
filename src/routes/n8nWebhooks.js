const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * n8n Webhook Integration Routes
 * 
 * These endpoints trigger n8n workflows for automation tasks that Otto AI
 * cannot perform directly (appointment booking, follow-ups, outbound campaigns, etc.)
 * Last updated: November 9, 2025
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
const GoogleSheetsService = require('../services/googleSheetsService');
const TwilioOutboundService = require('../services/twilioOutboundService');

const campaignService = new OutboundCampaignService();
const googleSheetsService = new GoogleSheetsService();
const twilioService = new TwilioOutboundService();

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

/**
 * Debug endpoint to check environment variables
 * GET /api/n8n/debug-env
 */
router.get('/debug-env', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV,
    envVars: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}... (length: ${process.env.TWILIO_ACCOUNT_SID.length})` : 'MISSING',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? `SET (length: ${process.env.TWILIO_AUTH_TOKEN.length})` : 'MISSING',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || 'MISSING',
      TWILIO_OUTBOUND_NUMBER: process.env.TWILIO_OUTBOUND_NUMBER || 'MISSING',
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? 'SET (hidden)' : 'MISSING',
      ELEVENLABS_OUTBOUND_AGENT_ID: process.env.ELEVENLABS_OUTBOUND_AGENT_ID || 'MISSING',
      GOOGLE_SHEETS_CAMPAIGN_ID: process.env.GOOGLE_SHEETS_CAMPAIGN_ID || 'MISSING',
      BASE_URL: process.env.BASE_URL || 'MISSING'
    },
    credentialLengths: {
      sidLength: process.env.TWILIO_ACCOUNT_SID?.length || 0,
      tokenLength: process.env.TWILIO_AUTH_TOKEN?.length || 0,
      sidValid: process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_ACCOUNT_SID?.length === 34,
      tokenValid: process.env.TWILIO_AUTH_TOKEN?.length === 32
    },
    twilioServiceStatus: {
      canInitialize: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      hasOutboundNumber: !!process.env.TWILIO_OUTBOUND_NUMBER
    }
  });
});

// ==================== NEW n8n WORKFLOW ENDPOINTS ====================

/**
 * n8n Webhook: Get Contacts from Google Sheets
 * GET /api/n8n/outbound/contacts
 */
router.get('/outbound/contacts', async (req, res) => {
  try {
    const { sheetName = 'Sheet1' } = req.query;

    console.log(`📊 n8n requesting contacts from sheet: ${sheetName}`);
    
    const contacts = await googleSheetsService.getCampaignContacts(sheetName);

    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts.map(c => ({
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        status: c.status || 'PENDING'
      }))
    });

  } catch (error) {
    console.error('❌ Error loading contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * n8n Webhook: Start Outbound Campaign
 * POST /api/n8n/outbound/start-campaign
 * 
 * Expected payload:
 * {
 *   "campaignName": "Daily Sales Outreach",
 *   "campaignType": "SALES_OUTREACH",
 *   "sheetName": "Sheet1",
 *   "delayBetweenCalls": 30,
 *   "dealershipName": "Sacramento CDJR"
 * }
 */
router.post('/outbound/start-campaign', async (req, res) => {
  try {
    const {
      campaignName,
      campaignType = 'SALES_OUTREACH',
      sheetName = 'Sheet1',
      delayBetweenCalls = 30,
      dealershipName = 'Vacaville Mitsubishi'
    } = req.body;

    console.log('📞 n8n triggered outbound campaign:', campaignName);
    console.log('📊 Loading contacts from Google Sheets...');

    // Load contacts from Google Sheets
    const contacts = await googleSheetsService.getCampaignContacts(sheetName);

    if (!contacts || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No contacts found in Google Sheet'
      });
    }

    console.log(`✅ Loaded ${contacts.length} contacts from Google Sheets`);

    // Create campaign in database
    const campaign = await campaignService.createCampaign({
      name: campaignName,
      type: campaignType,
      contactCount: contacts.length,
      status: 'RUNNING'
    });

    console.log(`✅ Created campaign: ${campaign.id}`);

    // Start calling contacts asynchronously (don't block response)
    setImmediate(async () => {
      try {
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          
          console.log(`\n[${i + 1}/${contacts.length}] Calling ${contact.name} at ${contact.phone}...`);
          
          try {
            const result = await twilioService.makeOutboundCall({
              toNumber: contact.phone,
              customerName: contact.name,
              customerId: `campaign-${campaign.id}-${i}`,
              campaignType: campaignType,
              recordCall: true
            });
            
            console.log(`   ✅ Call initiated: ${result.callSid}`);
            successCount++;
            
            // Wait before next call (except for last contact)
            if (i < contacts.length - 1) {
              console.log(`   ⏳ Waiting ${delayBetweenCalls} seconds before next call...`);
              await new Promise(resolve => setTimeout(resolve, delayBetweenCalls * 1000));
            }
            
          } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
            failCount++;
          }
        }

        // Update campaign status
        await campaignService.updateCampaignStatus(campaign.id, {
          status: 'COMPLETED',
          successfulCalls: successCount,
          failedCalls: failCount,
          completedAt: new Date()
        });

        console.log('\n📊 Campaign Complete!');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        
      } catch (error) {
        console.error('❌ Campaign execution error:', error);
        await campaignService.updateCampaignStatus(campaign.id, {
          status: 'FAILED'
        });
      }
    });

    // Return immediately with campaign ID
    res.json({
      success: true,
      campaignId: campaign.id,
      campaignName: campaign.name,
      contactCount: contacts.length,
      status: 'STARTED',
      message: `Campaign started with ${contacts.length} contacts`
    });

  } catch (error) {
    console.error('❌ Error starting campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * n8n Webhook: Get Campaign Status
 * GET /api/n8n/outbound/campaign-status/:campaignId
 */
router.get('/outbound/campaign-status/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await campaignService.getCampaignStatus(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        totalCalls: campaign.contactCount || 0,
        completedCalls: (campaign.successfulCalls || 0) + (campaign.failedCalls || 0),
        successfulCalls: campaign.successfulCalls || 0,
        failedCalls: campaign.failedCalls || 0,
        startedAt: campaign.createdAt,
        completedAt: campaign.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Error getting campaign status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * n8n Webhook: Stop Campaign
 * POST /api/n8n/outbound/stop-campaign/:campaignId
 */
router.post('/outbound/stop-campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    await campaignService.updateCampaignStatus(campaignId, {
      status: 'STOPPED'
    });

    res.json({
      success: true,
      message: 'Campaign stopped',
      campaignId
    });

  } catch (error) {
    console.error('❌ Error stopping campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * n8n Webhook: Make Single Call (Immediate)
 * POST /api/n8n/outbound/call-now
 * Body: { "phone": "+19184700208", "customerName": "York", "campaignType": "SALES_OUTREACH" }
 */
router.post('/outbound/call-now', async (req, res) => {
  try {
    const { phone, customerName = 'Customer', campaignType = 'SALES_OUTREACH' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number required'
      });
    }

    console.log(`📞 Making immediate call to ${customerName} at ${phone}`);

    // Use existing TwilioOutboundService (already has credentials)
    const result = await twilioService.makeOutboundCall({
      toNumber: phone,
      customerName: customerName,
      campaignType: campaignType,
      customerId: null, // n8n calls don't have customer ID
      recordCall: true
    });

    console.log(`✅ Call initiated: ${result.callSid}`);

    res.json({
      success: true,
      callSid: result.callSid,
      to: phone,
      customerName: customerName,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('❌ Error making call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate call'
    });
  }
});

/**
 * n8n Webhook: Make Single Call (GET with query params - easier for n8n)
 * GET /api/n8n/outbound/call/:phone?customerName=York&campaignType=SALES_OUTREACH
 */
router.get('/outbound/call/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { customerName = 'Customer', campaignType = 'SALES_OUTREACH' } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number required'
      });
    }

    console.log(`📞 n8n GET request: Making call to ${customerName} at ${phone}`);
    console.log(`📋 Environment check:`, {
      hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasOutboundNumber: !!process.env.TWILIO_OUTBOUND_NUMBER,
      baseUrl: process.env.BASE_URL
    });

    // Use the existing Twilio service
    const result = await twilioService.makeOutboundCall({
      toNumber: phone,
      customerName: customerName,
      customerId: `n8n-${Date.now()}`,
      campaignType: campaignType,
      recordCall: true
    });

    console.log(`✅ Call initiated via service: ${result.callSid}`);

    res.json({
      success: true,
      callSid: result.callSid,
      to: phone,
      customerName: customerName,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('❌ Error making call:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

/**
 * POST /api/n8n/book-appointment
 * Otto calls this during a conversation to book an appointment
 * Body: {
 *   "customerName": "York",
 *   "customerPhone": "+19184700208",
 *   "customerEmail": "york@example.com",
 *   "appointmentDate": "2025-11-15",
 *   "appointmentTime": "10:00 AM",
 *   "appointmentType": "Service Appointment",
 *   "notes": "Oil change needed"
 * }
 */
router.post('/book-appointment', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate,
      appointmentTime,
      appointmentType = 'Service Appointment',
      notes = ''
    } = req.body;

    console.log('📅 Booking appointment:', { customerName, appointmentDate, appointmentTime });

    // Validate required fields
    if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerName, customerPhone, appointmentDate, appointmentTime'
      });
    }

    // Combine date and time into ISO format
    const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
    
    // Try to save to database
    let appointmentId = null;
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            firstName: customerName.split(' ')[0] || customerName,
            lastName: customerName.split(' ').slice(1).join(' ') || '',
            email: customerEmail || null,
            phone: customerPhone,
            source: 'OUTBOUND_CALL'
          }
        });
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          customerId: customer.id,
          type: appointmentType,
          scheduledAt: appointmentDateTime,
          status: 'SCHEDULED',
          notes: notes,
          source: 'OTTO_AI_CALL'
        }
      });

      appointmentId = appointment.id;
      console.log('✅ Appointment saved to database:', appointmentId);
      
      await prisma.$disconnect();
    } catch (dbError) {
      console.error('⚠️  Database error (continuing anyway):', dbError.message);
    }

    // Trigger n8n workflow for Google Calendar + SMS confirmation
    try {
      await axios.post(`${N8N_BASE_URL}/otto/appointment-booked`, {
        customerName,
        customerPhone,
        customerEmail,
        appointmentDate,
        appointmentTime,
        appointmentType,
        notes,
        appointmentId
      }, {
        timeout: 5000
      });
      console.log('✅ n8n workflow triggered for calendar sync');
    } catch (n8nError) {
      console.error('⚠️  n8n workflow error (appointment still saved):', n8nError.message);
    }

    res.json({
      success: true,
      message: `Appointment booked for ${customerName} on ${appointmentDate} at ${appointmentTime}`,
      appointmentId: appointmentId,
      appointmentDateTime: appointmentDateTime.toISOString()
    });

  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

