# Database Connection Fix Guide

## Issue
Supabase database unreachable during test call:
```
Error: Can't reach database server at `db.iephonflxtsjylytmwxi.supabase.co:5432`
```

## Fixes Applied (Committed: a5bdacd)
✅ **WebSocket Error Handling** - Added null checks for `message.user_transcript?.transcript` and `message.agent_response?.response`
✅ **Prisma Import** - Added missing `PrismaClient` import in `twilioOutbound.js`

## Database Connection Steps

### 1. Check Render Environment Variables
Go to: https://dashboard.render.com → Select your service → Environment

**Required Variables:**
```bash
DATABASE_URL=postgresql://...      # OR
POSTGRES_URL=postgresql://...      # (check which one you're using)
```

**Format should be:**
```
postgresql://user:password@host:5432/database?pgbouncer=true
```

### 2. Verify Supabase Project Status
1. Login to https://supabase.com/dashboard
2. Check if project `iephonflxtsjylytmwxi` is active
3. Go to **Settings → Database**
4. Copy the **Connection String** (Transaction mode)

**Expected format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### 3. Test Connection Locally

**Option A: Using psql**
```bash
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**Option B: Using Node.js**
```bash
cd /Users/york/Documents/augment-projects/Automotive\ AI
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e));"
```

### 4. Common Issues & Solutions

#### Issue: Port 5432 blocked
**Solution:** Use Supabase pooler port `6543` instead
```
# Change from:
@db.iephonflxtsjylytmwxi.supabase.co:5432
# To:
@aws-0-us-west-1.pooler.supabase.com:6543
```

#### Issue: SSL required
**Solution:** Add SSL parameter to connection string
```
?sslmode=require
# OR
?pgbouncer=true&connection_limit=1
```

#### Issue: Password changed
**Solution:** Reset database password in Supabase dashboard
1. Go to Settings → Database
2. Click "Reset database password"
3. Update `POSTGRES_URL` in Render with new password

### 5. Update Render & Redeploy

**After verifying connection string:**
1. Go to Render dashboard
2. Navigate to Environment variables
3. Update `POSTGRES_URL` or `DATABASE_URL`
4. Click "Save Changes" (triggers auto-redeploy)
5. Monitor deploy logs for connection success

**Test after deploy:**
```bash
curl https://ottoagent.net/api/n8n/debug-env | jq
```

### 6. Verify Database Tables Exist

**Run Prisma migrations if needed:**
```bash
# Locally first:
cd /Users/york/Documents/augment-projects/Automotive\ AI
npm run db:generate
npm run db:push

# Then redeploy to Render (auto-runs migrations)
```

## Expected Results After Fix

### Successful Database Connection
```
✅ Connected to database
✅ Customer lookup: Found customer ID 123
✅ Call record saved: CA85c097e0dea289a3d0784c6d6c9ba6ec
✅ Recording metadata saved: RE1dba10003cb07d793adfc25541047bb0
📅 Appointment saved: ID 456
```

### n8n Flow 2 Should Work
Once database is connected, the appointment booking flow will:
1. ✅ Save appointment to PostgreSQL (via `/api/n8n/book-appointment`)
2. ✅ Trigger n8n webhook
3. ✅ Create Google Calendar event
4. ✅ Update Google Sheet
5. ✅ Send SMS confirmation

## Quick Test Command

**Test appointment booking endpoint:**
```bash
curl -X POST https://ottoagent.net/api/n8n/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerPhone": "+14155552671",
    "appointmentDate": "2025-12-01",
    "appointmentTime": "2:00 PM",
    "serviceType": "Oil Change",
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointmentId": 789,
  "appointmentDateTime": "2025-12-01T14:00:00.000Z"
}
```

## Next Steps After Database Fix

1. ✅ Verify connection working in Render logs
2. ✅ Test manual appointment booking endpoint
3. ✅ Activate n8n webhook in Flow 2
4. ✅ Make test Otto call triggering appointment
5. ✅ Confirm all integrations working (DB + Calendar + Sheet + SMS)

## Support Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Prisma Connection:** https://www.prisma.io/docs/orm/overview/databases/postgresql
- **Render Logs:** https://dashboard.render.com → Logs tab
