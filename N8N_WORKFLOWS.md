# Otto AI + n8n Workflow Automation Guide

## Overview

Otto AI can handle conversations but needs n8n to execute actions like booking appointments, sending follow-ups, and automating workflows.

---

## Architecture

```
┌─────────────────┐
│  Customer Call  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Otto AI       │ ◄── ElevenLabs Conversational AI
│  (Phone Agent)  │     - Understands intent
└────────┬────────┘     - Extracts information
         │              - Cannot execute actions
         │
         ▼
┌─────────────────┐
│  Webhook to n8n │ ◄── Sends call data + intent
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  n8n Workflows  │ ◄── Executes actions:
│                 │     - Books appointments
│                 │     - Sends follow-ups
│                 │     - Updates CRM
│                 │     - Creates tasks
└─────────────────┘
```

---

## Required n8n Workflows

### **Workflow 1: Appointment Booking**

**Trigger:** Webhook from Otto AI call
**Purpose:** Book appointments when Otto identifies booking intent

```json
{
  "name": "Otto - Appointment Booking",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "otto/appointment-request",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Extract Call Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "customerId",
              "value": "={{$json.customer.id}}"
            },
            {
              "name": "customerName",
              "value": "={{$json.customer.name}}"
            },
            {
              "name": "customerPhone",
              "value": "={{$json.customer.phone}}"
            },
            {
              "name": "customerEmail",
              "value": "={{$json.customer.email}}"
            },
            {
              "name": "appointmentType",
              "value": "={{$json.intent.appointmentType}}"
            },
            {
              "name": "preferredDate",
              "value": "={{$json.intent.preferredDate}}"
            },
            {
              "name": "preferredTime",
              "value": "={{$json.intent.preferredTime}}"
            }
          ]
        }
      }
    },
    {
      "name": "Check Calendar Availability",
      "type": "n8n-nodes-base.googleCalendar",
      "parameters": {
        "operation": "getAll",
        "calendar": "primary",
        "timeMin": "={{$json.preferredDate}}T00:00:00Z",
        "timeMax": "={{$json.preferredDate}}T23:59:59Z"
      }
    },
    {
      "name": "Find Available Slot",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Find first available 1-hour slot\nconst preferredTime = $input.first().json.preferredTime;\nconst busySlots = $input.all().map(item => ({\n  start: new Date(item.json.start.dateTime),\n  end: new Date(item.json.end.dateTime)\n}));\n\n// Business hours: 9 AM - 6 PM\nconst startHour = 9;\nconst endHour = 18;\nconst slotDuration = 60; // minutes\n\nconst date = new Date($input.first().json.preferredDate);\nlet availableSlot = null;\n\nfor (let hour = startHour; hour < endHour; hour++) {\n  const slotStart = new Date(date);\n  slotStart.setHours(hour, 0, 0, 0);\n  \n  const slotEnd = new Date(slotStart);\n  slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);\n  \n  // Check if slot is free\n  const isFree = !busySlots.some(busy => \n    (slotStart >= busy.start && slotStart < busy.end) ||\n    (slotEnd > busy.start && slotEnd <= busy.end)\n  );\n  \n  if (isFree) {\n    availableSlot = {\n      start: slotStart.toISOString(),\n      end: slotEnd.toISOString()\n    };\n    break;\n  }\n}\n\nreturn [{\n  json: {\n    ...$ input.first().json,\n    availableSlot\n  }\n}];"
      }
    },
    {
      "name": "Create Appointment in Otto AI",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://ottoagent.net/api/appointments",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$credentials.ottoApiKey}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "title",
              "value": "={{$json.appointmentType}} - {{$json.customerName}}"
            },
            {
              "name": "type",
              "value": "={{$json.appointmentType}}"
            },
            {
              "name": "startTime",
              "value": "={{$json.availableSlot.start}}"
            },
            {
              "name": "endTime",
              "value": "={{$json.availableSlot.end}}"
            },
            {
              "name": "customerId",
              "value": "={{$json.customerId}}"
            }
          ]
        }
      }
    },
    {
      "name": "Send Confirmation Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "fromEmail": "appointments@ottoagent.net",
        "toEmail": "={{$json.customerEmail}}",
        "subject": "Appointment Confirmed - {{$json.appointmentType}}",
        "text": "Dear {{$json.customerName}},\\n\\nYour appointment has been confirmed:\\n\\nType: {{$json.appointmentType}}\\nDate: {{$json.availableSlot.start}}\\n\\nWe look forward to seeing you!\\n\\nBest regards,\\nOtto AI Team"
      }
    },
    {
      "name": "Send SMS Confirmation",
      "type": "n8n-nodes-base.twilio",
      "parameters": {
        "operation": "send",
        "from": "={{$credentials.twilioPhoneNumber}}",
        "to": "={{$json.customerPhone}}",
        "message": "Hi {{$json.customerName}}! Your {{$json.appointmentType}} is confirmed for {{$json.availableSlot.start}}. See you then!"
      }
    },
    {
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"appointmentId\": $json.id, \"startTime\": $json.availableSlot.start } }}"
      }
    }
  ]
}
```

