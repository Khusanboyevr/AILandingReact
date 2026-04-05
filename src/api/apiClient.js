import axios from 'axios';
import demoService from './demoService';

const BASE_URL = 'https://dastur-aw8r.onrender.com/api/v1/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const analyze = (data) => apiClient.post("analyze/", data);

// Interceptor to handle Demo Mode
apiClient.interceptors.request.use(async (config) => {
  // Check if Demo Mode is active BUT exclude /analyze because it must ALWAYS hit real backend
  if (demoService.isDemoMode() && !(config.url || '').includes('/analyze')) {
    console.log(`🛠 [DEMO MODE] Intercepting: [${config.method.toUpperCase()}] ${config.url}`);
    
    // Determine which mock function to call based on URL and method
    const url = config.url || '';
    let mockResponse = null;

    try {
      const cleanUrl = url.startsWith('/') ? url : '/' + url;
      
      if (cleanUrl.includes('auth/login')) {
        mockResponse = await demoService.login(config.data);
      } else if (cleanUrl.includes('devices/')) {
        const parts = cleanUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        
        if (!isNaN(parseInt(lastPart)) && lastPart !== 'devices') {
          const id = lastPart;
          if (config.method === 'get') mockResponse = await demoService.getDevice(id);
          else if (config.method === 'put' || config.method === 'patch') mockResponse = await demoService.updateDevice(id, config.data);
          else if (config.method === 'delete') mockResponse = await demoService.deleteDevice(id);
        } else {
          if (config.method === 'get') mockResponse = await demoService.getDevices();
          else if (config.method === 'post') mockResponse = await demoService.addDevice(config.data);
        }
      } else if (cleanUrl.includes('devices')) {
        if (config.method === 'get') mockResponse = await demoService.getDevices();
        else if (config.method === 'post') mockResponse = await demoService.addDevice(config.data);
      } else if (cleanUrl.includes('dashboard/create') || cleanUrl.includes('predict') || (cleanUrl.includes('measurements') && config.method === 'post')) {
          mockResponse = await demoService.addMeasurement(config.data);
      } else if (cleanUrl.includes('dashboard')) {
        const parts = cleanUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (!isNaN(parseInt(lastPart))) {
          mockResponse = await demoService.getDeviceDashboard(lastPart);
        } else {
          mockResponse = await demoService.getDashboard();
        }
      } else if (cleanUrl.includes('measurements')) {
        const params = new URLSearchParams(cleanUrl.split('?')[1]);
        const deviceId = params.get('device_id');
        mockResponse = await demoService.getMeasurements(deviceId);
      } else if (cleanUrl.includes('health')) {
        mockResponse = { status: 'ok' };
      }

      // If in demo mode and it's not analyze, we MUST intercept.
      // If we didn't find a specific mockResponse, return an empty one instead of hitting real backend.
      if (mockResponse === null) {
        mockResponse = { success: true, message: 'Mock fallback', data: [] };
      }

      if (mockResponse !== null) {
        // Return a cancelled request error that we'll catch in the response interceptor
        // or just return a mock response object if axios allow it.
        // Actually, we can just throw a "fake" error and catch it or use a custom adapter.
        // But the simplest way in axios for a quick mock is to use an adapter or just
        // return a promise that resolves into the response schema axios expects.
        return Promise.reject({
          config,
          response: {
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          },
          isMock: true
        });
      }
    } catch (err) {
      return Promise.reject({
        config,
        response: {
          data: { error: err.message },
          status: 400,
          config
        },
        isMock: true
      });
    }
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle our mock "errors" and Offline Measurements
apiClient.interceptors.response.use(
  (response) => {
    // 1. Merge offline measurements transparently if any exist
    try {
      const offlineStr = localStorage.getItem('offline_measurements');
      if (offlineStr && !demoService.isDemoMode()) {
        const offlineMeasurements = JSON.parse(offlineStr);
        if (offlineMeasurements.length > 0) {
          const injectOffline = (device) => {
            if (!device || !device.id) return device;
            const deviceOffline = offlineMeasurements
              .filter(m => parseInt(m.device) === device.id)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            if (deviceOffline.length === 0) return device;

            // Deep clone to avoid mutating original references heavily
            const updated = { ...device };
            updated.measurements = [...deviceOffline, ...(updated.measurements || [])];
            updated.is_online = true; // Actively online
            
            // Recalculate status
            const latest = updated.measurements[0];
            const temp = parseFloat(latest.temperature);
            let s = 'online';
            if (updated.device_type === 'drying_cabinet' || updated.device_type === 'oven') {
                if (temp > 120) s = 'critical';
                else if (temp > 110) s = 'warning';
            } else {
                if (temp > 42 || temp < 34) s = 'critical';
                else if (temp > 39 || temp < 36) s = 'warning';
            }
            updated.status = s;
            updated.total_measurements = (updated.total_measurements || 0) + deviceOffline.length;
            
            return updated;
          };

          if (response.data) {
             if (Array.isArray(response.data.results)) {
                 response.data.results = response.data.results.map(injectOffline);
             } else if (Array.isArray(response.data.devices)) {
                 response.data.devices = response.data.devices.map(injectOffline);
             } else if (response.data.device && response.data.device.id) {
                 response.data.device = injectOffline(response.data.device);
             } else if (response.data.id) {
                 response.data = injectOffline(response.data);
             }
          }
        }
      }
    } catch (e) {
      console.warn("Error merging offline measurements:", e);
    }
    
    return response;
  },
  (error) => {
    // If it's our mock response, return it as a success
    if (error.isMock) {
      return Promise.resolve(error.response);
    }

    if (error.response?.status === 401 && !demoService.isDemoMode()) {
      localStorage.removeItem('auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
