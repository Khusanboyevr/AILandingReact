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
    timestamp: new Date().toISOString().slice(0, 16),
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
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.device) newErrors.device = 'Please select a device.';
    const temp = parseFloat(form.temperature);
    if (!form.temperature) newErrors.temperature = 'Temperature is required.';
    else if (isNaN(temp)) newErrors.temperature = 'Must be a valid number.';
    else if (temp < -50 || temp > 500) newErrors.temperature = 'Temperature must be between -50°C and 500°C.';
    const hum = parseFloat(form.humidity);
    if (!form.humidity) newErrors.humidity = 'Humidity is required.';
    else if (isNaN(hum)) newErrors.humidity = 'Must be a valid number.';
    else if (hum < 0 || hum > 100) newErrors.humidity = 'Humidity must be between 0% and 100%.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      device: parseInt(form.device),
      temperature: parseFloat(form.temperature),
      humidity: parseFloat(form.humidity),
      timestamp: form.timestamp ? new Date(form.timestamp).toISOString() : undefined,
    };

    const result = await createMeasurement(payload);
    setSubmitting(false);

    if (result.success) {
      toast.success('Measurement submitted successfully!');
      setForm({
        device: form.device,
        temperature: '',
        humidity: '',
        timestamp: new Date().toISOString().slice(0, 16),
      });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Measurement</h1>
          <p className="page-sub">Submit sensor readings from a device to the system</p>
        </div>
      </div>

      <div className="measure-layout">
        {/* Form */}
        <div className="glass-card measure-form-card">
          <h3 style={{ marginBottom: 24 }}><i className="bx bx-send" /> Submit Reading</h3>

          <form onSubmit={handleSubmit} className="modal-form">
            {/* Device */}
            <div className="form-field">
              <label>Device *</label>
              <div className={`form-input-wrap ${errors.device ? 'error' : ''}`}>
                <i className="bx bx-chip" />
                <select name="device" value={form.device} onChange={handleChange} disabled={loadingDevices}>
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

            {/* Temperature */}
            <div className="form-field">
              <label>Temperature (°C) *</label>
              <div className={`form-input-wrap ${errors.temperature ? 'error' : ''}`}>
                <i className="bx bx-thermometer" />
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="e.g. 37.5"
                />
              </div>
              {errors.temperature && <p className="form-error">{errors.temperature}</p>}
            </div>

            {/* Humidity */}
            <div className="form-field">
              <label>Humidity (%) *</label>
              <div className={`form-input-wrap ${errors.humidity ? 'error' : ''}`}>
                <i className="bx bx-droplet" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="humidity"
                  value={form.humidity}
                  onChange={handleChange}
                  placeholder="e.g. 65.0"
                />
              </div>
              {errors.humidity && <p className="form-error">{errors.humidity}</p>}
            </div>

            {/* Timestamp */}
            <div className="form-field">
              <label>Timestamp</label>
              <div className="form-input-wrap">
                <i className="bx bx-time" />
                <input
                  type="datetime-local"
                  name="timestamp"
                  value={form.timestamp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
              {submitting ? (
                <><i className="bx bx-loader-alt bx-spin" /> Submitting...</>
              ) : (
                <><i className="bx bx-upload" /> Submit Measurement</>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="glass-card measure-info-card">
          <h3 style={{ marginBottom: 20 }}><i className="bx bx-info-circle" /> Guidelines</h3>
          <div className="measure-info-list">
            {[
              { icon: 'bx-thermometer', title: 'Temperature Range', desc: '-50°C to 500°C (typical operating: 20–200°C)' },
              { icon: 'bx-droplet', title: 'Humidity Range', desc: '0% to 100% relative humidity' },
              { icon: 'bx-time', title: 'Timestamp', desc: 'Leave as current time for real-time readings' },
              { icon: 'bx-shield-check', title: 'Validation', desc: 'All fields are validated before submission' },
            ].map((item, i) => (
              <div key={i} className="measure-info-item">
                <div className="measure-info-icon">
                  <i className={`bx ${item.icon}`} />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementsPage;
