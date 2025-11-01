# n8n Workflow: Database & CRM Integration Guide

## Overview

The updated Otto AI Router workflow now automatically:
1. ✅ **Saves appointments to PostgreSQL database**
2. ✅ **Syncs appointments to customer's CRM** (HubSpot, Salesforce, Pipedrive, Zoho, Freshsales)
3. ✅ **Sends SMS confirmations** via Twilio
4. ✅ **Responds to ElevenLabs** with confirmation

## Workflow Flow

```
Customer Books Appointment
    ↓
Prepare Appointment Data
    ↓
Respond to Otto (immediate response)
    ↓
Save Appointment to Database (PostgreSQL)
    ↓
Sync Appointment to CRM
    ↓
Confirm Save and Sync
    ↓
Send SMS Confirmation
```

## New Nodes Added

### 1. Save Appointment to Database
- **Type:** HTTP Request
- **URL:** `http://localhost:3000/api/appointments`
- **Method:** POST
- **Purpose:** Saves appointment data to PostgreSQL via Otto API
- **Data Sent:**
  ```json
  {
    "customerName": "John Doe",
    "customerPhone": "+19163337305",
    "serviceType": "Oil Change",
    "appointmentDate": "2024-11-01T10:00:00Z",
    "status": "confirmed",
    "appointmentId": "apt_1234567890"
  }
  ```

### 2. Sync Appointment to CRM
- **Type:** HTTP Request
- **URL:** `http://localhost:3000/api/v1/integrations/crm/sync-appointment`
- **Method:** POST
- **Headers:** Authorization: Bearer {OTTO_API_KEY}
- **Purpose:** Syncs appointment to customer's CRM platform
- **Data Sent:**
  ```json
  {
    "crmType": "hubspot",
    "credentials": {
      "apiKey": "your-crm-api-key"
    },
    "appointmentData": {
      "id": "apt_1234567890",
      "customerName": "John Doe",
      "customerPhone": "+19163337305",
      "customerEmail": "john@example.com",
      "serviceType": "Oil Change",
      "appointmentDate": "2024-11-01T10:00:00Z",
      "status": "confirmed"
    }
  }
  ```

### 3. Confirm Save and Sync
- **Type:** Code Node
- **Purpose:** Verifies both database and CRM operations completed successfully
- **Returns:** Success status and IDs from both operations

## Configuration Required

### 1. Otto API Key
Set in your n8n environment variables:
```
OTTO_API_KEY=your-api-key-here
```

### 2. CRM Credentials
The workflow expects CRM credentials to be passed in the appointment data. You can:

**Option A: Store in n8n variables**
```
CRM_TYPE=hubspot
CRM_API_KEY=your-hubspot-api-key
```

**Option B: Store in database**
Create a CRM credentials table and fetch before sync

**Option C: Pass from ElevenLabs**
Include in the appointment request from ElevenLabs

### 3. Database Connection
Ensure your Otto server is running:
```bash
npm start
```

The server connects to PostgreSQL automatically via Prisma ORM.

## Testing the Integration

### 1. Test Database Save
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerPhone": "+19163337305",
    "serviceType": "Oil Change",
    "appointmentDate": "2024-11-01T10:00:00Z",
    "status": "confirmed",
    "appointmentId": "apt_test_123"
  }'
```

### 2. Test CRM Sync
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/sync-appointment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-key" \
  -d '{
    "crmType": "hubspot",
    "credentials": {
      "apiKey": "your-hubspot-api-key"
    },
    "appointmentData": {
      "id": "apt_test_123",
      "customerName": "Test Customer",
      "customerPhone": "+19163337305",
      "serviceType": "Oil Change",
      "appointmentDate": "2024-11-01T10:00:00Z",
      "status": "confirmed"
    }
  }'
```

### 3. Test Full Workflow
Book an appointment through ElevenLabs and verify:
- ✅ Appointment appears in database
- ✅ Appointment synced to CRM
- ✅ SMS confirmation sent
- ✅ Response returned to ElevenLabs

## Supported CRM Platforms

| CRM | Auth Type | Required Field |
|-----|-----------|-----------------|
| HubSpot | API Key | `apiKey` |
| Salesforce | OAuth2 | `accessToken` |
| Pipedrive | API Token | `apiToken` |
| Zoho CRM | OAuth2 | `accessToken` |
| Freshsales | API Key | `apiKey` |

## Troubleshooting

### Database Save Fails
- Check Otto server is running: `npm start`
- Verify PostgreSQL connection in `.env`
- Check appointment data format

### CRM Sync Fails
- Verify CRM API credentials are correct
- Check CRM type is supported
- Review CRM API rate limits
- Check network connectivity to CRM

### SMS Not Sending
- Verify Twilio credentials in n8n
- Check phone number format (E.164)
- Review Twilio account balance

## Next Steps

1. **Configure CRM credentials** for your dealership
2. **Test with real CRM** (HubSpot recommended for testing)
3. **Monitor workflow executions** in n8n dashboard
4. **Set up error notifications** for failed syncs
5. **Create backup workflow** for CRM sync failures

