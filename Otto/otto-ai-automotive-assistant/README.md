# 🚗 Otto - AI Automotive Call Center Assistant

> **Your Intelligent Assistant for Automotive Dealership Management**

The Otto AI Automotive Call Center Assistant is a comprehensive platform designed to streamline automotive dealership operations through intelligent automation and AI-driven customer interactions. This project leverages modern technologies to provide a robust solution for managing customer relationships, vehicle inventories, leads, and appointments.

![Otto AI Assistant](https://img.shields.io/badge/Platform-Otto%20AI%20Assistant-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Development%20Ready-orange?style=for-the-badge)

## 🌟 Key Features

### 🤖 **AI-Powered Customer Interaction**
- **Intelligent Call Handling** with real-time customer recognition
- **Automated Response Generation** for common inquiries
- **Contextual Conversations** leveraging customer history

### 📊 **Comprehensive Management Tools**
- **Customer Relationship Management** for tracking interactions
- **Vehicle Inventory Management** for efficient stock control
- **Lead Tracking** to monitor potential sales opportunities
- **Appointment Scheduling** for service and sales meetings

### 🔒 **Secure Authentication**
- **User Authentication** with JWT tokens
- **Role-Based Access Control** for secure operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/otto-ai-automotive-assistant.git
cd otto-ai-automotive-assistant
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
# Edit .env with your database and API keys
```

6. **Start the application**
```bash
npm run dev
```

7. **Access the platform**
- Dashboard: http://localhost:3000

## 📱 API Endpoints

### Core APIs
- `GET /api/customers` - Manage customers
- `GET /api/vehicles` - Manage vehicle inventory
- `GET /api/leads` - Track leads
- `GET /api/appointments` - Schedule appointments

### AI Features
- `POST /api/ai/messages/analyze` - Analyze customer messages
- `POST /api/ai/messages/generate-response` - Generate automated responses

## 🏗️ Architecture

### Backend Stack
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database

### Frontend
- **HTML/CSS/JavaScript** - Responsive web interface

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
```

### Environment Variables
Refer to `.env.example` for required configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI integration
- **Twilio** for communication capabilities

---

**Built with ❤️ for the automotive industry** 

*Revolutionizing how dealerships manage customer interactions and operations with cutting-edge AI technology.*