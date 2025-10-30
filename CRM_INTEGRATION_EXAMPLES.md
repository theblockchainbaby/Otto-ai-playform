# CRM Integration Examples

## Quick Start Examples

### 1. HubSpot Integration

#### Get API Key
1. Go to https://app.hubspot.com/l/api-key
2. Create a new private app
3. Copy the access token

#### Test Connection
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/test-connection \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "hubspot",
    "credentials": {
      "apiKey": "pat-na1-YOUR_HUBSPOT_API_KEY"
    }
  }'
```

#### Sync Customer
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/sync-customer \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "hubspot",
    "credentials": {
      "apiKey": "pat-na1-YOUR_HUBSPOT_API_KEY"
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
  }'
```

#### Sync Appointment
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/sync-appointment \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "hubspot",
    "credentials": {
      "apiKey": "pat-na1-YOUR_HUBSPOT_API_KEY"
    },
    "appointmentData": {
      "title": "Oil Change Service",
      "startTime": "2025-10-31T10:00:00Z",
      "endTime": "2025-10-31T11:00:00Z",
      "notes": "Customer confirmed via phone",
      "customerId": "12345"
    }
  }'
```

---

### 2. Salesforce Integration

#### Get Credentials
1. Go to your Salesforce instance
2. Setup → Apps → App Manager → Create New Connected App
3. Get: Client ID, Client Secret
4. Use your Salesforce username and password

#### Test Connection
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/test-connection \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "salesforce",
    "credentials": {
      "instanceUrl": "https://your-instance.salesforce.com",
      "clientId": "YOUR_CLIENT_ID",
      "clientSecret": "YOUR_CLIENT_SECRET",
      "username": "your-username@salesforce.com",
      "password": "YOUR_PASSWORD"
    }
  }'
```

---

### 3. Pipedrive Integration

#### Get API Token
1. Go to https://app.pipedrive.com/settings/personal/api
2. Copy your API token

#### Test Connection
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/test-connection \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "pipedrive",
    "credentials": {
      "apiToken": "YOUR_PIPEDRIVE_API_TOKEN",
      "companyDomain": "your-company"
    }
  }'
```

#### Sync Customer
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/sync-customer \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "pipedrive",
    "credentials": {
      "apiToken": "YOUR_PIPEDRIVE_API_TOKEN",
      "companyDomain": "your-company"
    },
    "customerData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+19163337305"
    }
  }'
```

---

### 4. Zoho CRM Integration

#### Get Access Token
1. Go to https://accounts.zoho.com/
2. Create OAuth2 credentials
3. Get your access token

#### Test Connection
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/test-connection \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "zoho",
    "credentials": {
      "accessToken": "YOUR_ZOHO_ACCESS_TOKEN"
    }
  }'
```

---

### 5. Freshsales Integration

#### Get API Key
1. Go to your Freshsales account
2. Settings → API Settings
3. Copy your API key

#### Test Connection
```bash
curl -X POST http://localhost:3000/api/v1/integrations/crm/test-connection \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "crmType": "freshsales",
    "credentials": {
      "apiKey": "YOUR_FRESHSALES_API_KEY",
      "domain": "your-domain"
    }
  }'
```

---

## n8n Workflow Integration

### Add CRM Sync to Appointment Booking Workflow

1. **Open your n8n workflow**
2. **After "Send Confirmation SMS" node, add HTTP Request node**
3. **Configure:**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/integrations/crm/sync-appointment`
   - Authentication: Header
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_API_KEY`

4. **Body (JSON):**
```json
{
  "crmType": "hubspot",
  "credentials": {
    "apiKey": "pat-na1-YOUR_HUBSPOT_API_KEY"
  },
  "appointmentData": {
    "title": "{{ $json.appointment.serviceType }}",
    "startTime": "{{ $json.appointment.date }}",
    "endTime": "{{ $json.appointment.date }}",
    "notes": "Confirmation #: {{ $json.appointment.id }}",
    "customerId": "{{ $json.appointment.customerPhone }}"
  }
}
```

5. **Save and test the workflow**

---

## JavaScript/Node.js Integration

```javascript
const axios = require('axios');

async function syncAppointmentToCRM(appointmentData) {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/integrations/crm/sync-appointment',
      {
        crmType: 'hubspot',
        credentials: {
          apiKey: process.env.HUBSPOT_API_KEY
        },
        appointmentData: {
          title: appointmentData.serviceType,
          startTime: appointmentData.date,
          endTime: appointmentData.date,
          notes: `Confirmation #: ${appointmentData.id}`,
          customerId: appointmentData.customerPhone
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OTTO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Appointment synced to CRM:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync appointment:', error.message);
    throw error;
  }
}

// Usage
syncAppointmentToCRM({
  serviceType: 'Oil Change',
  date: new Date().toISOString(),
  id: 'apt_1234567890',
  customerPhone: '+19163337305'
});
```

---

## Python Integration

```python
import requests
import json

def sync_appointment_to_crm(appointment_data):
    url = 'http://localhost:3000/api/v1/integrations/crm/sync-appointment'
    
    headers = {
        'Authorization': f'Bearer {os.getenv("OTTO_API_KEY")}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'crmType': 'hubspot',
        'credentials': {
            'apiKey': os.getenv('HUBSPOT_API_KEY')
        },
        'appointmentData': {
            'title': appointment_data['service_type'],
            'startTime': appointment_data['date'],
            'endTime': appointment_data['date'],
            'notes': f"Confirmation #: {appointment_data['id']}",
            'customerId': appointment_data['customer_phone']
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        print('✅ Appointment synced to CRM:', response.json())
        return response.json()
    else:
        print('❌ Failed to sync appointment:', response.text)
        raise Exception(response.text)
```

---

## Troubleshooting

### Connection Errors
- Verify API credentials are correct
- Check API key hasn't expired
- Ensure network connectivity

### Sync Failures
- Verify all required fields are present
- Check field mappings match CRM schema
- Review CRM API rate limits

### Missing Data
- Ensure customer exists in CRM
- Verify field names match CRM API
- Check data format (dates, phone numbers, etc.)

