# Troubleshooting Guide

Common issues and solutions for local development.

## Frontend-Backend Connectivity Issues

### Problem: Problem list doesn't load

**Symptoms:**
- Blank page on `/problems`
- Console shows network errors

**Solutions:**
1. **Check if server is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Verify API URL:**
   - Check `frontend/.env` has `VITE_API_SERVER_URL=http://localhost:5000`
   - Restart frontend after changing .env

3. **Check CORS:**
   - Verify `server/.env` has `ALLOWED_ORIGINS=http://localhost:5173`
   - Check browser console for CORS errors

4. **Check MongoDB:**
   - Ensure MongoDB is running
   - Verify `MONGO_URI` in `server/.env` is correct

### Problem: Code execution doesn't work

**Symptoms:**
- "Running..." shows but no response
- No request reaches backend

**Solutions:**
1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/
   ```

2. **Verify execution backend URL:**
   - Check `frontend/.env` has `VITE_EXECUTION_BACKEND_URL=http://localhost:8000`
   - Restart frontend after changing .env

3. **Check browser console:**
   - Look for network errors
   - Check if request is being sent to correct URL

4. **Verify CORS:**
   - Check `backend/.env` has `ALLOWED_ORIGINS=http://localhost:5173`

### Problem: Login/Registration doesn't work

**Symptoms:**
- Form submits but nothing happens
- Error messages don't show

**Solutions:**
1. **Check server is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Verify API URL:**
   - Check `frontend/.env` has `VITE_API_SERVER_URL=http://localhost:5000`

3. **Check browser console:**
   - Look for network errors
   - Check request/response in Network tab

4. **Verify MongoDB connection:**
   - Ensure MongoDB is running
   - Check connection string in `server/.env`

## Environment Variables

### Required Environment Variables

**Backend (port 8000):**
```env
PORT=8000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Server (port 5000):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/algou
JWT_SECRET=dev-secret-change-in-production
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend:**
```env
VITE_API_SERVER_URL=http://localhost:5000
VITE_EXECUTION_BACKEND_URL=http://localhost:8000
```

### Important Notes

- **Vite requires restart** after changing `.env` files
- Environment variables must start with `VITE_` to be accessible in frontend
- Use `http://localhost:5173` (not `https`) for local development

## Port Conflicts

### Check if ports are in use:
```bash
# Check port 8000 (backend)
lsof -i :8000

# Check port 5000 (server)
lsof -i :5000

# Check port 5173 (frontend)
lsof -i :5173
```

### Kill process using port:
```bash
kill -9 <PID>
```

## CORS Issues

### Symptoms:
- Browser console shows CORS errors
- Requests fail with "Not allowed by CORS"

### Solutions:
1. **Verify CORS configuration:**
   - Check `ALLOWED_ORIGINS` in both `backend/.env` and `server/.env`
   - Must include `http://localhost:5173`

2. **Check origin header:**
   - Browser sends origin automatically
   - Ensure no typos in allowed origins

3. **Restart services:**
   - CORS is configured at startup
   - Restart backend and server after changing CORS config

## MongoDB Issues

### Check MongoDB is running:
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB (if not running)
mongod
```

### Verify connection:
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/algou
```

### Common MongoDB errors:
- **Connection refused**: MongoDB not running
- **Authentication failed**: Wrong credentials in MONGO_URI
- **Database not found**: Will be created automatically

## Network Debugging

### Check services are accessible:
```bash
# Test backend
curl http://localhost:8000/

# Test server
curl http://localhost:5000/health

# Test frontend
curl http://localhost:5173/
```

### Check API endpoints:
```bash
# Test problems endpoint
curl http://localhost:5000/api/problems

# Test code execution
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include <iostream>\nint main(){std::cout<<\"Hello\";return 0;}","input":""}'
```

## Browser Console Debugging

### Enable detailed logging:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - Network errors
   - CORS errors
   - API errors
   - JavaScript errors

### Network Tab:
1. Open DevTools → Network tab
2. Check:
   - Request URL (should match expected)
   - Request method (GET, POST, etc.)
   - Status code (200 = success, 4xx/5xx = error)
   - Response body

## Quick Fixes

### Reset everything:
```bash
# Stop all services
./scripts/stop-local.sh

# Clean and restart
rm -rf node_modules backend/node_modules server/node_modules frontend/node_modules
./scripts/setup-local.sh
./scripts/start-local.sh
```

### Check all services:
```bash
# Run test script
./scripts/test-local.sh
```

### View logs:
```bash
# Backend logs
tail -f logs/backend.log

# Server logs
tail -f logs/server.log

# Frontend logs (in browser console)
```

## Common Error Messages

### "Cannot connect to server"
- **Cause**: Server not running or wrong URL
- **Fix**: Start server and verify URL in `.env`

### "CORS policy blocked"
- **Cause**: Origin not in allowed list
- **Fix**: Add origin to `ALLOWED_ORIGINS` in backend/server `.env`

### "Network Error"
- **Cause**: Service not running or wrong port
- **Fix**: Verify service is running on correct port

### "Failed to fetch"
- **Cause**: Network issue or service down
- **Fix**: Check service status and network connectivity

## Still Having Issues?

1. Check all services are running:
   ```bash
   ps aux | grep node
   ```

2. Verify environment variables:
   ```bash
   cat backend/.env
   cat server/.env
   cat frontend/.env
   ```

3. Check logs for errors:
   ```bash
   cat logs/backend.log
   cat logs/server.log
   ```

4. Restart all services:
   ```bash
   ./scripts/stop-local.sh
   ./scripts/start-local.sh
   ```




