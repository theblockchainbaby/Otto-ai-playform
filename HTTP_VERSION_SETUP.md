# 🚀 Otto AI - HTTP Version Setup Guide

## ✅ This Version Uses HTTP Request Nodes (No Installation Required!)

Since your n8n Cloud instance doesn't support community nodes, this version uses **built-in HTTP Request nodes** to call Twilio's API directly.

---

## 📦 **Import the Workflow**

### **Step 1: Import from URL**
1. Go to https://dualpay.app.n8n.cloud
2. Click **"..."** menu (top right)
3. Select **"Import from URL or Text"**
4. Paste this URL:
   ```
   https://raw.githubusercontent.com/theblockchainbaby/Otto-ai-playform/main/n8n-workflow-http-version.json
   ```
5. Click **"Import"**

---

## 🔑 **Configure Credentials (2 Required)**

### **Credential 1: Otto AI API Key**

1. Click on **"Create Appointment"** node
2. Under **"Credential for HTTP Header Auth"**, click **"Create New Credential"**
3. Fill in:
   - **Credential Name:** `Otto AI API Key`
   - **Name:** `Authorization`
   - **Value:** `Bearer YOUR_OTTO_API_KEY`
4. Click **"Save"**

---

### **Credential 2: Twilio API (HTTP Basic Auth)**

1. Click on **"Send Confirmation SMS"** node
2. Under **"Credential for HTTP Basic Auth"**, click **"Create New Credential"**
3. Fill in:
   - **Credential Name:** `Twilio API`
   - **User:** `ACafc412b62982312dc2efebaff233cf9f` (Account SID)
   - **Password:** `32c6e878cdc5707707980e6d6272f713` (Auth Token)
4. Click **"Save"**

5. **Apply to other nodes:**
   - Go to **"Send 24hr Reminder SMS"** node
   - Select the same **"Twilio API"** credential
   - Go to **"Make Follow-up Call"** node
   - Select the same **"Twilio API"** credential

---

## 📋 **Workflow Nodes (10 Total)**

1. ✅ **Webhook - Appointment Request** (Receives POST requests)
2. ✅ **Validate & Clean Data** (Normalizes input)
3. ✅ **Validate Required Fields** (Checks phone & date)
4. ✅ **Create Appointment** (HTTP POST to Otto AI)
5. ✅ **Send Confirmation SMS** (HTTP POST to Twilio)
6. ✅ **Wait 24 Hours** (Delays execution)
7. ✅ **Send 24hr Reminder SMS** (HTTP POST to Twilio)
8. ✅ **Make Follow-up Call** (HTTP POST to Twilio)
9. ✅ **Success Response** (Returns 200 OK)
10. ✅ **Error Response** (Returns 400 Bad Request)

---

## 🧪 **Test the Workflow**

### **Step 1: Activate the Workflow**
1. Click **"Active"** toggle (top right)
2. Copy the **Webhook URL** from the "Webhook - Appointment Request" node

### **Step 2: Test with cURL**

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "customerEmail": "john@example.com",
    "appointmentType": "oil change",
    "preferredDate": "2025-10-20",
    "preferredTime": "14:00",
    "notes": "Synthetic oil preferred"
  }'
```

### **Expected Response:**
```json
{
  "success": true,
  "appointmentId": "appt_xyz789",
  "message": "Appointment created successfully"
}
```

---

## 🔍 **How It Works**

### **1. Webhook Receives Request**
```
POST /webhook/otto/appointment-request
```

### **2. Data Validation**
- Normalizes nested/flat JSON formats
- Checks for required fields (phone, date)
- Returns 400 error if validation fails

### **3. Create Appointment**
```
POST https://ottoagent.net/api/appointments
Authorization: Bearer YOUR_API_KEY
```

### **4. Send Confirmation SMS**
```
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
From: +18884118568
To: {customerPhone}
Body: "Hi {name}! Your appointment is confirmed..."
```

### **5. Wait 24 Hours**
- Workflow pauses for 24 hours
- Uses webhook-based waiting

### **6. Send Reminder SMS**
```
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
Body: "Reminder: Your appointment is tomorrow..."
```

### **7. Make Follow-up Call**
```
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json
Url: https://ottoagent.net/api/twilio/reminder-call?name={name}&type={type}
```

---

## 🎯 **Key Differences from Twilio Node Version**

| Feature | Twilio Node | HTTP Request |
|---------|-------------|--------------|
| **Installation** | Requires community node | ✅ Built-in |
| **Credentials** | Twilio credential | HTTP Basic Auth |
| **API Calls** | Abstracted | Direct REST API |
| **Flexibility** | Limited to node features | ✅ Full API access |
| **Debugging** | Node-specific errors | HTTP response codes |

---

## 🐛 **Troubleshooting**

### **Issue: "401 Unauthorized" on Twilio calls**
**Solution:** Check Twilio credentials
- User: `ACafc412b62982312dc2efebaff233cf9f`
- Password: `32c6e878cdc5707707980e6d6272f713`

### **Issue: "400 Bad Request" on SMS**
**Solution:** Check phone number format
- Must include country code: `+1234567890`
- No spaces or dashes

### **Issue: "Missing required fields" error**
**Solution:** Ensure request includes:
- `customerPhone` (required)
- `preferredDate` (required)

### **Issue: Wait node doesn't trigger**
**Solution:** 
- Make sure workflow is **Active**
- Check n8n execution logs
- Verify webhook URL is accessible

---

## 📊 **Monitoring**

### **Check Execution History**
1. Go to **"Executions"** tab (left sidebar)
2. Click on any execution to see:
   - Input data
   - Each node's output
   - Error messages
   - Execution time

### **Common Success Indicators**
- ✅ Green checkmarks on all nodes
- ✅ 200 response from Otto AI API
- ✅ 201 response from Twilio SMS
- ✅ Wait node shows "waiting" status

---

## 🔐 **Security Notes**

1. **Webhook Security:** Add authentication to webhook
2. **API Keys:** Store in n8n credentials (never in code)
3. **Phone Numbers:** Validate format before sending
4. **Rate Limiting:** Twilio has rate limits (check your plan)

---

## 🚀 **Next Steps**

1. ✅ Import workflow
2. ✅ Configure 2 credentials (Otto AI + Twilio)
3. ✅ Activate workflow
4. ✅ Test with sample request
5. ✅ Monitor execution logs
6. ✅ Integrate with your app

---

## 📞 **Support**

If you encounter issues:
1. Check n8n execution logs
2. Verify credentials are correct
3. Test Twilio API directly with cURL
4. Check Otto AI API documentation

---

**You're all set!** 🎉 This version works without any community nodes and uses only built-in HTTP Request functionality.

