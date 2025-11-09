# Twilio Account Configuration Issue

## Problem: Test Credentials

Error: `Resource not accessible with Test Account Credentials`

This means the `.env` file has **test mode credentials** instead of **live credentials**.

---

## Solution: Get Live Credentials

### Step 1: Log into Twilio Console
Go to: https://console.twilio.com/

### Step 2: Get Live Credentials

1. Look for the **Account Info** section on the dashboard
2. You'll see two sets of credentials:
   - **Test Credentials** (for testing only)
   - **Live Credentials** (for real calls)

3. Make sure you're viewing **LIVE credentials**:
   - Click the dropdown that says "Test" and switch to "Live"
   - Or scroll down to find the "Live Credentials" section

4. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click the eye icon to reveal it)

### Step 3: Update .env File

Replace these lines in your `.env` file:

```bash
TWILIO_ACCOUNT_SID="AC..."  # Your LIVE Account SID
TWILIO_AUTH_TOKEN="..."     # Your LIVE Auth Token
TWILIO_PHONE_NUMBER="+18884118568"
TWILIO_OUTBOUND_NUMBER="+18884118568"
```

### Step 4: Verify Phone Number Status

After updating credentials, run:

```bash
node check-twilio.js
```

This should show:
- ✅ Account Status: active
- ✅ Number found in account
- ✅ Voice capability: true

---

## How to Tell Which Credentials You Have

**Test Credentials:**
- Can only call verified numbers
- Can't access all API features
- Used for development/testing

**Live Credentials:**
- Can call any number
- Full API access
- Used for production

**To Check:** Look at your Twilio Dashboard - if it says "Test Mode" at the top, you're using test credentials.

---

## Next Steps

1. **Get live credentials** from Twilio Console
2. **Update `.env` file** with live credentials
3. **Run** `node check-twilio.js` to verify
4. **Test call** with `node test-single-call.js`

---

## Quick Verification

After updating .env, run this to test:

```bash
node -e "
require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch()
  .then(account => console.log('✅ Account Type:', account.type))
  .catch(err => console.log('❌ Error:', err.message));
"
```

Should show: `✅ Account Type: Full` (not Trial)
