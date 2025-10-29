# Missing ElevenLabs Tools - Add These Now 🔧

## 🎯 Tools You Need to Add to ElevenLabs

You mentioned you don't have `get_customer_appointments`. Here are ALL the tools you need for Otto to work properly:

---

## ✅ Tool 1: get_customer_appointments

**Tool Name:** `get_customer_appointments`

**Description:**
```
Retrieves a customer's existing appointments. Use this when the customer asks "What appointments do I have?", "When is my next service?", or "Do I have any upcoming appointments?"
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/get-appointments
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number to look up appointments"
    }
  },
  "required": ["customerPhone"]
}
```

**Request Body Template:**
```json
{
  "customerPhone": "{{customerPhone}}"
}
```

---

## ✅ Tool 2: check_availability

**Tool Name:** `check_availability`

**Description:**
```
Checks available appointment slots for a specific date. Use this when the customer asks "What times are available?", "Do you have any openings on Friday?", or "When can I come in?"
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-availability
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "Date to check availability in YYYY-MM-DD format"
    },
    "duration": {
      "type": "number",
      "description": "Appointment duration in minutes (default: 60)",
      "default": 60
    }
  },
  "required": ["date"]
}
```

**Request Body Template:**
```json
{
  "date": "{{date}}",
  "duration": {{duration}}
}
```

---

## ✅ Tool 3: book_appointment (Update create_appointment)

**Tool Name:** `book_appointment` or `create_appointment`

**Description:**
```
Books a service appointment for the customer. Use this when the customer wants to schedule a service, oil change, tire rotation, brake service, or any automotive service.
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "customerName": {
      "type": "string",
      "description": "Customer's full name"
    },
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number"
    },
    "customerEmail": {
      "type": "string",
      "description": "Customer's email address (optional)"
    },
    "appointmentType": {
      "type": "string",
      "enum": ["oil_change", "tire_rotation", "brake_service", "inspection", "repair", "maintenance", "diagnostic"],
      "description": "Type of service needed"
    },
    "preferredDate": {
      "type": "string",
      "description": "Preferred date in YYYY-MM-DD format"
    },
    "preferredTime": {
      "type": "string",
      "description": "Preferred time in HH:MM format (24-hour)"
    },
    "vehicleMake": {
      "type": "string",
      "description": "Vehicle make (e.g., Toyota, Honda, Ford)"
    },
    "vehicleModel": {
      "type": "string",
      "description": "Vehicle model (e.g., Camry, Accord, F-150)"
    },
    "vehicleYear": {
      "type": "number",
      "description": "Vehicle year (e.g., 2020)"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes or details about the service"
    }
  },
  "required": ["customerName", "customerPhone", "appointmentType", "preferredDate"]
}
```

---

## ✅ Tool 4: get_service_status

**Tool Name:** `get_service_status`

**Description:**
```
Returns current repair or service order status. Use this when the customer asks "What's the status of my car?", "Is my service done?", or "How much longer will it take?"
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/service-status
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number"
    },
    "ticketId": {
      "type": "string",
      "description": "Service ticket ID or order number (if customer has it)"
    }
  },
  "required": ["customerPhone"]
}
```

**Request Body Template:**
```json
{
  "customerPhone": "{{customerPhone}}",
  "ticketId": "{{ticketId}}"
}
```

---

## ✅ Tool 5: check_inventory

**Tool Name:** `check_inventory`

**Description:**
```
Returns available vehicles or products matching the caller's query. Use this when the customer asks "Do you have any [make/model] in stock?", "What cars do you have available?", or "I'm looking for a [vehicle]"
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-inventory
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "make": {
      "type": "string",
      "description": "Vehicle make (e.g., Mercedes, BMW, Toyota)"
    },
    "model": {
      "type": "string",
      "description": "Vehicle model (e.g., C-Class, 3 Series, Camry)"
    },
    "year": {
      "type": "number",
      "description": "Vehicle year (e.g., 2024)"
    },
    "priceRange": {
      "type": "string",
      "description": "Price range (e.g., '30000-50000')"
    },
    "bodyType": {
      "type": "string",
      "enum": ["sedan", "suv", "truck", "coupe", "convertible", "van"],
      "description": "Vehicle body type"
    }
  }
}
```

---

## ✅ Tool 6: create_lead

**Tool Name:** `create_lead`

**Description:**
```
Creates a lead or inquiry record for the business from a caller. Use this when the customer expresses interest in buying a vehicle, getting more information, or wants to be contacted by sales.
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/create-lead
```

**Method:** `POST`

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "customerName": {
      "type": "string",
      "description": "Customer's full name"
    },
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number"
    },
    "customerEmail": {
      "type": "string",
      "description": "Customer's email address"
    },
    "interest": {
      "type": "string",
      "description": "What the customer is interested in (vehicle, service, etc.)"
    },
    "source": {
      "type": "string",
      "description": "How they heard about you",
      "default": "phone_call"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes from the conversation"
    }
  },
  "required": ["customerName", "customerPhone", "interest"]
}
```

---

## 🚀 How to Add These Tools in ElevenLabs

### **Step 1: Open ElevenLabs**
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Find: **Otto** (`agent_2201k8q07eheexe8j4vkt0b9vecb`)
3. Click: **"Edit"** or **"Configure"**

### **Step 2: Navigate to Tools**
Look for one of these sections:
- **"Tools"**
- **"Custom Functions"**
- **"Client Tools"**
- **"Integrations"**

### **Step 3: Add Each Tool**

For each tool above:

1. Click **"Add Tool"** or **"New Function"**
2. Fill in:
   - **Name:** (e.g., `get_customer_appointments`)
   - **Description:** (copy from above)
   - **URL:** (copy from above)
   - **Method:** `POST`
   - **Parameters:** (paste JSON schema from above)
3. Click **"Save"**

---

## 📋 Quick Checklist

Add these tools to ElevenLabs:

- [ ] `get_customer_appointments` - Get customer's appointments
- [ ] `check_availability` - Check available time slots
- [ ] `book_appointment` - Book new appointment
- [ ] `get_service_status` - Get service/repair status
- [ ] `check_inventory` - Search vehicle inventory
- [ ] `create_lead` - Create sales lead

---

## 🧪 Test After Adding

Call Otto: `+18884118568`

**Test 1:**
```
Say: "What appointments do I have?"
Expected: Otto calls get_customer_appointments tool
```

**Test 2:**
```
Say: "What times are available tomorrow?"
Expected: Otto calls check_availability tool
```

**Test 3:**
```
Say: "I want to book an oil change"
Expected: Otto calls book_appointment tool
```

---

## ⚠️ Important Notes

### **All URLs Must Be Active**

Before adding tools to ElevenLabs, make sure the n8n workflows exist:

1. Go to: https://dualpay.app.n8n.cloud
2. Create workflows for each webhook path
3. Activate the workflows
4. Test with curl before adding to ElevenLabs

### **Test URLs First:**

```bash
# Test get_customer_appointments
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/get-appointments \
  -H "Content-Type: application/json" \
  -d '{"customerPhone": "+19184700208"}'

# Should return: {"success": true, "appointments": [...]}
# If 404: Create the n8n workflow first
```

---

## 📞 Need Help?

If you can't find the Tools section in ElevenLabs:
1. Try the new UI vs classic UI
2. Look under "Advanced Settings"
3. Check the agent configuration page
4. Look for "Integrations" or "Webhooks"

---

**Next Step:** Add these 6 tools to ElevenLabs, then test by calling Otto! 🚀

