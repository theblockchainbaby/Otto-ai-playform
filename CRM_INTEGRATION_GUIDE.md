# CRM Integration Guide

## Overview

Otto AI now supports seamless integration with multiple CRM platforms. This guide explains how to configure and use the CRM integration API.

## Supported CRM Platforms

- **Salesforce** - Enterprise CRM platform
- **HubSpot** - All-in-one CRM and marketing platform
- **Pipedrive** - Sales-focused CRM
- **Zoho CRM** - Cloud-based CRM
- **Freshsales** - Sales CRM platform

## API Endpoints

### 1. Get Available CRM Platforms

```bash
GET /api/v1/integrations/crm/platforms
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "platforms": ["salesforce", "hubspot", "pipedrive", "zoho", "freshsales"],
  "message": "Available CRM platforms"
}
```

### 2. Test CRM Connection

```bash
POST /api/v1/integrations/crm/test-connection
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "crmType": "hubspot",
  "credentials": {
    "apiKey": "YOUR_HUBSPOT_API_KEY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "HubSpot connection successful",
  "data": {
    "success": true,
    "message": "HubSpot connection successful"
  }
}
```

### 3. Sync Customer to CRM

```bash
POST /api/v1/integrations/crm/sync-customer
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "crmType": "hubspot",
  "credentials": {
    "apiKey": "YOUR_HUBSPOT_API_KEY"
  },
  "customerData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+19163337305",
    "address": "123 Main St",
    "city": "Sacramento",
    "state": "CA",
    "zipCode": "95814"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer synced to HubSpot",
  "data": {
    "success": true,
    "crmId": "12345",
    "message": "Customer synced to HubSpot"
  }
}
```

### 4. Sync Appointment to CRM

```bash
POST /api/v1/integrations/crm/sync-appointment
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "crmType": "hubspot",
  "credentials": {
    "apiKey": "YOUR_HUBSPOT_API_KEY"
  },
  "appointmentData": {
    "title": "Oil Change Service",
    "startTime": "2025-10-31T10:00:00Z",
    "endTime": "2025-10-31T11:00:00Z",
    "notes": "Customer confirmed via phone",
    "customerId": "12345"
  }
}
```

### 5. Sync Lead to CRM

```bash
POST /api/v1/integrations/crm/sync-lead
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "crmType": "hubspot",
  "credentials": {
    "apiKey": "YOUR_HUBSPOT_API_KEY"
  },
  "leadData": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+19163337306",
    "company": "ABC Motors",
    "notes": "Interested in service packages"
  }
}
```

### 6. Get Customer from CRM

```bash
GET /api/v1/integrations/crm/get-customer?crmType=hubspot&customerId=12345&credentials={"apiKey":"YOUR_API_KEY"}
Authorization: Bearer YOUR_API_KEY
```

## CRM-Specific Configuration

### Salesforce

**Required Credentials:**
```json
{
  "instanceUrl": "https://your-instance.salesforce.com",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "username": "your-username@salesforce.com",
  "password": "YOUR_PASSWORD"
}
```

### HubSpot

**Required Credentials:**
```json
{
  "apiKey": "YOUR_HUBSPOT_API_KEY"
}
```

Get your API key from: https://app.hubspot.com/l/api-key

### Pipedrive

**Required Credentials:**
```json
{
  "apiToken": "YOUR_PIPEDRIVE_API_TOKEN",
  "companyDomain": "your-company"
}
```

Get your API token from: https://app.pipedrive.com/settings/personal/api

### Zoho CRM

**Required Credentials:**
```json
{
  "accessToken": "YOUR_ZOHO_ACCESS_TOKEN"
}
```

### Freshsales

**Required Credentials:**
```json
{
  "apiKey": "YOUR_FRESHSALES_API_KEY",
  "domain": "your-domain"
}
```

## Integration with n8n Workflow

To integrate CRM syncing into your n8n workflow:

1. **Add HTTP Request Node** after appointment booking
2. **Configure the node:**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/integrations/crm/sync-appointment`
   - Headers: `Authorization: Bearer YOUR_API_KEY`
   - Body:
   ```json
   {
     "crmType": "hubspot",
     "credentials": { "apiKey": "YOUR_API_KEY" },
     "appointmentData": {
       "title": "{{ $json.appointment.serviceType }}",
       "startTime": "{{ $json.appointment.date }}",
       "endTime": "{{ $json.appointment.date }}",
       "notes": "{{ $json.appointment.id }}",
       "customerId": "{{ $json.appointment.customerPhone }}"
     }
   }
   ```

## Error Handling

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common errors:
- `Unsupported CRM type` - CRM platform not supported
- `Connection failed` - Invalid credentials or network issue
- `Failed to sync` - Data validation or API error

## Best Practices

1. **Test Connection First** - Always test the connection before syncing data
2. **Store Credentials Securely** - Use environment variables or secure vaults
3. **Handle Errors Gracefully** - Implement retry logic for failed syncs
4. **Map Fields Correctly** - Ensure customer data maps to CRM fields
5. **Monitor Sync Status** - Log all sync operations for auditing

## Troubleshooting

### Connection Failed
- Verify credentials are correct
- Check API key/token hasn't expired
- Ensure network connectivity to CRM API

### Sync Failed
- Verify required fields are present
- Check field mappings match CRM schema
- Review CRM API rate limits

### Missing Data
- Ensure all required fields are provided
- Check data format matches CRM expectations
- Verify customer exists in CRM before updating

## Support

For issues or questions, contact: support@ottoai.com

