# Updated Otto Campaign Workflow

I have updated the file `n8n-workflow-otto-campaign-v2.json` to fix the appointment booking logic.

## Instructions to Update n8n

1.  Open your existing workflow in n8n (the one from the screenshot).
2.  **Delete** the bottom section starting from `Webhook1` (or just the nodes that were failing).
3.  **Copy** the JSON below (which represents the fixed bottom section).
4.  **Paste** it directly into your n8n canvas.
5.  **Connect** the nodes if they aren't connected automatically.
6.  **Save** and **Activate**.

## Fixed Nodes JSON (Copy this)

```json
[
  {
    "parameters": {
      "httpMethod": "POST",
      "path": "webhook1",
      "options": {}
    },
    "id": "webhook-1",
    "name": "Webhook1",
    "type": "n8n-nodes-base.webhook",
    "typeVersion": 1,
    "position": [250, 700]
  },
  {
    "parameters": {
      "jsCode": "// Process webhook data\nreturn $json.body || $json;"
    },
    "id": "code-js-2",
    "name": "Code in JavaScript1",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [450, 700]
  },
  {
    "parameters": {
      "conditions": {
        "boolean": [
          {
            "value1": "={{ !!($json.data?.analysis || $json.outcome) }}",
            "value2": true
          }
        ]
      }
    },
    "id": "if-analysis",
    "name": "If1",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2,
    "position": [650, 700]
  },
  {
    "parameters": {
      "resource": "calendar",
      "operation": "createEvent",
      "calendarId": {
        "__rl": true,
        "value": "primary",
        "mode": "list"
      },
      "start": "={{ DateTime.fromFormat(($json.appointmentDate || $json.body?.appointmentDate || $json.data?.conversation_initiation_client_data?.dynamic_variables?.appointmentDate) + ' ' + ($json.appointmentTime || $json.body?.appointmentTime || $json.data?.conversation_initiation_client_data?.dynamic_variables?.appointmentTime), 'yyyy-MM-dd HH:mm').toISO() }}",
      "end": "={{ DateTime.fromFormat(($json.appointmentDate || $json.body?.appointmentDate || $json.data?.conversation_initiation_client_data?.dynamic_variables?.appointmentDate) + ' ' + ($json.appointmentTime || $json.body?.appointmentTime || $json.data?.conversation_initiation_client_data?.dynamic_variables?.appointmentTime), 'yyyy-MM-dd HH:mm').plus({ minutes: 60 }).toISO() }}",
      "summary": "={{ ($json.appointmentService || $json.body?.appointmentService || 'Service') + ' - ' + ($json.customerName || $json.body?.customerName || $json.data?.conversation_initiation_client_data?.dynamic_variables?.customerName) }}",
      "description": "={{ 'Customer: ' + ($json.customerName || $json.body?.customerName) + '\\nPhone: ' + ($json.customerPhone || $json.body?.customerPhone) + '\\nNotes: ' + ($json.notes || $json.body?.notes || '') }}"
    },
    "id": "update-calendar-event",
    "name": "Create an event",
    "type": "n8n-nodes-base.googleCalendar",
    "typeVersion": 1,
    "position": [850, 600],
    "credentials": {
      "googleCalendarOAuth2Api": {
        "id": "YOUR_GOOGLE_CALENDAR_CREDENTIAL_ID",
        "name": "Google Calendar OAuth2"
      }
    }
  },
  {
    "parameters": {
      "fromNumber": "+19257226886",
      "toNumber": "={{ $json.customerPhone || $json.body?.customerPhone || $json.data?.conversation_initiation_client_data?.dynamic_variables?.customerPhone }}",
      "message": "={{ 'Hi ' + ($json.customerName || $json.body?.customerName) + '! Your ' + ($json.appointmentService || $json.body?.appointmentService || 'appointment') + ' is confirmed for ' + ($json.appointmentDate || $json.body?.appointmentDate) + ' at ' + ($json.appointmentTime || $json.body?.appointmentTime) + '. We look forward to seeing you!' }}",
      "options": {}
    },
    "id": "send-sms",
    "name": "Send an SMS/MMS/WhatsApp",
    "type": "n8n-nodes-base.twilio",
    "typeVersion": 1,
    "position": [1050, 800],
    "credentials": {
      "twilioApi": {
        "id": "YOUR_TWILIO_CREDENTIAL_ID",
        "name": "Twilio API"
      }
    }
  }
]
```
