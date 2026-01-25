# Testing Order - Step by Step

This document outlines the exact order to test the application: Local → Docker → AWS

## 📋 Overview

```
┌─────────────┐
│   Step 1    │  Local Development (No Docker)
│             │  ✓ Test all services individually
│             │  ✓ Verify code execution
│             │  ✓ Test authentication
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 2    │  Docker Compose
│             │  ✓ Test containerized services
│             │  ✓ Verify inter-service communication
│             │  ✓ Test with MongoDB container
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 3    │  AWS Deployment
│             │  ✓ Build and push to ECR
│             │  ✓ Deploy to ECS
│             │  ✓ Test production environment
└─────────────┘
```

## 🎯 Step 1: Local Development Testing

### Prerequisites Check
```bash
# Verify you have:
node --version    # Should be 18+
npm --version
g++ --version     # For C++
javac -version    # For Java
python3 --version # For Python
```

### Setup (First Time Only)
```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Run setup
./scripts/setup-local.sh
```

**What it does:**
- ✅ Checks all dependencies
- ✅ Installs npm packages (backend, server, frontend)
- ✅ Creates .env files
- ✅ Creates necessary directories

### Start Services
```bash
# Option A: Use start script (recommended)
./scripts/start-local.sh

# Option B: Manual start (3 separate terminals)
# Terminal 1:
cd backend && npm start

# Terminal 2:
cd server && npm start

# Terminal 3:
cd frontend && npm run dev
```

### Test Services
```bash
# Run automated tests
./scripts/test-local.sh

# Or test manually:
curl http://localhost:8000/          # Backend
curl http://localhost:5000/health    # Server
curl http://localhost:5173/          # Frontend
```

### Manual Testing Checklist
- [ ] Open http://localhost:5173 in browser
- [ ] Test code execution (C++, Java, Python)
- [ ] Test user registration
- [ ] Test user login
- [ ] Test problem submission
- [ ] Test AI explanation

### Stop Services
```bash
./scripts/stop-local.sh
```

**Expected Results:**
- ✅ All services start without errors
- ✅ Frontend loads in browser
- ✅ Code execution works
- ✅ Authentication works

---

## 🐳 Step 2: Docker Testing

### Prerequisites
```bash
# Verify Docker is installed and running
docker --version
docker-compose --version
docker info
```

### Start Docker Services
```bash
# Build and start all containers
docker-compose up -d --build

# Watch logs
docker-compose logs -f
```

**What it starts:**
- ✅ MongoDB container
- ✅ Backend container (port 8000)
- ✅ Server container (port 5000)
- ✅ Frontend container (port 80)

### Test Docker Setup
```bash
# Run automated tests
./scripts/test-docker.sh

# Or test manually:
curl http://localhost:8000/          # Backend
curl http://localhost:5000/health    # Server
curl http://localhost/               # Frontend
```

### Verify Containers
```bash
# Check container status
docker-compose ps

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View logs
docker-compose logs backend
docker-compose logs server
docker-compose logs frontend
```

### Manual Testing Checklist
- [ ] Open http://localhost in browser
- [ ] Test code execution
- [ ] Test authentication
- [ ] Verify MongoDB connection
- [ ] Check logs for errors

### Stop Docker Services
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Expected Results:**
- ✅ All containers start successfully
- ✅ Services communicate correctly
- ✅ Database connection works
- ✅ Application functions normally

---

## ☁️ Step 3: AWS Deployment Testing

### Prerequisites
```bash
# Install and configure AWS CLI
aws --version
aws configure

# Verify access
aws sts get-caller-identity
```

### Set Environment Variables
```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

### Create AWS Resources

#### 1. Create ECR Repositories
```bash
aws ecr create-repository --repository-name algou-backend --region $AWS_REGION
aws ecr create-repository --repository-name algou-server --region $AWS_REGION
aws ecr create-repository --repository-name algou-frontend --region $AWS_REGION
```

#### 2. Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name algou-cluster --region $AWS_REGION
```

#### 3. Create CloudWatch Log Groups
```bash
aws logs create-log-group --log-group-name /ecs/algou-backend --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/algou-server --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/algou-frontend --region $AWS_REGION
```

### Build and Push Images
```bash
# Using deployment script
./aws-deploy.sh

# Or using Makefile
make deploy
```

**What it does:**
- ✅ Builds Docker images
- ✅ Tags images for ECR
- ✅ Pushes to ECR repositories

### Configure Secrets Manager
```bash
# Store MongoDB URI
aws secretsmanager create-secret \
  --name algou/server/mongo-uri \
  --secret-string "mongodb://your-connection-string" \
  --region $AWS_REGION

# Store JWT Secret
aws secretsmanager create-secret \
  --name algou/server/jwt-secret \
  --secret-string "your-strong-secret" \
  --region $AWS_REGION

# Store OpenAI API Key
aws secretsmanager create-secret \
  --name algou/server/openai-api-key \
  --secret-string "sk-your-key" \
  --region $AWS_REGION
```

### Register Task Definitions
```bash
# Update task definitions with your account ID and region first!
# Then register:
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

### Create ECS Services
Follow detailed instructions in `DEPLOYMENT.md`

### Test AWS Deployment
```bash
# Get service endpoints from ALB
# Test backend
curl https://your-backend-domain.com/

# Test server
curl https://your-api-domain.com/health

# Test frontend
curl https://your-frontend-domain.com/
```

### Monitor Deployment
```bash
# View service status
aws ecs describe-services \
  --cluster algou-cluster \
  --services algou-backend algou-server algou-frontend \
  --region $AWS_REGION

# View logs
aws logs tail /ecs/algou-backend --follow --region $AWS_REGION
```

**Expected Results:**
- ✅ Images build and push successfully
- ✅ Services deploy to ECS
- ✅ Services are healthy
- ✅ Application accessible via ALB

---

## 🔍 Troubleshooting by Stage

### Local Issues
- **Port conflicts**: Change ports in .env files
- **Missing dependencies**: Run `./scripts/setup-local.sh` again
- **MongoDB connection**: Ensure MongoDB is running

### Docker Issues
- **Build failures**: Check Dockerfile syntax
- **Container won't start**: Check logs with `docker-compose logs`
- **Port conflicts**: Update docker-compose.yml

### AWS Issues
- **Push failures**: Verify AWS credentials and ECR permissions
- **Service won't start**: Check CloudWatch logs and task definition
- **Health check failures**: Verify security groups and ALB configuration

---

## ✅ Final Checklist

After completing all three stages:

- [ ] Local development works
- [ ] Docker setup works
- [ ] AWS deployment successful
- [ ] All services healthy
- [ ] Application fully functional
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 📚 Additional Resources

- `QUICK_START.md` - Quick reference
- `TESTING_GUIDE.md` - Detailed testing instructions
- `DEPLOYMENT.md` - Complete AWS deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist











