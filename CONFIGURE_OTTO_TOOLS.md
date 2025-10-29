# Configure Otto's Tools in ElevenLabs 🛠️

## 🎯 The Problem

When customers ask Otto to:
- "Book an appointment"
- "Check my calendar"
- "Schedule a service"

Otto doesn't know how to connect to your n8n workflows or database.

## ✅ The Solution

Configure **Custom Tools** in ElevenLabs that call your **n8n webhooks** and **Otto API endpoints**.

---

## 🔧 Step-by-Step Configuration

### **Step 1: Open Your Otto Agent**

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Find your agent: **Otto** (`agent_2201k8q07eheexe8j4vkt0b9vecb`)
3. Click **"Edit"** or **"Configure"**

### **Step 2: Navigate to Tools Section**

Look for:
- **"Tools"** tab
- **"Custom Functions"** section
- **"Client Tools"** or **"Server Tools"**

---

## 📋 Tools to Configure

### **Tool 1: Book Appointment**

**Tool Name:** `book_appointment`

**Description:**
```
Books a service appointment for the customer. Use this when the customer wants to schedule a service, oil change, tire rotation, or any automotive service.
```

**Parameters:**
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
      "enum": ["oil_change", "tire_rotation", "brake_service", "inspection", "repair", "maintenance"],
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
    "notes": {
      "type": "string",
      "description": "Additional notes or details about the service"
    }
  },
  "required": ["customerName", "customerPhone", "appointmentType", "preferredDate"]
}
```

**Webhook URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

**HTTP Method:** `POST`

**Request Body Template:**
```json
{
  "customer": {
    "name": "{{customerName}}",
    "phone": "{{customerPhone}}",
    "email": "{{customerEmail}}"
  },
  "intent": {
    "appointmentType": "{{appointmentType}}",
    "preferredDate": "{{preferredDate}}",
    "preferredTime": "{{preferredTime}}",
    "notes": "{{notes}}"
  },
  "timestamp": "{{$timestamp}}"
}
```

---

### **Tool 2: Check Calendar Availability**

**Tool Name:** `check_availability`

**Description:**
```
Checks available appointment slots for a specific date. Use this when the customer asks "What times are available?" or "Do you have any openings?"
```

**Parameters:**
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

**Webhook URL:**
```
https://ottoagent.net/api/appointments/availability/{{date}}?duration={{duration}}
```

**HTTP Method:** `GET`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

---

### **Tool 3: Get Customer Appointments**

**Tool Name:** `get_customer_appointments`

**Description:**
```
Retrieves a customer's existing appointments. Use this when the customer asks "What appointments do I have?" or "When is my next service?"
```

**Parameters:**
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

**Webhook URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/get-appointments
```

**HTTP Method:** `POST`

**Request Body Template:**
```json
{
  "customerPhone": "{{customerPhone}}",
  "timestamp": "{{$timestamp}}"
}
```

---

### **Tool 4: Cancel/Reschedule Appointment**

**Tool Name:** `modify_appointment`

**Description:**
```
Cancels or reschedules an existing appointment. Use this when the customer wants to change or cancel their appointment.
```

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number"
    },
    "action": {
      "type": "string",
      "enum": ["cancel", "reschedule"],
      "description": "Action to perform"
    },
    "newDate": {
      "type": "string",
      "description": "New date if rescheduling (YYYY-MM-DD)"
    },
    "newTime": {
      "type": "string",
      "description": "New time if rescheduling (HH:MM)"
    },
    "reason": {
      "type": "string",
      "description": "Reason for cancellation/rescheduling"
    }
  },
  "required": ["customerPhone", "action"]
}
```

**Webhook URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/modify-appointment
```

**HTTP Method:** `POST`

**Request Body Template:**
```json
{
  "customerPhone": "{{customerPhone}}",
  "action": "{{action}}",
  "newDate": "{{newDate}}",
  "newTime": "{{newTime}}",
  "reason": "{{reason}}",
  "timestamp": "{{$timestamp}}"
}
```

