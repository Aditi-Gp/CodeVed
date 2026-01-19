# Makefile for common deployment and development tasks

.PHONY: help build push deploy test clean

# Default target
help:
	@echo "Available targets:"
	@echo "  build          - Build all Docker images locally"
	@echo "  build-backend  - Build backend Docker image"
	@echo "  build-server   - Build server Docker image"
	@echo "  build-frontend - Build frontend Docker image"
	@echo "  push           - Push all images to ECR"
	@echo "  deploy         - Deploy to AWS (build + push)"
	@echo "  test           - Run tests"
	@echo "  clean          - Clean up Docker images and containers"
	@echo "  dev            - Start development environment with docker-compose"
	@echo "  stop           - Stop docker-compose services"
	@echo "  logs           - View docker-compose logs"

# Variables
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)
ECR_PREFIX ?= algou
DOCKER_COMPOSE = docker-compose

# Build all images
build: build-backend build-server build-frontend

build-backend:
	@echo "Building backend image..."
	docker build -t $(ECR_PREFIX)-backend -f backend/Dockerfile backend/

build-server:
	@echo "Building server image..."
	docker build -t $(ECR_PREFIX)-server -f server/Dockerfile server/

build-frontend:
	@echo "Building frontend image..."
	docker build -t $(ECR_PREFIX)-frontend -f frontend/Dockerfile frontend/

# Push to ECR
push:
	@if [ -z "$(AWS_ACCOUNT_ID)" ]; then \
		echo "Error: AWS_ACCOUNT_ID not set. Run: export AWS_ACCOUNT_ID=your-account-id"; \
		exit 1; \
	fi
	@echo "Logging in to ECR..."
	@aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
	@echo "Pushing images..."
	@docker tag $(ECR_PREFIX)-backend:latest $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-backend:latest
	@docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-backend:latest
	@docker tag $(ECR_PREFIX)-server:latest $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-server:latest
	@docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-server:latest
	@docker tag $(ECR_PREFIX)-frontend:latest $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-frontend:latest
	@docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_PREFIX)-frontend:latest
	@echo "Images pushed successfully!"

# Deploy (build + push)
deploy: build push
	@echo "Deployment complete!"

# Development
dev:
	@echo "Starting development environment..."
	$(DOCKER_COMPOSE) up -d

stop:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

# Testing
test:
	@echo "Running tests..."
	@cd backend && npm test || true
	@cd server && npm test || true
	@cd frontend && npm test || true

# Cleanup
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup complete!"

# Install dependencies locally
install:
	@echo "Installing dependencies..."
	@cd backend && npm install
	@cd server && npm install
	@cd frontend && npm install
	@echo "Dependencies installed!"

# Lint code
lint:
	@echo "Linting code..."
	@cd backend && npm run lint || true
	@cd server && npm run lint || true
	@cd frontend && npm run lint || true








