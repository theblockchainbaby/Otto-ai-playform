# Otto Appointment Booking Setup Guide

## Overview
Otto can now book appointments during outbound calls. When a customer agrees to an appointment, Otto will:
1. Save the appointment to your database
2. Create a Google Calendar event
3. Send SMS confirmation to the customer

## Setup Steps

### Step 1: Wait for Render Deployment (5 minutes)
The new `/api/n8n/book-appointment` endpoint is deploying to Render now. Wait ~90 seconds.

### Step 2: Import n8n Workflow

1. Go to https://dualpay.app.n8n.cloud/workflows
2. Click "+ Add workflow" → "Import from File"
3. Upload: `n8n-workflow-appointment-booking-complete.json`

### Step 3: Configure n8n Workflow Credentials

**A. Google Calendar Credential:**
1. Click on the "Create Google Calendar Event" node
2. Click "Select Credential" → "Create New"
3. Follow OAuth flow to connect your Google Calendar
4. Select which calendar to use (usually "primary")

**B. Twilio Credential (if not already set up):**
1. Click on the "Send SMS Confirmation" node  
2. Click "Select Credential" → "Create New" (or select existing)
3. Enter:
   - Account SID: `[YOUR_TWILIO_SID]`
   - Auth Token: `[YOUR_TWILIO_AUTH_TOKEN]`

### Step 4: Activate the Workflow

1. Click "Save" in the workflow
2. Toggle "Active" at the top
3. Copy the webhook URL (will look like: `https://dualpay.app.n8n.cloud/webhook/otto/appointment-booked`)

### Step 5: Configure Otto's ElevenLabs Agent

Now we need to add a "Book Appointment" tool to Otto's agent:

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Click on your Otto agent (`agent_8401k9gvthgyepjth51ya2sfh2k2`)
3. Go to **"Tools"** tab
4. Click **"Add Tool"** → **"Custom Tool"**

**Tool Configuration:**

**Name:** `book_appointment`

**Description:**
```
Books an appointment for the customer. Use this when the customer agrees to schedule a service appointment, test drive, or consultation. Ask for their preferred date and time before calling this tool.
```

**Parameters (click "Add Parameter" for each):**

1. **customerName**
   - Type: String
   - Required: Yes
   - Description: "Full name of the customer"

2. **customerPhone**
   - Type: String
   - Required: Yes
   - Description: "Customer's phone number in format +1XXXXXXXXXX"

3. **customerEmail**
   - Type: String
   - Required: No
   - Description: "Customer's email address for calendar invite"

4. **appointmentDate**
   - Type: String
   - Required: Yes
   - Description: "Date in YYYY-MM-DD format (e.g., 2025-11-15)"

5. **appointmentTime**
   - Type: String
   - Required: Yes
   - Description: "Time in 12-hour format (e.g., '10:00 AM', '2:30 PM')"

6. **appointmentType**
   - Type: String
   - Required: No
   - Description: "Type of appointment (e.g., 'Service Appointment', 'Test Drive', 'Consultation')"

7. **notes**
   - Type: String
   - Required: No
   - Description: "Any special notes or requests from the customer"

**Webhook URL:**
```
https://ottoagent.net/api/n8n/book-appointment
```

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

5. Click **"Save Tool"**

### Step 6: Update Otto's System Prompt (Optional but Recommended)

Add this to Otto's conversation instructions:

```
When a customer expresses interest in scheduling an appointment:
1. Ask for their preferred date and time
2. Confirm the details (date, time, type of appointment)
3. Use the book_appointment tool to create the appointment
4. Confirm that the appointment is booked and they'll receive an SMS confirmation

Available appointment types:
- Service Appointment (oil change, maintenance, repairs)
- Test Drive
- Sales Consultation
- Vehicle Pickup/Delivery
```

### Step 7: Test the Complete Flow

1. Run your n8n outbound calling workflow
2. When Otto calls you, say: "I'd like to schedule a service appointment"
3. Provide a date and time when Otto asks
4. Otto should book the appointment
5. Check:
   - ✅ Appointment saved in database (check your database or dashboard)
   - ✅ Google Calendar event created
   - ✅ SMS confirmation sent to your phone

## How It Works

```
Otto Outbound Call
     ↓
Customer agrees to appointment
     ↓
Otto calls book_appointment tool
     ↓
POST https://ottoagent.net/api/n8n/book-appointment
     ↓
Saves to database
     ↓
Triggers n8n webhook
     ↓
Creates Google Calendar event
     ↓
Sends SMS confirmation
     ↓
Returns success to Otto
     ↓
Otto confirms to customer
```

## Troubleshooting

**If appointments aren't saving to database:**
- Check Render logs for database connection errors
- Appointments will still be created in Google Calendar

**If Google Calendar events aren't created:**
- Check n8n execution history for errors
- Verify Google Calendar credential is connected
- Check calendar permissions

**If SMS confirmations aren't sent:**
- Verify Twilio credential in n8n
- Check Twilio console for delivery status
- Verify phone numbers are in E.164 format (+1XXXXXXXXXX)

## What You'll See

**Customer Experience:**
1. Receives call from Otto
2. Discusses appointment needs
3. Provides preferred date/time
4. Receives SMS confirmation immediately
5. Gets Google Calendar invite (if email provided)

**Your Experience:**
1. Appointment appears in Google Calendar
2. Appointment saved in database
3. Can view in Otto dashboard
4. Automated reminders via Google Calendar

---

**Next Steps After Testing:**
- Add more appointment types to Otto's prompt
- Customize SMS confirmation message
- Set up email confirmations (optional)
- Add appointment reminders workflow