---

## 🔗 n8n Workflows You Need to Create

### **Workflow 1: Appointment Request Handler**

**Webhook Path:** `otto/appointment-request`
**Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/appointment-request`

**What it does:**
1. Receives appointment request from Otto
2. Looks up customer in database (or creates new one)
3. Checks availability
4. Creates appointment in database
5. Sends confirmation SMS/email
6. Returns success response to Otto

**Response to Otto:**
```json
{
  "success": true,
  "message": "Appointment booked for October 25th at 2:00 PM",
  "appointmentId": "apt_123456",
  "confirmationSent": true
}
```

---

### **Workflow 2: Get Appointments Handler**

**Webhook Path:** `otto/get-appointments`
**Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/get-appointments`

**What it does:**
1. Receives customer phone number
2. Looks up customer in database
3. Retrieves their appointments
4. Returns formatted list to Otto

**Response to Otto:**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "apt_123",
      "type": "Oil Change",
      "date": "2025-10-25",
      "time": "14:00",
      "status": "confirmed"
    }
  ]
}
```

---

### **Workflow 3: Modify Appointment Handler**

**Webhook Path:** `otto/modify-appointment`
**Full URL:** `https://dualpay.app.n8n.cloud/webhook/otto/modify-appointment`

**What it does:**
1. Receives modification request
2. Looks up customer and appointment
3. Updates or cancels appointment
4. Sends notification
5. Returns confirmation to Otto

---

## 🧪 Testing Your Tools

### **Test 1: Call Otto and Say:**

```
"Hi, I'd like to book an oil change appointment"
```

**Expected Flow:**
1. Otto asks for your name and phone
2. Otto asks for preferred date/time
3. Otto calls `book_appointment` tool
4. n8n workflow processes request
5. Otto confirms: "Great! I've booked your oil change for..."

### **Test 2: Call Otto and Say:**

```
"What appointments do I have?"
```

**Expected Flow:**
1. Otto asks for your phone number
2. Otto calls `get_customer_appointments` tool
3. n8n workflow retrieves appointments
4. Otto responds: "You have an oil change scheduled for..."

---

## 📸 Screenshot Guide

When configuring in ElevenLabs, you should see:

1. **Tools Section** - List of custom tools
2. **Add Tool Button** - Click to add new tool
3. **Tool Configuration Form:**
   - Tool Name
   - Description
   - Parameters (JSON Schema)
   - Webhook URL
   - HTTP Method
   - Headers
   - Request Body Template

---

## ⚠️ Important Notes

### **Authentication**

Your n8n webhooks are currently **public** (no auth). For production, you should:

1. Add authentication to n8n webhooks
2. Configure headers in ElevenLabs tools:
```json
{
  "Authorization": "Bearer YOUR_SECRET_TOKEN",
  "Content-Type": "application/json"
}
```

### **Error Handling**

Make sure your n8n workflows return proper error responses:

**Success:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "No availability on that date",
  "suggestion": "Try October 26th instead"
}
```

Otto will read these messages to the customer!

---

## 🚀 Quick Start Checklist

- [ ] Open ElevenLabs Otto agent settings
- [ ] Navigate to Tools/Functions section
- [ ] Add `book_appointment` tool with webhook URL
- [ ] Add `check_availability` tool
- [ ] Add `get_customer_appointments` tool
- [ ] Create n8n workflow: `otto/appointment-request`
- [ ] Create n8n workflow: `otto/get-appointments`
- [ ] Test by calling Otto and booking appointment
- [ ] Verify appointment appears in database

---

## 📞 Need Help?

If you're stuck on:
1. **Finding the Tools section** - Look for "Custom Functions", "Client Tools", or "Server Tools" in ElevenLabs
2. **n8n workflow creation** - See `n8n-workflow-appointment-booking.json` for template
3. **Testing** - Call `+18884118568` and say "I want to book an appointment"

---

**Next Step:** Open your Otto agent in ElevenLabs and start adding these tools! 🛠️

