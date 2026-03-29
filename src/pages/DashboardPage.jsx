import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getDashboard } from '../api/dashboardApi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import demoService from '../api/demoService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const REFRESH_INTERVAL = 7000;

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async (showToast = false) => {
    const result = await getDashboard();
    if (result.success) {
      setData(result.data);
      setLastUpdated(new Date());
      if (showToast) toast.success('Dashboard refreshed!');
    } else {
      if (showToast) toast.error(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(), REFRESH_INTERVAL);
    
    // Immediate update listener for Demo Mode
    const handleUpdate = () => fetchData();
    window.addEventListener('demo-update', handleUpdate);
    
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('demo-update', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute stats from data
  const devices = data?.devices || data?.results || [];
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(
    (d) => d.is_online === true || d.status === 'online' || d.is_active === true || d.status === 'active'
  ).length;

  const measurements = devices.flatMap(
    (d) => d.measurements || d.latest_measurements || []
  );
  const avgTemp = measurements.length
    ? (measurements.reduce((s, m) => s + parseFloat(m.temperature || 0), 0) / measurements.length).toFixed(1)
    : '--';
  const avgHum = measurements.length
    ? (measurements.reduce((s, m) => s + parseFloat(m.humidity || 0), 0) / measurements.length).toFixed(1)
    : '--';

  // Chart data
  const chartLabels = devices.map((d) => d.name || d.device_name || `Device ${d.id}`);
  const tempData = devices.map((d) => {
    const ms = d.measurements || d.latest_measurements || [];
    return ms.length ? parseFloat(ms[ms.length - 1]?.temperature || 0) : 0;
  });
  const humData = devices.map((d) => {
    const ms = d.measurements || d.latest_measurements || [];
    return ms.length ? parseFloat(ms[ms.length - 1]?.humidity || 0) : 0;
  });

  const chartData = {
    labels: chartLabels.length ? chartLabels : ['No Devices'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempData.length ? tempData : [0],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Humidity (%)',
        data: humData.length ? humData : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } },
      },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const statusColor = (device) => {
    const s = device.status || (device.is_active ? 'online' : 'offline');
    if (s === 'online' || s === 'active') return '#10b981';
    if (s === 'warning' || s === 'alert') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <p className="page-sub">
              Real-time AI predictive analysis · Auto-refreshes every {REFRESH_INTERVAL / 1000}s
            </p>
            {demoService.isDemoMode() && (
              <div className="demo-badge" style={{ fontSize: '0.65rem' }}>
                <i className="bx bx-bot" /> AI ACTIVE
              </div>
            )}
          </div>
          
          {demoService.isDemoMode() && (
            <div className="glass-card" style={{ 
              marginTop: 16, 
              padding: '12px 20px', 
              borderLeft: '4px solid #8b5cf6',
              background: 'rgba(139, 92, 246, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <i className="bx bx-brain" style={{ fontSize: '1.5rem', color: '#8b5cf6' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Predictive Insight (98% confidence)</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  {devices.some(d => d.status === 'critical') 
                    ? "⚠ Critical anomaly detected in drying system. Immediate action recommended." 
                    : devices.some(d => d.status === 'warning')
                    ? "⚠ Risk increasing in next 2 hours. Monitor thermostat stability."
                    : "✔ All systems stable. No anomalies predicted in next 12 hours."}
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => fetchData(true)}
          disabled={loading}
          style={{ alignSelf: 'flex-start' }}
        >
          <i className={`bx bx-refresh ${loading ? 'bx-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <LoadingSkeleton type="stat" rows={4} />
      ) : (
        <div className="stat-grid">
          {[
            { label: 'Total Devices', value: totalDevices, icon: 'bx-devices', color: '#8b5cf6' },
            { label: 'Online Devices', value: onlineDevices, icon: 'bx-wifi', color: '#10b981' },
            { label: 'Avg Temperature', value: `${avgTemp}°C`, icon: 'bx-thermometer', color: '#f59e0b' },
            { label: 'Avg Humidity', value: `${avgHum}%`, icon: 'bx-droplet', color: '#3b82f6' },
          ].map((s, i) => (
            <div key={i} className="stat-card-app glass-card">
              <div className="stat-card-icon" style={{ background: `${s.color}18`, color: s.color }}>
                <i className={`bx ${s.icon}`} />
              </div>
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="glass-card chart-card" style={{ marginTop: 24 }}>
        <div className="chart-card-header">
          <h3><i className="bx bx-area-chart" /> Live Sensor Readings</h3>
          <span className="live-badge"><span className="pulse-dot" /> LIVE</span>
        </div>
        {loading ? (
          <LoadingSkeleton type="chart" />
        ) : (
          <div style={{ height: 260 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Devices table */}
      <div className="glass-card" style={{ marginTop: 24, overflow: 'hidden' }}>
        <div className="chart-card-header">
          <h3><i className="bx bx-list-ul" /> All Devices</h3>
          <Link to="/dashboard/devices" className="btn-sm primary">View All →</Link>
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}><LoadingSkeleton rows={3} /></div>
        ) : devices.length === 0 ? (
          <EmptyState icon="bx-devices" title="No devices found" message="Add your first device to get started." />
        ) : (
          <div className="devices-table">
            <div className="devices-table-head">
              <span>Device</span>
              <span>Type</span>
              <span>Status</span>
              <span>Last Measurement</span>
              <span>Action</span>
            </div>
            {devices.map((dev) => {
              const ms = dev.measurements || dev.latest_measurements || [];
              const last = ms[ms.length - 1];
              return (
                <div key={dev.id} className="devices-table-row">
                  <span className="dev-name" data-label="Device">
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><i className="bx bx-chip" /> {dev.name || dev.device_name || `Device #${dev.id}`}</span>
                  </span>
                  <span className="dev-type" data-label="Type">{dev.device_type || dev.type || 'N/A'}</span>
                  <span data-label="Status">
                    <span className="status-badge" style={{ background: `${statusColor(dev)}20`, color: statusColor(dev) }}>
                      ● {dev.status || (dev.is_active ? 'Online' : 'Offline')}
                    </span>
                  </span>
                  <span className="dev-measurement" data-label="Measurement">
                    {last ? `${last.temperature}°C · ${last.humidity}%` : '—'}
                  </span>
                  <span data-label="Action">
                    <Link to={`/dashboard/devices/${dev.id}`} className="btn-sm primary" style={{ fontSize: '0.78rem' }}>
                      Details
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
