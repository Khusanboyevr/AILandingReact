import axios from 'axios';

const BASE_URL = 'https://dastur-aw8r.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug log request
  console.log(`🚀 API Request: [${config.method.toUpperCase()}] ${config.url}`, config.data || '');
  
  return config;
}, (error) => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Debug log success
    console.log(`✅ API Response: [${response.config.method.toUpperCase()}] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Debug log error
    console.error(`❌ API Error: [${error.config?.method?.toUpperCase() || 'UNKNOWN'}] ${error.config?.url || 'UNKNOWN'}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
