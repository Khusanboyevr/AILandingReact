import apiClient from './apiClient';
import { getToken } from '../utils/auth';
import { mockDevices, getMockDeviceDetail } from './mockData';

export const getDashboard = async () => {
  try {
    const response = await apiClient.get('dashboard/');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch dashboard data.';
    return { success: false, message };
  }
};

export const getDeviceDashboard = async (deviceId) => {
  try {
    const response = await apiClient.get(`dashboard/${deviceId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch device dashboard.';
    return { success: false, message };
  }
};

