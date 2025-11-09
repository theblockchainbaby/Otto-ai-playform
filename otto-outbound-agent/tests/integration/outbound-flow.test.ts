import request from 'supertest';
import app from '../../src/app'; // Adjust the path as necessary
import { OutboundCampaignService } from '../../src/services/outboundCampaignService';
import { TwilioOutboundService } from '../../src/services/twilioOutboundService';
import { GoogleSheetsService } from '../../src/services/googleSheetsService';

jest.mock('../../src/services/outboundCampaignService');
jest.mock('../../src/services/twilioOutboundService');
jest.mock('../../src/services/googleSheetsService');

describe('Outbound Call Flow Integration Tests', () => {
  let outboundCampaignService: OutboundCampaignService;
  let twilioOutboundService: TwilioOutboundService;
  let googleSheetsService: GoogleSheetsService;

  beforeEach(() => {
    outboundCampaignService = new OutboundCampaignService();
    twilioOutboundService = new TwilioOutboundService();
    googleSheetsService = new GoogleSheetsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate an outbound call and log the result', async () => {
    const campaignData = { /* mock campaign data */ };
    const callData = { /* mock call data */ };

    outboundCampaignService.startCampaign.mockResolvedValue(campaignData);
    twilioOutboundService.createCall.mockResolvedValue(callData);

    const response = await request(app)
      .post('/api/outbound/start-campaign')
      .send({ campaignId: '12345' });

    expect(response.status).toBe(200);
    expect(outboundCampaignService.startCampaign).toHaveBeenCalledWith('12345');
    expect(twilioOutboundService.createCall).toHaveBeenCalled();
  });

  it('should sync data with Google Sheets after call completion', async () => {
    const callResult = { /* mock call result */ };

    twilioOutboundService.getCallResult.mockResolvedValue(callResult);
    googleSheetsService.syncData.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/outbound/call-complete')
      .send({ callSid: 'abc123' });

    expect(response.status).toBe(200);
    expect(twilioOutboundService.getCallResult).toHaveBeenCalledWith('abc123');
    expect(googleSheetsService.syncData).toHaveBeenCalled();
  });

  it('should handle errors during outbound call flow', async () => {
    outboundCampaignService.startCampaign.mockRejectedValue(new Error('Campaign not found'));

    const response = await request(app)
      .post('/api/outbound/start-campaign')
      .send({ campaignId: 'invalid-id' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campaign not found');
  });
});