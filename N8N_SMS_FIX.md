# Fix n8n SMS Node - Data Transformation Issue

## Problem
The SMS node is looking for `customer.phone` but the webhook receives `phone` at root level.

## Solution: Update "Validate & Clean Data" Node

### Step 1: Open Your n8n Workflow
Go to: https://dualpay.app.n8n.cloud

### Step 2: Click on "Validate & Clean Data" Node
This node needs to transform flat data into nested structure.

### Step 3: Update the Code/Function

Replace the node's code with this:

```javascript
// Get the incoming webhook data
const item = $input.first().json;

// Transform flat structure to nested structure expected by downstream nodes
const cleanedData = {
  customer: {
    id: item.customerId || `cust_${Date.now()}`,
    name: item.name || item.customerName || 'Unknown',
    phone: item.phone || item.customerPhone,
    email: item.email || item.customerEmail
  },
  intent: {
    appointmentType: item.appointmentType || item.type || 'Appointment',
    preferredDate: item.date || item.preferredDate,
    preferredTime: item.time || item.preferredTime || '10:00',
    notes: item.notes || ''
  },
  callId: item.callId || `call_${Date.now()}`
};

// Log for debugging
console.log('Cleaned data:', JSON.stringify(cleanedData, null, 2));

// Return the transformed data
return { json: cleanedData };
```

### Step 4: Save and Test

After saving, test again:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "15:00",
    "name": "York",
    "email": "york@eliteeighth.com",
    "appointmentType": "Full Service Inspection",
    "notes": "Test after data transformation fix"
  }'
```

---

## Alternative: Update SMS Node References

If you can't modify the Validate & Clean Data node, update each downstream node:

### In "Send Confirmation SMS" Node:
Change the "To Phone Number" field from:
```
={{ $('Webhook - Appointment Request').item.json.customer.phone }}
```

To:
```
={{ $('Validate & Clean Data').item.json.customer.phone }}
```

### In "Create Appointment" Node:
Update customer ID reference from:
```
={{ $json.customer.id }}
```

To:
```
={{ $('Validate & Clean Data').item.json.customer.id }}
```

---

## Quick Test Command

Once fixed, trigger the full workflow:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "16:00",
    "name": "York Test",
    "email": "york@eliteeighth.com",
    "appointmentType": "Oil Change & Inspection",
    "notes": "Full workflow test - should receive SMS"
  }'
```

You should receive an SMS at +19163337305 confirming the appointment!

---

## Expected Success Flow

1. ✅ Webhook receives data
2. ✅ Validate Required Fields (phone & date present)
3. ✅ Validate & Clean Data (transforms to nested structure)
4. ✅ Create Appointment (creates in Otto AI)
5. ✅ Send Confirmation SMS (Twilio sends to customer.phone)
6. ⏰ Wait 24 Hours
7. 📞 Make follow-up call

---

## Debug Tips

If SMS still fails:
1. Click on "Send Confirmation SMS" node
2. Check the "To Phone Number" field
3. Click "Test step" to see what value it's trying to use
4. Verify it shows "+19163337305" and not empty/undefined

The issue is just a data reference problem - easy fix in n8n! 🚀