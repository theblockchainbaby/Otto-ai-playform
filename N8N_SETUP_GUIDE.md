# n8n Setup Guide for Otto AI

## ✅ You Already Have n8n - Great!

This guide will help you connect your existing n8n instance to Otto AI.

---

## Step 1: Configure Environment Variable

### **Already Done!** ✅

I've added the n8n configuration to your `.env` file:

```bash
# n8n Workflow Automation
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

### **Update This URL Based on Your n8n Setup:**

**Option 1: Local n8n (Development)**
```bash
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

**Option 2: n8n Cloud**
```bash
N8N_WEBHOOK_URL="https://your-instance.app.n8n.cloud/webhook"
```

**Option 3: Self-Hosted n8n**
```bash
N8N_WEBHOOK_URL="https://n8n.yourdomain.com/webhook"
```

**Option 4: Docker n8n on Same Server**
```bash
N8N_WEBHOOK_URL="http://n8n:5678/webhook"
```

---

## Step 2: Get Your n8n Webhook URL

1. **Open your n8n instance**
2. **Create a new workflow** or open existing one
3. **Add a Webhook node**
4. **Set the webhook path** (e.g., `otto/appointment-request`)
5. **Copy the Production URL** - It will look like:
   - `https://your-instance.app.n8n.cloud/webhook/otto/appointment-request`
   - `http://localhost:5678/webhook/otto/appointment-request`

6. **Update your `.env` file** with the base URL (without the path):
   ```bash
   N8N_WEBHOOK_URL="https://your-instance.app.n8n.cloud/webhook"
   ```

---

## Step 3: Import Otto AI Workflows into n8n

### **Workflow 1: Appointment Booking**

1. **Open n8n**
2. **Click "Add Workflow"** → **Import from File**
3. **Copy this JSON** (from `N8N_WORKFLOWS.md` - Workflow 1)
4. **Paste and Import**
5. **Configure the webhook path:** `otto/appointment-request`
6. **Save and Activate**

### **Workflow 2: Post-Call Follow-up**

1. **Create new workflow**
2. **Import JSON** (from `N8N_WORKFLOWS.md` - Workflow 2)
3. **Configure webhook path:** `otto/call-completed`
4. **Save and Activate**

### **Workflow 3: Lead Nurturing** (Optional)

1. **Create new workflow**
2. **Configure webhook path:** `otto/lead-nurture`
3. **Save and Activate**

---

## Step 4: Configure n8n Credentials

You'll need to set up these credentials in n8n:

### **1. Otto AI API Key**

**Type:** Header Auth

**Settings:**
- **Name:** `Authorization`
- **Value:** `Bearer YOUR_OTTO_API_KEY`

**How to get your Otto AI API Key:**
1. Go to https://ottoagent.net/otto-dashboard.html
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy the key and paste in n8n

### **2. Google Calendar** (For appointment booking)

**Type:** OAuth2

**Settings:**
1. In n8n, select **Google Calendar** credential
2. Click **Connect my account**
3. Authorize with your Google account
4. Select the calendar to use for appointments

### **3. Twilio** (For SMS)

**Type:** Twilio API

**Settings:**
- **Account SID:** `ACafc412b62982312dc2efebaff233cf9f` (from your .env)
- **Auth Token:** `32c6e878cdc5707707980e6d6272f713` (from your .env)

### **4. SMTP/Email** (For email notifications)

**Type:** SMTP

**Settings:**
- **Host:** `smtp.gmail.com` (or your provider)
- **Port:** `587`
- **User:** Your email address
- **Password:** App password (not your regular password)

**Gmail App Password Setup:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to **App passwords**
4. Generate password for "Mail"
5. Copy and paste in n8n

---

## Step 5: Test the Integration

### **Test 1: Check n8n Connection**

```bash
curl https://ottoagent.net/api/n8n/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "n8nConnected": true,
  "n8nUrl": "http://localhost:5678/webhook",
  "timestamp": "2025-10-14T..."
}
```

### **Test 2: Trigger Appointment Booking**

