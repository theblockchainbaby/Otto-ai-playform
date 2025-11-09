# Otto Outbound - Quick Start Checklist

## ✅ Pre-Deployment Checklist

### 1. ElevenLabs Setup
- [ ] Create new outbound agent at https://elevenlabs.io/app/conversational-ai
- [ ] Configure system prompt for outbound scenarios
- [ ] Select appropriate voice (same as inbound Otto)
- [ ] Copy agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxxxxx`)
- [ ] Add to `.env`: `ELEVENLABS_OUTBOUND_AGENT_ID=`

### 2. Google Sheets Setup
- [ ] Create Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Create service account and download JSON credentials
- [ ] Create campaign sheet with template columns (see OUTBOUND_CALLING_SETUP.md)
- [ ] Share sheet with service account email (from JSON file)
- [ ] Copy sheet ID from URL
- [ ] Add to `.env`: 
  - `GOOGLE_SHEETS_CAMPAIGN_ID=`
  - `GOOGLE_SHEETS_CREDENTIALS=` (full JSON as string)

### 3. Twilio Setup
- [ ] Verify Twilio account has outbound calling enabled
- [ ] Confirm phone number `+18884118568` can make outbound calls
- [ ] Add to `.env`: `TWILIO_OUTBOUND_NUMBER=+18884118568`
- [ ] Ensure sufficient account balance for test campaigns

### 4. Environment Variables
- [ ] Copy `.env.example` to `.env` if not already done
- [ ] Add all new outbound-related variables
- [ ] Verify `BASE_URL` is set correctly (e.g., `https://ottoagent.net`)
- [ ] Double-check all API keys are valid

### 5. Database Migration
- [ ] Run `npm run db:generate` to generate Prisma client
- [ ] Run `npx prisma migrate dev --name add_outbound_campaigns` (local)
- [ ] Run `npx prisma migrate deploy` (production)
- [ ] Verify new tables created: `outbound_campaigns`, `outbound_calls`

### 6. Dependency Installation
- [ ] Run `npm install googleapis ws axios`
- [ ] Verify `package.json` includes new dependencies
- [ ] Run `npm install` to ensure all deps installed

### 7. Code Deployment
- [ ] Commit all new files to git
- [ ] Push to `main` branch
- [ ] Verify Railway/Render auto-deploy triggered
- [ ] Check deployment logs for errors
- [ ] Confirm server started successfully

### 8. Initial Testing
- [ ] Run `./setup-outbound.sh` to validate setup
- [ ] Add test contact to Google Sheets with your phone number
- [ ] Test Otto status: `curl https://ottoagent.net/api/n8n/otto-status`
- [ ] Run `./test-outbound-api.sh` for comprehensive API tests
- [ ] Verify you receive test call
- [ ] Check audio quality during call
- [ ] Confirm Google Sheets status updated
- [ ] Verify call logged in database
- [ ] Check Twilio console for recording

### 9. n8n Workflow Setup
- [ ] Create new workflow: "Otto Outbound Campaign Manager"
- [ ] Add webhook trigger node
- [ ] Add HTTP request to `/api/n8n/trigger-outbound-campaign`
- [ ] Add wait node (30 minutes)
- [ ] Add HTTP request to `/api/n8n/campaign-results/:campaignId`
- [ ] Add email node for campaign report
- [ ] Activate workflow
- [ ] Copy webhook URL for triggering

### 10. Compliance Verification
- [ ] Review TCPA compliance requirements
- [ ] Ensure contacts have given prior express consent
- [ ] Verify calling hours restrictions working (test outside hours)
- [ ] Confirm do-not-call status respected (add test contact with DO_NOT_CALL)
- [ ] Check Caller ID displays dealership name
- [ ] Verify recording disclosure in Otto's greeting (if required)

---

## 🚀 Launch Campaign

Once all items above are complete:

```bash
# 1. Populate Google Sheet with campaign contacts
# Format: Name, Phone, Email, Status=PENDING, ...

# 2. Trigger campaign via n8n or API
curl -X POST https://ottoagent.net/api/n8n/trigger-outbound-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "First Production Campaign",
    "campaignType": "APPOINTMENT_REMINDER",
    "sheetName": "Outbound Campaigns",
    "delayBetweenCalls": 30,
    "callDuringHours": {"start": "09:00", "end": "18:00"}
  }'

# 3. Monitor campaign
curl https://ottoagent.net/api/n8n/campaign-results/{CAMPAIGN_ID}

# 4. Review results in Google Sheets
```

---

## 📊 Post-Campaign Review

After first campaign:

- [ ] Review all call recordings
- [ ] Check completion rate (target: >70%)
- [ ] Analyze conversation quality
- [ ] Verify all Google Sheets updates accurate
- [ ] Review database logs for any errors
- [ ] Gather feedback from customers who were called
- [ ] Adjust Otto's system prompt if needed
- [ ] Optimize calling hours based on connection rates

---

## 🔧 Troubleshooting

### Issue: "Google Sheets connection failed"
```bash
# Verify credentials
echo $GOOGLE_SHEETS_CREDENTIALS | jq .client_email

# Test API access
node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
auth.getClient().then(() => console.log('✅ OK'));
"
```

### Issue: "ElevenLabs agent not found"
```bash
# Verify agent ID
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_OUTBOUND_AGENT_ID
```

### Issue: "Twilio calls failing"
```bash
# Check Twilio credentials
curl -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json
```

### Issue: "No calls being placed"
```bash
# Check campaign service logs
railway logs  # or your hosting provider's log command

# Verify database connection
npx prisma db pull

# Check Google Sheets has callable contacts
# (Status != DO_NOT_CALL, Phone exists, Phone format valid)
```

---

## 📚 Documentation

- **Full Setup Guide**: `OUTBOUND_CALLING_SETUP.md`
- **Implementation Details**: `OUTBOUND_IMPLEMENTATION_SUMMARY.md`
- **API Testing**: `test-outbound-api.sh`
- **Automated Setup**: `setup-outbound.sh`

---

## 🎯 Success Criteria

Your outbound system is ready when:

✅ Test call connects and Otto speaks clearly  
✅ Bidirectional audio works (Otto hears you, you hear Otto)  
✅ Answering machine detection works correctly  
✅ Google Sheets status updates automatically  
✅ Calls logged to database with all details  
✅ Recordings available in Twilio console  
✅ Campaign completes successfully  
✅ n8n receives campaign results  

---

**Ready to launch?** Start with a small test campaign (5-10 contacts) before scaling up!
