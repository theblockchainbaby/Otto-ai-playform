# AI Intent Router - Prompt Configuration

## 🎯 For n8n AI Agent Node

If you're using the **AI Agent** or **OpenAI Chat Model** node in n8n, here's what to configure:

---

## 📋 System Message (Instructions)

```
You are an AI routing assistant for Otto, an automotive service AI agent.

Your job is to analyze customer requests and determine their intent.

Always respond with ONLY a valid JSON object. No other text.

Available intents:
1. get_appointments - Customer wants to see existing appointments
2. book_appointment - Customer wants to book a new appointment
3. check_availability - Customer wants to see available time slots
4. service_status - Customer wants to check vehicle service status
5. general_inquiry - General questions or other requests

Response format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "extractedData": {
    "customerPhone": "phone if present",
    "customerName": "name if present",
    "serviceType": "service type if present",
    "preferredDate": "date if present",
    "preferredTime": "time if present"
  },
  "reasoning": "brief explanation"
}
```

---

## 💬 User Message (Prompt)

```
Analyze this customer request and determine the intent:

Customer Phone: {{ $json.customerPhone || 'not provided' }}
Customer Name: {{ $json.customerName || 'not provided' }}
Request: {{ $json.request || 'not provided' }}
Service Type: {{ $json.serviceType || 'not provided' }}
Preferred Date: {{ $json.preferredDate || 'not provided' }}
Preferred Time: {{ $json.preferredTime || 'not provided' }}

Full Request Data:
{{ JSON.stringify($json, null, 2) }}

Determine the intent and extract relevant data.
```

---

## 🔧 Alternative: Simple Code Node Approach

If you want to use a **Code node** instead of an AI node, here's the complete code:

### **Node Name:** AI Intent Router

### **Code:**

```javascript
// AI Intent Router - Determines customer intent using OpenAI

const requestData = $input.first().json;

// Extract request details
const customerRequest = requestData.request || '';
const customerPhone = requestData.customerPhone || '';
const customerName = requestData.customerName || '';
const serviceType = requestData.serviceType || '';
const preferredDate = requestData.preferredDate || '';
const preferredTime = requestData.preferredTime || '';

// Build the prompt
const systemPrompt = `You are an AI routing assistant for Otto, an automotive service AI agent.

Your job is to analyze customer requests and determine their intent.

Always respond with ONLY a valid JSON object. No other text.

Available intents:
1. get_appointments - Customer wants to see existing appointments
2. book_appointment - Customer wants to book a new appointment
3. check_availability - Customer wants to see available time slots
4. service_status - Customer wants to check vehicle service status
5. general_inquiry - General questions or other requests

Response format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "extractedData": {
    "customerPhone": "phone if present",
    "customerName": "name if present",
    "serviceType": "service type if present",
    "preferredDate": "date if present",
    "preferredTime": "time if present"
  },
  "reasoning": "brief explanation"
}`;

const userPrompt = `Analyze this customer request and determine the intent:

Customer Phone: ${customerPhone || 'not provided'}
Customer Name: ${customerName || 'not provided'}
Request: ${customerRequest || 'not provided'}
Service Type: ${serviceType || 'not provided'}
Preferred Date: ${preferredDate || 'not provided'}
Preferred Time: ${preferredTime || 'not provided'}

Full Request Data:
${JSON.stringify(requestData, null, 2)}

Determine the intent and extract relevant data.`;

// Get OpenAI API key from environment variable
const apiKey = $env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable not set');
}

// Call OpenAI API
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(`OpenAI API error: ${JSON.stringify(data)}`);
}

const aiResponse = data.choices[0].message.content;

return {
  response: aiResponse,
  originalRequest: requestData
};
```

---

## 🔑 Setting OpenAI API Key

### **Option 1: Environment Variable (Recommended)**

1. In n8n, go to **Settings** → **Environments**
2. Add variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (your OpenAI API key)
3. Save

### **Option 2: Hardcode in Code Node (Not Recommended)**

Replace this line:
```javascript
const apiKey = $env.OPENAI_API_KEY;
```

With:
```javascript
const apiKey = 'sk-proj-your-actual-api-key-here';
```

---

## 📊 Example Inputs and Outputs

### **Example 1: Get Appointments**

**Input:**
```json
{
  "customerPhone": "+19163337305",
  "request": "What appointments do I have?"
}
```

**Output:**
```json
{
  "response": "{\"intent\":\"get_appointments\",\"confidence\":0.95,\"extractedData\":{\"customerPhone\":\"+19163337305\"},\"reasoning\":\"Customer is asking about their existing appointments\"}",
  "originalRequest": {
    "customerPhone": "+19163337305",
    "request": "What appointments do I have?"
  }
}
```

---

### **Example 2: Book Appointment**

**Input:**
```json
{
  "customerPhone": "+19163337305",
  "customerName": "York",
  "request": "I want to book an oil change for tomorrow at 2 PM",
  "serviceType": "oil change",
  "preferredDate": "tomorrow",
  "preferredTime": "2:00 PM"
}
```

**Output:**
```json
{
  "response": "{\"intent\":\"book_appointment\",\"confidence\":0.98,\"extractedData\":{\"customerPhone\":\"+19163337305\",\"customerName\":\"York\",\"serviceType\":\"oil change\",\"preferredDate\":\"tomorrow\",\"preferredTime\":\"2:00 PM\"},\"reasoning\":\"Customer explicitly wants to book a service with specific details\"}",
  "originalRequest": {...}
}
```

---

## 🎯 Which Approach to Use?

### **Use Code Node (Recommended for You)**
- ✅ More control
- ✅ Easier to debug
- ✅ Works with environment variables
- ✅ No need to configure AI node credentials

### **Use AI Agent Node**
- ✅ Visual interface
- ✅ Built-in credential management
- ❌ More complex to set up

---

## 🚀 Quick Setup Steps

1. **Add Code node** after the webhook
2. **Copy the code** from above
3. **Set environment variable** `OPENAI_API_KEY` in n8n
4. **Test** with sample data
5. **Connect** to the Parse Intent node

---

## ✅ Testing

Test the AI router with this curl command:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/otto/ai-router \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+19163337305",
    "request": "I want to book an appointment"
  }'
```

You should see the AI determine the intent as `book_appointment`.

---

## 🔍 Troubleshooting

### **Error: OPENAI_API_KEY not set**
- Go to n8n Settings → Environments
- Add `OPENAI_API_KEY` variable
- Restart workflow

### **Error: OpenAI API error**
- Check your API key is valid
- Check you have credits in OpenAI account
- Check the error message in n8n execution logs

### **AI returns wrong intent**
- Adjust the temperature (lower = more deterministic)
- Add more examples to the system prompt
- Use `gpt-4` instead of `gpt-4o-mini` for better accuracy

---

## 📝 Summary

**For n8n AI Agent Node:**
- System Message: Copy the system prompt above
- User Message: `{{ JSON.stringify($json, null, 2) }}`

**For Code Node (Recommended):**
- Copy the complete code above
- Set `OPENAI_API_KEY` environment variable
- Test and deploy

---

**The Code Node approach is simpler and gives you more control!** 🚀

