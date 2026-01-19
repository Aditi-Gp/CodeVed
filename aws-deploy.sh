#!/bin/bash
# AWS Deployment Script
# Builds and pushes Docker images to ECR, then deploys to ECS

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-}
ECR_REPOSITORY_PREFIX=${ECR_REPOSITORY_PREFIX:-algou}
CLUSTER_NAME=${CLUSTER_NAME:-algou-cluster}
SERVICE_NAME_BACKEND=${SERVICE_NAME_BACKEND:-algou-backend}
SERVICE_NAME_SERVER=${SERVICE_NAME_SERVER:-algou-server}
SERVICE_NAME_FRONTEND=${SERVICE_NAME_FRONTEND:-algou-frontend}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Get AWS account ID if not set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${YELLOW}Using AWS Account ID: $AWS_ACCOUNT_ID${NC}"
fi

# ECR base URL
ECR_BASE_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Login to ECR
echo -e "${GREEN}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE_URL

# Function to build and push image
build_and_push() {
    local SERVICE=$1
    local IMAGE_NAME="${ECR_REPOSITORY_PREFIX}-${SERVICE}"
    local IMAGE_TAG="${ECR_BASE_URL}/${IMAGE_NAME}:latest"
    
    echo -e "${GREEN}Building ${SERVICE}...${NC}"
    docker build -t $IMAGE_NAME -f $SERVICE/Dockerfile $SERVICE/
    
    echo -e "${GREEN}Tagging ${IMAGE_NAME}...${NC}"
    docker tag $IMAGE_NAME:latest $IMAGE_TAG
    
    # Create ECR repository if it doesn't exist
    echo -e "${GREEN}Creating ECR repository if needed...${NC}"
    aws ecr describe-repositories --repository-names $IMAGE_NAME --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $IMAGE_NAME --region $AWS_REGION --image-scanning-configuration scanOnPush=true
    
    echo -e "${GREEN}Pushing ${IMAGE_NAME} to ECR...${NC}"
    docker push $IMAGE_TAG
    
    echo -e "${GREEN}Successfully pushed ${IMAGE_NAME}${NC}"
}

# Build and push all services
build_and_push "backend"
build_and_push "server"
build_and_push "frontend"

echo -e "${GREEN}All images built and pushed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update ECS task definitions with new image URIs"
echo "2. Update ECS services to use new task definitions"
echo "3. Or use AWS CodePipeline/CodeDeploy for automated deployment"








