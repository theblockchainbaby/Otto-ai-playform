# 🌐 GoDaddy DNS Setup for ottoagent.net

## 🎉 Perfect Domain Choice!

**`ottoagent.net`** is an excellent choice because:
- ✅ **Clear Identity**: Immediately identifies Otto as an AI agent
- ✅ **Professional**: .net extension is trusted and professional
- ✅ **Memorable**: Easy to remember and type
- ✅ **Brand Alignment**: Perfect for an AI agent platform
- ✅ **SEO Friendly**: Great for "AI agent" keyword searches

## 🚀 DNS Configuration Steps

### Step 1: Access GoDaddy DNS Management
1. Login to your **GoDaddy account**
2. Go to **"My Products"**
3. Find **ottoagent.net** and click **"DNS"**
4. You'll see the DNS Management page

### Step 2: Wait for Railway Deployment
First, deploy your app to Railway (see DEPLOYMENT.md), then Railway will provide you with:
- **App URL**: `your-app-name.railway.app`
- **IP Address**: Railway's static IP

### Step 3: Configure DNS Records

#### Option A: CNAME Method (Recommended)
Add these records in GoDaddy DNS:

| Type  | Name | Value                    | TTL |
|-------|------|--------------------------|-----|
| CNAME | www  | your-app.railway.app     | 1 Hour |
| A     | @    | Railway's IP Address     | 1 Hour |

#### Option B: A Record Method
If Railway provides static IP addresses:

| Type | Name | Value              | TTL |
|------|------|--------------------|-----|
| A    | @    | Railway's IP       | 1 Hour |
| A    | www  | Railway's IP       | 1 Hour |

### Step 4: Remove Default Records
**Important**: Remove any conflicting records:
- Remove default "Parked" A records
- Remove default CNAME records pointing to GoDaddy parking

### Step 5: Add Email Records (Optional)
For professional email (support@ottoagent.net):

| Type | Name | Value                           | TTL |
|------|------|---------------------------------|-----|
| MX   | @    | mx1.forwardemail.net (Priority 10) | 1 Hour |
| MX   | @    | mx2.forwardemail.net (Priority 20) | 1 Hour |
| TXT  | @    | forward-email=support@youremail.com | 1 Hour |

## 🔧 Railway Custom Domain Setup

### Step 1: Add Domain in Railway
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Settings"** tab
4. Click **"Custom Domain"**
5. Add **ottoagent.net**
6. Add **www.ottoagent.net**

### Step 2: Get Railway Values
Railway will show you:
- **CNAME Target**: `your-app.railway.app`
- **A Record IP**: Static IP address
- **SSL Status**: Will show "Pending" then "Active"

### Step 3: Verify Configuration
Railway will automatically:
- ✅ Generate SSL certificate
- ✅ Handle HTTPS redirects
- ✅ Configure CDN
- ✅ Set up health checks

## ⏰ DNS Propagation Timeline

| Time Frame | Status |
|------------|--------|
| 0-30 minutes | DNS changes saved in GoDaddy |
| 30 minutes - 2 hours | Changes propagate to major DNS servers |
| 2-24 hours | Global propagation complete |
| 24-48 hours | Full propagation guaranteed |

## 🔍 Testing Your Setup

### Check DNS Propagation
Use these tools to verify:
- **whatsmydns.net**: Check global DNS propagation
- **dig ottoagent.net**: Command line DNS lookup
- **nslookup ottoagent.net**: Windows DNS lookup

### Test Your Site
1. **HTTP**: http://ottoagent.net (should redirect to HTTPS)
2. **HTTPS**: https://ottoagent.net (should load your site)
3. **WWW**: https://www.ottoagent.net (should work)
4. **API**: https://ottoagent.net/health (should return OK)

## 🚨 Troubleshooting

### Common Issues

#### 1. "Site Can't Be Reached"
- **Cause**: DNS not propagated yet
- **Solution**: Wait 2-24 hours, check DNS propagation tools

#### 2. "Not Secure" Warning
- **Cause**: SSL certificate still generating
- **Solution**: Wait 10-30 minutes for Railway to generate SSL

#### 3. "Parked Domain" Page
- **Cause**: Old GoDaddy records still active
- **Solution**: Remove all default A/CNAME records in GoDaddy

#### 4. "502 Bad Gateway"
- **Cause**: Railway app not running
- **Solution**: Check Railway deployment logs

### DNS Verification Commands
```bash
# Check A record
dig A ottoagent.net

# Check CNAME record
dig CNAME www.ottoagent.net

# Check all records
dig ANY ottoagent.net

# Test from specific DNS server
dig @8.8.8.8 ottoagent.net
```

## 📧 Professional Email Setup

### Option 1: Google Workspace ($6/month)
1. Sign up for Google Workspace
2. Verify domain ownership
3. Add MX records provided by Google
4. Get support@ottoagent.net email

### Option 2: Free Email Forwarding
1. Use **ForwardEmail.net** (free)
2. Add MX and TXT records (shown above)
3. Forward support@ottoagent.net to your personal email

### Option 3: GoDaddy Email ($5.99/month)
1. Purchase GoDaddy Email in your account
2. Automatically configured
3. Get professional email with 10GB storage

## 🎯 Final Configuration

### Update Twilio Webhook
Once your domain is live:
1. Go to **Twilio Console**
2. Find your phone number: **+1 (888) 411-8568**
3. Update webhook URL to: **https://ottoagent.net/api/twilio/otto/incoming**

### Update Environment Variables
In Railway, update:
```env
DOMAIN=https://ottoagent.net
WEBHOOK_URL=https://ottoagent.net/api/twilio/otto/incoming
BASE_URL=https://ottoagent.net
```

### Test Complete Flow
1. **Visit**: https://ottoagent.net
2. **Call Otto**: +1 (888) 411-8568
3. **Purchase**: Test pricing and checkout
4. **Dashboard**: Access Otto dashboard

## 🎉 Success Checklist

- [ ] Domain purchased on GoDaddy ✅
- [ ] Railway app deployed
- [ ] DNS records configured in GoDaddy
- [ ] Custom domain added in Railway
- [ ] SSL certificate active
- [ ] Site loads at https://ottoagent.net
- [ ] WWW redirect working
- [ ] Twilio webhook updated
- [ ] Otto phone number working
- [ ] Professional email configured

**Your Otto AI platform will be live at https://ottoagent.net!** 🤖🌐
