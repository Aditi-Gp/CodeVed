# Testing Guide

This guide walks you through testing the application in three stages:
1. **Local Development** - Run without Docker
2. **Docker** - Run with Docker Compose
3. **AWS Deployment** - Deploy to AWS

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- AWS CLI (for AWS deployment)
- GCC, Java, Python3 (for local testing)

## Stage 1: Local Development Testing

### Step 1: Initial Setup

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run setup script
./scripts/setup-local.sh
```

This will:
- Check system dependencies
- Install all npm packages
- Create .env files
- Create necessary directories

### Step 2: Start Services

**Option A: Using the start script**
```bash
./scripts/start-local.sh
```

**Option B: Manual start (in separate terminals)**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Server
cd server
npm start

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Step 3: Test Services

```bash
# Run test script
./scripts/test-local.sh
```

Or test manually:
```bash
# Test backend
curl http://localhost:8000/

# Test server health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:5173/

# Test code execution
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include <iostream>\nint main(){std::cout<<\"Hello\";return 0;}","input":""}'
```

### Step 4: Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Server API: http://localhost:5000

### Step 5: Stop Services

```bash
./scripts/stop-local.sh
```

## Stage 2: Docker Testing

### Step 1: Build and Start Containers

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check container status
docker-compose ps
```

### Step 2: Test Docker Setup

```bash
# Run test script
./scripts/test-docker.sh
```

Or test manually:
```bash
# Test backend
curl http://localhost:8000/

# Test server
curl http://localhost:5000/health

# Test frontend
curl http://localhost/

# Test code execution
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include <iostream>\nint main(){std::cout<<\"Hello\";return 0;}","input":""}'
```

### Step 3: Access Application

- Frontend: http://localhost
- Backend API: http://localhost:8000
- Server API: http://localhost:5000
- MongoDB: localhost:27017

### Step 4: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f server
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Step 5: Stop Containers

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Step 6: Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

## Stage 3: AWS Deployment Testing

### Step 1: Prerequisites

```bash
# Install AWS CLI
# Configure AWS credentials
aws configure

# Verify access
aws sts get-caller-identity
```

### Step 2: Set Environment Variables

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

### Step 3: Create AWS Resources

```bash
# Create ECR repositories
aws ecr create-repository --repository-name algou-backend --region $AWS_REGION
aws ecr create-repository --repository-name algou-server --region $AWS_REGION
aws ecr create-repository --repository-name algou-frontend --region $AWS_REGION

# Create ECS cluster
aws ecs create-cluster --cluster-name algou-cluster --region $AWS_REGION

# Create CloudWatch log groups
aws logs create-log-group --log-group-name /ecs/algou-backend --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/algou-server --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/algou-frontend --region $AWS_REGION
```

### Step 4: Build and Push Images

```bash
# Using deployment script
./aws-deploy.sh

# Or using Makefile
make deploy
```

### Step 5: Set Up Secrets Manager

```bash
# Store secrets (replace with your actual values)
aws secretsmanager create-secret \
  --name algou/server/mongo-uri \
  --secret-string "mongodb://your-connection-string" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name algou/server/jwt-secret \
  --secret-string "your-jwt-secret" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name algou/server/openai-api-key \
  --secret-string "your-openai-key" \
  --region $AWS_REGION
```

### Step 6: Register Task Definitions

```bash
# Update task definitions with your account ID and region
# Then register them
aws ecs register-task-definition \
  --cli-input-json file://aws-task-definitions/backend-task-definition.json \
  --region $AWS_REGION

aws ecs register-task-definition \
  --cli-input-json file://aws-task-definitions/server-task-definition.json \
  --region $AWS_REGION

aws ecs register-task-definition \
  --cli-input-json file://aws-task-definitions/frontend-task-definition.json \
  --region $AWS_REGION
```

### Step 7: Create ECS Services

Follow the instructions in `DEPLOYMENT.md` to create ECS services.

### Step 8: Test AWS Deployment

```bash
# Get service endpoints
# Test backend
curl https://your-backend-domain.com/

# Test server
curl https://your-api-domain.com/health

# Test frontend
curl https://your-frontend-domain.com/
```

### Step 9: Monitor Deployment

```bash
# View ECS service status
aws ecs describe-services \
  --cluster algou-cluster \
  --services algou-backend algou-server algou-frontend \
  --region $AWS_REGION

# View CloudWatch logs
aws logs tail /ecs/algou-backend --follow --region $AWS_REGION
```

## Testing Checklist

### Local Development
- [ ] All services start successfully
- [ ] Backend responds to health check
- [ ] Server responds to health check
- [ ] Frontend loads in browser
- [ ] Code execution works (C++, Java, Python)
- [ ] Authentication works (login/register)
- [ ] AI explanation works

### Docker
- [ ] All containers start successfully
- [ ] Containers are healthy
- [ ] Services communicate correctly
- [ ] Code execution works
- [ ] Database connection works
- [ ] Logs are accessible

### AWS
- [ ] Images build and push successfully
- [ ] Task definitions register successfully
- [ ] Services deploy successfully
- [ ] Services are healthy
- [ ] Load balancer routes correctly
- [ ] SSL/TLS works
- [ ] Monitoring and logs work

## Troubleshooting

### Local Development Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :8000
lsof -i :5000
lsof -i :5173

# Kill process
kill -9 <PID>
```

**MongoDB connection issues:**
- Ensure MongoDB is running
- Check connection string in server/.env
- Verify MongoDB is accessible

### Docker Issues

**Containers won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

**Port conflicts:**
- Change ports in docker-compose.yml
- Stop conflicting services

### AWS Issues

**Image push fails:**
- Verify AWS credentials
- Check ECR repository exists
- Verify IAM permissions

**Service won't start:**
- Check CloudWatch logs
- Verify task definition
- Check security groups
- Verify secrets are configured

## Next Steps

After successful testing:
1. Review `DEPLOYMENT_CHECKLIST.md`
2. Set up production monitoring
3. Configure auto-scaling
4. Set up backups
5. Document your deployment

