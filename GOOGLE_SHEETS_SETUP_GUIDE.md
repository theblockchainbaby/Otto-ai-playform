# 📊 Google Sheets Setup for Otto AI Outbound Campaigns

## 🎯 Overview

This guide will help you set up Google Sheets to manage your outbound calling campaigns. You have two options:

1. **Quick Setup (Public Access)** - Easier, less secure, good for testing
2. **Secure Setup (Service Account)** - More secure, recommended for production

---

## 🚀 Quick Setup (Public Access) - 5 Minutes

### Step 1: Open Your Google Sheet

Your sheet ID is already configured: `1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w`

**Open it here:**
https://docs.google.com/spreadsheets/d/1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w/edit

### Step 2: Create the Campaign Sheet

1. Click the **"+"** button at the bottom to create a new sheet
2. Name it: **"Outbound Campaigns"** (exact name, case-sensitive)
3. Add these column headers in Row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Name | Phone | Email | Status | Last Called | Notes |

### Step 3: Add Sample Contacts

Add a few test contacts (use your own phone numbers for testing):

| Name | Phone | Email | Status | Last Called | Notes |
|------|-------|-------|--------|-------------|-------|
| John Doe | +15551234567 | john@example.com | PENDING | | Test contact |
| Jane Smith | +15559876543 | jane@example.com | PENDING | | Test contact |

**Important Phone Number Format:**
- ✅ Must include country code: `+1` for US
- ✅ Example: `+15551234567`
- ❌ Don't use: `555-123-4567` or `(555) 123-4567`

### Step 4: Make Sheet Publicly Viewable

1. Click **"Share"** button (top right)
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **"Done"**

### Step 5: Test the Integration

Run this command to verify Otto can read your sheet:

```bash
node -e "
const GoogleSheetsService = require('./src/services/googleSheetsService');
const service = new GoogleSheetsService();
service.getCampaignContacts('Outbound Campaigns').then(contacts => {
  console.log('✅ Found', contacts.length, 'contacts');
  console.log(contacts);
}).catch(err => console.error('❌ Error:', err));
"
```

**Expected Output:**
```
✅ Found 2 contacts
[
  {
    name: 'John Doe',
    phone: '+15551234567',
    email: 'john@example.com',
    status: 'PENDING',
    rowNumber: 2
  },
  {
    name: 'Jane Smith',
    phone: '+15559876543',
    email: 'jane@example.com',
    status: 'PENDING',
    rowNumber: 3
  }
]
```

✅ **You're done!** The quick setup is complete.

---

## 🔒 Secure Setup (Service Account) - 15 Minutes

For production use, this method is more secure and allows Otto to update the sheet.

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name: **"Otto AI Outbound"**
4. Click **"Create"**

### Step 2: Enable Google Sheets API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for: **"Google Sheets API"**
3. Click on it and click **"Enable"**

### Step 3: Create Service Account

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - **Service account name:** `otto-outbound-caller`
   - **Service account ID:** `otto-outbound-caller` (auto-filled)
   - **Description:** `Service account for Otto AI outbound calling campaigns`
4. Click **"Create and Continue"**
5. **Role:** Select **"Editor"** (or create custom role with Sheets access)
6. Click **"Continue"** → **"Done"**

### Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **"JSON"**
5. Click **"Create"**
6. A JSON file will download - **SAVE THIS FILE SECURELY!**

### Step 5: Share Sheet with Service Account

1. Open the downloaded JSON file
2. Find the `client_email` field (looks like: `otto-outbound-caller@project-id.iam.gserviceaccount.com`)
3. Copy this email address
4. Go to your Google Sheet
5. Click **"Share"**
6. Paste the service account email
7. Set permission to **"Editor"**
8. **Uncheck** "Notify people"
9. Click **"Share"**

### Step 6: Add Credentials to .env

