# Otto AI Router - Complete Setup Guide 🤖

## 🎯 Overview

Instead of having Otto call multiple separate webhooks, we now have:

1. **One webhook** (`/otto/ai-router`) that receives ALL requests from Otto
2. **An AI agent** that analyzes the request and determines intent
3. **Smart routing** to different workflows based on what the customer wants
4. **Automated actions**: Google Calendar, Email, SMS, Database updates

---

## 🏗️ Architecture

```
Otto (ElevenLabs)
    ↓
    ↓ Calls ONE webhook
    ↓
┌───────────────────────────────────┐
│  Otto AI Router Webhook           │
│  /otto/ai-router                  │
└───────────────────────────────────┘
    ↓
    ↓ Analyzes request with AI
    ↓
┌───────────────────────────────────┐
│  AI Intent Router (GPT-4)         │
│  Determines customer intent       │
└───────────────────────────────────┘
    ↓
    ↓ Routes to correct workflow
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Get         │ Book        │ Check       │ Service     │
│ Appointments│ Appointment │ Availability│ Status      │
└─────────────┴─────────────┴─────────────┴─────────────┘
                    ↓
                    ↓ If booking appointment
                    ↓
        ┌───────────────────────────┐
        │ Create Google Calendar    │
        │ Send Email Confirmation   │
        │ Send SMS Confirmation     │
        │ Update Database           │
        └───────────────────────────┘
```

---

## 📋 Step-by-Step Setup

### **Step 1: Import Workflow to n8n**

1. Go to: **https://dualpay.app.n8n.cloud**
2. Click **"Import from File"**
3. Upload: `n8n-workflow-otto-ai-router.json`
4. The workflow will be imported with all nodes

---

### **Step 2: Configure Credentials in n8n**

You need to set up these credentials:

#### **A. OpenAI API (for AI Intent Router)**

1. In n8n, go to **Settings → Credentials**
2. Click **"Add Credential"**
3. Select **"OpenAI API"**
4. Enter your OpenAI API key
5. Save as **"OpenAI Account"**

#### **B. Google Calendar API**

1. Go to **Settings → Credentials**
2. Click **"Add Credential"**
3. Select **"Google Calendar OAuth2 API"**
4. Follow the OAuth flow to connect your Google account
5. Save as **"Google Calendar Account"**

#### **C. SMTP (for Email)**

1. Go to **Settings → Credentials**
2. Click **"Add Credential"**
3. Select **"SMTP"**
4. Enter your email server details:
   - **Host**: `smtp.gmail.com` (or your provider)
   - **Port**: `587`
   - **User**: `otto@autolux.com`
   - **Password**: Your app password
5. Save as **"SMTP Account"**

#### **D. Twilio API (for SMS)**

1. Go to **Settings → Credentials**
2. Click **"Add Credential"**
3. Select **"Twilio API"**
4. Enter:
   - **Account SID**: Your Twilio SID
   - **Auth Token**: Your Twilio token
5. Save as **"Twilio Account"**

---

### **Step 3: Update Credential IDs in Workflow**

After creating credentials, update these nodes:

1. **AI Intent Router** node:
   - Click the node
   - Select your **"OpenAI Account"** credential

2. **Create Google Calendar Event** node:
   - Click the node
   - Select your **"Google Calendar Account"** credential

3. **Send Confirmation Email** node:
   - Click the node
   - Select your **"SMTP Account"** credential

4. **Send Confirmation SMS** node:
   - Click the node
   - Select your **"Twilio Account"** credential

---

### **Step 4: Activate the Workflow**

1. Click the **toggle switch** in the top right
2. The workflow should turn **green** (active)
3. Copy the webhook URL (should be something like):
   ```
   https://dualpay.app.n8n.cloud/webhook/otto/ai-router
   ```

---

### **Step 5: Configure ONE Tool in ElevenLabs**

Now you only need to configure **ONE tool** in ElevenLabs instead of multiple!

1. Go to: **https://elevenlabs.io/app/conversational-ai**
2. Find: **Otto** (`agent_2201k8q07eheexe8j4vkt0b9vecb`)
3. Click **"Edit"** → **"Tools"**
4. Click **"Add Tool"**

**Tool Configuration:**

**Tool Name:**
```
handle_customer_request
```

**Description:**
```
Handles all customer requests including booking appointments, checking existing appointments, viewing availability, and checking service status. Use this tool whenever a customer asks about appointments, services, or vehicle status. The AI will automatically route to the correct action.
```

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number extracted from the conversation"
    },
    "customerName": {
      "type": "string",
      "description": "Customer's name if mentioned in the conversation"
    },
    "request": {
      "type": "string",
      "description": "The customer's full request or question"
    },
    "serviceType": {
      "type": "string",
      "description": "Type of service if mentioned (e.g., oil change, tire rotation)"
    },
    "preferredDate": {
      "type": "string",
      "description": "Preferred date if mentioned (e.g., tomorrow, next Monday, 2024-11-01)"
    },
    "preferredTime": {
      "type": "string",
      "description": "Preferred time if mentioned (e.g., 2:00 PM, morning, afternoon)"
    }
  },
  "required": ["request"]
}
```

**Webhook URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/ai-router
```

**HTTP Method:**
```
POST
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

---

### **Step 6: Test the System**

#### **Test 1: Get Appointments**
```
Call Otto: +18884118568
Say: "What appointments do I have?"
Otto: "What's your phone number?"
You: "916-333-7305"
Otto: [Reads your appointments]
```

#### **Test 2: Book Appointment**
```
Call Otto: +18884118568
Say: "I want to book an oil change for tomorrow at 2 PM"
Otto: [Books appointment, creates calendar event, sends email & SMS]
```

#### **Test 3: Check Availability**
```
Call Otto: +18884118568
Say: "What times are available tomorrow?"
Otto: [Shows available time slots]
```

---

## 🔧 How It Works

### **1. Customer calls Otto**
- Customer: "I want to book an appointment"

### **2. Otto calls the webhook**
```json
{
  "customerPhone": "+19163337305",
  "customerName": "York",
  "request": "I want to book an appointment",
  "serviceType": "oil change",
  "preferredDate": "tomorrow",
  "preferredTime": "2:00 PM"
}
```

### **3. AI analyzes the request**
```json
{
  "intent": "book_appointment",
  "confidence": 0.95,
  "extractedData": {
    "customerPhone": "+19163337305",
    "serviceType": "oil change",
    "preferredDate": "2024-11-01",
    "preferredTime": "14:00"
  }
}
```

### **4. Workflow routes to "Book Appointment"**
- Creates Google Calendar event
- Sends confirmation email
- Sends confirmation SMS
- Updates database (if connected)

### **5. Response sent back to Otto**
```json
{
  "success": true,
  "message": "Perfect! I've scheduled your oil change for tomorrow at 2:00 PM. You'll receive a confirmation email and text shortly.",
  "appointment": {
    "id": "apt_1234567890",
    "status": "confirmed"
  }
}
```

### **6. Otto reads the message to customer**
- Otto: "Perfect! I've scheduled your oil change for tomorrow at 2:00 PM. You'll receive a confirmation email and text shortly."

---

## ✅ Benefits of This Approach

1. **One webhook** instead of multiple
2. **AI-powered routing** - automatically determines intent
3. **Flexible** - handles variations in how customers ask
4. **Automated** - creates calendar events, sends emails/SMS automatically
5. **Easy to extend** - just add new branches for new features
6. **Better error handling** - centralized error management
7. **Easier to maintain** - all logic in one place

---

## 🚀 Next Steps

1. **Connect to your real database** - Replace mock data with actual database queries
2. **Add more intents** - Add branches for cancellations, reschedules, etc.
3. **Enhance AI prompts** - Fine-tune the AI router for better accuracy
4. **Add logging** - Track all requests for analytics
5. **Add error handling** - Handle edge cases and failures gracefully

---

## 📞 Support

If you need help:
- Check n8n execution logs for errors
- Test the webhook directly with curl
- Verify all credentials are configured correctly
- Check ElevenLabs tool configuration

---

**You now have a single, intelligent webhook that handles everything!** 🎉

