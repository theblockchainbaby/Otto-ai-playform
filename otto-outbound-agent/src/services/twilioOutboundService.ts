import { Twilio } from 'twilio';
import { OutboundCallLog } from '../models/OutboundCallLog';
import { OutboundCampaignService } from './outboundCampaignService';

export class TwilioOutboundService {
  private twilioClient: Twilio;
  private campaignService: OutboundCampaignService;

  constructor(accountSid: string, authToken: string) {
    this.twilioClient = new Twilio(accountSid, authToken);
    this.campaignService = new OutboundCampaignService();
  }

  async createCall(to: string, from: string, campaignId: string): Promise<void> {
    try {
      const call = await this.twilioClient.calls.create({
        to,
        from,
        statusCallback: `${process.env.BASE_URL}/api/twilio/outbound/call-status`,
        statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
      });

      await this.logCall(call.sid, to, from, campaignId);
    } catch (error) {
      console.error('Error creating call:', error);
    }
  }

  private async logCall(callSid: string, to: string, from: string, campaignId: string): Promise<void> {
    const callLog = new OutboundCallLog({
      callSid,
      to,
      from,
      campaignId,
      status: 'initiated',
    });

    await callLog.save();
  }

  async handleCallStatus(callSid: string, status: string): Promise<void> {
    try {
      const callLog = await OutboundCallLog.findOne({ callSid });

      if (callLog) {
        callLog.status = status;
        await callLog.save();
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  }
}