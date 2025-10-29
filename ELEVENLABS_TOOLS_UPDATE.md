# Update ElevenLabs Otto Tools - URL Mapping 🔧

## 🎯 Current vs Correct URLs

You have the tools configured, but they're pointing to the wrong endpoints. Here's what needs to be updated:

---

## 📋 Tools That Need URL Updates

### ✅ **1. create_appointment**

**Current URL:**
```
https://dualpay.app.n8n.cloud/webhook-test/dental-webhook
```

**Update to:**
```
https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

**Why:** Your n8n workflow should use the `otto/appointment-request` path, not the dental webhook test path.

---

### ✅ **2. get_availability**

**Current URL:**
```
https://dualpay.app.n8n.cloud/webhook-test/dental-webhook
```

**Update to:**
```
https://ottoagent.net/api/appointments/availability/{date}
```

**Or create n8n workflow:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-availability
```

**Why:** This should check your actual Otto database for available slots, not a dental test webhook.

---

### ✅ **3. cancel_appointment**

**Current URL:**
```
https://dualpay.app.n8n.cloud/webhook/cancel-appointment
```

**Keep this URL** ✅ (Already correct!)

But make sure the n8n workflow exists at this path.

---

### ✅ **4. reschedule_appointment**

**Current URL:**
```
https://dualpay.app.n8n.cloud/webhook/reschedule-appointment
```

**Keep this URL** ✅ (Already correct!)

But make sure the n8n workflow exists at this path.

---

### ✅ **5. create_lead**

**Current URL:**
```
https://97404b1e430d.ngrok-free.app/api/leads/intake
```

**Update to:**
```
https://ottoagent.net/api/leads
```

**Why:** ngrok tunnels are temporary. Use your production Otto server instead.

---

### ✅ **6. check_inventory**

**Current URL:**
```
https://api.yorkai.co/inventory/search
```

**Update to:**
```
https://ottoagent.net/api/vehicles
```

**Or:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-inventory
```

**Why:** Your vehicle inventory is in the Otto database, not YorkAI.

---

### ✅ **7. get_service_status**

**Current URL:**
```
https://api.yorkai.co/service/status
```

**Update to:**
```
https://ottoagent.net/api/service-requests
```

**Or:**
```
https://dualpay.app.n8n.cloud/webhook/otto/service-status
```

**Why:** Service requests are tracked in your Otto database.

---

### ✅ **8. log_conversation**

**Current URL:**
```
https://api.yorkai.co/logs/conversation
```

**Update to:**
```
https://ottoagent.net/api/calls
```

**Or:**
```
https://dualpay.app.n8n.cloud/webhook/otto/log-call
```

**Why:** Call logs should be stored in your Otto database.

---

### ✅ **9. update_lead_status**

**Current URL:**
```
https://api.yorkai.co/leads/update
```

**Update to:**
```
https://ottoagent.net/api/leads/{leadId}
```

**Method:** `PUT` or `PATCH`

**Why:** Lead data is in your Otto CRM.

---

## 🔧 Tools That Can Stay (External Services)

These tools can keep their current URLs if they're external services:

### ✅ **Keep as-is:**

1. **send_email_summary** - `https://api.yorkai.co/notifications/email`
   - If this is a working email service, keep it

2. **send_followup_sms** - `https://api.yorkai.co/notifications/sms`
   - If this is a working SMS service, keep it

3. **verify_customer_identity** - `https://api.yorkai.co/verify/identity`
   - If this is a KYC service, keep it

4. **get_financing_info** - `https://api.yorkai.co/finance/info`
   - If this is a financing API, keep it

5. **trigger_payment_link** - `https://api.yorkai.co/payments/create`
   - If this is a payment processor, keep it

---

## 📊 Complete URL Mapping Table

