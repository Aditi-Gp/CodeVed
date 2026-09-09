const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || "http://localhost:5000";
const EXECUTION_BACKEND_URL = import.meta.env.VITE_EXECUTION_BACKEND_URL || "http://localhost:8000";

export const getToken = () => window.localStorage.getItem("codeved_token");

export const saveSession = ({ token, refreshToken, user }) => {
  window.localStorage.setItem("codeved_token", token);
  if (refreshToken) window.localStorage.setItem("codeved_refresh_token", refreshToken);
  if (user) window.localStorage.setItem("codeved_user", JSON.stringify(user));
};

export const clearSession = () => {
  window.localStorage.removeItem("codeved_token");
  window.localStorage.removeItem("codeved_refresh_token");
  window.localStorage.removeItem("codeved_user");
};

export const refreshSession = async () => {
  const refreshToken = window.localStorage.getItem("codeved_refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_SERVER_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Session refresh failed");
  saveSession(payload);
  return payload;
};

async function request(baseUrl, endpoint, options = {}, retry = true) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && retry && baseUrl === API_SERVER_URL && endpoint !== "/api/auth/refresh") {
      try {
        await refreshSession();
        return request(baseUrl, endpoint, options, false);
      } catch {
        clearSession();
      }
    }
    const error = new Error(payload.error || payload.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const apiRequest = (endpoint, options) => request(API_SERVER_URL, endpoint, options);
export const executionRequest = (endpoint, options) => request(EXECUTION_BACKEND_URL, endpoint, options);

export const login = (credentials) => apiRequest("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});

export const register = (details) => apiRequest("/api/auth/register", {
  method: "POST",
  body: JSON.stringify(details),
});

export const getProblems = () => apiRequest("/api/problems");
export const getProblem = (id) => apiRequest(`/api/problems/${encodeURIComponent(id)}`);
export const getDashboard = () => apiRequest("/api/users/me/dashboard");
export const verifyToken = () => apiRequest("/api/auth/verify");
export const getProgress = (userId) => apiRequest(`/api/auth/${encodeURIComponent(userId)}/progress`);
export const getSupportedLanguages = () => executionRequest("/languages");
export const getExecutionHealth = () => executionRequest("/");

export const runCode = (language, code, input = "") => executionRequest("/run", {
  method: "POST",
  body: JSON.stringify({ language, code, input }),
});

export const submitCode = (problemId, language, code) => apiRequest(`/api/submit/${encodeURIComponent(problemId)}`, {
  method: "POST",
  body: JSON.stringify({ language, code }),
});

export const explainCode = (language, code) => apiRequest("/api/explain", {
  method: "POST",
  body: JSON.stringify({ language, code }),
});