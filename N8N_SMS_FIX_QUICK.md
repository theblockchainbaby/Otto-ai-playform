# Fix n8n SMS Error - Quick Guide

## Current Error
```
Bad request - please check your parameters
A 'To' phone number is required.
```

## Root Cause
The "Send Confirmation SMS" node is looking for `customer.phone` but the data structure is flat: `phone` (not nested under `customer`)

---

## Fix Method 1: Update SMS Node (FASTEST)

### 1. Click "Send Confirmation SMS" node

### 2. Find "To" field
Currently shows:
```
{{ $('Webhook - Appointment Request').item.json.customer.phone }}
```

### 3. Change to:
```
{{ $('Webhook - Appointment Request').item.json.phone }}
```

### 4. Also update the message body
Change from:
```
{{ $('Webhook - Appointment Request').item.json.customer.name }}
```

To:
```
{{ $('Webhook - Appointment Request').item.json.name }}
```

And update appointment type/date/time fields similarly:
```
{{ $('Webhook - Appointment Request').item.json.appointmentType }}
{{ $('Webhook - Appointment Request').item.json.date }}
{{ $('Webhook - Appointment Request').item.json.time }}
```

---

## Fix Method 2: Add Data Transformation (BETTER LONG-TERM)

If you want to keep the `customer.phone` structure in downstream nodes, fix the "Validate & Clean Data" node:

### 1. Open "Validate & Clean Data" node

### 2. Switch to "JSON" mode (not Manual Mapping)

### 3. Use this code:
```javascript
return items.map(item => ({
  json: {
    customer: {
      phone: item.json.phone,
      name: item.json.name,
      email: item.json.email
    },
    intent: {
      preferredDate: item.json.date,
      preferredTime: item.json.time,
      appointmentType: item.json.appointmentType
    },
    notes: item.json.notes,
    // Also pass through original flat structure for compatibility
    phone: item.json.phone,
    name: item.json.name,
    date: item.json.date,
    time: item.json.time,
    appointmentType: item.json.appointmentType
  }
}));
```

This creates BOTH structures so nodes can reference either format.

---

## Quick Test After Fix

After updating the SMS node, click **"Execute step"** button (top right) to test just that node.

Or trigger the full workflow again:
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "14:00",
    "name": "York",
    "appointmentType": "SMS Fix Test"
  }'
```

---

## Expected Result After Fix

✅ SMS sends to +19163337305
✅ Message: "Your SMS Fix Test appointment is confirmed for October 23, 2025 at 14:00"
✅ Workflow continues to follow-up call

---

**Fix the SMS node "To" field now and try again!**