| Tool Name | Current URL | New URL | Status |
|-----------|-------------|---------|--------|
| `create_appointment` | `dualpay.app.n8n.cloud/webhook-test/dental-webhook` | `dualpay.app.n8n.cloud/webhook/otto/appointment-request` | ⚠️ Update |
| `get_availability` | `dualpay.app.n8n.cloud/webhook-test/dental-webhook` | `ottoagent.net/api/appointments/availability/{date}` | ⚠️ Update |
| `cancel_appointment` | `dualpay.app.n8n.cloud/webhook/cancel-appointment` | Same | ✅ OK |
| `reschedule_appointment` | `dualpay.app.n8n.cloud/webhook/reschedule-appointment` | Same | ✅ OK |
| `create_lead` | `97404b1e430d.ngrok-free.app/api/leads/intake` | `ottoagent.net/api/leads` | ⚠️ Update |
| `check_inventory` | `api.yorkai.co/inventory/search` | `ottoagent.net/api/vehicles` | ⚠️ Update |
| `get_service_status` | `api.yorkai.co/service/status` | `ottoagent.net/api/service-requests` | ⚠️ Update |
| `log_conversation` | `api.yorkai.co/logs/conversation` | `ottoagent.net/api/calls` | ⚠️ Update |
| `update_lead_status` | `api.yorkai.co/leads/update` | `ottoagent.net/api/leads/{leadId}` | ⚠️ Update |
| `send_email_summary` | `api.yorkai.co/notifications/email` | Same (if working) | ✅ OK |
| `send_followup_sms` | `api.yorkai.co/notifications/sms` | Same (if working) | ✅ OK |

---

## 🚀 Quick Update Steps

### **Step 1: Open ElevenLabs**
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Find: **Otto** (`agent_2201k8q07eheexe8j4vkt0b9vecb`)
3. Click: **"Edit"** or **"Configure"**
4. Navigate to: **"Tools"** section

### **Step 2: Update Each Tool**

For each tool in the "⚠️ Update" list:
1. Click on the tool name
2. Find the **"URL"** or **"Endpoint"** field
3. Replace with the new URL from the table above
4. Click **"Save"**

### **Step 3: Test**

Call Otto and say:
```
"I'd like to book an appointment for an oil change"
```

Otto should now call the correct endpoint!

---

## 🔍 Why These Changes?

### **Problem 1: Dental Webhook**
Your appointment tools were pointing to a **dental test webhook**. You're running an **automotive** business, so this won't work.

### **Problem 2: ngrok Tunnel**
The `create_lead` tool uses an **ngrok tunnel** (`97404b1e430d.ngrok-free.app`). These are temporary and will break when you restart ngrok.

### **Problem 3: YorkAI API**
Many tools point to `api.yorkai.co`. If this is a different system, the data won't sync with your Otto database.

---

## 🧪 Testing Each Tool

After updating, test each tool:

### **Test create_appointment:**
```
Call: +18884118568
Say: "I need to schedule an oil change"
Expected: Otto books appointment in your database
```

### **Test get_availability:**
```
Say: "What times are available tomorrow?"
Expected: Otto checks your calendar and responds with open slots
```

### **Test create_lead:**
```
Say: "I'm interested in buying a car"
Expected: Otto creates a lead in your CRM
```

### **Test check_inventory:**
```
Say: "Do you have any Mercedes in stock?"
Expected: Otto searches your vehicle database
```

---

## ⚠️ Important: n8n Workflows Needed

After updating the URLs, you need to create these n8n workflows:

1. **`otto/appointment-request`** - Handles appointment booking
2. **`otto/check-availability`** - Returns available time slots
3. **`otto/check-inventory`** - Searches vehicle inventory
4. **`otto/service-status`** - Gets service request status
5. **`otto/log-call`** - Logs call to database

**Templates available in:**
- `n8n-workflow-appointment-booking.json`
- `n8n-workflow-get-appointments.json`

---

## 📞 Need Help?

If you're unsure about:
1. **Which URLs to use** - Check if `api.yorkai.co` is a real service you're using
2. **Creating n8n workflows** - Import the JSON templates provided
3. **Testing** - Call `+18884118568` and try each function

---

## ✅ Quick Checklist

- [ ] Update `create_appointment` URL
- [ ] Update `get_availability` URL
- [ ] Update `create_lead` URL (remove ngrok)
- [ ] Update `check_inventory` URL
- [ ] Update `get_service_status` URL
- [ ] Update `log_conversation` URL
- [ ] Update `update_lead_status` URL
- [ ] Create n8n workflows for new endpoints
- [ ] Test each tool by calling Otto
- [ ] Verify data appears in Otto database

---

**Next Step:** Update the tool URLs in ElevenLabs, then test by calling Otto! 📞

