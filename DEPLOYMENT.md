# AWS Deployment Guide

This guide covers deploying the CodeVed Online Compiler to AWS using ECS Fargate.

## Prerequisites

1. AWS CLI installed and configured
2. Docker installed
3. AWS account with appropriate permissions
4. ECR repositories created (or use the deployment script)
5. ECS cluster created
6. VPC and networking configured
7. Application Load Balancer (ALB) configured
8. Secrets Manager configured for sensitive data

## Architecture

- **Backend Service**: Code execution service (port 8000)
- **Server Service**: API and authentication service (port 5000)
- **Frontend Service**: React frontend served by Nginx (port 80)
- **MongoDB**: Database (can use AWS DocumentDB or self-hosted)

## Step 1: Set Up AWS Resources

### 1.1 Create ECR Repositories

```bash
aws ecr create-repository --repository-name algou-backend --region us-east-1
aws ecr create-repository --repository-name algou-server --region us-east-1
aws ecr create-repository --repository-name algou-frontend --region us-east-1
```

### 1.2 Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name algou-cluster --region us-east-1
```

### 1.3 Create IAM Roles

Create execution role and task role for ECS tasks with appropriate permissions.

### 1.4 Set Up Secrets Manager

Store sensitive configuration in AWS Secrets Manager:

- `algou/server/mongo-uri`
- `algou/server/jwt-secret`
- `algou/server/openai-api-key`
- `algou/backend/execution-timeout`
- `algou/backend/memory-limit`
- `algou/backend/allowed-origins`
- `algou/server/allowed-origins`

## Step 2: Build and Push Docker Images

### Option A: Using Deployment Script

```bash
chmod +x aws-deploy.sh
export AWS_REGION=us-east-1
./aws-deploy.sh
```

### Option B: Manual Build and Push

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -t algou-backend ./backend
docker tag algou-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-backend:latest

# Build and push server
docker build -t algou-server ./server
docker tag algou-server:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-server:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-server:latest

# Build and push frontend
docker build -t algou-frontend ./frontend
docker tag algou-frontend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/algou-frontend:latest
```

## Step 3: Register Task Definitions

Update the task definition JSON files with your AWS account ID and region, then register:

```bash
aws ecs register-task-definition --cli-input-json file://aws-task-definitions/backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://aws-task-definitions/server-task-definition.json
aws ecs register-task-definition --cli-input-json file://aws-task-definitions/frontend-task-definition.json
```

## Step 4: Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster algou-cluster \
  --service-name algou-backend \
  --task-definition algou-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Server service
aws ecs create-service \
  --cluster algou-cluster \
  --service-name algou-server \
  --task-definition algou-server \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/server-tg/xxx,containerName=server,containerPort=5000"

# Frontend service
aws ecs create-service \
  --cluster algou-cluster \
  --service-name algou-frontend \
  --task-definition algou-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/frontend-tg/xxx,containerName=frontend,containerPort=80"
```

## Step 5: Configure Application Load Balancer

Set up ALB with:
- Frontend target group (port 80)
- Backend target group (port 8000)
- Server target group (port 5000)
- SSL/TLS certificates for HTTPS
- Health checks configured

## Step 6: Set Up CloudWatch Logs

Create log groups:

```bash
aws logs create-log-group --log-group-name /ecs/algou-backend
aws logs create-log-group --log-group-name /ecs/algou-server
aws logs create-log-group --log-group-name /ecs/algou-frontend
```

## Step 7: Environment Variables

Update task definitions with production environment variables:
- `NODE_ENV=production`
- `VITE_BACKEND_URL` (frontend) - should point to your API domain
- All secrets should come from Secrets Manager

## Step 8: Database Setup

### Option A: AWS DocumentDB

Create DocumentDB cluster and update MONGO_URI in Secrets Manager.

### Option B: Self-Hosted MongoDB

Deploy MongoDB on EC2 or use MongoDB Atlas.

## Monitoring and Maintenance

1. **CloudWatch**: Monitor logs, metrics, and alarms
2. **ECS Service Auto Scaling**: Configure auto-scaling based on CPU/memory
3. **Health Checks**: Ensure health checks are passing
4. **Backup**: Regular backups of MongoDB
5. **Security**: Regular security updates and patches

## Troubleshooting

- Check CloudWatch logs for errors
- Verify security groups allow traffic
- Ensure secrets are correctly configured
- Check ECS service events for deployment issues
- Verify ALB target health

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Right-size task definitions (CPU/memory)
- Use CloudWatch Logs retention policies
- Consider Reserved Capacity for predictable workloads

## Security Best Practices

1. Use Secrets Manager for all sensitive data
2. Enable VPC flow logs
3. Use security groups with least privilege
4. Enable WAF on ALB
5. Use HTTPS/TLS everywhere
6. Regular security audits
7. Enable ECR image scanning





