# n8n Workflow: Test Without 24 Hour Wait

## Quick Instructions

### Option A: Modify Wait Duration (Recommended)
1. Open n8n workflow: https://dualpay.app.n8n.cloud
2. Find **"Wait 24 Hours"** node
3. Click on it
4. Change duration from **24 hours** to **1 minute**
5. Click **Save** (top right)
6. Trigger workflow again
7. You'll get SMS confirmation immediately, then call 1 minute later

### Option B: Remove Wait Node (Fastest Test)
1. Open n8n workflow
2. Click **"Wait 24 Hours"** node
3. Press **Delete** key (or right-click → Delete)
4. Connect **"Send Confirmation SMS"** output directly to **"Send 24hr Reminder SMS"** input
   - Drag from green dot on "Send Confirmation SMS" 
   - To the input dot on "Send 24hr Reminder SMS"
5. Click **Save**
6. Test immediately

---

## Test Command (After Modifying Workflow)

```bash
curl -X POST https://dualpay.app.n8n.cloud/webhook-test/otto/appointment-request \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+19163337305",
    "date": "2025-10-23",
    "time": "14:00",
    "name": "York",
    "email": "york@eliteeighth.com",
    "appointmentType": "Immediate Voice Test",
    "notes": "Testing full workflow with 1 minute wait"
  }'
```

---

## Expected Flow (With 1 Minute Wait)

1. **Immediate**: Webhook receives request
2. **Immediate**: Validates phone + date fields
3. **Immediate**: Calls POST /api/appointments (creates appointment)
4. **Immediate**: Sends SMS to +19163337305: "Your appointment is confirmed for 2025-10-23 at 14:00"
5. **⏰ Wait 1 minute**
6. **After 1 min**: Sends reminder SMS: "Reminder: Your appointment is tomorrow"
7. **After 1 min**: Makes voice call from +18884118568

---

## Expected Flow (Without Wait - Instant)

1. **Immediate**: All steps execute instantly
2. **Within 10 seconds**: You receive:
   - ✅ Confirmation SMS
   - ✅ Reminder SMS (would normally be 24 hours later)
   - ✅ Voice call from Otto AI

---

## Monitoring Execution

### In n8n Dashboard:
1. Go to **Executions** tab (left sidebar)
2. Find your latest execution
3. Click to see detailed flow
4. Check each node for:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - ⏸️ Blue pause icon = Waiting

### Check Your Phone:
- **SMS 1**: "Your Immediate Voice Test appointment is confirmed for October 23, 2025 at 14:00."
- **SMS 2** (after wait): "Reminder: Your appointment tomorrow at 14:00. Reply CANCEL to cancel."
- **Call**: Voice call from +18884118568

---

## Troubleshooting

### SMS Still Failing?
You need to fix the "Validate & Clean Data" node first:

1. Open that node in n8n
2. Switch from **Manual Mapping** to **JSON** mode
3. Replace code with:
```javascript
return {
  customer: {
    phone: items[0].json.phone,
    name: items[0].json.name,
    email: items[0].json.email
  },
  intent: {
    preferredDate: items[0].json.date,
    preferredTime: items[0].json.time,
    appointmentType: items[0].json.appointmentType
  },
  notes: items[0].json.notes
};
```
4. Save and test again

### Voice Call Not Coming?
- Check if `ELEVENLABS_API_KEY` is set (see ELEVENLABS_SETUP.md)
- Verify Twilio number +18884118568 can make calls
- Check n8n execution log for "Make Follow-up Call" node errors

### Execution Stops at Wait Node?
- If you set to 1 minute, execution will pause for 1 minute (this is normal)
- Check back after the wait period
- Or remove the wait entirely for instant testing

---

## After Testing: Restore 24 Hour Wait

Once you've verified everything works:

1. Re-add or re-connect the **"Wait 24 Hours"** node
2. Change duration back to **24 hours** (or **1 day**)
3. Save workflow
4. Now production appointments will get follow-up calls 24 hours later

---

## Production vs Test Workflows

**Consider creating two workflows:**

1. **Production**: `otto-appointment-booking`
   - Webhook: `/webhook/otto/appointment-request`
   - Wait: 24 hours
   - For real customer appointments

2. **Test**: `otto-appointment-booking-test`
   - Webhook: `/webhook-test/otto/appointment-request`
   - Wait: 1 minute (or none)
   - For your testing

This way you can test without affecting production!

---

**Ready to test?** Modify the wait node and run the curl command above! 📞