```bash
curl -X POST https://ottoagent.net/api/n8n/trigger/appointment-booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_customer_123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1-555-123-4567",
    "appointmentType": "service",
    "preferredDate": "2025-10-20",
    "preferredTime": "14:00",
    "notes": "Oil change and tire rotation"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment booking workflow triggered",
  "data": {
    "appointmentId": "...",
    "startTime": "2025-10-20T14:00:00Z"
  }
}
```

### **Test 3: Trigger Post-Call Follow-up**

```bash
curl -X POST https://ottoagent.net/api/n8n/trigger/call-completed \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call_123",
    "customerId": "test_customer_123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1-555-123-4567",
    "duration": 245,
    "topic": "Service inquiry",
    "sentiment": "positive",
    "outcome": "appointment_scheduled"
  }'
```

---

## Step 6: Deploy to Production

### **Update Production Environment Variables**

On **Render** (your hosting platform):

1. **Go to Render Dashboard**
2. **Select your Otto AI service**
3. **Go to Environment**
4. **Add new environment variable:**
   - **Key:** `N8N_WEBHOOK_URL`
   - **Value:** `https://your-n8n-instance.app.n8n.cloud/webhook`
5. **Save Changes**
6. **Redeploy** (Render will auto-deploy)

### **Update n8n Webhooks for Production**

In your n8n workflows, update the Otto AI API URLs from:
- `http://localhost:3000/api/appointments`

To:
- `https://ottoagent.net/api/appointments`

---

## Step 7: Monitor and Debug

### **Check n8n Execution Logs**

1. **Open n8n**
2. **Go to Executions** (left sidebar)
3. **View recent workflow runs**
4. **Check for errors**

### **Check Otto AI Logs**

```bash
# On Render
# Go to your service → Logs tab

# Or locally
npm run dev
# Watch console for n8n webhook calls
```

### **Common Issues:**

**Issue 1: "n8n is not reachable"**
- ✅ Check `N8N_WEBHOOK_URL` in `.env`
- ✅ Make sure n8n is running
- ✅ Check firewall/network settings

**Issue 2: "Webhook not found"**
- ✅ Verify webhook path in n8n matches Otto AI calls
- ✅ Make sure workflow is **Activated** in n8n

**Issue 3: "Authentication failed"**
- ✅ Check Otto AI API key in n8n credentials
- ✅ Verify API key is valid

---

## Quick Reference: Webhook Endpoints

| Otto AI Endpoint | n8n Webhook Path | Purpose |
|-----------------|------------------|---------|
| `POST /api/n8n/trigger/appointment-booking` | `otto/appointment-request` | Book appointments |
| `POST /api/n8n/trigger/call-completed` | `otto/call-completed` | Post-call follow-ups |
| `POST /api/n8n/trigger/lead-nurture` | `otto/lead-nurture` | Lead nurturing |
| `POST /api/n8n/trigger/emergency-dispatch` | `otto/emergency-dispatch` | Emergency assistance |
| `POST /api/n8n/trigger/appointment-reminder` | `otto/appointment-reminder` | Send reminders |
| `GET /api/n8n/health` | N/A | Health check |

---

## Next Steps

1. ✅ **Update `.env` with your n8n URL** (Already done!)
2. ⏳ **Import workflows into n8n** (See Step 3)
3. ⏳ **Configure credentials** (See Step 4)
4. ⏳ **Test integration** (See Step 5)
5. ⏳ **Deploy to production** (See Step 6)

---

## Need Help?

**Documentation:**
- `N8N_WORKFLOWS.md` - Complete workflow JSON
- `INTEGRATION_API.md` - CRM/DMS integration guide
- `DEPLOYMENT.md` - Deployment guide

**Test Endpoints:**
- https://ottoagent.net/api/n8n/health
- https://ottoagent.net/api/v1/integrations/health

**Your n8n Instance:**
- Update `N8N_WEBHOOK_URL` in `.env` with your actual n8n URL
- Make sure n8n is accessible from Otto AI server

---

## Summary

✅ **Environment variable configured** - `N8N_WEBHOOK_URL` added to `.env`
✅ **Webhook endpoints ready** - All routes deployed to production
✅ **Workflows documented** - See `N8N_WORKFLOWS.md`
⏳ **Next:** Import workflows into your n8n instance and configure credentials

**You're all set! Just update the `N8N_WEBHOOK_URL` with your actual n8n instance URL and import the workflows!** 🚀

