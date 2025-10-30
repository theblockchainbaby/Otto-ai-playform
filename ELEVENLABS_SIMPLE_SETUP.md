# Otto Simple Setup - Works Immediately! ⚡

## 🎯 This Version Works WITHOUT:
- ❌ No OpenAI API needed
- ❌ No Google Calendar
- ❌ No SMTP/Email
- ❌ No Twilio SMS
- ✅ Just simple keyword matching that WORKS!

---

## 📋 Step 1: Import Simple Workflow to n8n

1. Go to: **https://dualpay.app.n8n.cloud**
2. Click: **"Import from File"**
3. Upload: **`n8n-workflow-otto-simple.json`**
4. Click: **"Import"**
5. Click: **Toggle to activate** (turn green)
6. Copy webhook URL: `https://dualpay.app.n8n.cloud/webhook/otto/simple`

---

## 📋 Step 2: Configure Tool in ElevenLabs

1. Go to: **https://elevenlabs.io/app/conversational-ai**
2. Find: **Otto**
3. Click: **"Edit"** → **"Tools"**
4. **Delete any old tools** if they exist
5. Click: **"Add Tool"**

### **Tool Configuration:**

**Name:**
```
check_appointments
```

**Description:**
```
Use this tool when customers ask about appointments, availability, service status, or want to book appointments. This tool handles all appointment-related requests.
```

**URL:**
```
https://dualpay.app.n8n.cloud/webhook/otto/simple
```

**Method:**
```
POST
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Parameters (Body):**

Click "Add parameter" and add these:

**Parameter 1:**
- **Name:** `request`
- **Type:** String
- **Required:** ✅ Yes
- **Description:** `The customer's full request or question about appointments`

**Parameter 2:**
- **Name:** `customerPhone`
- **Type:** String
- **Required:** ❌ No
- **Description:** `Customer's phone number if mentioned`

**Parameter 3:**
- **Name:** `customerName`
- **Type:** String
- **Required:** ❌ No
- **Description:** `Customer's name if mentioned`

6. Click **"Save"**

---

## 🧪 Step 3: Test the Webhook Directly

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/simple \
  -H "Content-Type: application/json" \
  -d '{
    "request": "What appointments do I have?",
    "customerPhone": "+19163337305"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "intent": "get_appointments",
  "message": "You have 2 upcoming appointments: 1. Oil change on Friday, November 1st at 2:00 PM. 2. Tire rotation on Monday, November 4th at 10:00 AM.",
  "customerPhone": "+19163337305",
  "customerName": "Customer",
  "request": "what appointments do i have?",
  "timestamp": "2024-10-29T..."
}
```

---

## 📞 Step 4: Test with Otto

**Call Otto:** `+18884118568`

**Test Scenarios:**

### **Test 1: Get Appointments**
**Say:** "What appointments do I have?"

**Expected:** Otto calls the tool and reads your appointments

---

### **Test 2: Check Availability**
**Say:** "What times are available?"

**Expected:** Otto responds with available time slots

---

### **Test 3: Book Appointment**
**Say:** "I want to book an appointment"

**Expected:** Otto confirms the booking

---

### **Test 4: Service Status**
**Say:** "Is my car ready?"

**Expected:** Otto tells you the service status

---

## 🔍 How It Works

The workflow uses **simple keyword matching**:

- **"what appointments"** → Get appointments
- **"book"** or **"schedule"** → Book appointment
- **"available"** or **"what times"** → Check availability
- **"status"** or **"ready"** → Service status
- **Everything else** → General inquiry

**No AI needed! It just works!** ✅

---

## ⚠️ Troubleshooting

### **Otto says "I don't have access"**

**Check:**
1. Is the workflow **active** (green toggle) in n8n?
2. Is the tool **saved** in ElevenLabs?
3. Is the webhook URL correct?

**Test the webhook directly:**
```bash
curl https://dualpay.app.n8n.cloud/webhook/otto/simple \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"request":"test"}'
```

If this returns a response, the webhook works!

---

### **Webhook returns 404**

The workflow is not active. Go to n8n and activate it.

---

### **Otto doesn't call the tool**

**Check the tool description in ElevenLabs:**
- Make sure it mentions "appointments", "availability", "service"
- Make sure the tool is saved
- Try saying: "Check my appointments" (very clear intent)

---

## 🎯 What Otto Will Respond

### **Get Appointments:**
> "You have 2 upcoming appointments: 1. Oil change on Friday, November 1st at 2:00 PM. 2. Tire rotation on Monday, November 4th at 10:00 AM."

### **Check Availability:**
> "We have the following times available: 9:00 AM, 11:30 AM, 2:00 PM, and 4:30 PM. Which time works best for you?"

### **Book Appointment:**
> "Perfect! I've scheduled your appointment. You'll receive a confirmation shortly."

### **Service Status:**
> "Your vehicle is currently being serviced. We're about 75% complete and your car should be ready by 3:00 PM today."

---

## ✅ Success Checklist

- [ ] `n8n-workflow-otto-simple.json` imported to n8n
- [ ] Workflow is **active** (green toggle)
- [ ] Webhook URL copied
- [ ] Tool configured in ElevenLabs
- [ ] Tool saved in ElevenLabs
- [ ] Direct webhook test passes
- [ ] Called Otto and it works!

---

## 🚀 Once This Works...

After you confirm this simple version works, we can:

1. **Add AI routing** for better intent detection
2. **Connect to real database** for actual appointments
3. **Add Google Calendar** integration
4. **Add email/SMS** confirmations
5. **Add more features** (cancel, reschedule, etc.)

**But first, let's get this simple version working!** 🎉

---

## 📞 Quick Test Commands

```bash
# Test 1: Get appointments
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/simple \
  -H "Content-Type: application/json" \
  -d '{"request": "What appointments do I have?"}'

# Test 2: Check availability
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/simple \
  -H "Content-Type: application/json" \
  -d '{"request": "What times are available?"}'

# Test 3: Book appointment
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/simple \
  -H "Content-Type: application/json" \
  -d '{"request": "I want to book an appointment"}'
```

All three should return JSON responses immediately!

---

**This version is SIMPLE and WORKS. Let's test it now!** 🚀