1. Open the downloaded JSON file
2. Copy the **entire contents** (it's one long line)
3. Open your `.env` file
4. Update the `GOOGLE_SHEETS_CREDENTIALS` line:

```env
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"otto-outbound-caller@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important:** 
- Wrap the entire JSON in single quotes `'...'`
- Keep it as one line
- Don't add any line breaks

### Step 7: Test the Secure Integration

```bash
node -e "
const GoogleSheetsService = require('./src/services/googleSheetsService');
const service = new GoogleSheetsService();
service.getCampaignContacts('Outbound Campaigns').then(contacts => {
  console.log('✅ Service Account Working!');
  console.log('Found', contacts.length, 'contacts');
}).catch(err => console.error('❌ Error:', err));
"
```

### Step 8: Test Status Updates

```bash
node -e "
const GoogleSheetsService = require('./src/services/googleSheetsService');
const service = new GoogleSheetsService();
service.updateContactStatus(2, 'CALLED', 'Test update from Otto').then(() => {
  console.log('✅ Status update successful!');
  console.log('Check row 2 in your Google Sheet');
}).catch(err => console.error('❌ Error:', err));
"
```

Check your Google Sheet - Row 2 should now show:
- Status: `CALLED`
- Last Called: Current timestamp
- Notes: `Test update from Otto`

✅ **Secure setup complete!**

---

## 📋 Sheet Structure Reference

### Required Sheets:

#### 1. "Outbound Campaigns" Sheet
**Purpose:** List of contacts to call

| Column | Name | Type | Required | Description |
|--------|------|------|----------|-------------|
| A | Name | Text | Yes | Customer full name |
| B | Phone | Text | Yes | Phone with country code (+15551234567) |
| C | Email | Text | No | Customer email |
| D | Status | Text | Auto | PENDING, CALLED, COMPLETED, FAILED |
| E | Last Called | DateTime | Auto | Timestamp of last call |
| F | Notes | Text | Auto | Call outcome notes |

#### 2. "Call Results" Sheet (Optional)
**Purpose:** Detailed log of all calls

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When call was made |
| B | Customer Name | Who was called |
| C | Phone | Phone number |
| D | Call SID | Twilio call identifier |
| E | Status | Call status |
| F | Duration | Call length in seconds |
| G | Outcome | HUMAN_ANSWERED, VOICEMAIL, etc. |
| H | Notes | Additional notes |

---

## 🧪 Testing Your Setup

### Test 1: Read Contacts
```bash
npm run test-sheets-read
```

### Test 2: Update Status
```bash
npm run test-sheets-update
```

### Test 3: Full Campaign Flow
```bash
node test-outbound-campaign.js +1YOUR_PHONE_NUMBER
```

---

## 🔧 Troubleshooting

### Error: "Cannot read contacts"
- ✅ Check sheet name is exactly "Outbound Campaigns"
- ✅ Verify sheet is publicly viewable (Quick Setup)
- ✅ Verify service account has access (Secure Setup)
- ✅ Check GOOGLE_SHEETS_CAMPAIGN_ID in .env

### Error: "Cannot update status"
- ✅ Only works with Service Account setup
- ✅ Verify service account has "Editor" permission
- ✅ Check GOOGLE_SHEETS_CREDENTIALS is valid JSON

### Error: "Invalid phone number"
- ✅ Must include country code: `+1` for US
- ✅ Format: `+15551234567` (no spaces, dashes, or parentheses)

### Error: "API not enabled"
- ✅ Enable Google Sheets API in Google Cloud Console
- ✅ Wait a few minutes for API to activate

---

## 📊 Sample Data Template

Copy this into your sheet for testing:

```
Name,Phone,Email,Status,Last Called,Notes
John Doe,+15551234567,john@example.com,PENDING,,Test contact 1
Jane Smith,+15559876543,jane@example.com,PENDING,,Test contact 2
Bob Johnson,+15555555555,bob@example.com,PENDING,,Test contact 3
```

---

## 🚀 Next Steps

Once your Google Sheets is set up:

1. ✅ Add real contacts to your sheet
2. ✅ Run database migration: `npx prisma migrate dev`
3. ✅ Test a campaign: `node test-outbound-campaign.js +1YOUR_NUMBER`
4. ✅ Create n8n workflow to trigger campaigns
5. ✅ Build UI for campaign management

---

## 💡 Pro Tips

1. **Use separate sheets for different campaign types**
   - "Service Follow-ups"
   - "Appointment Reminders"
   - "Sales Outreach"

2. **Add custom columns for your use case**
   - Last Service Date
   - Vehicle VIN
   - Appointment Time
   - Sales Rep

3. **Use Google Sheets formulas**
   - Auto-calculate days since last contact
   - Conditional formatting for status
   - Data validation for phone numbers

4. **Keep a backup**
   - File → Make a copy
   - Download as CSV regularly

---

Ready to test? Let me know if you hit any issues! 🎉

