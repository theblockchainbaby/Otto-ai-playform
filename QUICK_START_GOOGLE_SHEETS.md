# 🚀 Quick Start: Google Sheets Setup (5 Minutes)

## Step 1: Open Your Google Sheet ✅

Your sheet is now open in your browser!

**Sheet ID:** `1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w`

---

## Step 2: Create "Outbound Campaigns" Sheet

1. Click the **"+"** button at the bottom left to add a new sheet
2. Right-click the new sheet tab → **Rename** → Type: `Outbound Campaigns`
3. Press Enter

---

## Step 3: Add Column Headers

In Row 1, add these headers:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| **Name** | **Phone** | **Email** | **Status** | **Last Called** | **Notes** |

---

## Step 4: Add Test Contacts

Add 2-3 test contacts (use YOUR phone numbers for testing):

**Example:**

| Name | Phone | Email | Status | Last Called | Notes |
|------|-------|-------|--------|-------------|-------|
| Test Contact 1 | +1YOUR_NUMBER | test@example.com | PENDING | | Test |
| Test Contact 2 | +1ANOTHER_NUMBER | test2@example.com | PENDING | | Test |

**⚠️ IMPORTANT:** Phone numbers MUST include country code:
- ✅ Correct: `+15551234567`
- ❌ Wrong: `555-123-4567` or `(555) 123-4567`

---

## Step 5: Make Sheet Public

1. Click **"Share"** button (top right corner)
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **"Done"**

---

## Step 6: Test the Integration

Open your terminal and run:

```bash
npm run test:sheets-read
```

**Expected Output:**
```
✅ Successfully read 2 contact(s)!

Contact #1:
   Name: Test Contact 1
   Phone: +1YOUR_NUMBER
   Email: test@example.com
   Status: PENDING
   Row: 2
```

---

## ✅ You're Done!

Your Google Sheets integration is ready!

### Next Steps:

1. **Test a real call:**
   ```bash
   node test-outbound-campaign.js +1YOUR_PHONE_NUMBER
   ```

2. **Run database migration:**
   ```bash
   npx prisma migrate dev --name add_outbound_calling
   ```

3. **Start a campaign:**
   ```bash
   curl -X POST http://localhost:3000/api/n8n/trigger-outbound-campaign \
     -H "Content-Type: application/json" \
     -d '{"campaignName": "Test Campaign", "campaignType": "GENERAL"}'
   ```

---

## 🔒 Want More Security?

For production use, follow the **"Secure Setup (Service Account)"** guide in:
- `GOOGLE_SHEETS_SETUP_GUIDE.md`

This allows Otto to:
- ✅ Update contact status automatically
- ✅ Log call results to the sheet
- ✅ Keep everything in sync

---

## 🆘 Troubleshooting

### "Cannot read contacts"
- Make sure sheet name is exactly: `Outbound Campaigns` (case-sensitive)
- Verify sheet is publicly viewable (Share → Anyone with link → Viewer)

### "Invalid phone number"
- Must include country code: `+1` for US
- No spaces, dashes, or parentheses

### Need Help?
Check the full guide: `GOOGLE_SHEETS_SETUP_GUIDE.md`

---

## 📊 Optional: Create "Call Results" Sheet

For detailed call logging:

1. Create another sheet named: `Call Results`
2. Add headers:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **Timestamp** | **Name** | **Phone** | **Call SID** | **Status** | **Duration** | **Outcome** | **Notes** |

Otto will automatically log all calls here!

---

Ready to make your first outbound call? 🚀

