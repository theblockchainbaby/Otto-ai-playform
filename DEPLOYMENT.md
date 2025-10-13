# 🚀 Otto AI Deployment Guide

## 🌐 Domain Registration

### Step 1: Domain Registered ✅
**Your Domain**: `ottoagent.net` (Purchased on GoDaddy)
**Perfect Choice**: Clearly identifies Otto as an AI agent

### Step 2: Domain Configuration
Your domain is ready! We'll configure DNS during deployment.

## 🚀 Railway Deployment (Recommended)

### Why Railway?
- ✅ Perfect for Node.js + PostgreSQL
- ✅ Automatic deployments from GitHub
- ✅ Built-in database
- ✅ Environment variables
- ✅ Custom domains
- ✅ $5-20/month pricing

### Step 1: Prepare Repository
```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Railway
1. Go to **railway.app**
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your Otto AI repository
6. Railway will automatically detect Node.js and deploy

### Step 3: Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL"
3. Railway will create database and provide connection string

### Step 4: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
ELEVENLABS_API_KEY=your-elevenlabs-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-phone-number
DOMAIN=https://ottoagent.net
WEBHOOK_URL=https://ottoagent.net/api/twilio/otto/incoming
```

### Step 5: Custom Domain
1. In Railway dashboard, go to Settings
2. Click "Custom Domain"
3. Add your domain (e.g., otto.ai)
4. Railway will provide DNS records

### Step 6: Configure DNS in GoDaddy
1. Login to your GoDaddy account
2. Go to "My Products" → "DNS"
3. Add CNAME record: `www` → `your-app.railway.app`
4. Add A record: `@` → Railway's IP address (provided by Railway)
5. Wait 24-48 hours for DNS propagation

## 🔄 Alternative: Render Deployment

### Step 1: Deploy to Render
1. Go to **render.com**
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Step 2: Add PostgreSQL
1. Create new PostgreSQL database in Render
2. Copy connection string to environment variables

## 🔄 Alternative: Vercel + PlanetScale

### For Frontend-Heavy Deployment
1. Deploy to **Vercel** (excellent for frontend)
2. Use **PlanetScale** for database
3. Use **Railway** or **Render** for API endpoints

## 📋 Post-Deployment Checklist

### ✅ Essential Steps After Deployment

1. **Database Setup**
   ```bash
   # Run migrations
   npm run db:deploy
   
   # Seed database
   npm run db:seed
   ```

2. **Test Otto AI**
   - Visit your domain
   - Test phone number: +1 (888) 411-8568
   - Chat with Otto: https://elevenlabs.io/app/talk-to?agent_id=agent_3701k70bz4gcfd6vq1bkh57d15bw

3. **Update Twilio Webhook**
   - Go to Twilio Console
   - Update webhook URL to: `https://ottoagent.net/api/twilio/otto/incoming`

4. **SSL Certificate**
   - Railway/Render automatically provide SSL
   - Verify HTTPS is working

5. **Test Purchase Flow**
   - Test pricing page
   - Test purchase forms
   - Verify success page

## 🔧 Production Optimizations

### Performance
- Enable gzip compression
- Set up CDN (Cloudflare)
- Optimize images
- Enable caching headers

### Security
- Rate limiting (already configured)
- CORS settings (already configured)
- Environment variables (never commit .env)
- Regular security updates

### Monitoring
- Set up error tracking (Sentry)
- Add analytics (Google Analytics)
- Monitor uptime (UptimeRobot)
- Database monitoring

## 💰 Estimated Monthly Costs

### Railway Deployment
- **Railway**: $5-20/month
- **Domain**: $7-10/month (.ai domains)
- **Total**: ~$12-30/month

### Enterprise Scale
- **Railway Pro**: $20-50/month
- **CDN (Cloudflare)**: $20/month
- **Monitoring**: $10-30/month
- **Total**: ~$50-100/month

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **Environment Variables**: Ensure all required vars are set
3. **Build Failures**: Check Node.js version compatibility
4. **Domain Issues**: Wait 24-48 hours for DNS propagation

### Support Resources
- Railway Discord: https://discord.gg/railway
- Render Community: https://community.render.com
- Otto AI Support: support@otto.ai

## 🎯 Next Steps After Deployment

1. **Custom Email**: Set up support@otto.ai
2. **Analytics**: Add Google Analytics
3. **Monitoring**: Set up uptime monitoring
4. **Backups**: Configure database backups
5. **CI/CD**: Set up automated testing
6. **Documentation**: Create user guides
7. **Marketing**: Launch announcement
8. **SEO**: Optimize for search engines

## 🚀 Launch Checklist

- [ ] Domain registered and configured
- [ ] Application deployed and running
- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Otto AI phone number working
- [ ] Purchase flow tested
- [ ] Analytics configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

**Your Otto AI platform is ready to revolutionize the automotive industry!** 🤖🚗
