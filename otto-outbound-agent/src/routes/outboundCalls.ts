const express = require('express');
const router = express.Router();
const OutboundCampaignService = require('../services/outboundCampaignService');
const twilioOutboundService = require('../services/twilioOutboundService');
const googleSheetsService = require('../services/googleSheetsService');

// Initialize services
const outboundCampaignService = new OutboundCampaignService();
const twilioService = new twilioOutboundService();
const sheetsService = new googleSheetsService();

// Route to start an outbound campaign
router.post('/campaigns/start', async (req, res) => {
  try {
    const { campaignId } = req.body;
    const campaign = await outboundCampaignService.startCampaign(campaignId);
    res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to start campaign' });
  }
});

// Route to get call logs
router.get('/calls/logs', async (req, res) => {
  try {
    const logs = await outboundCampaignService.getCallLogs();
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Error retrieving call logs:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve call logs' });
  }
});

// Route to sync campaign data with Google Sheets
router.post('/campaigns/sync', async (req, res) => {
  try {
    const { campaignId } = req.body;
    const result = await sheetsService.syncCampaignData(campaignId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error syncing campaign data:', error);
    res.status(500).json({ success: false, error: 'Failed to sync campaign data' });
  }
});

// Export the router
module.exports = router;