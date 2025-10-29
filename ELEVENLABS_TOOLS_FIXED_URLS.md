# ElevenLabs Tools - Fixed URLs (No Path Parameters) 🔧

## ⚠️ Common Issue: "Invalid URL" Error

ElevenLabs doesn't support path parameters like `{date}` in the URL field. You need to use **query parameters** instead.

---

## ✅ Corrected Tool URLs

### **1. create_appointment**

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/appointment-request
```

**Method:** `POST`

**Parameters:**
```json
{
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "appointmentType": "string",
  "preferredDate": "string",
  "preferredTime": "string",
  "notes": "string"
}
```

✅ **This URL is valid** - No path parameters

---

### **2. get_availability**

**❌ WRONG (Invalid URL):**
```
https://ottoagent.net/api/appointments/availability/{date}
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-availability
```

**Method:** `POST`

**Parameters:**
```json
{
  "date": "string",
  "duration": "number"
}
```

**Why:** ElevenLabs doesn't support `{date}` in the URL. Use a webhook that accepts the date as a POST parameter instead.

---

### **3. cancel_appointment**

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/cancel-appointment
```

**Method:** `POST`

**Parameters:**
```json
{
  "customerPhone": "string",
  "appointmentId": "string",
  "reason": "string"
}
```

✅ **This URL is valid**

---

### **4. reschedule_appointment**

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/reschedule-appointment
```

**Method:** `POST`

**Parameters:**
```json
{
  "customerPhone": "string",
  "appointmentId": "string",
  "newDate": "string",
  "newTime": "string"
}
```

✅ **This URL is valid**

---

### **5. create_lead**

**❌ WRONG (ngrok tunnel - temporary):**
```
https://97404b1e430d.ngrok-free.app/api/leads/intake
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/create-lead
```

**Method:** `POST`

**Parameters:**
```json
{
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "interest": "string",
  "source": "string",
  "notes": "string"
}
```

**Why:** ngrok URLs expire. Use n8n webhook instead.

---

### **6. check_inventory**

**❌ WRONG (External API):**
```
https://api.yorkai.co/inventory/search
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/check-inventory
```

**Method:** `POST`

**Parameters:**
```json
{
  "make": "string",
  "model": "string",
  "year": "number",
  "priceRange": "string"
}
```

**Why:** Your inventory is in the Otto database, not YorkAI.

---

### **7. get_service_status**

**❌ WRONG (External API):**
```
https://api.yorkai.co/service/status
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/service-status
```

**Method:** `POST`

**Parameters:**
```json
{
  "customerPhone": "string",
  "ticketId": "string"
}
```

**Why:** Service requests are in your Otto database.

---

### **8. log_conversation**

**❌ WRONG (External API):**
```
https://api.yorkai.co/logs/conversation
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/log-call
```

**Method:** `POST`

**Parameters:**
```json
{
  "callSid": "string",
  "customerPhone": "string",
  "transcript": "string",
  "duration": "number",
  "sentiment": "string"
}
```

**Why:** Call logs should be in your Otto database.

---

### **9. update_lead_status**

**❌ WRONG (External API with path parameter):**
```
https://api.yorkai.co/leads/update
```

**✅ CORRECT:**
```
https://dualpay.app.n8n.cloud/webhook/otto/update-lead
```

**Method:** `POST`

**Parameters:**
```json
{
  "leadId": "string",
  "status": "string",
  "notes": "string"
}
```

**Why:** Lead data is in your Otto CRM.

---

## 📋 Complete URL List (Copy-Paste Ready)

Use these exact URLs in ElevenLabs:

```
1. create_appointment
   https://dualpay.app.n8n.cloud/webhook/otto/appointment-request

2. get_availability
   https://dualpay.app.n8n.cloud/webhook/otto/check-availability

3. cancel_appointment
   https://dualpay.app.n8n.cloud/webhook/otto/cancel-appointment

