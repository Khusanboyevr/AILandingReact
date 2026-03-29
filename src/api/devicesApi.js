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
    // Map frontend fields to Swagger backend fields
    // Backend expects: { name, serial_number, device_type }
    // Frontend provides: { device_name, serial_number, device_type, location }
    const payload = {
      name: deviceData.device_name,
      serial_number: deviceData.serial_number,
      device_type: deviceData.device_type
    };

    console.log('📤 Creating device with payload:', payload);

    const response = await apiClient.post('/api/v1/devices/', payload);
    return { success: true, data: response.data };
  } catch (error) {
    let message = 'Failed to create device.';
    if (error.response?.data) {
      const data = error.response.data;
      // Handle validation errors which are often objects { field: [error] }
      message = data.detail || 
                (typeof data === 'object' ? JSON.stringify(data) : data);
    }
    return { success: false, message };
  }
};

