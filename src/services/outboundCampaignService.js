const GoogleSheetsService = require('./googleSheetsService');
const TwilioOutboundService = require('./twilioOutboundService');
const ElevenLabsOutboundService = require('./elevenLabsOutboundService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OutboundCampaignService {
  constructor() {
    this.sheetsService = new GoogleSheetsService();
    this.elevenLabsService = new ElevenLabsOutboundService(
      process.env.ELEVENLABS_API_KEY,
      process.env.ELEVENLABS_OUTBOUND_AGENT_ID
    );
    this.twilioService = new TwilioOutboundService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_OUTBOUND_NUMBER,
      this.elevenLabsService
    );
    this.activeCampaigns = new Map();
  }

  /**
   * Start an outbound campaign
   */
  async startCampaign(campaignConfig) {
    try {
      console.log('🚀 Starting outbound campaign:', campaignConfig.name);

      // Load contacts from Google Sheets
      const contacts = await this.sheetsService.getCampaignContacts(
        campaignConfig.sheetName || 'Outbound Campaigns'
      );

      if (contacts.length === 0) {
        throw new Error('No callable contacts found in Google Sheets');
      }

      // Create campaign in database
      const campaign = await this.sheetsService.createCampaignInDatabase({
        name: campaignConfig.name,
        type: campaignConfig.type || 'APPOINTMENT_REMINDER',
        dealershipId: campaignConfig.dealershipId,
        totalContacts: contacts.length,
        delaySeconds: campaignConfig.delayBetweenCalls || 30,
        callDuringHours: campaignConfig.callDuringHours,
        maxAttempts: campaignConfig.maxAttempts || 3,
        recordCalls: campaignConfig.recordCalls
      });

      // Store active campaign
      this.activeCampaigns.set(campaign.id, {
        status: 'RUNNING',
        startedAt: new Date(),
        totalContacts: contacts.length,
        contactsCalled: 0,
        contactsCompleted: 0,
        contactsFailed: 0
      });

      // Start calling contacts
      this.runCampaign(campaign.id, contacts, campaignConfig);

      return {
        success: true,
        campaignId: campaign.id,
        totalContacts: contacts.length,
        estimatedDuration: contacts.length * (campaignConfig.delayBetweenCalls || 30) / 60 + ' minutes'
      };

    } catch (error) {
      console.error('❌ Error starting campaign:', error);
      throw error;
    }
  }

  /**
   * Run the campaign (async - returns immediately)
   */
  async runCampaign(campaignId, contacts, config) {
    const campaignState = this.activeCampaigns.get(campaignId);

    for (const contact of contacts) {
      // Check if campaign was stopped
      if (campaignState.status === 'STOPPED') {
        console.log('⏸️ Campaign stopped:', campaignId);
        break;
      }

      // Check call time restrictions
      if (!this.isWithinCallHours(config.callDuringHours)) {
        console.log('⏰ Outside calling hours, pausing campaign');
        await this.sleep(60000); // Check again in 1 minute
        continue;
      }

      try {
        console.log(`📞 Calling ${contact.name} at ${contact.phone}`);

        // Prepare custom variables for ElevenLabs conversation
        const customVariables = {
          customer_name: contact.name,
          customer_phone: contact.phone,
          customer_email: contact.email,
          vehicle_info: `${contact.customFields.vehicleYear || ''} ${contact.customFields.vehicleMake || ''} ${contact.customFields.vehicleModel || ''}`.trim(),
          service_type: contact.customFields.serviceType || 'general service',
          last_service: contact.customFields.lastServiceDate || 'unknown',
          campaign_type: config.type || 'APPOINTMENT_REMINDER'
        };

        // Make the call via Twilio
        const callResult = await this.twilioService.makeOutboundCall({
          to: contact.phone,
          customVariables: customVariables,
          record: config.recordCalls !== false,
          statusCallback: `${process.env.BASE_URL}/api/twilio/outbound/status-callback`,
          metadata: {
            campaignId: campaignId,
            contactRowNumber: contact.rowNumber,
            contactName: contact.name
          }
        });

        if (callResult.success) {
          // Update contact status in Google Sheets
          await this.sheetsService.updateContactStatus(
            contact.rowNumber,
            'CALLED',
            `Call initiated: ${callResult.callSid}`
          );

          // Log call in database
          await this.logCallToDatabase(campaignId, contact, callResult);

          campaignState.contactsCalled++;
        } else {
          campaignState.contactsFailed++;
          
          await this.sheetsService.updateContactStatus(
            contact.rowNumber,
            'FAILED',
            `Error: ${callResult.error}`
          );
        }

      } catch (error) {
        console.error(`❌ Error calling ${contact.name}:`, error);
        campaignState.contactsFailed++;
      }

      // Rate limiting delay between calls
      if (config.delayBetweenCalls) {
        await this.sleep(config.delayBetweenCalls * 1000);
      }
    }

    // Mark campaign as completed
    campaignState.status = 'COMPLETED';
    campaignState.completedAt = new Date();

    await prisma.outboundCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        contactsCalled: campaignState.contactsCalled,
        contactsCompleted: campaignState.contactsCompleted,
        contactsFailed: campaignState.contactsFailed
      }
    });

    console.log('✅ Campaign completed:', campaignId);
  }

  /**
   * Stop an active campaign
   */
  async stopCampaign(campaignId) {
    const campaign = this.activeCampaigns.get(campaignId);
    if (campaign) {
      campaign.status = 'STOPPED';
      
      await prisma.outboundCampaign.update({
        where: { id: campaignId },
        data: { status: 'STOPPED' }
      });

      return { success: true, message: 'Campaign stopped' };
    }
    return { success: false, error: 'Campaign not found' };
  }

  /**
   * Get campaign status
   */
  getCampaignStatus(campaignId) {
    return this.activeCampaigns.get(campaignId) || null;
  }

  /**
   * Log call to database
   */
  async logCallToDatabase(campaignId, contact, callResult) {
    try {
      await prisma.outboundCall.create({
        data: {
          campaignId: campaignId,
          callSid: callResult.callSid,
          customerName: contact.name,
          customerPhone: contact.phone,
          customerEmail: contact.email,
          status: 'INITIATED',
          direction: 'OUTBOUND',
          initiatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging call to database:', error);
    }
  }

  /**
   * Check if current time is within allowed calling hours
   */
  isWithinCallHours(callHours) {
    if (!callHours) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = callHours.start.split(':').map(Number);
    const [endHour, endMinute] = callHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle call completion callback
   */
  async handleCallCompleted(callSid, callData) {
    try {
      // Update database
      await prisma.outboundCall.update({
        where: { callSid: callSid },
        data: {
          status: callData.CallStatus,
          duration: parseInt(callData.CallDuration || 0),
          completedAt: new Date(),
          answeredBy: callData.AnsweredBy,
          recordingUrl: callData.RecordingUrl
        }
      });

      // Get campaign ID
      const call = await prisma.outboundCall.findUnique({
        where: { callSid: callSid },
        include: { campaign: true }
      });

      if (call && call.campaign) {
        const campaignState = this.activeCampaigns.get(call.campaignId);
        if (campaignState) {
          if (callData.CallStatus === 'completed') {
            campaignState.contactsCompleted++;
          } else {
            campaignState.contactsFailed++;
          }
        }

        // Append to Google Sheets
        await this.sheetsService.appendCallResult({
          customerName: call.customerName,
          phone: call.customerPhone,
          callSid: callSid,
          status: callData.CallStatus,
          duration: callData.CallDuration,
          outcome: callData.AnsweredBy === 'human' ? 'HUMAN_ANSWERED' : 'VOICEMAIL',
          notes: `Duration: ${callData.CallDuration}s`
        });
      }

    } catch (error) {
      console.error('Error handling call completion:', error);
    }
  }
}

module.exports = OutboundCampaignService;
