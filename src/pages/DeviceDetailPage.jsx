import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getDeviceDashboard } from '../api/dashboardApi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DeviceDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const result = await getDeviceDashboard(id);
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    };
    
    fetchDetail();
    const interval = setInterval(fetchDetail, 5000);
    
    // Immediate update listener for Demo Mode
    const handleUpdate = () => fetchDetail();
    window.addEventListener('demo-update', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('demo-update', handleUpdate);
    };
  }, [id]);

  const measurements = data?.measurements || data?.latest_measurements || [];
  const tempReadings = measurements.map((m) => parseFloat(m.temperature || 0));
  const humReadings = measurements.map((m) => parseFloat(m.humidity || 0));
  const labels = measurements.map((m, i) =>
    m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `#${i + 1}`
  );

  const chartData = {
    labels: labels.length ? labels : ['--'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempReadings.length ? tempReadings : [0],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: 'Humidity (%)',
        data: humReadings.length ? humReadings : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const device = data?.device || data;
  const lastM = measurements[measurements.length - 1];

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/dashboard/devices" className="back-link">
            <i className="bx bx-arrow-back" /> Back to Devices
          </Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>
            {loading ? 'Loading...' : device?.name || device?.device_name || `Device #${id}`}
          </h1>
          <p className="page-sub">Detailed analytics and measurement history</p>
        </div>
        {!loading && data && (
          <button 
            onClick={async () => {
              if (!window.confirm("Buni o'chirishga ishonchingiz komilmi?")) return;
              const { deleteDevice } = await import('../api/devicesApi');
              const toast = await import('react-hot-toast').then(m => m.default);
              const toastId = toast.loading("O'chirilmoqda...");
              const res = await deleteDevice(id);
              toast.dismiss(toastId);
              if (res.success) {
                toast.success("Muvaffaqiyatli o'chirildi!");
                window.location.href = '/dashboard/devices';
              } else {
                toast.error(res.message);
              }
            }}
            className="btn btn-secondary" 
            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <i className="bx bx-trash" /> 
            <span>O'chirish</span>
          </button>
        )}
      </div>

      {loading ? (
        <>
          <LoadingSkeleton type="stat" rows={3} />
          <div style={{ marginTop: 24 }}><LoadingSkeleton type="chart" /></div>
        </>
      ) : !data ? (
        <EmptyState icon="bx-error" title="Device not found" message="Could not load data for this device." />
      ) : (
        <>
          {/* Stats */}
          <div className="stat-grid">
            {[
              {
                label: 'Latest Temperature',
                value: lastM ? `${lastM.temperature}°C` : '—',
                icon: 'bx-thermometer', color: '#f59e0b',
              },
              {
                label: 'Latest Humidity',
                value: lastM ? `${lastM.humidity}%` : '—',
                icon: 'bx-droplet', color: '#3b82f6',
              },
              {
                label: 'Total Readings',
                value: measurements.length,
                icon: 'bx-data', color: '#8b5cf6',
              },
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

          {/* Chart */}
          <div className="glass-card chart-card" style={{ marginTop: 24 }}>
            <div className="chart-card-header">
              <h3><i className="bx bx-area-chart" /> Measurement History</h3>
            </div>
            {measurements.length === 0 ? (
              <EmptyState icon="bx-line-chart" title="No measurements" message="No readings recorded for this device yet." />
            ) : (
              <div style={{ height: 280 }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Measurements table */}
          {measurements.length > 0 && (
            <div className="glass-card" style={{ marginTop: 24, overflow: 'hidden' }}>
              <div className="chart-card-header">
                <h3><i className="bx bx-table" /> Measurement Records</h3>
              </div>
              <div className="devices-table">
                <div className="devices-table-head">
                  <span>#</span>
                  <span>Temperature</span>
                  <span>Humidity</span>
                  <span>Timestamp</span>
                </div>
                {[...measurements].reverse().slice(0, 20).map((m, i) => (
                  <div key={i} className="devices-table-row">
                    <span style={{ color: 'var(--text-muted)' }}>{measurements.length - i}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{m.temperature}°C</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>{m.humidity}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {m.timestamp ? new Date(m.timestamp).toLocaleString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeviceDetailPage;
