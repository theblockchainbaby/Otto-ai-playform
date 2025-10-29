# n8n Workflow Debugging Guide

## Problem: Validation Error on Active Workflow

Your n8n workflow is **active** but rejecting all webhook requests with:
```json
{"success":false,"error":"Missing required fields","message":"Phone number and date are required"}
```

## Root Cause Analysis

The error is coming from n8n **BEFORE** your workflow nodes execute. This means:

### Most Likely Causes:

1. **Hidden Validation Node**
   - There's a Function or IF node at the start that validates input
   - This node exists in n8n but wasn't exported to your JSON file
   - It's checking for `phone` and `date` at root level, not nested

2. **Webhook Response Configuration**
   - The webhook node might have "options" configured with validation
   - Check the "Webhook" node → "Options" tab in n8n
   - Look for "Response Data" or "Response Code" settings

3. **Workflow Version Mismatch**
   - Your JSON export shows `"active": false` (line 221)
   - But you say it's active in the UI
   - This suggests the JSON file is outdated

## How to Fix

### Step 1: Check for Hidden Nodes in n8n UI

1. Open workflow in n8n editor
2. Look for nodes **between** "Webhook" and "Create Appointment"
3. Specifically look for:
   - **Function** node (has JavaScript icon)
   - **IF** node (has branching icon)  
   - **Set** node (has gear icon)
   - **Code** node (has <> icon)

### Step 2: Check Webhook Node Configuration

1. Click on "Webhook - Appointment Request" node
2. Go to **"Options"** section (click "Add Option")
3. Check these settings:
   - ✅ Response Mode: Should be "Using 'Respond to Webhook' Node"
   - ✅ Response Data: Should be "All Entries"
   - ❌ NO custom validation should be set here

### Step 3: Add Debugging

Add a **Function node** right after the Webhook to log what data is received:

1. Click the + button between Webhook and HTTP Request nodes
2. Add **"Code"** or **"Function"** node
3. Add this code:

```javascript
// Log incoming data
console.log('Webhook received:', JSON.stringify($input.all(), null, 2));

// Check what fields exist
const data = $input.first().json;
console.log('Customer:', data.customer);
console.log('Intent:', data.intent);

// Pass data through unchanged
return $input.all();
```

4. Save and execute
5. Check n8n execution logs to see what data actually arrives

### Step 4: Check Workflow Execution History

1. Go to **"Executions"** tab in n8n
2. Look at recent failed executions
3. Click on any failed execution
4. Check which node is failing
5. See the actual error message

### Step 5: Test with n8n's Built-in Tester

1. Click on "Webhook - Appointment Request" node
2. Click **"Listen for Test Event"** button
3. n8n will start listening
4. Send your curl request
5. See if data arrives in n8n

If data arrives, the webhook is working. If not, there's a routing issue.

### Step 6: Create Minimal Test Workflow

Create a new simple workflow to test:

1. **New Workflow** button
2. Add **Webhook** node:
   - Path: `test/appointment`
   - Method: POST
3. Add **Respond to Webhook** node:
   - Response body: `{{ $json }}`
4. Connect them
5. Activate workflow
6. Test:

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook/test/appointment \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

If this works, your main workflow has hidden validation.

## Alternative: Check n8n Logs

If you have access to n8n server logs:

```bash
# Docker logs
docker logs -f n8n-container-name

# Or check n8n UI
# Settings → Log Streaming
```

Look for validation errors or exceptions.

## Quick Fix: Bypass Validation

If there IS a validation node you can't find:

### Option A: Clone and Simplify
1. Duplicate the workflow
2. Remove all nodes except: Webhook → Respond to Webhook
3. Test if webhook works
4. Add nodes back one by one

### Option B: Use webhook-test Path
Your earlier test used `/webhook-test/` - maybe that's the correct path?

Try:
```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"id":"york_123","name":"York","phone":"+19163337305","email":"york@eliteeighth.com"},
    "intent": {"appointmentType":"oil change","preferredDate":"2025-10-22","preferredTime":"10:00","notes":"Test"}
  }'
```

### Option C: Check n8n Webhook Settings

In n8n settings, check:
- **Webhook URL**: What's the actual base URL?
- **Path prefix**: Is there a prefix like `/webhook/` or `/webhook-test/`?

## Expected Working Flow

When properly configured, execution should be:

```
1. Webhook receives data ✅
2. Logs: "Webhook triggered with data: {...}"
3. HTTP Request node: Creates appointment
4. Logs: "Appointment created: ID xxx"
5. Twilio SMS: Sends confirmation
6. Logs: "SMS sent to +19163337305"
7. Respond to Webhook: Returns success
```

## Contact Me Back With:

Please check n8n UI and provide:

1. **Screenshot** of the full workflow (with all nodes visible)
2. **Execution logs** from a failed attempt
3. **Webhook URL** shown in the Webhook node
4. Any **Function/IF nodes** you see between Webhook and HTTP Request

This will help me identify the exact validation that's blocking requests!

---

**TL;DR**: There's a validation node or setting in your n8n workflow that wasn't exported to the JSON file. Check the n8n UI for hidden nodes or webhook options that are validating the input structure.