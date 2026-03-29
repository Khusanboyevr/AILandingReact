import { useState, useEffect } from 'react';
import { createMeasurement } from '../api/measurementsApi';
import { getDevices } from '../api/devicesApi';
import toast from 'react-hot-toast';

const MeasurementsPage = () => {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    device: '',
    temperature: '',
    humidity: '',
    power_usage: '',
    sensor_data: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDevices = async () => {
      const result = await getDevices();
      if (result.success) {
        setDevices(result.data?.results || result.data || []);
      }
      setLoadingDevices(false);
    };
    fetchDevices();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear the specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Required fields
    if (!form.device) newErrors.device = 'Please select a device.';
    
    if (!form.temperature) {
      newErrors.temperature = 'Temperature is required.';
    } else {
      const temp = parseFloat(form.temperature);
      if (isNaN(temp)) newErrors.temperature = 'Must be a valid number.';
      else if (temp < -50 || temp > 500) newErrors.temperature = 'Temperature must be between -50°C and 500°C.';
    }

    // Optional fields validation
    if (form.humidity) {
      const hum = parseFloat(form.humidity);
      if (isNaN(hum)) newErrors.humidity = 'Must be a valid number.';
      else if (hum < 0 || hum > 100) newErrors.humidity = 'Humidity must be between 0% and 100%.';
    }

    if (form.power_usage) {
      const pwr = parseFloat(form.power_usage);
      if (isNaN(pwr)) newErrors.power_usage = 'Must be a valid number.';
      else if (pwr < 0) newErrors.power_usage = 'Power usage cannot be negative.';
    }

    if (form.sensor_data) {
      try {
        JSON.parse(form.sensor_data);
      } catch (e) {
        newErrors.sensor_data = 'Must be valid JSON.';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      device: parseInt(form.device),
      temperature: parseFloat(form.temperature).toFixed(2),
    };

    if (form.humidity) payload.humidity = parseFloat(form.humidity).toFixed(2);
    if (form.power_usage) payload.power_usage = parseFloat(form.power_usage).toFixed(2);
    if (form.sensor_data) payload.sensor_data = JSON.parse(form.sensor_data);

    const result = await createMeasurement(payload);
    
    setSubmitting(false);

    if (result.success) {
      if (result.offline) {
        toast.error(result.warning || 'Saved locally due to server error.', { icon: '💾' });
      } else {
        toast.success('Measurement submitted successfully!');
      }
      setForm({
        device: form.device, // Keep selected device
        temperature: '',
        humidity: '',
        power_usage: '',
        sensor_data: '',
      });
      setErrors({});
    } else {
      toast.error(result.message);
      if (result.fieldErrors) {
        // Map backend field errors to frontend inputs
        const backendErrors = {};
        for (const [key, value] of Object.entries(result.fieldErrors)) {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        }
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Measurement</h1>
          <p className="page-sub">Submit sensor readings manually</p>
        </div>
      </div>

      <div className="measure-layout">
        {/* Form */}
        <div className="glass-card measure-form-card">
          <h3 style={{ marginBottom: 24 }}><i className="bx bx-send" /> Submit Reading</h3>

          <form onSubmit={handleSubmit} className="modal-form">
            {/* Device (Required) */}
            <div className="form-field">
              <label>Device <span style={{color: 'var(--accent)'}}>*</span></label>
              <div className={`form-input-wrap ${errors.device ? 'error' : ''}`}>
                <i className="bx bx-chip" />
                <select name="device" value={form.device} onChange={handleChange} disabled={loadingDevices || submitting}>
                  <option value="">
                    {loadingDevices ? 'Loading devices...' : 'Select a device...'}
                  </option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.device_name || `Device #${d.id}`}
                    </option>
                  ))}
                </select>
              </div>
              {errors.device && <p className="form-error">{errors.device}</p>}
            </div>

            {/* Temperature (Required) */}
            <div className="form-field">
              <label>Temperature (°C) <span style={{color: 'var(--accent)'}}>*</span></label>
              <div className={`form-input-wrap ${errors.temperature ? 'error' : ''}`}>
                <i className="bx bx-thermometer" />
                <input
                  type="number"
                  step="0.01"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="e.g. 37.5"
                  disabled={submitting}
                />
              </div>
              {errors.temperature && <p className="form-error">{errors.temperature}</p>}
            </div>

            {/* Humidity (Optional) */}
            <div className="form-field">
              <label>Humidity (%) <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>(Optional)</span></label>
              <div className={`form-input-wrap ${errors.humidity ? 'error' : ''}`}>
                <i className="bx bx-droplet" />
                <input
                  type="number"
                  step="0.01"
                  name="humidity"
                  value={form.humidity}
                  onChange={handleChange}
                  placeholder="e.g. 65.0"
                  disabled={submitting}
                />
              </div>
              {errors.humidity && <p className="form-error">{errors.humidity}</p>}
            </div>

            {/* Power Usage (Optional) */}
            <div className="form-field">
              <label>Power Usage (kWh) <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>(Optional)</span></label>
              <div className={`form-input-wrap ${errors.power_usage ? 'error' : ''}`}>
                <i className="bx bx-bulb" />
                <input
                  type="number"
                  step="0.01"
                  name="power_usage"
                  value={form.power_usage}
                  onChange={handleChange}
                  placeholder="e.g. 12.5"
                  disabled={submitting}
                />
              </div>
              {errors.power_usage && <p className="form-error">{errors.power_usage}</p>}
            </div>
            
            {/* Sensor Data (Optional) */}
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Sensor Data (JSON) <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>(Optional)</span></label>
              <div className={`form-input-wrap ${errors.sensor_data ? 'error' : ''}`}>
                <i className="bx bx-data" />
                <input
                  type="text"
                  name="sensor_data"
                  value={form.sensor_data}
                  onChange={handleChange}
                  placeholder='e.g. {"fan_speed": 1200}'
                  disabled={submitting}
                />
              </div>
              {errors.sensor_data && <p className="form-error">{errors.sensor_data}</p>}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, gridColumn: '1 / -1' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '0.85rem', width: '100%' }}
                disabled={submitting}
                onClick={() => {
                  if (!form.device) {
                    toast.error('Please select a device first to randomize values');
                    setErrors(prev => ({ ...prev, device: 'Required for randomization' }));
                    return;
                  }
                  const dev = devices.find(d => d.id === parseInt(form.device));
                  const isOven = (dev?.device_type || dev?.type) === 'drying_cabinet';
                  setForm(prev => ({
                    ...prev,
                    temperature: (isOven ? 80 + Math.random() * 40 : 25 + Math.random() * 15).toFixed(2),
                    humidity: (isOven ? 5 + Math.random() * 10 : 30 + Math.random() * 30).toFixed(2),
                    power_usage: (Math.random() * 10 + 5).toFixed(2),
                    sensor_data: JSON.stringify({ mode: 'auto', diagnostic_code: 0 })
                  }));
                  setErrors({});
                  toast.success('Generated random values!');
                }}
              >
                <i className="bx bx-dice-5" /> Auto-fill Random Ranges
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 8, gridColumn: '1 / -1' }}>
              {submitting ? (
                <><i className="bx bx-loader-alt bx-spin" /> Transmitting...</>
              ) : (
                <><i className="bx bx-upload" /> Submit Measurement</>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="glass-card measure-info-card">
          <div className="info-icon">
            <i className="bx bx-info-circle" />
          </div>
          <h3>Submission Guidelines</h3>
          <p>Please follow these instructions when manually submitting data:</p>
          <ul className="info-list">
            <li>
              <i className="bx bx-check-circle" />
              <span><strong>Device Selection</strong> is mandatory. You must link the reading to a registered device.</span>
            </li>
            <li>
              <i className="bx bx-check-circle" />
              <span><strong>Temperature</strong> is strictly required for all device types. Ensure accuracy.</span>
            </li>
            <li>
              <i className="bx bx-check-circle" />
              <span><strong>Humidity & Power</strong> are optional but recommended for better AI predictions.</span>
            </li>
            <li>
              <i className="bx bx-time" />
              <span>The <strong>timestamp</strong> is automatically added by the server at the exact moment of reception.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeasurementsPage;