4. reschedule_appointment
   https://dualpay.app.n8n.cloud/webhook/otto/reschedule-appointment

5. create_lead
   https://dualpay.app.n8n.cloud/webhook/otto/create-lead

6. check_inventory
   https://dualpay.app.n8n.cloud/webhook/otto/check-inventory

7. get_service_status
   https://dualpay.app.n8n.cloud/webhook/otto/service-status

8. log_conversation
   https://dualpay.app.n8n.cloud/webhook/otto/log-call

9. update_lead_status
   https://dualpay.app.n8n.cloud/webhook/otto/update-lead

10. get_customer_appointments
    https://dualpay.app.n8n.cloud/webhook/otto/get-appointments
```

---

## 🔧 n8n Workflows You Need to Create

For each webhook above, create an n8n workflow:

### **Workflow: otto/check-availability**

**Webhook Path:** `otto/check-availability`

**What it does:**
1. Receives date from Otto
2. Queries Otto database for appointments on that date
3. Calculates available time slots
4. Returns formatted list to Otto

**Example Response:**
```json
{
  "success": true,
  "date": "2025-10-25",
  "availableSlots": [
    "09:00 AM",
    "10:30 AM",
    "02:00 PM",
    "03:30 PM"
  ],
  "message": "We have 4 available slots on October 25th"
}
```

---

### **Workflow: otto/create-lead**

**Webhook Path:** `otto/create-lead`

**What it does:**
1. Receives lead data from Otto
2. Creates customer record in database (if new)
3. Creates lead record
4. Sends notification to sales team
5. Returns confirmation to Otto

**Example Response:**
```json
{
  "success": true,
  "leadId": "lead_123456",
  "message": "Lead created successfully. Sales team has been notified."
}
```

---

### **Workflow: otto/check-inventory**

**Webhook Path:** `otto/check-inventory`

**What it does:**
1. Receives search criteria from Otto
2. Queries vehicle database
3. Returns matching vehicles
4. Formats response for Otto to read

**Example Response:**
```json
{
  "success": true,
  "vehicles": [
    {
      "make": "Mercedes-Benz",
      "model": "C-Class",
      "year": 2024,
      "price": "$45,000",
      "stock": "In Stock"
    }
  ],
  "message": "We have 1 Mercedes-Benz C-Class available"
}
```

---

## ⚠️ Important: All URLs Must Be Valid

### **Valid URL Format:**
```
https://domain.com/path/to/endpoint
```

### **Invalid URL Formats (ElevenLabs will reject):**
```
❌ https://domain.com/path/{parameter}
❌ http://localhost:3000/api/endpoint
❌ domain.com/endpoint (missing https://)
❌ https://97404b1e430d.ngrok-free.app (temporary tunnel)
```

---

## 🧪 Testing Your URLs

Before adding to ElevenLabs, test each URL:

```bash
# Test appointment request
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+19184700208",
    "appointmentType": "oil_change",
    "preferredDate": "2025-10-25",
    "preferredTime": "14:00"
  }'

# Expected response:
# {"success": true, "message": "Appointment booked", "appointmentId": "apt_123"}
```

If you get a 404 error, the n8n workflow doesn't exist yet - create it first!

---

## ✅ Quick Checklist

- [ ] Remove all URLs with `{parameters}` in the path
- [ ] Replace ngrok URLs with n8n webhooks
- [ ] Replace `api.yorkai.co` URLs with n8n webhooks
- [ ] Use only `https://` URLs (no `http://`)
- [ ] Test each URL with curl before adding to ElevenLabs
- [ ] Create corresponding n8n workflows
- [ ] Update Otto dashboard agent ID (already done)

---

## 🚀 Next Steps

1. **Update ElevenLabs tools** with the URLs from the list above
2. **Create n8n workflows** for each webhook path
3. **Test** by calling Otto: `+18884118568`
4. **Verify** data appears in your Otto database

---

**All URLs are now valid and ready to use!** 🎉

