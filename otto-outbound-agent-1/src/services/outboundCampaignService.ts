import { ElevenLabsOutboundService } from './elevenLabsOutboundService';
import { TwilioOutboundService } from './twilioOutboundService';
import { GoogleSheetsService } from './googleSheetsService';

class OutboundCampaignService {
  private elevenLabsService: ElevenLabsOutboundService;
  private twilioService: TwilioOutboundService;
  private googleSheetsService: GoogleSheetsService;

  constructor() {
    this.elevenLabsService = new ElevenLabsOutboundService();
    this.twilioService = new TwilioOutboundService();
    this.googleSheetsService = new GoogleSheetsService();
  }

  async scheduleCalls(campaignId: string): Promise<void> {
    // Logic to schedule calls for the given campaign
    const campaignData = await this.googleSheetsService.getCampaignData(campaignId);
    // Schedule calls using the campaign data
  }

  async startCampaign(campaignId: string): Promise<void> {
    // Logic to start the outbound campaign
    await this.scheduleCalls(campaignId);
    // Additional logic to initiate calls
  }

  async logCallResult(callId: string, result: string): Promise<void> {
    // Logic to log the result of an outbound call
    await this.twilioService.logCallResult(callId, result);
  }

  async syncCampaignData(): Promise<void> {
    // Logic to sync campaign data with Google Sheets
    await this.googleSheetsService.syncData();
  }
}

export { OutboundCampaignService };