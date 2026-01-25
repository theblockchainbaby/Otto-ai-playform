# CaipherAI.com DNS Setup Guide

This guide walks you through hosting caipherai.com on Render by pointing DNS from Inc Authority.

## Overview

| Component | Value |
|-----------|-------|
| Domain | caipherai.com |
| Current Registrar | Inc Authority |
| Hosting Platform | Render |
| Render Service | otto-ai-platform |

---

## Step 1: Get Your Render Service URL

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click on your service (otto-ai-platform)
3. Note your service URL: `otto-ai-platform.onrender.com` (or similar)

---

## Step 2: Add Custom Domain in Render

1. In Render Dashboard, go to your service
2. Click **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Add both:
   - `caipherai.com`
   - `www.caipherai.com`
5. Render will show you the DNS records to configure
6. Keep this page open - you'll need the values for Step 3

---

## Step 3: Configure DNS at Inc Authority

Log into your Inc Authority account and navigate to DNS Management for caipherai.com.

### Option A: Using CNAME (Recommended for www)

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| CNAME | www | otto-ai-platform.onrender.com | 3600 |
| A | @ | (See Render dashboard for IP) | 3600 |

### Option B: Using Render's Load Balancer IPs

If Inc Authority doesn't support CNAME flattening for root domain, use A records:

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| A | @ | 216.24.57.1 | 3600 |
| CNAME | www | otto-ai-platform.onrender.com | 3600 |

> **Note**: Render's IP may change. Check your Render dashboard for the current IP address.

### Option C: Redirect Root to WWW

If you have trouble with root domain, set up a redirect:

1. Set CNAME for `www` → `otto-ai-platform.onrender.com`
2. Set up URL forwarding for `@` → `https://www.caipherai.com`

---

## Step 4: Verify DNS Propagation

After updating DNS records, verify propagation:

```bash
# Check A record
dig caipherai.com A

# Check CNAME record
dig www.caipherai.com CNAME

# Or use online tools:
# https://dnschecker.org
# https://www.whatsmydns.net
```

DNS propagation can take 15 minutes to 48 hours (usually under 1 hour).

---

## Step 5: Verify SSL Certificate

1. Once DNS propagates, Render will automatically provision an SSL certificate
2. Check your Render dashboard - the domain should show a green checkmark
3. Test by visiting `https://caipherai.com`

---

## Step 6: Update Environment Variables (Optional)

If caipherai.com needs its own configuration, update in Render:

1. Go to **Settings** → **Environment**
2. Add or update:
   ```
   CORS_ORIGIN=https://caipherai.com
   ```

The server code already includes caipherai.com in the allowed CORS origins.

---

## Troubleshooting

### Domain shows "Pending" in Render
- DNS hasn't propagated yet. Wait 15-60 minutes.
- Verify DNS records are correct using `dig` or dnschecker.org

### SSL Certificate Error
- Render auto-provisions SSL after DNS verification
- If stuck, try removing and re-adding the domain in Render

### CORS Errors
- Ensure `https://caipherai.com` is in your allowed origins
- Check that you're using HTTPS, not HTTP

### "Connection Refused" Error
- Verify your Render service is running
- Check the health endpoint: `https://otto-ai-platform.onrender.com/health`

---

## DNS Records Summary

```
# Recommended DNS Configuration for caipherai.com

# Root domain (A record)
@       A       216.24.57.1     (verify current IP in Render)

# WWW subdomain (CNAME)
www     CNAME   otto-ai-platform.onrender.com
```

---

## Related Files

- [Server CORS Config](src/server.ts) - Lines 60-73
- [Render Deployment Config](render.yaml)
- [GoDaddy DNS Setup](GODADDY-DNS-SETUP.md) - Reference for ottoagent.net

---

## Support

- **Render Docs**: https://render.com/docs/custom-domains
- **Inc Authority Support**: Contact their support for DNS management help
