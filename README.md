# 🚗 AutoLux Intelligence Platform

> **The World's Most Advanced AI-Powered Automotive Dealership Management System**

A comprehensive, enterprise-grade automotive dealership management platform featuring **Otto**, a custom ElevenLabs AI agent for intelligent phone call handling, real-time customer management, and complete business automation.

![AutoLux Platform](https://img.shields.io/badge/Platform-AutoLux%20Intelligence-blue?style=for-the-badge)
![AI Agent](https://img.shields.io/badge/AI%20Agent-Otto%20by%20ElevenLabs-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)

## 🌟 Key Features

### 🤖 **Otto - AI Phone Agent**
- **Custom ElevenLabs Conversational AI** for automotive customer service
- **Intelligent Call Routing** with customer recognition
- **Real-time Voice Synthesis** with professional automotive responses
- **Context-Aware Conversations** with customer history integration

### 📊 **Complete Business Management**
- **Customer Relationship Management** (500+ customers)
- **Vehicle Inventory Management** (800+ luxury vehicles)
- **Lead Tracking & Conversion** (300+ active leads)
- **Call Center Operations** (600+ call records)
- **Appointment Scheduling** (200+ appointments)
- **Emergency Roadside Assistance** (150+ emergency calls)
- **Service Provider Network** (50+ certified providers)

### 🎯 **AI-Powered Automation**
- **Smart Message Analysis** with sentiment detection
- **Automated Response Generation** using OpenAI GPT-4
- **Real-time Agent Assistance** during live calls
- **Predictive Analytics** for customer behavior
- **Workflow Automation** with campaign management

### 🏢 **Enterprise Features**
- **Multi-user Authentication** with role-based access
- **Real-time Dashboard** with live statistics
- **Advanced Search & Filtering** across all modules
- **Professional UI/UX** with Mercedes-Benz inspired design
- **Mobile-Responsive** interface for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/theblockchainbaby/autolux-intelligence-platform.git
cd autolux-intelligence-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the database**
```bash
docker-compose up -d
```

4. **Set up the database**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

6. **Start the application**
```bash
npm run dev
```

7. **Access the platform**
- Dashboard: http://localhost:3000
- Login: `john.anderson@autolux.com` / `admin123`

## 🤖 Otto AI Agent Setup

### ElevenLabs Integration
- **Agent ID**: `agent_3701k70bz4gcfd6vq1bkh57d15bw`
- **Agent URL**: [Talk to Otto](https://elevenlabs.io/app/talk-to?agent_id=agent_3701k70bz4gcfd6vq1bkh57d15bw)

### Configuration
1. Add your ElevenLabs API key to `.env`:
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

2. Configure Twilio for phone integration:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

3. Test Otto in the dashboard:
   - Go to **AI Assistant** tab
   - Click **Test Otto**
   - Try different scenarios (sales, service, emergency)

## 📱 API Endpoints

### Core APIs
- `GET /api/customers` - Customer management
- `GET /api/vehicles` - Vehicle inventory
- `GET /api/leads` - Lead tracking
- `GET /api/calls` - Call center data
- `GET /api/appointments` - Appointment scheduling

### Otto AI APIs
- `POST /api/twilio/otto/incoming` - Handle incoming calls with Otto
- `POST /api/twilio/otto/response` - Process Otto conversations
- `GET /api/twilio/otto/test` - Test Otto functionality

### AI Features
- `POST /api/ai/messages/analyze` - Message analysis
- `POST /api/ai/messages/generate-response` - Auto-response generation
- `POST /api/ai/calls/transcribe` - Call transcription
- `POST /api/ai/calls/agent-assistance` - Real-time agent help

## 🏗️ Architecture

### Backend Stack
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure user sessions

### AI Integration
- **ElevenLabs** - Otto conversational AI agent
- **OpenAI GPT-4** - Message analysis and generation
- **Twilio** - Phone system integration
- **Real-time Processing** - Live call assistance

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS Custom Properties** - Mercedes-Benz inspired design
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live dashboard statistics

## 📊 Database Schema

The platform includes comprehensive data models:
- **Users** - Authentication and roles
- **Customers** - Customer profiles and history
- **Vehicles** - Inventory management
- **Leads** - Sales pipeline tracking
- **Calls** - Call center records
- **Appointments** - Scheduling system
- **Emergency Calls** - Roadside assistance
- **Service Requests** - Maintenance tracking
- **Service Providers** - Partner network

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:reset     # Reset database
npm run db:seed      # Seed with sample data
```

### Environment Variables
See `.env.example` for all required configuration options.

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Add real API keys for ElevenLabs, OpenAI, Twilio
4. Set up SSL certificates
5. Configure reverse proxy (nginx)

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ElevenLabs** for the amazing Otto AI agent
- **OpenAI** for GPT-4 integration
- **Twilio** for phone system capabilities
- **Mercedes-Benz** for design inspiration

---

**Built with ❤️ for the automotive industry**

*Revolutionizing how dealerships manage customers, inventory, and communications with cutting-edge AI technology.*
