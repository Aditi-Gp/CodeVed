#!/bin/bash
# Test Local Setup
# Verifies that all services are running and responding

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Testing Local Setup ===${NC}\n"

# Test backend
echo -e "${YELLOW}Testing backend (http://localhost:8000)...${NC}"
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    exit 1
fi

# Test server
echo -e "${YELLOW}Testing server (http://localhost:5000)...${NC}"
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi

# Test frontend
echo -e "${YELLOW}Testing frontend (http://localhost:5173)...${NC}"
if curl -s http://localhost:5173/ > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
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

echo -e "\n${GREEN}=== All Tests Passed! ===${NC}"

