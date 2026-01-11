# Otto AI Calendar & SMS Integration Setup Guide

**Date:** December 16, 2025  
**Objective:** Configure Otto to automatically create Google Calendar events and send SMS confirmations after booking appointments

---

## Problem Summary

Otto was making outbound calls successfully, but after booking appointments during calls, the workflow wasn't:
1. Creating Google Calendar events
2. Updating Google Sheets with appointment details
3. Sending SMS confirmations to customers

---

## Solution Overview

### 1. Created ElevenLabs Webhook Tool

Added a new tool called `notify_appointment_booked` that Otto calls after booking any appointment.

**Tool JSON Configuration:**
```json
{
  "type": "webhook",
  "name": "notify_appointment_booked",
  "description": "Call this after booking an appointment to send confirmation",
  "api_schema": {
    "url": "https://dualpay.app.n8n.cloud/webhook-test/elevenlabs-call-complete",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "appointment_data",
      "type": "object",
      "description": "Appointment details",
      "required": true,
      "properties": [
        {
          "id": "outcome",
          "type": "string",
          "description": "Set to APPOINTMENT_BOOKED",
          "dynamic_variable": "",
          "constant_value": "",
          "value_type": "llm_prompt",
          "required": true
        },
        {
          "id": "customerName",
          "type": "string",
          "description": "Customer full name",
          "dynamic_variable": "",
          "constant_value": "",
          "value_type": "llm_prompt",
          "required": true
        },
        {
          "id": "customerPhone",
          "type": "string",
          "description": "Customer phone number",
          "dynamic_variable": "",
          "constant_value": "",
          "value_type": "llm_prompt",
          "required": true
        },
        {
          "id": "appointmentDate",
          "type": "string",
          "description": "Date in YYYY-MM-DD format",
          "dynamic_variable": "",
          "constant_value": "",
          "value_type": "llm_prompt",
          "required": true
        },
        {
          "id": "appointmentTime",
          "type": "string",
          "description": "Time in HH:MM format",
          "dynamic_variable": "",
          "constant_value": "",
          "value_type": "llm_prompt",
          "required": true
        }
      ]
    },
    "request_headers": []
  },
  "response_timeout_secs": 20
}
```

---

### 2. Updated Agent System Prompt

Added instruction at the end of system prompt:

```
IMPORTANT: After successfully booking ANY appointment, you MUST immediately call the notify_appointment_booked tool with all the appointment details before ending the conversation. This creates the calendar event and sends confirmation.
```

**Updated Confirmation Flow (Step 5):**
```
5. Confirm their name and phone number
You already have their information from the outbound call system.
Say: "And just to confirm, I have you listed as [CUSTOMER_NAME] at [PHONE_NUMBER]. Is that correct?"
Wait for them to verbally confirm or correct the information.
Do NOT ask them to provide it - only confirm what you already have.
```

---

### 3. Fixed n8n Workflow Data Flow

**Issue:** Webhook data wasn't being properly extracted, causing `null` values in Calendar node.

**Solution:** Need to fix Edit Fields2 or Code in JavaScript1 node to properly map webhook data.

**Pending Fix Options:**

**Option A - Update Edit Fields2:**
Map fields directly from webhook:
- `dynamic_variables.customerPhone` = `{{ $json.customerPhone }}`
- `dynamic_variables.customerName` = `{{ $json.customerName }}`
- `dynamic_variables.customerEmail` = `{{ $json.customerEmail }}`
- `dynamic_variables.appointmentDate` = `{{ $json.appointmentDate }}`
- `dynamic_variables.appointmentTime` = `{{ $json.appointmentTime }}`
- `dynamic_variables.appointmentService` = `{{ $json.appointmentService }}`

**Option B - Simplify Workflow:**
Delete Edit Fields2 and Code in JavaScript1, connect Webhook1 → If1 directly, then update all downstream nodes to reference `{{ $json.appointmentDate }}` instead of `{{ $json.dynamic_variables.appointmentDate }}`

---

### 4. Google Calendar Node Configuration

**Start Time:**
```
={{ $json.dynamic_variables.appointmentDate + 'T' + $json.dynamic_variables.appointmentTime + ':00' }}
```

