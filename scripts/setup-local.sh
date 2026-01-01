#!/bin/bash
# Local Development Setup Script
# Installs dependencies and sets up the project for local development

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== CodeVed Online Compiler - Local Setup ===${NC}\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18 or higher is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) found${NC}"

# Check for required system dependencies
echo -e "\n${YELLOW}Checking system dependencies...${NC}"

# Check GCC (for C++)
if command -v g++ &> /dev/null; then
    echo -e "${GREEN}✓ g++ found: $(g++ --version | head -n1)${NC}"
else
    echo -e "${YELLOW}⚠ g++ not found. C++ compilation will not work.${NC}"
    echo "  Install with: sudo apt-get install g++ (Ubuntu/Debian)"
    echo "  or: brew install gcc (macOS)"
fi

# Check Java
if command -v javac &> /dev/null && command -v java &> /dev/null; then
    echo -e "${GREEN}✓ Java found: $(java -version 2>&1 | head -n1)${NC}"
else
    echo -e "${YELLOW}⚠ Java not found. Java execution will not work.${NC}"
    echo "  Install with: sudo apt-get install openjdk-17-jdk (Ubuntu/Debian)"
    echo "  or: brew install openjdk@17 (macOS)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"
else
    echo -e "${YELLOW}⚠ Python3 not found. Python execution will not work.${NC}"
    echo "  Install with: sudo apt-get install python3 (Ubuntu/Debian)"
fi

# Check MongoDB (optional for local)
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB found${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not found. You can use MongoDB Atlas or Docker for database.${NC}"
fi

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi
cd ..

# Install server dependencies
echo -e "\n${YELLOW}Installing server dependencies...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Server dependencies already installed${NC}"
fi
cd ..

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi
cd ..

# Create .env files if they don't exist
echo -e "\n${YELLOW}Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo "PORT=8000" > backend/.env
    echo "NODE_ENV=development" >> backend/.env
    echo "ALLOWED_ORIGINS=http://localhost:5173" >> backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi

if [ ! -f "server/.env" ]; then
    echo "PORT=5000" > server/.env
    echo "NODE_ENV=development" >> server/.env
    echo "MONGO_URI=mongodb://localhost:27017/algou" >> server/.env
    echo "JWT_SECRET=dev-secret-change-in-production" >> server/.env
    echo "ALLOWED_ORIGINS=http://localhost:5173" >> server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo "VITE_API_SERVER_URL=http://localhost:5000" > frontend/.env
    echo "VITE_EXECUTION_BACKEND_URL=http://localhost:8000" >> frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
fi

# Create necessary directories
echo -e "\n${YELLOW}Creating necessary directories...${NC}"
mkdir -p backend/codes backend/inputs backend/outputs
echo -e "${GREEN}✓ Directories created${NC}"

echo -e "\n${GREEN}=== Setup Complete! ===${NC}\n"
echo -e "Next steps:"
echo -e "1. Start MongoDB (if using local): mongod"
echo -e "2. Start backend: cd backend && npm start"
echo -e "3. Start server: cd server && npm start"
echo -e "4. Start frontend: cd frontend && npm run dev"
echo -e "\nOr use the start script: ./scripts/start-local.sh"

