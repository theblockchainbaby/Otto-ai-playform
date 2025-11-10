# n8n Otto Outbound Integration - Complete Setup Guide

## 🎉 What We Built

We've successfully created a complete n8n workflow integration for Otto's outbound calling system that enables automated, scheduled sales campaigns.

## 📦 Files Created

### 1. **src/routes/n8nWebhooks.js** (Updated)
Added 4 new webhook endpoints for n8n automation:

- `GET /api/n8n/outbound/contacts` - Load contacts from Google Sheets
- `POST /api/n8n/outbound/start-campaign` - Start an outbound campaign
- `GET /api/n8n/outbound/campaign-status/:id` - Check campaign progress
- `POST /api/n8n/outbound/stop-campaign/:id` - Stop a running campaign

### 2. **n8n-workflow-otto-outbound-daily.json**
Complete n8n workflow that:
- Triggers every weekday at 9 AM
- Loads contacts from Google Sheets
- Starts Otto outbound campaign
- Polls status every 60 seconds until complete
- Formats and displays results

### 3. **run-sales-campaign.js**
Standalone script for manual campaign execution (already tested and working!)

### 4. **test-n8n-integration.sh**
Quick test script to verify all webhook endpoints work correctly

## 🚀 How to Use

### Option 1: Automated via n8n (Recommended)

1. **Import the workflow into n8n:**
   - Go to https://dualpay.app.n8n.cloud/workflows
   - Click "Add Workflow" → "Import from File"
   - Upload: `n8n-workflow-otto-outbound-daily.json`

2. **Configure the workflow:**
   - **Schedule Trigger**: Currently set to weekdays at 9 AM PT
     - To change: Click the "Schedule" node → Modify cron expression
     - Examples:
       - `0 9 * * 1-5`: Weekdays 9 AM
       - `0 14 * * *`: Every day 2 PM
       - `0 9,14 * * 1-5`: Weekdays 9 AM and 2 PM
   
   - **Google Sheet ID**: Already configured (`1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w`)
   - **Sheet Name**: "Sheet1" (change if needed)
   - **Dealership Name**: "Sacramento CDJR" (customize per campaign)

3. **Test the workflow:**
   - Click "Execute Workflow" button in n8n
   - Watch the nodes light up as each step completes
   - Check Render logs for call initiation messages
   - Verify calls in Twilio console

4. **Activate the workflow:**
   - Toggle the "Active" switch in top-right
   - Workflow will now run automatically on schedule

### Option 2: Manual via Command Line

```bash
cd '/Users/york/Documents/augment-projects/Automotive AI'
node run-sales-campaign.js
```

- Prompts for confirmation before calling
- Shows progress in real-time
- Provides summary report at the end

### Option 3: Manual via n8n Webhook

```bash
curl -X POST https://ottoagent.net/api/n8n/outbound/start-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Manual Test Campaign",
    "campaignType": "SALES_OUTREACH",
    "sheetName": "Sheet1",
    "delayBetweenCalls": 30,
    "dealershipName": "Your Dealership"
  }'
```

## 📊 Campaign Tracking

### Check Campaign Status

```bash
# Get campaign status by ID
curl https://ottoagent.net/api/n8n/outbound/campaign-status/<CAMPAIGN_ID>
```

Response:
```json
{
  "success": true,
  "campaign": {
    "id": "abc123",
    "name": "Daily Sales Outreach",
    "type": "SALES_OUTREACH",
    "status": "RUNNING" | "COMPLETED" | "FAILED",
    "totalCalls": 10,
    "completedCalls": 7,
    "successfulCalls": 6,
    "failedCalls": 1,
    "startedAt": "2025-11-09T09:00:00Z",
    "completedAt": null
  }
}
```

### Stop Running Campaign

```bash
curl -X POST https://ottoagent.net/api/n8n/outbound/stop-campaign/<CAMPAIGN_ID>
```

## 🔧 Configuration Options

