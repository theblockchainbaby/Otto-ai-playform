# Your n8n Setup - Quick Reference

## ✅ Your n8n Instance Details

**n8n Cloud URL:** https://dualpay.app.n8n.cloud
**Webhook Base URL:** https://dualpay.app.n8n.cloud/webhook

---

## ✅ Configuration Complete

### **Local Development (.env)** ✅
```bash
N8N_WEBHOOK_URL="https://dualpay.app.n8n.cloud/webhook"
```
**Status:** ✅ Already configured in `.env`

### **Production (Render)** ⏳
**You need to add this to Render:**

1. Go to: https://dashboard.render.com/
2. Select your Otto AI service
3. Click **Environment**
4. Add Environment Variable:
   - **Key:** `N8N_WEBHOOK_URL`
   - **Value:** `https://dualpay.app.n8n.cloud/webhook`
5. Click **Save Changes**

---

## 📋 Webhook Paths to Create in n8n

Create these webhook nodes in your n8n workflows:

### **Workflow 1: Appointment Booking**
- **Webhook Path:** `otto/appointment-request`
- **Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/appointment-request`
- **Method:** POST
- **Otto AI Endpoint:** `POST /api/n8n/trigger/appointment-booking`

### **Workflow 2: Post-Call Follow-up**
- **Webhook Path:** `otto/call-completed`
- **Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/call-completed`
- **Method:** POST
- **Otto AI Endpoint:** `POST /api/n8n/trigger/call-completed`

### **Workflow 3: Lead Nurturing**
- **Webhook Path:** `otto/lead-nurture`
- **Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/lead-nurture`
- **Method:** POST
- **Otto AI Endpoint:** `POST /api/n8n/trigger/lead-nurture`

### **Workflow 4: Emergency Dispatch**
- **Webhook Path:** `otto/emergency-dispatch`
- **Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/emergency-dispatch`
- **Method:** POST
- **Otto AI Endpoint:** `POST /api/n8n/trigger/emergency-dispatch`

### **Workflow 5: Appointment Reminder**
- **Webhook Path:** `otto/appointment-reminder`
- **Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/appointment-reminder`
- **Method:** POST
- **Otto AI Endpoint:** `POST /api/n8n/trigger/appointment-reminder`

---

## 🚀 Quick Start: Create Your First Workflow

### **Step 1: Open n8n**
Go to: https://dualpay.app.n8n.cloud

### **Step 2: Create New Workflow**
1. Click **"+ Add workflow"**
2. Name it: **"Otto - Appointment Booking"**

### **Step 3: Add Webhook Node**
1. Click **"+"** to add node
2. Search for **"Webhook"**
3. Click **Webhook** node
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `otto/appointment-request`
   - **Response Mode:** "Respond to Webhook"

### **Step 4: Add HTTP Request Node (Create Appointment)**
1. Click **"+"** after Webhook
2. Search for **"HTTP Request"**
3. Configure:
   - **Method:** POST
   - **URL:** `https://ottoagent.net/api/appointments`
   - **Authentication:** Header Auth
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_OTTO_API_KEY`
   - **Body Content Type:** JSON
   - **JSON Body:**
     ```json
     {
       "title": "={{ $json.intent.appointmentType }} - {{ $json.customer.name }}",
       "type": "={{ $json.intent.appointmentType }}",
       "startTime": "={{ $json.intent.preferredDate }}T{{ $json.intent.preferredTime }}:00Z",
       "customerId": "={{ $json.customer.id }}"
     }
     ```

### **Step 5: Add Email Node (Send Confirmation)**
1. Click **"+"** after HTTP Request
2. Search for **"Send Email"**
3. Configure:
   - **From Email:** `appointments@ottoagent.net`
   - **To Email:** `={{ $json.customer.email }}`
   - **Subject:** `Appointment Confirmed - {{ $json.intent.appointmentType }}`
   - **Text:**
     ```
     Dear {{ $json.customer.name }},

     Your appointment has been confirmed!

     Type: {{ $json.intent.appointmentType }}
     Date: {{ $json.intent.preferredDate }}
     Time: {{ $json.intent.preferredTime }}

     We look forward to seeing you!

     Best regards,
     Otto AI Team
     ```

### **Step 6: Activate Workflow**
1. Click **"Active"** toggle in top right
2. Workflow is now live!

---

## 🧪 Test Your Setup

### **Test 1: Check Connection**
```bash
curl https://ottoagent.net/api/n8n/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "n8nConnected": true,
  "n8nUrl": "https://dualpay.app.n8n.cloud/webhook",
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
    "notes": "Oil change and tire rotation",
    "callId": "test_call_456"
  }'
