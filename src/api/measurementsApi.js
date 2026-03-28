import apiClient from './apiClient';
import { getToken } from '../utils/auth';

export const createMeasurement = async (data) => {
  if (getToken() === 'DEMO_MODE') {
    return { success: true, data: { id: Date.now(), ...data } };
  }
  try {
    const response = await apiClient.post('/api/v1/measurements/', data);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.detail
      || JSON.stringify(error.response?.data)
      || 'Failed to create measurement.';
    return { success: false, message };
  }
};

