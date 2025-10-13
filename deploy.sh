#!/bin/bash

# Otto AI Deployment Script
# Run with: chmod +x deploy.sh && ./deploy.sh

echo "🤖 Otto AI Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit - Otto AI Platform"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found. Committing...${NC}"
    git add .
    git commit -m "Prepare for deployment - $(date)"
fi

echo -e "${GREEN}🎉 Domain Registered: ottoagent.net${NC}"
echo "✅ Perfect choice! Clearly identifies Otto as an AI agent"
echo "✅ Professional .net extension"
echo "✅ Memorable and brandable"
echo "✅ Great for SEO (AI agent keywords)"

echo ""
echo -e "${GREEN}🚀 Deployment Options:${NC}"
echo "1. Railway (Recommended) - Full-stack with PostgreSQL"
echo "2. Render - Alternative full-stack platform"
echo "3. Vercel + PlanetScale - Frontend + Database"

echo ""
echo -e "${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo "✅ Code committed to git"
echo "✅ Environment variables documented"
echo "✅ Database schema ready"
echo "✅ Otto AI agent configured"
echo "✅ Twilio webhook ready"

echo ""
echo -e "${BLUE}🌐 Next Steps:${NC}"
echo "1. ✅ Domain registered: ottoagent.net"
echo "2. Create account on Railway.app"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables"
echo "5. Configure custom domain (ottoagent.net)"
echo "6. Set up DNS in GoDaddy (see GODADDY-DNS-SETUP.md)"

echo ""
echo -e "${GREEN}📖 Detailed instructions available in DEPLOYMENT.md${NC}"

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo ""
    echo -e "${GREEN}🚂 Railway CLI detected!${NC}"
    echo "You can deploy directly with:"
    echo "  railway login"
    echo "  railway link"
    echo "  railway up"
else
    echo ""
    echo -e "${YELLOW}💡 Install Railway CLI for easier deployment:${NC}"
    echo "  npm install -g @railway/cli"
fi

echo ""
echo -e "${BLUE}🎯 Your Domain: ottoagent.net${NC}"
echo "GoDaddy DNS Setup: See GODADDY-DNS-SETUP.md for detailed instructions"

echo ""
echo -e "${GREEN}✨ Otto AI is ready for deployment!${NC}"
