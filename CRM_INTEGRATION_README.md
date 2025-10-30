# 🚀 Otto AI CRM Integration

Connect Otto AI to your favorite CRM platform and automatically sync customer data, appointments, and leads!

## ✨ Features

- 🔗 **Multi-CRM Support** - Salesforce, HubSpot, Pipedrive, Zoho CRM, Freshsales
- 🔄 **Automatic Sync** - Sync customers, appointments, and leads in real-time
- 🛡️ **Secure** - API key authentication and credential management
- 📱 **Easy Integration** - Simple REST API endpoints
- 🔧 **Flexible** - Works with n8n workflows and custom integrations
- ⚡ **Fast** - Async operations with proper error handling

## 🎯 Quick Start

### 1. Get Your CRM API Credentials

**HubSpot:**
- Go to https://app.hubspot.com/l/api-key
- Create a private app and copy the access token

**Salesforce:**
- Setup → Apps → App Manager → Create Connected App
- Get Client ID, Client Secret, and use your credentials

**Pipedrive:**
- Go to https://app.pipedrive.com/settings/personal/api
- Copy your API token

**Zoho CRM:**
- Create OAuth2 credentials at https://accounts.zoho.com/
- Get your access token

**Freshsales:**
- Settings → API Settings
- Copy your API key

### 2. Test Connection

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

### 3. Sync Your First Customer

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

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/integrations/crm/platforms` | List supported CRM platforms |
| POST | `/api/v1/integrations/crm/test-connection` | Test CRM connection |
| POST | `/api/v1/integrations/crm/sync-customer` | Sync customer to CRM |
| POST | `/api/v1/integrations/crm/sync-appointment` | Sync appointment to CRM |
| POST | `/api/v1/integrations/crm/sync-lead` | Sync lead to CRM |
| GET | `/api/v1/integrations/crm/get-customer` | Get customer from CRM |

### Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer YOUR_API_KEY
```

## 🔌 n8n Integration

### Add CRM Sync to Your Workflow

1. Open your n8n workflow
2. After "Send Confirmation SMS" node, add **HTTP Request** node
3. Configure:
   - **Method:** POST
   - **URL:** `http://localhost:3000/api/v1/integrations/crm/sync-appointment`
   - **Headers:** `Authorization: Bearer YOUR_API_KEY`
   - **Body:**
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
4. Save and test!

## 💻 Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function syncCustomer(customerData) {
  const response = await axios.post(
    'http://localhost:3000/api/v1/integrations/crm/sync-customer',
    {
      crmType: 'hubspot',
      credentials: { apiKey: process.env.HUBSPOT_API_KEY },
      customerData
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OTTO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}
```

### Python

```python
import requests

def sync_customer(customer_data):
    response = requests.post(
        'http://localhost:3000/api/v1/integrations/crm/sync-customer',
        json={
            'crmType': 'hubspot',
            'credentials': {'apiKey': os.getenv('HUBSPOT_API_KEY')},
            'customerData': customer_data
        },
        headers={
            'Authorization': f'Bearer {os.getenv("OTTO_API_KEY")}',
            'Content-Type': 'application/json'
        }
    )
    return response.json()
```

## 🔐 Security Best Practices

1. **Store credentials securely** - Use environment variables or secret vaults
2. **Use API keys** - Never hardcode credentials in code
3. **Test connections first** - Verify credentials before syncing
4. **Monitor sync operations** - Log all sync activities
5. **Handle errors gracefully** - Implement retry logic

## 📖 Documentation

- **[CRM_INTEGRATION_GUIDE.md](./CRM_INTEGRATION_GUIDE.md)** - Complete API documentation
- **[CRM_INTEGRATION_EXAMPLES.md](./CRM_INTEGRATION_EXAMPLES.md)** - Practical examples
- **[CRM_INTEGRATION_SUMMARY.md](./CRM_INTEGRATION_SUMMARY.md)** - Implementation details

## 🐛 Troubleshooting

### Connection Failed
- Verify API credentials are correct
- Check API key hasn't expired
- Ensure network connectivity

### Sync Failed
- Verify all required fields are present
- Check field mappings match CRM schema
- Review CRM API rate limits

### Missing Data
- Ensure customer exists in CRM
- Verify field names match CRM API
- Check data format (dates, phone numbers)

## 🚀 Next Steps

1. **Test with your CRM** - Use the quick start guide
2. **Integrate with n8n** - Add CRM sync to your workflow
3. **Monitor syncs** - Set up logging and alerts
4. **Expand integrations** - Add more CRM platforms as needed

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation files
3. Test connection with valid credentials
4. Check server logs for detailed errors

## 📝 Supported CRM Platforms

| CRM | Status | Auth Method |
|-----|--------|-------------|
| Salesforce | ✅ Supported | OAuth2 |
| HubSpot | ✅ Supported | API Key |
| Pipedrive | ✅ Supported | API Token |
| Zoho CRM | ✅ Supported | OAuth2 |
| Freshsales | ✅ Supported | API Key |

## 🎓 Architecture

The CRM integration uses an **Adapter Pattern** for flexibility:

```
CRMIntegrationService
├── SalesforceAdapter
├── HubSpotAdapter
├── PipedriveAdapter
├── ZohoCRMAdapter
└── FreshsalesAdapter
```

Each adapter handles CRM-specific API calls and data mapping.

## 📊 Performance

- ⚡ Async/await for all API calls
- 🔄 No blocking operations
- 🛡️ Proper error handling
- 📈 Scalable architecture

## 🔄 Data Flow

```
ElevenLabs Call
    ↓
n8n Workflow
    ↓
Otto AI Server
    ├→ Save to Database
    ├→ Send SMS
    └→ Sync to CRM
        ├→ Salesforce
        ├→ HubSpot
        ├→ Pipedrive
        ├→ Zoho CRM
        └→ Freshsales
```

## 📄 License

MIT

## 🙏 Contributing

Contributions welcome! Please submit pull requests or issues.

---

**Ready to sync?** Start with the [Quick Start](#-quick-start) section! 🚀

