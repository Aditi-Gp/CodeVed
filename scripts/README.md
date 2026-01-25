# Scripts Directory

This directory contains automation scripts for development, testing, and deployment.

## Local Development Scripts

### `setup-local.sh`
Initial setup for local development:
- Checks system dependencies (Node.js, GCC, Java, Python)
- Installs npm packages for all services
- Creates .env files with default values
- Creates necessary directories

**Usage:**
```bash
./scripts/setup-local.sh
```

### `start-local.sh`
Starts all services in the background:
- Backend (port 8000)
- Server (port 5000)
- Frontend (port 5173)

**Usage:**
```bash
./scripts/start-local.sh
```

**Output:**
- Services run in background
- Logs saved to `logs/` directory
- PIDs saved for easy stopping

### `stop-local.sh`
Stops all running services:
- Kills processes by PID
- Cleans up PID files
- Kills any leftover node processes

**Usage:**
```bash
./scripts/stop-local.sh
```

### `test-local.sh`
Tests that all services are running and responding:
- Checks backend health
- Checks server health
- Checks frontend availability
- Tests code execution

**Usage:**
```bash
./scripts/test-local.sh
```

## Docker Scripts

### `test-docker.sh`
Tests Docker setup:
- Verifies Docker is running
- Checks all containers are running
- Tests service health endpoints
- Tests code execution

**Usage:**
```bash
./scripts/test-docker.sh
```

## Notes

- All scripts are executable and include error handling
- Scripts use colored output for better readability
- Logs are saved to `logs/` directory
- Scripts check prerequisites before execution










