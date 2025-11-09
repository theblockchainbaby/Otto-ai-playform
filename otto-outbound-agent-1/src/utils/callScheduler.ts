import { OutboundCampaignService } from '../services/outboundCampaignService';
import { TwilioOutboundService } from '../services/twilioOutboundService';
import { GoogleSheetsService } from '../services/googleSheetsService';

const callScheduler = {
  scheduleCalls: async (campaignId: string) => {
    const campaignService = new OutboundCampaignService();
    const twilioService = new TwilioOutboundService();
    const sheetsService = new GoogleSheetsService();

    // Fetch campaign details
    const campaign = await campaignService.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Fetch contacts from Google Sheets
    const contacts = await sheetsService.getContactsForCampaign(campaignId);
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts found for the campaign');
    }

    // Schedule calls
    for (const contact of contacts) {
      const callTime = calculateCallTime(contact);
      await twilioService.createCall(contact.phoneNumber, callTime);
    }
  },

  calculateCallTime: (contact) => {
    // Logic to determine the best time to call based on contact's preferences
    const preferredTime = contact.preferredCallTime || new Date();
    return preferredTime;
  }
};

export default callScheduler;