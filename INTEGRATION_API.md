# Otto AI Integration API Documentation

## Overview

Otto AI provides a comprehensive REST API that allows seamless integration with your existing CRM/DMS systems. **No data migration required** - your data stays in your system while Otto AI syncs in real-time.

## Base URL

```
https://api.ottoagent.net/v1/integrations
```

## Authentication

All API requests require authentication using an API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

To obtain an API key, contact our integration team or generate one from your Otto AI dashboard.

## Supported CRM/DMS Platforms

- **CDK Global** (CDK Drive, Elead CRM, CDK DMS)
- **Reynolds & Reynolds** (ERA, docuPAD, Reynolds DMS)
- **DealerSocket** (CRM, ILM, Inventory Management)
- **VinSolutions** (Connect CRM)
- **Salesforce Automotive**
- **Custom REST API** (Any system with API access)

## API Endpoints

### 1. Health Check

Check the status of the integration API.

```bash
GET /api/v1/integrations/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-14T16:42:33.300Z",
  "endpoints": {
    "customers": "/api/v1/integrations/customers/sync",
    "vehicles": "/api/v1/integrations/vehicles/sync",
    "leads": "/api/v1/integrations/leads/create",
    "calls": "/api/v1/integrations/calls/log",
    "webhooks": "/api/v1/integrations/webhooks/register"
  }
}
```

---

### 2. Sync Customer Data

Sync customer information from your CRM to Otto AI.

```bash
POST /api/v1/integrations/customers/sync
```

**Request Body:**
```json
{
  "externalId": "CRM_CUSTOMER_12345",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "address": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001"
  },
  "metadata": {
    "source": "CDK_GLOBAL",
    "customerId": "12345",
    "lastUpdated": "2025-10-14T16:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer synced successfully",
  "data": {
    "id": "otto_1697123456789",
    "externalId": "CRM_CUSTOMER_12345",
    "firstName": "John",
    "lastName": "Doe",
    "syncedAt": "2025-10-14T16:42:33.300Z",
    "source": "CDK_GLOBAL"
  }
}
```

---

### 3. Sync Vehicle Inventory

Sync vehicle data from your DMS to Otto AI.

```bash
POST /api/v1/integrations/vehicles/sync
```

**Request Body:**
```json
{
  "externalId": "VEH_98765",
  "vin": "1HGBH41JXMN109186",
  "make": "Honda",
  "model": "Accord",
  "year": 2024,
  "price": 32500,
  "status": "available",
  "metadata": {
    "source": "REYNOLDS_DMS",
    "stockNumber": "A12345",
    "color": "Silver",
    "mileage": 15
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle synced successfully",
  "data": {
    "id": "otto_vehicle_1697123456789",
    "externalId": "VEH_98765",
    "vin": "1HGBH41JXMN109186",
    "make": "Honda",
    "model": "Accord",
    "year": 2024,
    "syncedAt": "2025-10-14T16:42:33.300Z"
  }
}
```

---

### 4. Create Lead

Create a new lead in Otto AI from your CRM.

```bash
POST /api/v1/integrations/leads/create
```

**Request Body:**
```json
{
  "customerId": "otto_1697123456789",
  "source": "phone_call",
  "vehicleInterest": "2024 Honda Accord",
  "notes": "Customer interested in test drive",
  "priority": "high",
  "metadata": {
    "campaignId": "SPRING_SALE_2025",
    "referralSource": "Google Ads"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "otto_lead_1697123456789",
    "customerId": "otto_1697123456789",
    "status": "new",
    "priority": "high",
    "createdAt": "2025-10-14T16:42:33.300Z"
  }
}
```

---

### 5. Log Call Activity

Log call details from Otto AI back to your CRM.

```bash
POST /api/v1/integrations/calls/log
```

**Request Body:**
```json
{
  "customerId": "otto_1697123456789",
  "duration": 245,
  "transcript": "Customer called about 2024 Honda Accord...",
  "sentiment": "positive",
  "outcome": "appointment_scheduled",
  "metadata": {
    "appointmentTime": "2025-10-15T14:00:00Z",
    "callRecordingUrl": "https://..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call logged successfully",
  "data": {
    "id": "otto_call_1697123456789",
    "customerId": "otto_1697123456789",
    "duration": 245,
    "sentiment": "positive",
    "timestamp": "2025-10-14T16:42:33.300Z"
  }
}
```

---

### 6. Register Webhook

Register a webhook endpoint to receive real-time events from Otto AI.

```bash
POST /api/v1/integrations/webhooks/register
```

**Request Body:**
```json
{
  "url": "https://your-crm.com/webhooks/otto",
  "events": [
    "call.completed",
    "lead.created",
    "appointment.scheduled"
  ],
  "secret": "your_webhook_secret_key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "data": {
    "id": "webhook_1697123456789",
    "url": "https://your-crm.com/webhooks/otto",
    "events": ["call.completed", "lead.created", "appointment.scheduled"],
    "active": true,
    "createdAt": "2025-10-14T16:42:33.300Z"
  }
}
```

---

### 7. Get Available Webhook Events

Get a list of all available webhook events.

```bash
GET /api/v1/integrations/webhooks/events
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "event": "call.started",
      "description": "Triggered when Otto AI starts a call",
      "payload": {
        "callId": "string",
        "customerId": "string",
        "phoneNumber": "string",
        "timestamp": "ISO8601"
      }
    },
    {
      "event": "call.completed",
      "description": "Triggered when a call is completed",
      "payload": {
        "callId": "string",
        "customerId": "string",
        "duration": "number",
        "transcript": "string",
        "sentiment": "string",
        "outcome": "string"
      }
    }
  ]
}
```

---

## Integration Examples

### Node.js Example

```javascript
const axios = require('axios');

const ottoAPI = axios.create({
  baseURL: 'https://api.ottoagent.net/v1/integrations',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Sync customer from CDK Global
async function syncCustomerFromCDK(cdkCustomer) {
  const response = await ottoAPI.post('/customers/sync', {
    externalId: cdkCustomer.id,
    firstName: cdkCustomer.first_name,
    lastName: cdkCustomer.last_name,
    email: cdkCustomer.email,
    phone: cdkCustomer.phone,
    metadata: {
      source: 'CDK_GLOBAL',
      lastUpdated: new Date().toISOString()
    }
  });
  return response.data;
}
```

### Python Example

```python
import requests

OTTO_API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.ottoagent.net/v1/integrations"

headers = {
    "Authorization": f"Bearer {OTTO_API_KEY}",
    "Content-Type": "application/json"
}

# Sync vehicle from Reynolds DMS
def sync_vehicle_from_reynolds(vehicle_data):
    response = requests.post(
        f"{BASE_URL}/vehicles/sync",
        headers=headers,
        json={
            "externalId": vehicle_data["id"],
            "vin": vehicle_data["vin"],
            "make": vehicle_data["make"],
            "model": vehicle_data["model"],
            "year": vehicle_data["year"],
            "price": vehicle_data["price"],
            "metadata": {
                "source": "REYNOLDS_DMS"
            }
        }
    )
    return response.json()
```

---

## Support

For integration support, contact:
- **Email:** integrations@ottoagent.net
- **Documentation:** https://ottoagent.net/integrations.html
- **API Status:** https://status.ottoagent.net

---

## Rate Limits

- **100 requests per 15 minutes** per API key
- Contact us for higher limits for enterprise customers

## Security

- All API requests must use HTTPS
- API keys are encrypted at rest
- Webhook payloads are signed with HMAC-SHA256
- OAuth 2.0 support available for enterprise customers

