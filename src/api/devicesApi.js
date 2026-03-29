import apiClient from './apiClient';
import { getToken } from '../utils/auth';
import { mockDevices } from './mockData';

export const getDevices = async () => {
  if (getToken() === 'DEMO_MODE') {
    return { success: true, data: mockDevices };
  }
  try {
    const response = await apiClient.get('/api/v1/devices/');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch devices.';
    return { success: false, message };
  }
};

export const createDevice = async (deviceData) => {
  if (getToken() === 'DEMO_MODE') {
    const newDevice = {
      id: Date.now(),
      ...deviceData,
      name: deviceData.device_name,
      status: 'online',
      is_active: true,
      measurements: []
    };
    mockDevices.push(newDevice);
    return { success: true, data: newDevice };
  }
  try {
    const response = await apiClient.post('/api/v1/devices/', deviceData);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.detail
      || JSON.stringify(error.response?.data)
      || 'Failed to create device.';
    return { success: false, message };
  }
};

