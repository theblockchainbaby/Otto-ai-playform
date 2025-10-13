# Custom Domain Setup Guide - GoDaddy + Render

## 🌐 Setting Up ottoagent.net with Render

### OPTION 1: Use A Record (Recommended for GoDaddy)

Since GoDaddy doesn't support CNAME flattening at the root domain, we'll use A records to point directly to Render's IP addresses.

---

## 📋 Step-by-Step Instructions

### Step 1: Get Render's IP Addresses

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Select your `otto-ai-platform` service
   - Click on **Settings** in the left sidebar
   - Scroll down to **Custom Domains** section

2. **Add Your Custom Domain**
   - Click **Add Custom Domain**
   - Enter: `ottoagent.net`
   - Click **Save**

3. **Get the IP Addresses**
   Render will display DNS configuration instructions. Look for the A record values:
   
   ```
   Type: A
   Name: @
   Value: 216.24.57.1  (example - use actual Render IPs)
   
   Type: A
   Name: @
   Value: 216.24.57.2  (example - use actual Render IPs)
   ```
   
   **Note:** Render typically provides 2-4 IP addresses for redundancy.

4. **Also Add www Subdomain**
   - Click **Add Custom Domain** again
   - Enter: `www.ottoagent.net`
   - Get the CNAME value (should be something like `otto-ai-platform.onrender.com`)

---

### Step 2: Configure DNS in GoDaddy

1. **Login to GoDaddy**
   - Go to: https://dcc.godaddy.com/domains
   - Find `ottoagent.net` and click **DNS** or **Manage DNS**

2. **Remove Existing Records**
   - Delete any existing A records for `@` (root domain)
   - Delete any existing CNAME records for `@`
   - Keep NS (nameserver) and SOA records - **DO NOT DELETE THESE**

3. **Add A Records for Root Domain**
   For each IP address Render provided, add:
   
   ```
   Type: A
   Name: @
   Value: [First Render IP]
   TTL: 600 (or Custom: 600 seconds)
   ```
   
   Click **Add Record**, then repeat for each additional IP:
   
   ```
   Type: A
   Name: @
   Value: [Second Render IP]
   TTL: 600
   ```
   
   *Add all IP addresses Render provided (usually 2-4)*

4. **Add CNAME Record for www Subdomain**
   ```
   Type: CNAME
   Name: www
   Value: otto-ai-platform.onrender.com
   TTL: 600
   ```

5. **Optional: Add CNAME for API subdomain**
   ```
   Type: CNAME
   Name: api
   Value: otto-ai-platform.onrender.com
   TTL: 600
   ```

6. **Save All Changes**

---

### Step 3: Verify in Render

1. **Go back to Render Dashboard**
   - Navigate to your service → Settings → Custom Domains
   - You should see both:
     - `ottoagent.net` - Status: Verifying...
     - `www.ottoagent.net` - Status: Verifying...

2. **Wait for Verification**
   - DNS changes can take 5-60 minutes to propagate
   - Render will automatically verify and issue SSL certificates
   - Status will change to: ✅ **Active** when ready

---

### Step 4: Update Environment Variables

Once your domain is verified, update these environment variables in Render:

1. Go to: Render Dashboard → Your Service → Environment
2. Update or add:

```bash
DOMAIN=https://ottoagent.net
BASE_URL=https://ottoagent.net
CORS_ORIGIN=https://ottoagent.net
WEBHOOK_URL=https://ottoagent.net/api/twilio/otto/incoming
```

3. Click **Save Changes** - Your service will redeploy automatically

---

## 🔍 Troubleshooting

### Check DNS Propagation
Use these tools to verify your DNS changes:

```bash
# In your terminal:
nslookup ottoagent.net
dig ottoagent.net

# Or use online tools:
# https://dnschecker.org
# https://www.whatsmydns.net
```

### Common Issues:

#### Issue 1: "Domain verification failed"
- **Solution**: Wait longer (up to 48 hours max, usually 1-2 hours)
- **Check**: Ensure A records are pointing to correct Render IPs
- **Verify**: No conflicting records in GoDaddy DNS

#### Issue 2: "SSL certificate pending"
- **Solution**: Render auto-provisions SSL after domain verification
- **Wait**: Usually takes 5-15 minutes after verification
- **Check**: Make sure both `ottoagent.net` and `www.ottoagent.net` are verified

#### Issue 3: "www works but root domain doesn't (or vice versa)"
- **Solution**: Ensure both domains are added in Render
- **Check**: Both A records and CNAME record are configured correctly
- **Wait**: DNS propagation may be slower for one than the other

#### Issue 4: GoDaddy says "Cannot use @ with CNAME"
- **Solution**: This is normal - that's why we use A records instead
- **Use**: A records for root (`@`), CNAME for subdomains (`www`, `api`)

---

## 📊 Expected DNS Configuration

Your final GoDaddy DNS should look like this:

| Type  | Name | Value                              | TTL |
|-------|------|------------------------------------|-----|
| A     | @    | 216.24.57.1 (Render IP #1)        | 600 |
| A     | @    | 216.24.57.2 (Render IP #2)        | 600 |
| CNAME | www  | otto-ai-platform.onrender.com     | 600 |
| NS    | @    | ns*.domaincontrol.com             | 1H  |
| SOA   | @    | (GoDaddy default)                 | 1H  |

---

## ✅ Verification Checklist

- [ ] Got IP addresses from Render dashboard
- [ ] Added A records in GoDaddy for root domain
- [ ] Added CNAME record for www subdomain
- [ ] Added custom domains in Render dashboard
- [ ] Waited 15-60 minutes for DNS propagation
- [ ] Both domains show "Active" status in Render
- [ ] SSL certificates are issued (green padlock)
- [ ] Updated environment variables in Render
- [ ] Tested: https://ottoagent.net loads correctly
- [ ] Tested: https://www.ottoagent.net loads correctly

---

## 🎯 What Render IP Addresses Look Like

Render typically provides IP addresses in these formats:

**Example Set 1:**
- 216.24.57.1
- 216.24.57.2
- 216.24.57.3
- 216.24.57.4

**Example Set 2:**
- 216.24.57.253
- 216.24.57.254

**Your Actual IPs**: Will be shown in Render dashboard under Custom Domains section.

**Important**: Use the EXACT IP addresses Render provides - the examples above are just illustrations.

---

## 📞 Need Help?

If you're stuck at any step:

1. **Check Render Status**: https://status.render.com
2. **Check GoDaddy Status**: https://status.godaddy.com
3. **Render Support**: support@render.com
4. **DNS Propagation**: Usually completes in 15-60 minutes, max 48 hours

---

## 🚀 After Setup is Complete

Once your domain is working:

1. Update all hardcoded URLs in your code to use `ottoagent.net`
2. Update Twilio webhook URLs to point to your new domain
3. Update ElevenLabs agent configuration if needed
4. Test all features thoroughly
5. Set up monitoring for your domain

Your Otto AI platform will be live at:
- 🌐 **https://ottoagent.net** - Main website
- 🌐 **https://www.ottoagent.net** - WWW redirect
- 🔌 **https://ottoagent.net/api/...** - API endpoints
- ❤️ **https://ottoagent.net/health** - Health check