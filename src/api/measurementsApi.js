import apiClient from './apiClient';
import { getToken } from '../utils/auth';

export const createMeasurement = async (data) => {
  // Construct API request exactly like DRF expects
  // Device and temperature are required
  const payload = {
    device: data.device,
    temperature: data.temperature,
  };
  
  // Process optional fields
  if (data.humidity !== undefined && data.humidity !== null && data.humidity !== '') {
    payload.humidity = data.humidity;
  }
  if (data.power_usage !== undefined && data.power_usage !== null && data.power_usage !== '') {
    payload.power_usage = data.power_usage;
  }
  if (data.sensor_data && Object.keys(data.sensor_data).length > 0) {
    payload.sensor_data = data.sensor_data;
  }

  try {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token && token !== 'DEMO_MODE') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 Sending Measurement Payload:', payload);

    const response = await apiClient.post(
      '/api/v1/measurements/',
      payload,
      { headers }
    );

    // Notify UI to refresh instantly (Dashboard and devices)
    window.dispatchEvent(new Event('demo-update'));

    return { success: true, data: response.data };

  } catch (error) {
    console.error('Measurement POST Error:', error.response || error);

    let message = 'Failed to create measurement.';
    let fieldErrors = {};

    if (error.response) {
      if (error.response.status === 500) {
        // Fallback to offline storage if 500!
        message = 'Server error, saving measurement locally for sync.';
        saveMeasurementOffline(payload);
        return { success: true, warning: message, offline: true };
      } else if (error.response.status === 400 || error.response.status === 422) {
        message = 'Please correct the highlighted errors.';
        fieldErrors = error.response.data; // Pass Django form/serializer errors to UI
      } else {
        message = error.response.data?.detail || JSON.stringify(error.response.data) || message;
      }
    } else if (error.request || error.message === 'Network Error') {
      // Offline fallback
      message = 'Network error, saving measurement locally for sync.';
      saveMeasurementOffline(payload);
      return { success: true, warning: message, offline: true };
    }

    return { success: false, message, fieldErrors };
  }
};

const saveMeasurementOffline = (payload) => {
  try {
    const offline = JSON.parse(localStorage.getItem('offline_measurements') || '[]');
    const newMeasurement = {
      ...payload,
      id: `offline-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    offline.push(newMeasurement);
    localStorage.setItem('offline_measurements', JSON.stringify(offline));
    // Trigger dashboard refresh
    window.dispatchEvent(new Event('demo-update'));
  } catch (e) {
    console.error('Failed to save offline measurement', e);
  }
};

