# ElevenLabs - Single Tool Configuration

## 🎯 You Only Need ONE Tool!

Instead of configuring 6+ tools, you now only need **ONE tool** that handles everything.

---

## 📋 Tool Configuration

### **Step 1: Open ElevenLabs**

1. Go to: **https://elevenlabs.io/app/conversational-ai**
2. Find: **Otto** (Agent ID: `agent_2201k8q07eheexe8j4vkt0b9vecb`)
3. Click: **"Edit"** or **"Configure"**
4. Navigate to: **"Tools"** or **"Custom Functions"**

---

### **Step 2: Delete Old Tools (If Any)**

If you have these old tools, delete them:
- ❌ `get_customer_appointments`
- ❌ `book_appointment`
- ❌ `check_availability`
- ❌ `get_service_status`
- ❌ `check_inventory`
- ❌ `create_lead`

---

### **Step 3: Add New Tool**

Click **"Add Tool"** or **"New Function"**

---

## 🔧 Tool Details

### **Tool Name**
```
handle_customer_request
```

---

### **Description**
```
Handles all customer requests including booking appointments, checking existing appointments, viewing availability, checking service status, and general inquiries. Use this tool whenever a customer asks about appointments, services, vehicle status, or any automotive-related questions. The AI will automatically route to the correct action based on the customer's intent.
```

---

### **Parameters (JSON Schema)**

Copy and paste this **EXACTLY**:

```json
{
  "type": "object",
  "properties": {
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number in E.164 format (e.g., +19163337305). Extract this from the conversation when the customer provides their phone number."
    },
    "customerName": {
      "type": "string",
      "description": "Customer's name if mentioned in the conversation. Extract from phrases like 'My name is John' or 'This is Sarah calling'."
    },
    "customerEmail": {
      "type": "string",
      "description": "Customer's email address if mentioned in the conversation."
    },
    "request": {
      "type": "string",
      "description": "The customer's full request or question. Include the complete context of what they're asking for."
    },
    "serviceType": {
      "type": "string",
      "description": "Type of service if mentioned (e.g., 'oil change', 'tire rotation', 'brake service', 'inspection'). Leave empty if not mentioned."
    },
    "preferredDate": {
      "type": "string",
      "description": "Preferred date if mentioned. Can be relative (e.g., 'tomorrow', 'next Monday') or absolute (e.g., '2024-11-01', 'November 1st')."
    },
    "preferredTime": {
      "type": "string",
      "description": "Preferred time if mentioned (e.g., '2:00 PM', '14:00', 'morning', 'afternoon', 'evening')."
    },
    "vehicleInfo": {
      "type": "string",
      "description": "Vehicle information if mentioned (e.g., '2020 Honda Accord', 'my BMW', 'the truck')."
    }
  },
  "required": ["request"]
}
```

---

### **Webhook URL**

```
https://dualpay.app.n8n.cloud/webhook/otto/ai-router
```

---

### **HTTP Method**

```
POST
```

---

### **Headers**

```json
{
  "Content-Type": "application/json"
}
```

---

### **Request Body Template** (Optional)

If ElevenLabs asks for a request body template, use:

```json
{
  "customerPhone": "{{customerPhone}}",
  "customerName": "{{customerName}}",
  "customerEmail": "{{customerEmail}}",
  "request": "{{request}}",
  "serviceType": "{{serviceType}}",
  "preferredDate": "{{preferredDate}}",
  "preferredTime": "{{preferredTime}}",
  "vehicleInfo": "{{vehicleInfo}}",
  "timestamp": "{{$timestamp}}",
  "callSid": "{{$callSid}}"
}
```

---

## 📸 What It Should Look Like

After configuration, you should see:

```
┌─────────────────────────────────────────────────┐
│ Tools & Functions                               │
├─────────────────────────────────────────────────┤
│ ➕ Add Tool                                      │
│                                                 │
│ ✅ handle_customer_request                      │
│    Handles all customer requests including...   │
│    URL: https://dualpay.app.n8n.cloud/webhook...│
│    Method: POST                                 │
│    Parameters: 8 (1 required)                   │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Test the Configuration

### **Test 1: Get Appointments**

**Call Otto:** `+18884118568`

**Say:** "What appointments do I have?"

**Expected Flow:**
1. Otto asks: "What's your phone number?"
2. You say: "916-333-7305"
3. Otto calls `handle_customer_request` with:
   ```json
   {
     "customerPhone": "+19163337305",
     "request": "What appointments do I have?"
   }
   ```
4. AI Router detects intent: `get_appointments`
5. Otto responds: "You have 2 upcoming appointments..."

---

### **Test 2: Book Appointment**

**Call Otto:** `+18884118568`

**Say:** "I want to book an oil change for tomorrow at 2 PM"

**Expected Flow:**
1. Otto calls `handle_customer_request` with:
   ```json
   {
     "request": "I want to book an oil change for tomorrow at 2 PM",
     "serviceType": "oil change",
     "preferredDate": "tomorrow",
     "preferredTime": "2:00 PM"
   }
   ```
2. AI Router detects intent: `book_appointment`
3. Workflow creates Google Calendar event
4. Workflow sends email confirmation
5. Workflow sends SMS confirmation
6. Otto responds: "Perfect! I've scheduled your oil change..."

---

### **Test 3: Check Availability**

**Call Otto:** `+18884118568`

**Say:** "What times are available tomorrow?"

**Expected Flow:**
1. Otto calls `handle_customer_request` with:
   ```json
   {
     "request": "What times are available tomorrow?",
     "preferredDate": "tomorrow"
   }
   ```
2. AI Router detects intent: `check_availability`
3. Otto responds: "For tomorrow, we have the following times available..."

---

## 🎯 How Otto Knows When to Use This Tool

Otto will automatically use this tool when customers:

- Ask about appointments
- Want to book service
- Check availability
- Ask about vehicle status
- General automotive questions

**Examples of phrases that trigger the tool:**
- "What appointments do I have?"
- "I need to schedule service"
- "When can I come in?"
- "Is my car ready?"
- "I want to book an oil change"
- "What times are available?"
- "Can I get an appointment tomorrow?"
- "I need to cancel my appointment"

---

## ⚙️ Advanced Configuration (Optional)

### **Timeout**
Set to: `30 seconds` (to allow time for AI processing)

### **Retry on Failure**
Enable: `Yes` (retry up to 2 times)

### **Cache Response**
Disable: `No` (always get fresh data)

---

## 🔍 Debugging

If the tool isn't being called:

1. **Check n8n workflow is active**
   - Go to n8n dashboard
   - Verify "Otto AI Router" workflow is ON (green)

2. **Check webhook URL is correct**
   - Copy from n8n workflow
   - Paste into ElevenLabs tool configuration

3. **Check tool is saved**
   - Click "Save" in ElevenLabs
   - Refresh the page
   - Verify tool still appears

4. **Test webhook directly**
   ```bash
   curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/ai-router \
     -H "Content-Type: application/json" \
     -d '{"request": "test"}'
   ```

5. **Check n8n execution logs**
   - Go to n8n workflow
   - Click "Executions" tab
   - Look for recent executions

---

## ✅ Checklist

Before testing with Otto, verify:

- [ ] Tool name is `handle_customer_request`
- [ ] Webhook URL is correct
- [ ] HTTP method is `POST`
- [ ] Parameters JSON is valid
- [ ] Tool is saved in ElevenLabs
- [ ] n8n workflow is active
- [ ] n8n credentials are configured
- [ ] Test webhook responds correctly

---

## 🎉 You're Done!

You now have **ONE tool** that handles **EVERYTHING**!

No more managing multiple tools. No more confusion about which tool to use.

Just one smart tool that routes everything correctly. 🚀

