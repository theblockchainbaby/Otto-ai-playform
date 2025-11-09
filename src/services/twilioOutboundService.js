const twilio = require('twilio');
const ElevenLabsOutboundService = require('./elevenLabsOutboundService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TwilioOutboundService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(this.accountSid, this.authToken);
    this.outboundNumber = process.env.TWILIO_OUTBOUND_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    this.elevenLabsService = new ElevenLabsOutboundService();
  }

  /**
   * Initiate outbound call with ElevenLabs AI
   * This creates a call that connects to a WebSocket for AI conversation
   */
  async makeOutboundCall(config) {
    try {
      console.log('📞 Initiating outbound call to:', config.toNumber);
      console.log('📋 Campaign:', config.campaignType);
      console.log('👤 Customer:', config.customerName);

      // Create Twilio call with TwiML that connects to WebSocket
      const call = await this.client.calls.create({
        to: config.toNumber,
        from: this.outboundNumber,
        url: `${process.env.BASE_URL}/api/twilio/outbound/twiml?customerId=${config.customerId}&customerName=${encodeURIComponent(config.customerName)}&campaignType=${config.campaignType}`,
        statusCallback: `${process.env.BASE_URL}/api/twilio/outbound/status-callback`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: config.recordCall !== false, // Default to true
        recordingStatusCallback: `${process.env.BASE_URL}/api/twilio/outbound/recording-callback`,
        timeout: 30, // Ring for 30 seconds before giving up
        machineDetection: 'DetectMessageEnd', // Detect voicemail/answering machines
        asyncAmd: 'true',
        asyncAmdStatusCallback: `${process.env.BASE_URL}/api/twilio/outbound/amd-callback`,
        asyncAmdStatusCallbackMethod: 'POST'
      });

      console.log('✅ Outbound call initiated:', call.sid);

      // Save call to database
      try {
        await prisma.outboundCall.create({
          data: {
            callSid: call.sid,
            customerName: config.customerName || 'Unknown',
            customerPhone: config.toNumber,
            customerEmail: config.customerEmail || null,
            status: 'INITIATED',
            direction: 'OUTBOUND',
            campaignId: config.campaignId || null
          }
        });
        console.log('✅ Call saved to database');
      } catch (dbError) {
        console.error('⚠️ Failed to save call to database:', dbError.message);
        // Don't fail the call if database save fails
      }

      return {
        callSid: call.sid,
        status: call.status,
        to: config.toNumber,
        from: this.outboundNumber
      };

    } catch (error) {
      console.error('❌ Error making outbound call:', error);
      throw error;
    }
  }

  /**
   * Make multiple outbound calls in sequence with rate limiting
   */
  async makeOutboundCampaign(contacts, campaignConfig) {
    const results = [];
    const delayBetweenCalls = campaignConfig.delaySeconds || 30; // 30 seconds between calls

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        console.log(`📞 Calling ${i + 1}/${contacts.length}: ${contact.name} (${contact.phone})`);
        
        const callResult = await this.makeOutboundCall({
          toNumber: contact.phone,
          customerName: contact.name,
          customerId: contact.id,
          campaignType: campaignConfig.type,
          recordCall: campaignConfig.recordCalls
        });

        results.push({
          contact: contact,
          success: true,
          callSid: callResult.callSid,
          timestamp: new Date()
        });

        // Wait before next call (except for last call)
        if (i < contacts.length - 1) {
          console.log(`⏳ Waiting ${delayBetweenCalls} seconds before next call...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenCalls * 1000));
        }

      } catch (error) {
        console.error(`❌ Failed to call ${contact.name}:`, error.message);
        results.push({
          contact: contact,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Get call details
   */
  async getCallDetails(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        from: call.from,
        to: call.to,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        priceUnit: call.priceUnit,
        answeredBy: call.answeredBy // 'human', 'machine_start', 'machine_end_beep', 'machine_end_silence', 'fax', 'unknown'
      };
    } catch (error) {
      console.error('❌ Error fetching call details:', error);
      throw error;
    }
  }

  /**
   * Get call recording URL
   */
  async getCallRecording(callSid) {
    try {
      const recordings = await this.client.recordings.list({
        callSid: callSid,
        limit: 1
      });

      if (recordings.length > 0) {
        const recording = recordings[0];
        return {
          sid: recording.sid,
          duration: recording.duration,
          url: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
          dateCreated: recording.dateCreated
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching recording:', error);
      throw error;
    }
  }

  /**
   * Cancel/hang up an ongoing call
   */
  async hangupCall(callSid) {
    try {
      await this.client.calls(callSid).update({ status: 'completed' });
      console.log('📴 Call hung up:', callSid);
      return true;
    } catch (error) {
      console.error('❌ Error hanging up call:', error);
      throw error;
    }
  }
}

module.exports = TwilioOutboundService;
