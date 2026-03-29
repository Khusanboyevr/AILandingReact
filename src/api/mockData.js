export const mockDevices = [
  {
    id: 1,
    name: "Termostat TC-120",
    device_name: "Termostat TC-120",
    device_type: "thermostat",
    status: "online",
    is_active: true,
    location: "Laboratoriya A",
    measurements: [
      { temperature: "37.5", humidity: "45.0", timestamp: new Date(Date.now() - 10000).toISOString() }
    ]
  },
  {
    id: 2,
    name: "Quritish Shkafi SH-3",
    device_name: "Quritish Shkafi SH-3",
    device_type: "oven",
    status: "warning",
    is_active: true,
    location: "Sanoat qismi",
    measurements: [
      { temperature: "105.0", humidity: "12.0", timestamp: new Date(Date.now() - 5000).toISOString() }
    ]
  },
  {
    id: 3,
    name: "Sovutgich S-80",
    device_name: "Sovutgich S-80",
    device_type: "thermostat",
    status: "online",
    is_active: true,
    location: "Asosiy Ombor",
    measurements: [
      { temperature: "-5.0", humidity: "65.0", timestamp: new Date().toISOString() }
    ]
  }
];

export const getMockDeviceDetail = (id) => {
  const device = mockDevices.find(d => d.id === parseInt(id)) || mockDevices[0];
  const measurements = Array.from({ length: 20 }).map((_, i) => {
    const time = new Date(Date.now() - (20 - i) * 60000);
    const baseTemp = device.device_type === 'oven' ? 100 : (device.name.includes("Sovutgich") ? -5 : 37);
    return {
      temperature: (baseTemp + (Math.random() * 4 - 2)).toFixed(1),
      humidity: (50 + (Math.random() * 10 - 5)).toFixed(1),
      timestamp: time.toISOString()
    };
  });
  return { device, measurements };
};
