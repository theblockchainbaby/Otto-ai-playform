# Render Environment Variables Setup

## Add n8n Configuration to Render

Since you're hosting Otto AI on Render, you need to add the n8n webhook URL to your Render environment variables.

---

## Step-by-Step Instructions

### **1. Go to Render Dashboard**

Visit: https://dashboard.render.com/

### **2. Select Your Otto AI Service**

- Click on your **otto-ai-platform** service
- Or whatever you named your Otto AI deployment

### **3. Go to Environment Tab**

- Click **Environment** in the left sidebar
- You'll see all your current environment variables

### **4. Add n8n Webhook URL**

Click **Add Environment Variable** and add:

**Key:**
```
N8N_WEBHOOK_URL
```

**Value (Choose based on your n8n setup):**

**Option A: n8n Cloud**
```
https://your-instance.app.n8n.cloud/webhook
```

**Option B: Self-Hosted n8n**
```
https://n8n.yourdomain.com/webhook
```

**Option C: n8n on Same Render Account**
```
https://your-n8n-service.onrender.com/webhook
```

**Option D: Local n8n (Development Only)**
```
http://localhost:5678/webhook
```

### **5. Save Changes**

- Click **Save Changes**
- Render will automatically redeploy your service

### **6. Verify Deployment**

Wait 2-3 minutes for deployment, then test:

```bash
curl https://ottoagent.net/api/n8n/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "n8nConnected": true,
  "n8nUrl": "https://your-n8n-instance.app.n8n.cloud/webhook",
  "timestamp": "2025-10-14T..."
}
```

---

## Complete List of Environment Variables for Render

Here's what you should have in Render (for reference):

### **Required Variables:**

```bash
# Node Environment
NODE_ENV=production
PORT=10000

# Database (Render provides this automatically if you have a database)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Twilio (Your existing values)
TWILIO_ACCOUNT_SID=ACafc412b62982312dc2efebaff233cf9f
TWILIO_AUTH_TOKEN=32c6e878cdc5707707980e6d6272f713
TWILIO_PHONE_NUMBER=+18884118568

# ElevenLabs (Your existing value)
ELEVENLABS_API_KEY=sk_069522a3e143c120684fe6924fa8791093d6fea95c699038

# Application Settings
BASE_URL=https://ottoagent.net
DOMAIN=https://ottoagent.net
CORS_ORIGIN=https://ottoagent.net
WEBHOOK_URL=https://ottoagent.net/api/twilio/otto/incoming

# n8n Integration (NEW - ADD THIS)
N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook
```

### **Optional Variables:**

```bash
# OpenAI (if you want to use GPT features)
OPENAI_API_KEY=sk-...

# Email (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for caching - if you add Redis service)
REDIS_URL=redis://...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## How to Find Your n8n Webhook URL

### **If you're using n8n Cloud:**

1. Log into https://app.n8n.cloud/
2. Open any workflow
3. Add a **Webhook** node
4. Look at the **Production URL** - it will be something like:
   ```
   https://your-instance.app.n8n.cloud/webhook/test
   ```
5. Copy everything BEFORE `/test`:
   ```
   https://your-instance.app.n8n.cloud/webhook
   ```

### **If you're self-hosting n8n:**

Your webhook URL is:
```
https://your-n8n-domain.com/webhook
```

Or if using a subdomain:
```
https://n8n.yourdomain.com/webhook
```

### **If n8n is on Render:**

1. Go to your n8n service on Render
2. Copy the service URL (e.g., `https://n8n-abc123.onrender.com`)
3. Add `/webhook` to the end:
   ```
   https://n8n-abc123.onrender.com/webhook
   ```

---

## Testing After Setup

### **Test 1: Check Environment Variable**

After Render redeploys, SSH into your service or check logs to verify:

```bash
# The logs should show:
# "n8n webhook URL configured: https://your-n8n-instance.app.n8n.cloud/webhook"
```

### **Test 2: Health Check**

```bash
curl https://ottoagent.net/api/n8n/health
```

Should return:
```json
{
  "status": "healthy",
  "n8nConnected": true
}
```

### **Test 3: Trigger a Workflow**

```bash
curl -X POST https://ottoagent.net/api/n8n/trigger/appointment-booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_123",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+1-555-123-4567",
    "appointmentType": "service",
    "preferredDate": "2025-10-20",
    "preferredTime": "14:00"
  }'
```

---

## Troubleshooting

### **Issue: "n8n is not reachable"**

**Solution:**
1. Check that `N8N_WEBHOOK_URL` is set correctly in Render
2. Make sure your n8n instance is running and accessible
3. If using n8n Cloud, verify your instance is active
4. Check if there's a firewall blocking the connection

### **Issue: "Webhook not found"**

**Solution:**
1. Make sure you've imported the workflows into n8n
2. Verify the webhook paths match (e.g., `otto/appointment-request`)
3. Check that workflows are **Activated** in n8n

### **Issue: Render keeps using old value**

**Solution:**
1. After changing environment variables, click **Manual Deploy**
2. Or make a small code change and push to trigger redeploy

---

## Quick Checklist

- [ ] Add `N8N_WEBHOOK_URL` to Render environment variables
- [ ] Save changes in Render
- [ ] Wait for automatic redeploy (2-3 minutes)
- [ ] Test health endpoint: `curl https://ottoagent.net/api/n8n/health`
- [ ] Import workflows into n8n (see `N8N_SETUP_GUIDE.md`)
- [ ] Configure n8n credentials (Google Calendar, Twilio, SMTP)
- [ ] Test appointment booking workflow
- [ ] Test post-call follow-up workflow

---

## What Happens Next

Once you add the `N8N_WEBHOOK_URL` to Render:

1. ✅ Render will redeploy Otto AI automatically
2. ✅ Otto AI will be able to communicate with n8n
3. ✅ When Otto identifies an intent (e.g., "book appointment"), it will trigger n8n
4. ✅ n8n will execute the workflow (check calendar, book appointment, send confirmation)
5. ✅ Customer receives confirmation email/SMS automatically

**You're almost there! Just add the environment variable to Render and you're done!** 🚀

