# 🤖 Otto AI Agent - Twilio Integration Setup

## 📞 Your Twilio Configuration

### Account Information
- **Phone Number**: `+1 (888) 411-8568`
- **Account SID**: `ACafc412b62982312dc2efebaff233cf9f`
- **Auth Token**: `32c6e878cdc5707707980e6d6272f713` (Test credentials)

## 🔧 Required Webhook Configuration

### 1. Voice Configuration (Phone Calls)

**For your phone number `+1 (888) 411-8568`:**

**A call comes in:**
- **URL**: `https://your-domain.com/api/twilio/otto/incoming`
- **HTTP Method**: `HTTP POST`

**Primary handler fails:**
- **URL**: `https://your-domain.com/api/twilio/otto/incoming`
- **HTTP Method**: `HTTP POST`

### 2. Messaging Configuration (SMS)

**A message comes in:**
- **URL**: `https://your-domain.com/api/twilio/sms/incoming`
- **HTTP Method**: `HTTP POST`

**Primary handler fails:**
- **URL**: `https://your-domain.com/api/twilio/sms/incoming`
- **HTTP Method**: `HTTP POST`

## 🌐 Production Deployment URLs

### Option 1: Using ngrok (for testing)
```bash
# Install ngrok
npm install -g ngrok

# Start your AutoLux server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL in Twilio webhooks
# Example: https://abc123.ngrok.io/api/twilio/otto/incoming
```

### Option 2: Deploy to Production
Deploy your AutoLux platform to:
- **Heroku**: `https://autolux-platform.herokuapp.com`
- **Vercel**: `https://autolux-platform.vercel.app`
- **AWS/DigitalOcean**: `https://autolux.yourdomain.com`

## 🎯 Otto Webhook Endpoints

Your AutoLux platform provides these Otto-specific endpoints:

### Voice Calls with Otto
- `POST /api/twilio/otto/incoming` - Handle incoming calls with Otto
- `POST /api/twilio/otto/response` - Process Otto conversation responses
- `POST /api/twilio/otto/end` - Handle call completion

### Testing & Management
- `GET /api/twilio/otto/test` - Test Otto functionality
- `GET /api/health` - Health check endpoint

## 🚀 Quick Setup Steps

### Step 1: Update Twilio Console

1. **Go to**: https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. **Click your phone number**: `+1 (888) 411-8568`
3. **Voice Configuration**:
   - **A call comes in**: `https://your-domain.com/api/twilio/otto/incoming`
   - **HTTP**: `POST`
4. **Save Configuration**

### Step 2: Test Otto Integration

```bash
# Test Otto locally
curl "http://localhost:3000/api/twilio/otto/test?customerName=John&scenario=sales"

# Test with real Twilio webhook
curl -X POST "http://localhost:3000/api/twilio/otto/incoming" \
  -d "From=+15551234567" \
  -d "To=+18884118568" \
  -d "CallSid=CA1234567890abcdef" \
  -d "CallerName=John Doe"
```

### Step 3: Verify Otto Responses

Otto will intelligently handle:
- ✅ **Sales Inquiries**: "I want to buy a Mercedes"
- ✅ **Service Appointments**: "I need an oil change"
- ✅ **Emergency Calls**: "My car broke down"
- ✅ **Financing Questions**: "What are my payment options?"
- ✅ **General Support**: "I have a question about my vehicle"

## 🔐 Security Configuration

### Environment Variables
```env
# Production Twilio Credentials
TWILIO_ACCOUNT_SID="ACf0b00c7cf09e6798b7b8513666b2819e4"
TWILIO_AUTH_TOKEN="your_live_auth_token"
TWILIO_PHONE_NUMBER="+18884118568"

# Otto AI Agent
ELEVENLABS_API_KEY="your_elevenlabs_api_key"

# Base URL for webhooks
BASE_URL="https://your-production-domain.com"
```

### Webhook Security
- All webhooks validate Twilio signatures
- HTTPS required for production
- Rate limiting enabled
- Error handling with fallbacks

## 📊 Otto Analytics

Monitor Otto's performance in your dashboard:
- **Call Volume**: Track incoming calls handled by Otto
- **Response Quality**: Monitor customer satisfaction
- **Conversation Length**: Average call duration
- **Resolution Rate**: Calls resolved without human transfer

## 🎯 Next Steps

1. **Deploy to Production**: Choose hosting platform
2. **Update Twilio Webhooks**: Point to your production URLs
3. **Add ElevenLabs API Key**: Enable real voice synthesis
4. **Test Live Calls**: Call `+1 (888) 411-8568` to test Otto
5. **Monitor Performance**: Use dashboard analytics

## 🆘 Troubleshooting

### Common Issues

**Otto not responding to calls:**
- Check webhook URL is correct
- Verify HTTPS is enabled
- Check server logs for errors

**Voice quality issues:**
- Add real ElevenLabs API key
- Check internet connection
- Verify audio codec settings

**Customer data not loading:**
- Check database connection
- Verify customer phone number format
- Check authentication tokens

## 📞 Support

For technical support with Otto integration:
- **Dashboard**: http://localhost:3000 → AI Assistant tab
- **Test Otto**: Use built-in testing tools
- **Logs**: Check server console for detailed error messages

---

**Otto is ready to revolutionize your automotive customer service!** 🚗✨
