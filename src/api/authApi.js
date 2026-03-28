import apiClient from './apiClient';

/**
 * Login using the DGU 53519 API.
 * The API exposes two auth endpoints:
 *   POST /api/v1/auth/login/   → custom login returning { token } or { access }
 *   POST /api/v1/auth/token/   → JWT pair returning { access, refresh }
 * We try /auth/login/ first (as specified in requirements), fallback to /auth/token/.
 */
export const login = async (username, password) => {
  // Attempt 1: /api/v1/auth/login/
  try {
    const response = await apiClient.post('/api/v1/auth/login/', { username, password });
    const token =
      response.data?.access ||
      response.data?.token ||
      response.data?.key ||
      response.data?.auth_token;
    if (token) return { success: true, data: response.data, token };
  } catch (err1) {
    // If it's a 404 (endpoint doesn't exist), try the token endpoint
    if (err1.response?.status !== 404 && err1.response?.status !== 405) {
      const message =
        err1.response?.data?.detail ||
        err1.response?.data?.non_field_errors?.[0] ||
        err1.response?.data?.message ||
        'Invalid credentials. Please try again.';
      return { success: false, message };
    }
  }

  // Attempt 2: /api/v1/auth/token/ (JWT pair endpoint)
  try {
    const response = await apiClient.post('/api/v1/auth/token/', { username, password });
    const token = response.data?.access;
    if (token) return { success: true, data: response.data, token };
    return { success: false, message: 'No token received from server.' };
  } catch (err2) {
    const message =
      err2.response?.data?.detail ||
      err2.response?.data?.non_field_errors?.[0] ||
      err2.response?.data?.message ||
      'Login failed. Please check your credentials.';
    return { success: false, message };
  }
};
