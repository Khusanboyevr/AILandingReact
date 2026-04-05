import apiClient from './apiClient';
import demoService from './demoService';

/**
 * Login using the DGU 53519 API.
 * The API exposes two auth endpoints:
 *   POST /api/v1/auth/login/   → custom login returning { token } or { access }
 *   POST /api/v1/auth/token/   → JWT pair returning { access, refresh }
 * We try /auth/login/ first (as specified in requirements), fallback to /auth/token/.
 */
export const login = async (username, password) => {
  // Always use Demo Mode logic first as per user request to avoid CORS blockers
  const demoResult = await demoService.login({ username, password });
  if (demoResult && !demoResult.error) {
    return { success: true, token: 'DEMO_TOKEN_' + Date.now(), data: demoResult };
  }

  try {
    // Keep real API logic for those who specifically need it, but it's secondary now
    const response = await apiClient.post('auth/login/', { username, password });
    const token = response.data?.access || response.data?.token || response.data?.access_token || response.data?.data?.token;
    if (token) return { success: true, data: response.data, token };
    return { success: false, message: 'Token topilmadi.' };
  } catch (err) {
    return { success: false, message: 'Backend ulanishda xatolik (CORS yoki Server). Demo rejimidan foydalaning.' };
  }
};