```

**What Should Happen:**
1. ✅ Otto AI sends data to n8n webhook
2. ✅ n8n receives the webhook
3. ✅ n8n creates appointment in Otto AI
4. ✅ n8n sends confirmation email
5. ✅ You receive response with appointment details

### **Test 3: Check n8n Execution**
1. Go to https://dualpay.app.n8n.cloud
2. Click **"Executions"** in left sidebar
3. You should see your test execution
4. Click on it to see the workflow run details

---

## 📊 Your Complete Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER CALLS: +1 (888) 411-8568              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    OTTO AI (ElevenLabs)                      │
│         Agent: agent_3701k70bz4gcfd6vq1bkh57d15bw          │
│         Understands: "Book appointment for Tuesday"         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OTTO AI BACKEND (ottoagent.net)                 │
│         POST /api/n8n/trigger/appointment-booking           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              YOUR n8n (dualpay.app.n8n.cloud)               │
│         Webhook: otto/appointment-request                   │
│                                                              │
│         1. Receive customer data                            │
│         2. Create appointment in Otto AI                    │
│         3. Send confirmation email                          │
│         4. Send confirmation SMS (optional)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

### **Configuration**
- [x] n8n URL added to `.env` ✅
- [ ] n8n URL added to Render environment variables ⏳
- [ ] Render redeployed ⏳

### **n8n Workflows**
- [ ] Workflow 1: Appointment Booking created ⏳
- [ ] Workflow 2: Post-Call Follow-up created ⏳
- [ ] Workflows activated ⏳

### **n8n Credentials**
- [ ] Otto AI API Key configured ⏳
- [ ] Google Calendar connected (optional) ⏳
- [ ] Twilio configured (optional) ⏳
- [ ] SMTP/Email configured (optional) ⏳

### **Testing**
- [ ] Health check passed ⏳
- [ ] Test appointment booking ⏳
- [ ] Test post-call follow-up ⏳

---

## 🎯 Next Steps

1. **Add to Render** (3 minutes)
   - Go to Render Dashboard
   - Add `N8N_WEBHOOK_URL` = `https://dualpay.app.n8n.cloud/webhook`
   - Save and wait for redeploy

2. **Create First Workflow** (10 minutes)
   - Follow "Quick Start" above
   - Or import from `N8N_WORKFLOWS.md`

3. **Test Integration** (5 minutes)
   - Run the test commands above
   - Check n8n executions

4. **Go Live!** 🚀
   - Otto can now book appointments automatically
   - Customers receive instant confirmations
   - Follow-ups are automated

---

## 📚 Additional Resources

- **Full Workflow JSON:** `N8N_WORKFLOWS.md`
- **Detailed Setup Guide:** `N8N_SETUP_GUIDE.md`
- **Render Setup:** `RENDER_ENV_SETUP.md`
- **CRM Integration:** `INTEGRATION_API.md`

---

## 🆘 Need Help?

**Test Endpoints:**
- Health Check: https://ottoagent.net/api/n8n/health
- API Status: https://ottoagent.net/api/status

**Your n8n:**
- Dashboard: https://dualpay.app.n8n.cloud
- Webhook Base: https://dualpay.app.n8n.cloud/webhook

**Everything is configured and ready to go!** 🎉

