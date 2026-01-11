# Otto Appointment Booking - Fixed Workflow

This file contains the corrected n8n workflow JSON.

## Instructions
1. Open n8n.
2. Create a **New Workflow**.
3. Click the **three dots** in the top right corner -> **Import from File** (or copy-paste the JSON below).
4. **Save** and **Activate** the workflow.
5. **Disable** the old "Webhook1" node in your other workflow to prevent conflicts.

## Workflow JSON
```json
{
  "name": "Otto Appointment Booking - Fixed",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "elevenlabs-call-complete",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 300],
      "webhookId": "elevenlabs-call-complete"
    }    {{ $json.appointmentTime || $json.body.appointmentTime }},
    {
      "parameters": {
        "resource": "calendar",
        "operation": "createEvent",
        "calendarId": {
          "__rl": true,
          "value": "primary",
          "mode": "list"
        },
        "start": "={{ DateTime.fromFormat(($json.appointmentDate || $json.body.appointmentDate) + ' ' + ($json.appointmentTime || $json.body.appointmentTime), 'yyyy-MM-dd HH:mm').toISO() }}",
        "end": "={{ DateTime.fromFormat(($json.appointmentDate || $json.body.appointmentDate) + ' ' + ($json.appointmentTime || $json.body.appointmentTime), 'yyyy-MM-dd HH:mm').plus({ minutes: 60 }).toISO() }}",
        "useDefaultReminders": false,
        "summary": "={{ ($json.appointmentService || $json.body.appointmentService || 'Service') + ' - ' + ($json.customerName || $json.body.customerName) }}",
        "description": "={{ 'Customer: ' + ($json.customerName || $json.body.customerName) + '\\nPhone: ' + ($json.customerPhone || $json.body.customerPhone) + '\\nNotes: ' + ($json.notes || $json.body.notes || '') }}",
        "location": "Sacramento CDJR",
        "sendUpdates": "all",
        "attendees": "={{ $json.customerEmail ? [$json.customerEmail] : [] }}",
        "reminders": {
          "useDefault": false,
          "overrides": [
            {
              "method": "email",
              "minutes": 1440
            },
            {
              "method": "popup",
              "minutes": 60
            }
          ]
        }
      },
      "id": "google-calendar",
      "name": "Create Google Calendar Event",
      "type": "n8n-nodes-base.googleCalendar",
      "typeVersion": 1,
      "position": [450, 300],
      "credentials": {
        "googleCalendarOAuth2Api": {
          "id": "YOUR_GOOGLE_CALENDAR_CREDENTIAL_ID",
          "name": "Google Calendar OAuth2"
        }
      }
    },
    {
      "parameters": {
        "authentication": "serviceAccount",
        "operation": "append",
        "sheetId": {
          "__rl": true,
          "value": "1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w",
          "mode": "list"
        },
        "range": {
          "__rl": true,
          "value": "Sheet1",
          "mode": "list"
        },
        "options": {},
        "fieldsUi": {
          "values": [
            {
              "fieldId": "name",
              "fieldValue": "={{ $json.customerName || $json.body.customerName }}"
            },
            {
              "fieldId": "phone_number",
              "fieldValue": "={{ $json.customerPhone || $json.body.customerPhone }}"
            },
            {
              "fieldId": "email",
              "fieldValue": "={{ $json.customerEmail || $json.body.customerEmail }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "APPOINTMENT_BOOKED"
            },
            {
              "fieldId": "notes",
              "fieldValue": "={{ $json.notes || $json.body.notes }}"
            },
            {
              "fieldId": "calendatEventId",
              "fieldValue": "={{ $('Create Google Calendar Event').item.json.id }}"
            },
            {
              "fieldId": "appointmentDate",
              "fieldValue": "={{ $json.appointmentDate || $json.body.appointmentDate }}"
            },
            {
              "fieldId": "appointmentTime",
              "fieldValue": "={{ $json.appointmentTime || $json.body.appointmentTime }}"
            }
          ]
        }
      },
      "id": "google-sheets",
      "name": "Update Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.3,
      "position": [650, 300],
      "credentials": {
        "googleSheetsApi": {
          "id": "google-sheets-credential-id",
          "name": "Google Sheets Account"
        }
      }
    },
    {
      "parameters": {
        "fromNumber": "+19257226886",
        "toNumber": "={{ $json.customerPhone || $json.body.customerPhone }}",
        "message": "={{ 'Hi ' + ($json.customerName || $json.body.customerName) + '! Your ' + ($json.appointmentService || $json.body.appointmentService || 'appointment') + ' is confirmed for ' + ($json.appointmentDate || $json.body.appointmentDate) + ' at ' + ($json.appointmentTime || $json.body.appointmentTime) + '. We look forward to seeing you!' }}",
        "options": {}
      },
      "id": "twilio-sms",
      "name": "Send SMS Confirmation",
      "type": "n8n-nodes-base.twilio",
      "typeVersion": 1,
      "position": [850, 300],
      "credentials": {
        "twilioApi": {
          "id": "YOUR_TWILIO_CREDENTIAL_ID",
          "name": "Twilio API"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"message\": \"Appointment booked and calendar event created\", \"eventId\": $('Create Google Calendar Event').item.json.id } }}"
      },
      "id": "respond-webhook",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Create Google Calendar Event",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Google Calendar Event": {
      "main": [
        [
          {
            "node": "Update Google Sheets",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update Google Sheets": {
      "main": [
        [
          {
            "node": "Send SMS Confirmation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send SMS Confirmation": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 0,
  "versionId": "1"
}
```
