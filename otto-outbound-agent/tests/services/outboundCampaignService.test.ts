import { OutboundCampaignService } from '../../src/services/outboundCampaignService';
import { GoogleSheetsService } from '../../src/services/googleSheetsService';
import { TwilioOutboundService } from '../../src/services/twilioOutboundService';
import { ElevenLabsOutboundService } from '../../src/services/elevenLabsOutboundService';

describe('OutboundCampaignService', () => {
  let outboundCampaignService: OutboundCampaignService;
  let googleSheetsService: GoogleSheetsService;
  let twilioOutboundService: TwilioOutboundService;
  let elevenLabsOutboundService: ElevenLabsOutboundService;

  beforeEach(() => {
    googleSheetsService = new GoogleSheetsService();
    twilioOutboundService = new TwilioOutboundService();
    elevenLabsOutboundService = new ElevenLabsOutboundService();
    outboundCampaignService = new OutboundCampaignService(
      googleSheetsService,
      twilioOutboundService,
      elevenLabsOutboundService
    );
  });

  describe('scheduleCalls', () => {
    it('should schedule calls for the campaign', async () => {
      const campaignData = {
        id: 'campaign1',
        name: 'Test Campaign',
        contacts: [{ phone: '+1234567890' }],
        schedule: '2023-10-01T10:00:00Z',
      };

      const result = await outboundCampaignService.scheduleCalls(campaignData);
      expect(result).toBeTruthy();
      // Additional assertions can be added based on the expected behavior
    });
  });

  describe('manageCampaignData', () => {
    it('should update campaign data', async () => {
      const campaignId = 'campaign1';
      const updatedData = { name: 'Updated Campaign' };

      const result = await outboundCampaignService.manageCampaignData(campaignId, updatedData);
      expect(result).toBeTruthy();
      // Additional assertions can be added based on the expected behavior
    });
  });

  // Additional test cases can be added for other methods in OutboundCampaignService
});