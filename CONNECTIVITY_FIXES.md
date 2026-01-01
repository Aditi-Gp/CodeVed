# Frontend-Backend Connectivity Fixes

## Issues Fixed

### 1. Problem List Not Loading
**Problem:** Blank page on `/problems` route

**Root Cause:**
- Template string bug: `'${import.meta.env.VITE_BACKEND_URL}/api/problems'` used single quotes instead of backticks
- Using raw `axios` instead of configured `api` instance
- No error handling or loading states

**Fix:**
- ✅ Fixed template string to use backticks
- ✅ Switched to `api` from `axiosConfig.js`
- ✅ Added loading and error states
- ✅ Added proper error handling

### 2. Code Execution Not Working
**Problem:** "Running..." shows but no request reaches backend

**Root Cause:**
- Frontend was using `VITE_BACKEND_URL` which defaulted to port 5000 (API server)
- Code execution endpoint `/run` is on port 8000 (execution backend)
- No distinction between API server and execution backend

**Fix:**
- ✅ Created `apiConfig.js` to distinguish between:
  - API Server (port 5000): `/api/*` endpoints
  - Execution Backend (port 8000): `/run` endpoint
- ✅ Created `executionApi.js` for code execution requests
- ✅ Updated Compiler.jsx to use `executionApi` for `/run` endpoint
- ✅ Added better error messages for connection failures

### 3. Login/Registration Not Working
**Problem:** Forms submit but nothing happens

**Root Cause:**
- Using raw `axios` instead of configured `api` instance
- Wrong API URL configuration
- No proper error handling

**Fix:**
- ✅ Switched to `api` from `axiosConfig.js`
- ✅ Updated to use `API_SERVER_URL` from `apiConfig.js`
- ✅ Added comprehensive error handling
- ✅ Added connection error detection

## Architecture Changes

### New API Configuration Structure

```
frontend/src/utils/
├── apiConfig.js          # Centralized API URL configuration
├── axiosConfig.js        # API server client (port 5000)
├── executionApi.js       # Execution backend client (port 8000)
└── auth.js              # Auth utilities (uses apiConfig)
```

### Service Separation

**API Server (port 5000):**
- `/api/auth/*` - Authentication
- `/api/problems` - Problem management
- `/api/submit/*` - Problem submissions
- `/api/explain` - AI explanations

**Execution Backend (port 8000):**
- `/run` - Code execution
- `/languages` - Supported languages

### Environment Variables

**Old (deprecated):**
```env
VITE_BACKEND_URL=http://localhost:5000
```

**New (recommended):**
```env
VITE_API_SERVER_URL=http://localhost:5000
VITE_EXECUTION_BACKEND_URL=http://localhost:8000
```

## Files Modified

### Frontend
- ✅ `frontend/src/utils/apiConfig.js` - New file
- ✅ `frontend/src/utils/executionApi.js` - New file
- ✅ `frontend/src/utils/axiosConfig.js` - Updated to use apiConfig
- ✅ `frontend/src/utils/auth.js` - Updated to use apiConfig
- ✅ `frontend/src/pages/ProblemList.jsx` - Fixed template string, added error handling
- ✅ `frontend/src/pages/Compiler.jsx` - Switched to executionApi
- ✅ `frontend/src/pages/Login.jsx` - Switched to api, better error handling
- ✅ `frontend/src/pages/Register.jsx` - Switched to api, better error handling
- ✅ `frontend/src/pages/ProblemDetails.jsx` - Fixed language fetching
- ✅ `frontend/src/Editor.jsx` - Fixed to use executionApi for code execution

### Backend
- ✅ `backend/index.js` - Improved CORS configuration
- ✅ `server/server.js` - Improved CORS configuration

### Scripts
- ✅ `scripts/setup-local.sh` - Updated to create correct .env files

## Testing

### Verify Fixes

1. **Problem List:**
   ```bash
   # Start server
   cd server && npm start
   
   # In browser: http://localhost:5173/problems
   # Should show problems or loading/error state
   ```

2. **Code Execution:**
   ```bash
   # Start backend
   cd backend && npm start
   
   # In browser: http://localhost:5173/compiler
   # Click "Run Code" - should execute and show output
   ```

3. **Login/Registration:**
   ```bash
   # Start server
   cd server && npm start
   
   # In browser: http://localhost:5173/login
   # Should work with proper error messages
   ```

### Quick Test Commands

```bash
# Test API server
curl http://localhost:5000/health
curl http://localhost:5000/api/problems

# Test execution backend
curl http://localhost:8000/
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"#include <iostream>\nint main(){std::cout<<\"Hello\";return 0;}","input":""}'
```

## CORS Configuration

Both services now properly handle CORS:

- ✅ Allow `http://localhost:5173` (frontend)
- ✅ Allow requests with no origin (for testing)
- ✅ Proper error logging for CORS rejections
- ✅ Support for credentials

## Next Steps

1. **Update .env files:**
   ```bash
   # Run setup script to create correct .env files
   ./scripts/setup-local.sh
   ```

2. **Restart services:**
   ```bash
   # Stop existing services
   ./scripts/stop-local.sh
   
   # Start fresh
   ./scripts/start-local.sh
   ```

3. **Test in browser:**
   - Open http://localhost:5173
   - Test problem list
   - Test code execution
   - Test login/registration

## Common Issues

### "Cannot connect to server"
- **Check:** Is server running on port 5000?
- **Fix:** Start server: `cd server && npm start`

### "Cannot connect to execution service"
- **Check:** Is backend running on port 8000?
- **Fix:** Start backend: `cd backend && npm start`

### CORS errors
- **Check:** Are origins in `ALLOWED_ORIGINS`?
- **Fix:** Update `.env` files and restart services

See `TROUBLESHOOTING.md` for more detailed help.



