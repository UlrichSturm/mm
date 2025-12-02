#!/bin/bash
# Setup script for Memento Mori development environment

set -e

echo "🪦 Setting up Memento Mori development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version must be 20 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose available${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating .env file from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please update with your values.${NC}"
    else
        echo -e "${RED}⚠️  .env.example not found. Please create .env manually.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for database
echo -e "\n${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
cd apps/server && npx prisma migrate dev --name init 2>/dev/null || npx prisma db push
cd ../..

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
npm run db:seed 2>/dev/null || echo -e "${YELLOW}⚠️  Seed script not configured yet${NC}"

echo -e "\n${GREEN}🎉 Setup complete!${NC}"
echo -e "\nYou can now run:"
echo -e "  ${YELLOW}npm run dev${NC}     - Start all development servers"
echo -e "  ${YELLOW}npm run dev:server${NC} - Start only backend"
echo -e "\nAccess points:"
echo -e "  Client:  http://localhost:3000"
echo -e "  API:     http://localhost:3001"
echo -e "  Vendor:  http://localhost:3002"
echo -e "  Admin:   http://localhost:3003"
echo -e "  Swagger: http://localhost:3001/api/docs"
