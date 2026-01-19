# Quick Start Guide

Get up and running in 3 simple steps.

## 🚀 Quick Start

### 1. Local Development (5 minutes)

```bash
# Setup
./scripts/setup-local.sh

# Start services
./scripts/start-local.sh

# Test
./scripts/test-local.sh

# Access: http://localhost:5173
```

### 2. Docker (2 minutes)

```bash
# Start everything
docker-compose up -d --build

# Test
./scripts/test-docker.sh

# Access: http://localhost
```

### 3. AWS Deployment (30 minutes)

```bash
# Set AWS credentials
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Deploy
./aws-deploy.sh

# Follow DEPLOYMENT.md for complete setup
```

## 📋 Prerequisites

- **Local**: Node.js 18+, GCC, Java, Python3
- **Docker**: Docker & Docker Compose
- **AWS**: AWS CLI, AWS Account

## 🧪 Testing Order

1. ✅ **Local** - Test without containers
2. ✅ **Docker** - Test with containers
3. ✅ **AWS** - Deploy to production

See `TESTING_GUIDE.md` for detailed instructions.

## 🛠️ Common Commands

```bash
# Local
./scripts/setup-local.sh    # Initial setup
./scripts/start-local.sh     # Start services
./scripts/stop-local.sh      # Stop services
./scripts/test-local.sh      # Test services

# Docker
docker-compose up -d         # Start containers
docker-compose down          # Stop containers
docker-compose logs -f       # View logs
./scripts/test-docker.sh     # Test containers

# AWS
./aws-deploy.sh              # Build and push to ECR
make deploy                  # Alternative deployment
```

## 📚 Documentation

- `TESTING_GUIDE.md` - Detailed testing instructions
- `DEPLOYMENT.md` - AWS deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist








