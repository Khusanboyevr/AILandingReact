import demoService from '../api/demoService';

const SystemUnavailable = () => {
  const handleDemoMode = () => {
    demoService.toggleDemoMode(true);
    window.location.reload(); // Refresh to activate demo mode in apiClient
  };

  return (
    <div className="sys-unavailable">
      <div className="sys-unavailable-inner">
        <div className="sys-icon">
          <i className="bx bx-error-circle" />
        </div>
        <h1>System Unavailable</h1>
        <p>
          The backend service is currently unreachable. Please check your connection
          or try again in a few minutes.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <i className="bx bx-refresh" /> Retry Connection
          </button>
          
          <button className="btn btn-secondary" onClick={handleDemoMode} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            <i className="bx bx-play-circle" /> Enter Demo Mode
          </button>
        </div>

        <div className="sys-status" style={{ marginTop: 32 }}>
          <span className="sys-dot offline" />
          API: Offline — https://dastur-aw8r.onrender.com
        </div>
      </div>
    </div>
  );
};

export default SystemUnavailable;
