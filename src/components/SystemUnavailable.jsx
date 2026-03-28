const SystemUnavailable = () => (
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
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        <i className="bx bx-refresh" /> Retry Connection
      </button>
      <div className="sys-status">
        <span className="sys-dot offline" />
        API: Offline — https://dastur-aw8r.onrender.com
      </div>
    </div>
  </div>
);

export default SystemUnavailable;
