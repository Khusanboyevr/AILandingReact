import apiClient from './apiClient';

/**
 * Login using the DGU 53519 API.
 * The API exposes two auth endpoints:
 *   POST /api/v1/auth/login/   → custom login returning { token } or { access }
 *   POST /api/v1/auth/token/   → JWT pair returning { access, refresh }
 * We try /auth/login/ first (as specified in requirements), fallback to /auth/token/.
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/api/v1/auth/login/', { username, password });
    
    // As per Swagger, the response contains 'access', 'refresh', and 'token'
    const token = response.data?.access || response.data?.token;
    
    if (token) {
      return { success: true, data: response.data, token };
    }
    
    return { success: false, message: 'Login succeeded but no token received.' };
  } catch (err) {
    // Extract error message from API response
    let message = 'Login failed. Please check your credentials.';
    
    if (err.response?.data) {
      const data = err.response.data;
      message = data.detail || 
                data.non_field_errors?.[0] || 
                data.message || 
                (typeof data === 'string' ? data : JSON.stringify(data));
    } else if (err.request) {
      message = 'Could not connect to the server. Please check your internet connection.';
    }
    
    return { success: false, message };
  }
};
