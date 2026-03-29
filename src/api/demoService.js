import { mockDevices } from './mockData';

const DEVICES_KEY = 'demo_devices';
const IS_DEMO_KEY = 'is_demo_mode';
const AUTH_TOKEN_KEY = 'auth_token';

// Initial state from mockData if nothing in localStorage
const initializeData = () => {
  if (!localStorage.getItem(DEVICES_KEY)) {
    localStorage.setItem(DEVICES_KEY, JSON.stringify(mockDevices));
  }
};

initializeData();

const demoService = {
  isDemoMode: () => true, // Permanently force simulation mode, ignoring real API
  
  toggleDemoMode: (value) => {
    const wasDemo = demoService.isDemoMode();
    if (wasDemo !== value) {
      // Clear token when switching modes to prevent session bleed
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    localStorage.setItem(IS_DEMO_KEY, value);
    if (value) {
      initializeData();
    }
  },

  getDevices: async () => {
    await new Promise(r => setTimeout(r, 800)); // Simulate delay
    return JSON.parse(localStorage.getItem(DEVICES_KEY));
  },

  getDevice: async (id) => {
    await new Promise(r => setTimeout(r, 600));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    return devices.find(d => d.id === parseInt(id));
  },

  addDevice: async (device) => {
    await new Promise(r => setTimeout(r, 1000));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const newDevice = {
      ...device,
      id: Math.max(...devices.map(d => d.id), 0) + 1,
      status: 'offline',
      is_active: true,
      is_online: false,
      measurements: []
    };
    devices.push(newDevice);
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    return newDevice;
  },

  updateDevice: async (id, data) => {
    await new Promise(r => setTimeout(r, 800));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const index = devices.findIndex(d => d.id === parseInt(id));
    if (index !== -1) {
      devices[index] = { ...devices[index], ...data };
      localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
      return devices[index];
    }
    throw new Error('Device not found');
  },

  deleteDevice: async (id) => {
    await new Promise(r => setTimeout(r, 800));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const filtered = devices.filter(d => d.id !== parseInt(id));
    localStorage.setItem(DEVICES_KEY, JSON.stringify(filtered));
    return { success: true };
  },

  login: async (credentials) => {
    await new Promise(r => setTimeout(r, 1200));
    const token = 'demo-token-' + Math.random().toString(36).substr(2);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return { access: token, refresh: 'demo-refresh-token' };
  },

  getMeasurements: async (deviceId, limit = 50) => {
    await new Promise(r => setTimeout(r, 500));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const device = devices.find(d => d.id === parseInt(deviceId));
    
    // Generate some history
    const baseTemp = device?.device_type === 'oven' ? 105 : 37;
    const measurements = Array.from({ length: limit }).map((_, i) => {
      const time = new Date(Date.now() - (limit - i) * 60000);
      return {
        temperature: (baseTemp + (Math.random() * 6 - 3)).toFixed(1),
        humidity: (45 + (Math.random() * 10 - 5)).toFixed(1),
        timestamp: time.toISOString()
      };
    });
    return measurements;
  },

  // Simulate real-time updates for all devices
  updateSimulation: () => {
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    if (!devices) return;

    const updatedDevices = devices.map(device => {
      // Skip offline or uninitialized devices entirely so they don't auto-simulate
      if (!device.is_online || !device.measurements || device.measurements.length === 0) {
        return device;
      }

      // Randomly update status occasionally
      let newStatus = device.status;
      const rand = Math.random();
      
      const lastTemp = parseFloat(device.measurements?.[0]?.temperature || (device.device_type === 'oven' ? 100 : 25));
      const drift = (Math.random() * 2 - 1);
      const newTemp = (lastTemp + drift).toFixed(1);
      const newHumidity = (parseFloat(device.measurements?.[0]?.humidity || 45) + (Math.random() * 2 - 1)).toFixed(1);

      // Status logic
      if (device.device_type === 'oven') {
        if (newTemp > 120) newStatus = 'critical';
        else if (newTemp > 110) newStatus = 'warning';
        else newStatus = 'online';
      } else {
        if (newTemp > 42 || newTemp < 34) newStatus = 'critical';
        else if (newTemp > 39 || newTemp < 36) newStatus = 'warning';
        else newStatus = 'online';
      }

      // Add new measurement to the beginning (most recent)
      const newMeasurement = {
        temperature: newTemp,
        humidity: newHumidity,
        timestamp: new Date().toISOString()
      };

      return {
        ...device,
        status: newStatus,
        measurements: [newMeasurement, ...(device.measurements || []).slice(0, 50)]
      };
    });

    localStorage.setItem(DEVICES_KEY, JSON.stringify(updatedDevices));
    
    // Dispatch custom event so UI can react if it wants
    window.dispatchEvent(new CustomEvent('demo-update', { detail: updatedDevices }));
    
    return updatedDevices;
  },

  addMeasurement: async (data) => {
    await new Promise(r => setTimeout(r, 700));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const index = devices.findIndex(d => d.id === parseInt(data.device));
    
    if (index !== -1) {
      const newMeasurement = {
        temperature: parseFloat(data.temperature).toFixed(1),
        humidity: parseFloat(data.humidity).toFixed(1),
        timestamp: data.timestamp || new Date().toISOString()
      };

      // Add to device measurements
      devices[index].measurements = [newMeasurement, ...(devices[index].measurements || []).slice(0, 50)];
      
      // Update status based on new measurement
      let newStatus = 'online';
      const temp = parseFloat(newMeasurement.temperature);
      if (devices[index].device_type === 'oven') {
        if (temp > 120) newStatus = 'critical';
        else if (temp > 110) newStatus = 'warning';
      } else {
        if (temp > 42 || temp < 34) newStatus = 'critical';
        else if (temp > 39 || temp < 36) newStatus = 'warning';
      }
      devices[index].status = newStatus;
      devices[index].is_online = true; // Ensure device comes explicitly online

      localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('demo-update', { detail: devices }));
      
      return { success: true, measurement: newMeasurement };
    }
    throw new Error('Device not found');
  },

  getDashboard: async () => {
    await new Promise(r => setTimeout(r, 800));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    return { devices };
  },

  getDeviceDashboard: async (id) => {
    await new Promise(r => setTimeout(r, 600));
    const devices = JSON.parse(localStorage.getItem(DEVICES_KEY));
    const device = devices.find(d => d.id === parseInt(id));
    return device;
  }
};

export default demoService;
