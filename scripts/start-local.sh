#!/bin/bash
# Start Local Development Servers
# Starts all services in separate terminal windows/tabs

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Starting Local Development Servers ===${NC}\n"

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠ MongoDB is not running. Starting it...${NC}"
        echo "You may need to start MongoDB manually: mongod"
    fi
fi

# Function to start service in background
start_service() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "${GREEN}Starting ${name}...${NC}"
    cd "$dir"
    $command > "../logs/${name}.log" 2>&1 &
    echo $! > "../logs/${name}.pid"
    cd ..
    echo -e "${GREEN}✓ ${name} started (PID: $(cat logs/${name}.pid))${NC}"
}

# Create logs directory
mkdir -p logs

# Start services
echo -e "\n${YELLOW}Starting services...${NC}"

# Start backend
start_service "backend" "backend" "npm start"

# Wait a bit for backend to start
sleep 2

# Start server
start_service "server" "server" "npm start"

# Wait a bit for server to start
sleep 2

# Start frontend
start_service "frontend" "frontend" "npm run dev"

echo -e "\n${GREEN}=== All Services Started ===${NC}\n"
echo -e "Services running:"
echo -e "  - Backend:  http://localhost:8000"
echo -e "  - Server:   http://localhost:5000"
echo -e "  - Frontend: http://localhost:5173"
echo -e "\nLogs are in the logs/ directory"
echo -e "To stop all services: ./scripts/stop-local.sh"








