# Production Dockerfile for Backend (Code Execution Service)
# Multi-stage build for optimized image size

FROM node:18-alpine AS builder

# Install build dependencies for C++, Java, Python
RUN apk update && apk add --no-cache \
    g++ \
    gcc \
    make \
    python3 \
    openjdk17-jdk \
    openjdk17-jre \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    openjdk17-jdk \
    openjdk17-jre \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create directories for execution files
RUN mkdir -p codes inputs outputs && \
    chown -R nodejs:nodejs codes inputs outputs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
