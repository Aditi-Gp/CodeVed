# Deployment Checklist

Use this checklist to ensure a smooth deployment to AWS.

## Pre-Deployment

- [ ] Review and update all environment variables in `.env.example`
- [ ] Set up AWS account with appropriate IAM permissions
- [ ] Configure AWS CLI with credentials
- [ ] Review security groups and network configuration
- [ ] Set up domain name and SSL certificates (if using custom domain)

## AWS Infrastructure Setup

- [ ] Create VPC with public and private subnets
- [ ] Create security groups for each service
- [ ] Create Application Load Balancer (ALB)
- [ ] Configure target groups for backend, server, and frontend
- [ ] Set up SSL/TLS certificates in ACM
- [ ] Create ECS cluster
- [ ] Create ECR repositories (or use deployment script)
- [ ] Set up CloudWatch log groups
- [ ] Configure Secrets Manager with all sensitive data

## Database Setup

- [ ] Choose database option (DocumentDB, MongoDB Atlas, or self-hosted)
- [ ] Create database instance/cluster
- [ ] Configure database security groups
- [ ] Set up database backups
- [ ] Store MongoDB connection string in Secrets Manager

## Docker Images

- [ ] Test Docker builds locally using `docker-compose`
- [ ] Verify all services start correctly
- [ ] Test health checks
- [ ] Build and push images to ECR
- [ ] Tag images appropriately (latest, version tags)

## ECS Task Definitions

- [ ] Update task definition JSON files with correct:
  - [ ] AWS Account ID
  - [ ] Region
  - [ ] IAM role ARNs
  - [ ] Secrets Manager ARNs
  - [ ] Log group names
- [ ] Register task definitions in ECS
- [ ] Verify task definitions are correct

## ECS Services

- [ ] Create backend service
- [ ] Create server service
- [ ] Create frontend service
- [ ] Configure service auto-scaling (if needed)
- [ ] Set up service discovery (if needed)
- [ ] Verify services are running and healthy

## Load Balancer Configuration

- [ ] Configure ALB listeners (HTTP and HTTPS)
- [ ] Set up routing rules
- [ ] Configure health checks
- [ ] Set up SSL/TLS termination
- [ ] Configure WAF rules (optional but recommended)

## Security

- [ ] Review and update security groups (least privilege)
- [ ] Enable VPC flow logs
- [ ] Configure Secrets Manager properly
- [ ] Review IAM roles and policies
- [ ] Enable ECR image scanning
- [ ] Set up CloudTrail for audit logging
- [ ] Configure WAF rules for protection

## Monitoring & Logging

- [ ] Set up CloudWatch dashboards
- [ ] Configure CloudWatch alarms
- [ ] Set up log retention policies
- [ ] Configure SNS for alerts
- [ ] Set up application performance monitoring (optional)

## Testing

- [ ] Test backend service endpoints
- [ ] Test server API endpoints
- [ ] Test authentication flow
- [ ] Test code execution (C++, Java, Python)
- [ ] Test AI explanation feature
- [ ] Test frontend application
- [ ] Load testing (optional)

## DNS & Domain

- [ ] Configure Route 53 (if using AWS DNS)
- [ ] Set up DNS records pointing to ALB
- [ ] Verify SSL certificate is valid
- [ ] Test domain accessibility

## Post-Deployment

- [ ] Verify all services are healthy
- [ ] Test end-to-end user flows
- [ ] Monitor CloudWatch metrics
- [ ] Review CloudWatch logs for errors
- [ ] Set up backup procedures
- [ ] Document deployment process
- [ ] Create runbooks for common issues

## Cost Optimization

- [ ] Review and right-size task definitions
- [ ] Set up cost alerts
- [ ] Configure auto-scaling appropriately
- [ ] Review CloudWatch log retention
- [ ] Consider Reserved Capacity for predictable workloads

## Documentation

- [ ] Update deployment documentation
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Document rollback procedures
- [ ] Create runbooks for operations team

## Backup & Disaster Recovery

- [ ] Set up database backups
- [ ] Test backup restoration
- [ ] Document disaster recovery procedures
- [ ] Set up cross-region replication (if needed)

## Performance

- [ ] Review and optimize Docker images
- [ ] Configure appropriate resource limits
- [ ] Set up auto-scaling policies
- [ ] Review and optimize database queries
- [ ] Configure CDN for frontend (optional)

## Compliance & Governance

- [ ] Review compliance requirements
- [ ] Set up resource tagging
- [ ] Configure AWS Config (if required)
- [ ] Review data retention policies





