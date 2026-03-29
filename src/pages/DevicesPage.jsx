import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDevices, createDevice } from '../api/devicesApi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ device_name: '', device_type: 'thermostat', location: '', serial_number: '' });

  const fetchDevices = async () => {
    setLoading(true);
    const result = await getDevices();
    if (result.success) {
      setDevices(result.data?.results || result.data || []);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.device_name.trim()) {
      toast.error('Device name is required.');
      return;
    }
    if (!form.serial_number.trim()) {
      toast.error('Serial number is required.');
      return;
    }
    setCreating(true);
    const result = await createDevice(form);
    setCreating(false);
    if (result.success) {
      toast.success('Device created successfully!');
      setShowModal(false);
      setForm({ device_name: '', device_type: 'thermostat', location: '', serial_number: '' });
      fetchDevices();
    } else {
      toast.error(result.message);
    }
  };

  const statusColor = (device) => {
    const s = device.status || (device.is_active ? 'online' : 'offline');
    if (s === 'online' || s === 'active') return '#10b981';
    if (s === 'warning') return '#f59e0b';
    return '#ef4444';
  };

  const statusLabel = (device) => {
    if (device.status) return device.status;
    return device.is_active ? 'Online' : 'Offline';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Devices</h1>
          <p className="page-sub">Manage all connected thermostats and drying cabinets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bx bx-plus" /> Add Device
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : devices.length === 0 ? (
        <EmptyState
          icon="bx-devices"
          title="No devices yet"
          message="Click 'Add Device' to register your first monitoring device."
        />
      ) : (
        <div className="devices-grid">
          {devices.map((dev) => (
            <div key={dev.id} className="device-card glass-card">
              <div className="device-card-header">
                <div className="device-icon">
                  <i className={`bx ${dev.device_type === 'thermostat' ? 'bx-thermometer' : 'bxs-hot'}`} />
                </div>
                <span
                  className="status-badge"
                  style={{ background: `${statusColor(dev)}18`, color: statusColor(dev) }}
                >
                  ● {statusLabel(dev)}
                </span>
              </div>
              <h3 className="device-card-name">{dev.name || dev.device_name || `Device #${dev.id}`}</h3>
              <p className="device-card-type">{dev.device_type || dev.type || 'Unknown Type'}</p>
              {dev.location && (
                <p className="device-card-location">
                  <i className="bx bx-map" /> {dev.location}
                </p>
              )}
              <Link
                to={`/dashboard/devices/${dev.id}`}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              >
                <i className="bx bx-bar-chart-alt-2" /> View Analytics
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bx bx-plus-circle" /> Add New Device</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-field">
                <label>Device Name *</label>
                <div className="form-input-wrap">
                  <i className="bx bx-rename" />
                  <input
                    type="text"
                    name="device_name"
                    value={form.device_name}
                    onChange={handleChange}
                    placeholder="e.g. Thermostat TC-120"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Serial Number *</label>
                <div className="form-input-wrap">
                  <i className="bx bx-barcode" />
                  <input
                    type="text"
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleChange}
                    placeholder="e.g. SN-00123"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Device Type</label>
                <div className="form-input-wrap">
                  <i className="bx bx-category" />
                  <select name="device_type" value={form.device_type} onChange={handleChange} required>
                    <option value="" disabled>Select type...</option>
                    <option value="thermostat">Thermostat</option>
                    <option value="drying_cabinet">Drying Cabinet</option>
                    <option value="sensor">Sensor</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Location</label>
                <div className="form-input-wrap">
                  <i className="bx bx-map" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Lab Room B"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? (
                    <><i className="bx bx-loader-alt bx-spin" /> Creating...</>
                  ) : (
                    <><i className="bx bx-check" /> Create Device</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
