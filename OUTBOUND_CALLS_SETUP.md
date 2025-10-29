# Otto Outbound Calls Setup Guide

## 🎯 Current Situation

Your Otto agent is configured with:
- **Agent ID**: `agent_2201k8q07eheexe8j4vkt0b9vecb`
- **Phone Number**: `+18884118568` (ElevenLabs-managed, Twilio provider)
- **Twilio Account**: Test account (limited features)

### ✅ What Works Now:
- **INBOUND calls**: People can call `+18884118568` and talk to Otto ✅
- **Web chat**: Otto works in browser via widget ✅
- **n8n webhooks**: Otto can receive and process data ✅

### ❌ What Doesn't Work:
- **OUTBOUND calls via API**: Requires paid Twilio account or ElevenLabs enterprise plan ❌

---

## 🚀 Solutions for Making Outbound Calls

### **Option 1: Use ElevenLabs Dashboard (Easiest - Works Now!)**

**Steps:**
1. Go to your Otto agent: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
2. Click the **phone icon** or **"Make a call"** button
3. Enter the phone number (E.164 format: `+19184700208`)
4. Click **"Call"** to initiate

**Pros:**
- ✅ Works immediately
- ✅ No additional setup required
- ✅ Uses your existing ElevenLabs credits
- ✅ Full conversation analytics

**Cons:**
- ❌ Manual process (not automated)
- ❌ Can't be triggered from n8n directly

**Best for:** Testing, manual follow-ups, one-off calls

---

### **Option 2: Upgrade Twilio Account (Recommended for Automation)**

**Steps:**
1. Go to Twilio Console: https://console.twilio.com
2. Upgrade from **Test Account** to **Paid Account**
   - Add payment method
   - Verify your business
3. Purchase a phone number:
   - Go to **Phone Numbers** → **Buy a Number**
   - Choose a local or toll-free number
   - Cost: ~$1-2/month + usage
4. Configure the number to connect to ElevenLabs:
   - Set Voice webhook to: `https://ottoagent.net/api/twilio/voice`
   - This TwiML will connect calls to Otto agent

**Pros:**
- ✅ Full automation via API
- ✅ Works with n8n workflows
- ✅ Scalable for high volume
- ✅ Complete control

**Cons:**
- ❌ Requires paid Twilio account (~$20 minimum)
- ❌ Additional monthly costs

**Best for:** Production use, automated campaigns, high volume

**Cost Estimate:**
- Twilio phone number: $1-2/month
- Outbound calls: $0.013/minute
- ElevenLabs: Based on your plan
- Total: ~$25-50/month for moderate use

---

### **Option 3: Use n8n with ElevenLabs Widget (Hybrid Approach)**

**Steps:**
1. Create a web page with ElevenLabs widget
2. Use n8n to send SMS with link to the page
3. Customer clicks link and talks to Otto in browser

**Implementation:**
```html
<!-- otto-call.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Talk to Otto</title>
    <script src="https://elevenlabs.io/convai-widget/index.js"></script>
</head>
<body>
    <h1>Otto is ready to help!</h1>
    <elevenlabs-convai agent-id="agent_2201k8q07eheexe8j4vkt0b9vecb"></elevenlabs-convai>
</body>
</html>
```

**n8n Workflow:**
1. Trigger: New appointment reminder needed
2. Send SMS via Twilio:
   ```
   Hi {{name}}! Otto has an update about your appointment.
   Click here to talk: https://ottoagent.net/otto-call.html?customer={{id}}
   ```
3. Customer clicks link → talks to Otto in browser

**Pros:**
- ✅ Works with test Twilio account
- ✅ No outbound call costs
- ✅ Can be automated via n8n
- ✅ Customer initiates (better compliance)

**Cons:**
- ❌ Requires customer to click link
- ❌ Not a true phone call
- ❌ Requires internet connection

**Best for:** Cost-conscious automation, TCPA compliance

---

### **Option 4: ElevenLabs Enterprise Plan**

Contact ElevenLabs sales for:
- Direct API access for outbound calls
- Higher rate limits
- Dedicated support
- Custom integrations

**Best for:** Large-scale operations, enterprise needs

---

## 🎯 Recommended Path Forward

### **For Testing (Right Now):**
Use **Option 1** - ElevenLabs Dashboard
- Go to: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
- Click "Make a call"
- Test Otto with real phone calls