**End Time (1 hour later):**
```
={{ $json.dynamic_variables.appointmentDate + 'T' + String(Number($json.dynamic_variables.appointmentTime.split(':')[0]) + 1).padStart(2, '0') + ':' + $json.dynamic_variables.appointmentTime.split(':')[1] + ':00' }}
```

---

### 5. SMS Node Configuration

**Updated "From" number:**
- Old: `+18884118568`
- New: `+19257226886`

---

## Testing

**Test webhook manually:**
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/elevenlabs-call-complete \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "APPOINTMENT_BOOKED",
    "customerName": "JR Sims",
    "customerPhone": "2792159834",
    "customerEmail": "jrsims@example.com",
    "appointmentDate": "2025-12-18",
    "appointmentTime": "11:00",
    "appointmentService": "Oil Change"
  }'
```

**Expected Results:**
1. Google Calendar event created for Dec 18, 2025 at 11:00 AM
2. Google Sheets row updated with appointment details
3. SMS sent to customer from +19257226886

---

## Complete Workflow Flow

1. **Cron** triggers at scheduled time
2. **Google Sheets - Fetch Leads** reads customer list
3. **Split In Batches** (size: 1) loops through each lead
4. **Edit Fields** prepares call data
5. **Code in JavaScript** formats data
6. **Make Call HTTP Request** → calls backend API
7. **If** checks if call was successful
8. **Update row in sheet** marks as called
9. *Loop back to Split In Batches for next lead*

**Separate Appointment Workflow (triggered by webhook):**

1. **Webhook1** receives data from ElevenLabs (when Otto calls `notify_appointment_booked`)
2. **Edit Fields2** extracts customer/appointment data (NEEDS FIX)
3. **Code in JavaScript1** formats data structure (NEEDS FIX)
4. **If1** checks if `outcome === "APPOINTMENT_BOOKED"`
5. **Create an event** → Google Calendar
6. **Append or update row in sheet** → Google Sheets
7. **Send SMS** → Twilio confirmation text

---

## ElevenLabs Voice Settings

**Recommended for Professional Outbound Calls:**
- **TTS Model:** Eleven Flash (Fastest)
- **Stability:** 65% (right of center)
- **Speed:** 55% (slightly right of center)
- **Similarity:** 75% (high, towards right)

---

## Current Issues to Resolve

1. ✅ **Data not flowing from Webhook to Calendar** - Fixed by creating simplified workflow `n8n-workflow-appointment-booking-fixed.json` with direct mappings and correct date formatting.
   - Removed `Edit Fields2` and `Code in JavaScript1` nodes
   - Connected Webhook directly to Google Calendar
   - Added Google Sheets update node
   - Verified Twilio number `+19257226886`

2. ✅ **Phone number updated** - Now using correct 925 number for SMS
3. ✅ **ElevenLabs tool created** - `notify_appointment_booked` working
4. ✅ **System prompt updated** - Otto knows to call webhook after booking

---

## Next Steps

1. **Manual Webhook Test:** Click "Execute Workflow" in n8n, then run the curl command below to verify the workflow logic.
2. **Live Call Test:** Call Otto and book an appointment to verify the full integration.
3. **Verification:** Check Google Calendar, Google Sheets, and your phone for the SMS.

## Testing Commands

**1. Manual Webhook Test:**
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/elevenlabs-call-complete \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "APPOINTMENT_BOOKED",
    "customerName": "Test User",
    "customerPhone": "+19257226886",
    "customerEmail": "test@example.com",
    "appointmentDate": "2025-12-20",
    "appointmentTime": "14:00",
    "appointmentService": "Oil Change",
    "notes": "Testing n8n workflow"
  }'
```

**2. Live Call Test:**
Run this script to have Otto call you:
```bash
./make-otto-call.sh
```

---

## Key Files & URLs

- **n8n Workflow:** https://dualpay.app.n8n.cloud/workflow/y31DaKZyxgnFDxvX
- **Webhook URL:** https://dualpay.app.n8n.cloud/webhook-test/elevenlabs-call-complete
- **ElevenLabs Agent:** Otto Outbound Agent (`agent_...a2sfh2k2`)
- **Google Sheets:** lead_template
- **Backend API:** https://ottoagent.net/api/n8n/outbound/call-now

---

**Status:** 90% Complete - Just needs data flow fix in n8n workflow
