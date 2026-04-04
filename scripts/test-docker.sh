#!/bin/bash
# Test Docker Setup
# Verifies that Docker containers are running and responding

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Testing Docker Setup ===${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if containers are running
echo -e "\n${YELLOW}Checking containers...${NC}"



CONTAINERS=("algou-mongodb" "algou-backend" "algou-server" "algou-frontend")

for container in "${CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "${GREEN}✓ ${container} is running${NC}"
    else
        echo -e "${RED}✗ ${container} is not running${NC}"
        exit 1
    fi
done

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Test backend
echo -e "${YELLOW}Testing backend...${NC}"
if docker exec algou-backend wget -q --spider http://localhost:8000/; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    exit 1
fi

# Test server
echo -e "${YELLOW}Testing server...${NC}"
if docker exec algou-server wget -q --spider http://localhost:5000/health; then
    echo -e "${GREEN}✓ Server is responding${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
if docker exec algou-frontend wget -q --spider http://localhost/health; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    exit 1
fi

# Test code execution
echo -e "\n${YELLOW}Testing code execution...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include <iostream>\nint main(){std::cout<<\"Hello World\";return 0;}","input":""}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Code execution is working${NC}"
else
    echo -e "${RED}✗ Code execution failed${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "\n${GREEN}=== All Docker Tests Passed! ===${NC}"











