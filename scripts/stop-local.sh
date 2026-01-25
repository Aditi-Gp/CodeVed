#!/bin/bash
# Stop Local Development Servers

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Stopping Local Development Servers ===${NC}\n"

if [ ! -d "logs" ]; then
    echo -e "${RED}No logs directory found. Services may not be running.${NC}"
    exit 0
fi

# Stop services by PID
for service in backend server frontend; do
    if [ -f "logs/${service}.pid" ]; then
        PID=$(cat "logs/${service}.pid")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "Stopping ${service} (PID: $PID)..."
            kill $PID 2>/dev/null || true
            rm "logs/${service}.pid"
            echo -e "${GREEN}✓ ${service} stopped${NC}"
        else
            echo -e "${RED}${service} was not running${NC}"
            rm "logs/${service}.pid"
        fi
    fi
done

# Also kill any node processes that might be leftover
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo -e "\n${GREEN}=== All Services Stopped ===${NC}"











