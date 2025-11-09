# Google Sheets Setup for Outbound Calling

## Quick Setup Guide

### Option 1: Public Sheet (Testing Only)

For quick testing, you can make the Google Sheet public:

1. Open https://docs.google.com/spreadsheets/d/1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w/edit
2. Click "Share" button
3. Change to "Anyone with the link" → "Viewer"
4. Copy the sheet ID: `1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w`

**Sheet Template Columns:**
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Name | Phone | Email | Status | LastContactDate | Notes | VehicleYear | VehicleMake | VehicleModel | ServiceType | LastServiceDate |

**Example Row:**
```
John Doe | 5551234567 | john@example.com | PENDING | | | 2022 | Toyota | Camry | Oil Change | 2024-10-15
```

---

### Option 2: Service Account (Production)

For production use with private sheets:

#### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable **Google Sheets API**

#### Step 2: Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `otto-outbound-sheets`
4. Description: `Otto outbound campaign sheet access`
5. Click **Create and Continue**
6. Skip role assignment → **Done**

#### Step 3: Generate Credentials
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Download the file (keep it secure!)

#### Step 4: Share Sheet with Service Account
1. Open the JSON file you downloaded
2. Find the `client_email` field (looks like: `otto-outbound-sheets@project-id.iam.gserviceaccount.com`)
3. Copy this email address
4. Open your Google Sheet
5. Click **Share**
6. Paste the service account email
7. Give **Editor** permission
8. Click **Send** (uncheck "Notify people")

#### Step 5: Add to .env
1. Open the JSON credentials file
2. Copy the ENTIRE contents
3. Add to `.env` as a single-line string:

```bash
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"otto-outbound-sheets@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important**: Use single quotes around the JSON, and ensure the private key newlines are escaped as `\n`

---

### Option 3: Use Test Without Google Sheets

For immediate testing without Google Sheets setup, you can create an in-memory test:

Create `test-campaign-local.js`:

```javascript
const OutboundCampaignService = require('./src/services/outboundCampaignService');

async function testCampaign() {
  const campaignService = new OutboundCampaignService();
  
  // Override the sheets service to use local data
  campaignService.sheetsService.getCampaignContacts = async () => {
    return [
      {
        rowNumber: 2,
        name: 'Test User',
        phone: '+15551234567',  // YOUR PHONE NUMBER
        email: 'test@example.com',
        status: 'PENDING',
        customFields: {
          vehicleYear: '2022',
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          serviceType: 'Oil Change',
          lastServiceDate: '2024-10-15'
        }
      }
    ];
  };

  // Start campaign
  const result = await campaignService.startCampaign({
    name: 'Local Test Campaign',
    type: 'APPOINTMENT_REMINDER',
    delayBetweenCalls: 5
  });

  console.log('Campaign started:', result);
}

testCampaign().catch(console.error);
```

Run: `node test-campaign-local.js`

---

## Verification

Test your Google Sheets connection:

```bash
node -e "
const { google } = require('googleapis');
const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth: auth });
sheets.spreadsheets.get({
  spreadsheetId: process.env.GOOGLE_SHEETS_CAMPAIGN_ID
}).then(res => {
  console.log('✅ Connected to sheet:', res.data.properties.title);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
});
"
```

---

## Next Steps

Once Google Sheets is configured:

1. **Add test contacts** to your sheet
2. **Run setup script**: `./setup-outbound.sh`
3. **Test API**: `./test-outbound-api.sh`
4. **Make a test call** to your phone number

See `OUTBOUND_CALLING_SETUP.md` for complete documentation.