### **For Production (Next Week):**
Use **Option 2** - Upgrade Twilio
- Cost: ~$20 initial + $25-50/month
- Full automation with n8n
- Scalable solution

### **For Budget-Conscious:**
Use **Option 3** - Hybrid SMS + Web Widget
- Works with current setup
- No additional costs
- Good for appointment reminders

---

## 🔧 How to Implement Option 2 (Twilio Upgrade)

### **Step 1: Upgrade Twilio Account**
```bash
# Go to Twilio Console
https://console.twilio.com/billing/upgrade

# Add payment method
# Minimum: $20 initial credit
```

### **Step 2: Buy a Phone Number**
```bash
# Go to Phone Numbers
https://console.twilio.com/us1/develop/phone-numbers/manage/search

# Search for a number in your area
# Purchase it ($1-2/month)
```

### **Step 3: Configure the Number**
In Twilio Console:
1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click your new number
3. Under **Voice Configuration**:
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://ottoagent.net/api/twilio/voice`
   - **HTTP**: POST
4. Under **Messaging Configuration**:
   - **A MESSAGE COMES IN**: Webhook
   - **URL**: `https://ottoagent.net/api/twilio/sms`
   - **HTTP**: POST
5. Click **Save**

### **Step 4: Update Your .env**
```bash
# Update with your new Twilio number
TWILIO_PHONE_NUMBER="+1XXXXXXXXXX"  # Your new number
```

### **Step 5: Test Outbound Call**
```bash
# Update make-otto-call.sh with your new number
# Then run:
./make-otto-call.sh
```

---

## 🧪 Testing Checklist

### **Test 1: Inbound Call (Works Now)**
```bash
# Call this number from your phone:
+18884118568

# Expected: Otto answers and talks to you
```

### **Test 2: Web Widget (Works Now)**
```bash
# Open in browser:
https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb

# Click "Start conversation"
# Expected: Otto talks to you in browser
```

### **Test 3: Outbound Call (After Twilio Upgrade)**
```bash
# Run the script:
./make-otto-call.sh

# Enter your phone number
# Expected: You receive a call from Otto
```

### **Test 4: n8n Integration (After Twilio Upgrade)**
```bash
# In n8n, create HTTP Request node:
POST https://api.twilio.com/2010-04-01/Accounts/{{ACCOUNT_SID}}/Calls.json

Body:
- Url: https://ottoagent.net/api/twilio/voice
- To: +19184700208
- From: {{YOUR_TWILIO_NUMBER}}

# Expected: Call is made to the number
```

---

## 💰 Cost Comparison

| Option | Setup Cost | Monthly Cost | Per Call | Best For |
|--------|-----------|--------------|----------|----------|
| **Dashboard** | $0 | $0 | Manual | Testing |
| **Twilio Paid** | $20 | $1-2 + usage | $0.013/min | Production |
| **SMS + Widget** | $0 | $0 | $0.0075/SMS | Budget |
| **Enterprise** | Contact Sales | Custom | Custom | Scale |

---

## 🎯 Quick Start (Right Now)

**Want to test Otto making calls RIGHT NOW?**

1. Open this URL: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
2. Click the **phone icon** (📞) in the top right
3. Enter your phone number: `+19184700208`
4. Click **"Call"**
5. Answer your phone and talk to Otto!

**This works immediately with no additional setup!**

---

## 📞 Support

- **ElevenLabs Support**: https://elevenlabs.io/support
- **Twilio Support**: https://support.twilio.com
- **n8n Community**: https://community.n8n.io

---

## 🔗 Useful Links

- **Otto Agent**: https://elevenlabs.io/app/talk-to?agent_id=agent_2201k8q07eheexe8j4vkt0b9vecb
- **n8n Workflow**: https://dualpay.app.n8n.cloud/workflow/KhRUxjHicIxXKfIK
- **Twilio Console**: https://console.twilio.com
- **Integration Guide**: `N8N_ELEVENLABS_INTEGRATION.md`

---

**Need help deciding? Here's my recommendation:**

1. **Today**: Test with ElevenLabs dashboard (Option 1)
2. **This week**: Decide if you need automation
3. **If yes**: Upgrade Twilio account (Option 2)
4. **If no**: Use SMS + Widget approach (Option 3)

The integration is ready - you just need to choose your outbound calling method! 🚀