---

### **Workflow 2: Post-Call Follow-up Sequence**

**Trigger:** Call completed webhook
**Purpose:** Automated follow-up sequence after every call

```json
{
  "name": "Otto - Post-Call Follow-up",
  "nodes": [
    {
      "name": "Webhook - Call Completed",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "otto/call-completed"
      }
    },
    {
      "name": "Wait 1 Hour",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 1,
        "unit": "hours"
      }
    },
    {
      "name": "Send Thank You Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "fromEmail": "support@ottoagent.net",
        "toEmail": "={{$json.customer.email}}",
        "subject": "Thank you for calling Otto AI",
        "text": "Dear {{$json.customer.name}},\\n\\nThank you for contacting us today. We appreciate your interest in our services.\\n\\nCall Summary:\\n- Duration: {{$json.call.duration}} seconds\\n- Topic: {{$json.call.topic}}\\n\\nIf you have any questions, feel free to reach out!\\n\\nBest regards,\\nOtto AI Team"
      }
    },
    {
      "name": "Wait 24 Hours",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 24,
        "unit": "hours"
      }
    },
    {
      "name": "Check if Customer Responded",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://ottoagent.net/api/customers/={{$json.customer.id}}/interactions"
      }
    },
    {
      "name": "IF No Response",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.hasResponse}}",
              "value2": false
            }
          ]
        }
      }
    },
    {
      "name": "Send Follow-up SMS",
      "type": "n8n-nodes-base.twilio",
      "parameters": {
        "operation": "send",
        "from": "={{$credentials.twilioPhoneNumber}}",
        "to": "={{$json.customer.phone}}",
        "message": "Hi {{$json.customer.name}}! Just following up on our conversation yesterday. Do you have any questions? Reply YES to speak with a specialist."
      }
    },
    {
      "name": "Wait 3 Days",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 3,
        "unit": "days"
      }
    },
    {
      "name": "Create Task for Sales Rep",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://ottoagent.net/api/tasks",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "title",
              "value": "Follow up with {{$json.customer.name}}"
            },
            {
              "name": "description",
              "value": "Customer called on {{$json.call.date}} but hasn't responded to automated follow-ups"
            },
            {
              "name": "priority",
              "value": "HIGH"
            },
            {
              "name": "customerId",
              "value": "={{$json.customer.id}}"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Setup Instructions

### **1. Install n8n**

```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or using npm
npm install n8n -g
n8n start
```

### **2. Configure Credentials in n8n**

1. **Otto AI API Key**
   - Type: Header Auth
   - Name: `Authorization`
   - Value: `Bearer YOUR_OTTO_API_KEY`

2. **Google Calendar**
   - OAuth2 authentication
   - Scopes: `https://www.googleapis.com/auth/calendar`

3. **Twilio**
   - Account SID
   - Auth Token
   - Phone Number

4. **SMTP (Email)**
   - Host: `smtp.gmail.com` (or your provider)
   - Port: `587`
   - Username: Your email
   - Password: App password

### **3. Import Workflows**

1. Copy the JSON workflows above
2. In n8n, click "Import from File" or "Import from URL"
3. Paste the JSON
4. Configure credentials
5. Activate workflow

### **4. Connect Otto AI to n8n**

Update your Otto AI webhook configuration to send events to n8n:

```javascript
// In your Otto AI backend
const n8nWebhookUrl = 'https://your-n8n-instance.com/webhook/otto/call-completed';

// After call completes
await axios.post(n8nWebhookUrl, {
  customer: {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone
  },
  call: {
    id: call.id,
    duration: call.duration,
    topic: call.topic,
    date: call.date
  },
  intent: {
    type: 'appointment_booking', // or 'lead_inquiry', 'service_request', etc.
    appointmentType: 'service',
    preferredDate: '2025-10-15',
    preferredTime: '14:00'
  }
});
```

---

## Summary

**Otto AI (Current):**
- ✅ Handles phone conversations
- ✅ Understands customer intent
- ✅ Extracts information
- ❌ Cannot execute actions

**n8n (Required):**
- ✅ Executes actions based on Otto's understanding
- ✅ Books appointments with calendar integration
- ✅ Sends automated follow-ups
- ✅ Creates tasks for sales reps
- ✅ Updates CRM systems
- ✅ Runs multi-step workflows

**Together:** Otto + n8n = Fully automated dealership operations! 🚀