### Campaign Types
- `SALES_OUTREACH` - General sales calls
- `APPOINTMENT_REMINDER` - Service appointment reminders
- `SERVICE_FOLLOWUP` - Post-service follow-ups
- `PAYMENT_REMINDER` - Payment reminders
- `CUSTOMER_SATISFACTION` - Satisfaction surveys

### Calling Settings
```javascript
{
  "delayBetweenCalls": 30,        // Seconds between calls (TCPA compliance)
  "callingHours": {
    "start": 9,                    // Don't call before 9 AM
    "end": 20                      // Don't call after 8 PM
  },
  "timeZone": "America/Los_Angeles", // Recipient's timezone
  "recordCalls": true              // Enable call recording
}
```

## 📋 Google Sheets Format

Your Google Sheet should have these columns:

| Name | Phone | Email | Status | Notes |
|------|-------|-------|--------|-------|
| York | +19184700208 | york@example.com | PENDING | Test contact |
| Will | +19163337305 | will@example.com | PENDING | Test contact 2 |

**Status Values:**
- `PENDING` - Ready to call
- `CALLED` - Call attempted
- `NO_ANSWER` - No answer/voicemail
- `INTERESTED` - Expressed interest
- `NOT_INTERESTED` - Not interested
- `DO_NOT_CALL` - Skip this contact (never call)

## 🔍 Monitoring

### Render Logs
```bash
# View real-time logs
# Go to: https://dashboard.render.com → Select service → Logs tab

# Look for:
📞 n8n triggered outbound campaign: <NAME>
✅ Loaded N contacts from Google Sheets
[1/N] Calling <NAME> at <PHONE>...
✅ Call initiated: CA<CALL_SID>
```

### Twilio Console
- View all calls: https://console.twilio.com/us1/monitor/logs/calls
- Listen to recordings
- Check call duration and status
- View transcriptions (if enabled)

### Campaign Database
All campaigns are stored in PostgreSQL with full audit trails:
- Campaign start/end times
- Individual call records
- Success/failure counts
- Average call duration
- Cost tracking

## 🎯 Next Steps

### Immediate Actions
1. **Import workflow into n8n** - Copy the JSON file
2. **Test manually first** - Click "Execute Workflow" in n8n
3. **Verify calls work** - Check your phone gets the test call
4. **Activate schedule** - Toggle "Active" when ready for automation

### Future Enhancements
- **Google Sheets write-back**: Update call status after each call
- **SMS follow-ups**: Send SMS if no answer
- **Calendar integration**: Book appointments directly from calls
- **Multi-dealership**: Support multiple dealerships in one sheet
- **A/B testing**: Test different scripts/approaches

## ❓ Troubleshooting

### "No contacts found"
- Check Google Sheet ID in workflow
- Verify Sheet name is "Sheet1" (case-sensitive)
- Ensure contacts have status other than "DO_NOT_CALL"
- Check phone numbers are valid (10+ digits)

### "Campaign failed to start"
- Check Render logs for error messages
- Verify environment variables are set:
  - `ELEVENLABS_OUTBOUND_AGENT_ID`
  - `TWILIO_OUTBOUND_NUMBER`
  - `GOOGLE_SHEETS_CAMPAIGN_ID`
- Test with manual script first

### "Calls not connecting"
- Verify Twilio account is active (not trial)
- Check phone numbers are verified
- Review TwilioOutbound.js for errors
- Test single call first: `node test-call-manual-env.js`

### "n8n workflow stuck"
- Check "Wait" node isn't timing out too quickly
- Increase wait time if campaigns are large
- Check campaign status manually via API

## 📞 Support

If you encounter issues:

1. **Check logs**: Render dashboard → Logs tab
2. **Test endpoint**: `curl https://ottoagent.net/api/n8n/otto-status`
3. **Manual test**: Run `node run-sales-campaign.js` locally
4. **Review this guide**: Most issues are configuration-related

---

**You're all set!** Otto is ready to make automated outbound sales calls via n8n. 🎉

Start with a small test campaign (2-3 contacts) before scaling up to hundreds.
