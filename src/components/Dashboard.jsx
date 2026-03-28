import { useState, useEffect, useRef } from 'react';
import { getDashboard } from '../api/dashboardApi';
import { isAuthenticated } from '../utils/auth';

const Dashboard = () => {
  const [systemData, setSystemData] = useState({
    isLoading: true,
    stats: { precision: '-', risk: '-', activeTime: '-' },
    devices: [],
    alerts: [],
  });
  const [activeTab, setActiveTab] = useState('ai');
  const intervalRef = useRef(null);

  const normalizeDevices = (rawData) => {
    const list = rawData?.devices || rawData?.results || rawData?.data || [];
    return list.map((d) => {
      const ms = d.measurements || d.latest_measurements || [];
      const last = ms[ms.length - 1];
      const tempVal = last?.temperature ? `${last.temperature}°C` : 'N/A';
      const type = d.device_type?.toLowerCase().includes('thermostat') ? 'thermostat' : 'oven';
      const stateRaw = d.status || (d.is_active ? 'online' : 'offline');
      const state = stateRaw === 'online' || stateRaw === 'active' ? 'Norma' : 'Xavf';
      return {
        id: d.id,
        type,
        name: d.name || d.device_name || `Device #${d.id}`,
        temp: tempVal,
        target: 'N/A',
        state,
        prediction: state === 'Xavf' ? 'Monitoring required' : 'Stable',
      };
    });
  };

  const fetchApiData = async (silent = false) => {
    if (!silent) setSystemData((prev) => ({ ...prev, isLoading: true }));

    if (!isAuthenticated()) {
      // Show mock data for landing page visitors not logged in
      setTimeout(() => {
        setSystemData({
          isLoading: false,
          stats: { precision: '98.5%', risk: 'Low (1.2%)', activeTime: '140 hours' },
          devices: [
            { id: 'TR-01', type: 'thermostat', name: 'Thermostat TC-120', temp: '37.5°C', target: '37.0°C', state: 'Norma', prediction: 'Stable' },
            { id: 'QR-05', type: 'oven', name: 'Drying Cabinet SH-3', temp: '105.0°C', target: '100.0°C', state: 'Xavf', prediction: 'Overheating risk in 30 min' },
            { id: 'TR-02', type: 'thermostat', name: 'Thermostat TC-80', temp: '-5.0°C', target: '-5.0°C', state: 'Norma', prediction: 'Freezing state optimal' },
          ],
          alerts: [
            { id: 'AL-1', time: '10:32', msg: 'QR-05 temperature exceeded normal by 5°C. Malfunction risk detected.' },
            { id: 'AL-2', time: '08:15', msg: 'TR-01 system passed diagnostic check successfully.' },
          ],
        });
      }, 800);
      return;
    }

    // Real API call
    const result = await getDashboard();
    if (result.success) {
      const devices = normalizeDevices(result.data);
      const totalDevices = devices.length;
      const online = devices.filter((d) => d.state === 'Norma').length;
      setSystemData({
        isLoading: false,
        stats: {
          precision: totalDevices > 0 ? `${((online / totalDevices) * 100).toFixed(1)}%` : 'N/A',
          risk: online < totalDevices ? `High (${totalDevices - online} alerts)` : 'Low (0%)',
          activeTime: `${totalDevices} device(s) online`,
        },
        devices,
        alerts: devices
          .filter((d) => d.state === 'Xavf')
          .map((d) => ({
            id: d.id,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            msg: `${d.name} — Status: ${d.state} — ${d.prediction}`,
          })),
      });
    } else {
      setSystemData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchApiData();
    intervalRef.current = setInterval(() => fetchApiData(true), 7000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = () => {
    alert('📊 Full PDF report is being generated from analysis results...');
  };

  const renderContent = () => {
    if (systemData.isLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--primary)' }}>
          <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '3rem' }} />
          <span>Loading live data from devices...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'ai':
        return (
          <>
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)' }}>
                  <i className='bx bx-target-lock' />
                </div>
                <div className="stat-info">AI Analysis Accuracy<br /><b>{systemData.stats.precision}</b></div>
              </div>
              <div className="dash-stat-card">
                <div className="stat-icon alert"><i className='bx bx-error-alt' /></div>
                <div className="stat-info">Risk Level<br /><b>{systemData.stats.risk}</b></div>
              </div>
              <div className="dash-stat-card">
                <div className="stat-icon"><i className='bx bx-time-five' /></div>
                <div className="stat-info">Active Monitoring<br /><b>{systemData.stats.activeTime}</b></div>
              </div>
            </div>

            <div className="devices-list" style={{ flex: 1, marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.1rem' }}>All Device Sessions:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {systemData.devices.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                    <i className="bx bx-devices" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }} />
                    No devices connected. <a href="/login" style={{ color: 'var(--primary)' }}>Login</a> to view real data.
                  </div>
                ) : (
                  systemData.devices.map((dev, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', color: dev.state === 'Xavf' ? '#ef4444' : 'var(--success)' }}>
                          {dev.name} <span style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--text-main)' }}>({dev.id})</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <i className='bx bx-line-chart' /> <b style={{ color: 'var(--text-main)' }}>AI Prediction:</b> {dev.prediction}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: dev.state === 'Xavf' ? '#ef4444' : 'var(--text-main)' }}>
                          {dev.temp} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {dev.target}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: {dev.state}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );

      case 'thermostats':
        return (
          <div className="devices-list" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              <i className='bx bx-check-shield' /> Connected Thermostats
            </h4>
            {systemData.devices.filter(d => d.type === 'thermostat').map((dev, idx) => (
              <div key={idx} style={{ marginBottom: '16px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: '1.1rem' }}>{dev.name} <small>({dev.id})</small></b>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{dev.temp}</span>
                </div>
                <div style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Status: {dev.prediction}</div>
              </div>
            ))}
          </div>
        );

      case 'ovens':
        return (
          <div className="devices-list" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              <i className='bx bxs-hot' /> Drying Cabinets
            </h4>
            {systemData.devices.filter(d => d.type === 'oven').map((dev, idx) => (
              <div key={idx} style={{ marginBottom: '16px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: '1.1rem', color: '#ef4444' }}>{dev.name} <small>({dev.id})</small></b>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>{dev.temp}</span>
                </div>
                <div style={{ marginTop: '10px', color: 'var(--text-muted)' }}><i className='bx bx-error' /> {dev.prediction}</div>
              </div>
            ))}
          </div>
        );

      case 'alerts':
        return (
          <div className="alerts-list" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              <i className='bx bx-bell' /> System Alerts (Live Logs)
            </h4>
            {systemData.alerts.length > 0 ? (
              systemData.alerts.map((al, idx) => (
                <div key={idx} style={{ padding: '16px', borderLeft: '4px solid #ef4444', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold', marginRight: '10px' }}>[{al.time}]</span> {al.msg}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No alerts in the system at this time.</div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="settings-panel" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '24px', fontSize: '1.2rem' }}><i className='bx bx-slider-alt' /> API Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>API Endpoint</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  https://dastur-aw8r.onrender.com
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Service Status</div>
                <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                  <span className="pulse-dot" style={{ display: 'inline-block', marginRight: 8 }} />
                  ONLINE — DGU 53519 API
                </div>
              </div>
              <a href="/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center', width: 'fit-content' }}>
                <i className="bx bx-log-in" /> Open Full Dashboard
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabsConfig = [
    { id: 'ai', icon: 'bx-brain', label: 'AI Predictions' },
    { id: 'thermostats', icon: 'bx-check-shield', label: 'Thermostats (Live)' },
    { id: 'ovens', icon: 'bxs-hot', label: 'Drying Cabinets' },
    { id: 'alerts', icon: 'bx-bell', label: 'Alert System' },
    { id: 'settings', icon: 'bx-slider-alt', label: 'API Settings' },
  ];

  return (
    <section className="dashboard-preview" id="dashboard">
      <div className="container">
        <div className="section-header fade-up text-center">
          <h2 className="section-title">AI Analysis <span className="gradient-text">Control Panel</span></h2>
          <p className="section-desc">
            View real-time sensor data and AI-powered predictive logs from connected devices below.
          </p>
        </div>

        <div className="dashboard-wrapper glass-card fade-up delay-1">
          <div className="dash-header">
            <div className="dash-title">Dynamic Predictions & Metrology Panel</div>
            <div className="dash-actions">
              <span className="btn-sm" onClick={handleExport}><i className='bx bxs-file-pdf' /> Export (PDF)</span>
              <span className="btn-sm primary" onClick={() => fetchApiData()} style={{ pointerEvents: systemData.isLoading ? 'none' : 'auto', opacity: systemData.isLoading ? 0.7 : 1 }}>
                <i className={`bx bx-refresh ${systemData.isLoading ? 'bx-spin' : ''}`} /> Refresh
              </span>
            </div>
          </div>
          <div className="dash-body">
            <div className="dash-sidebar">
              {tabsConfig.map(tab => (
                <div
                  key={tab.id}
                  className={`dash-menu ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bx ${tab.icon}`} /> {tab.label}
                </div>
              ))}
            </div>
            <div className="dash-content" style={{ overflowY: 'auto' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
