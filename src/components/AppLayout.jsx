import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../utils/auth';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: 'bx-grid-alt', label: 'Dashboard', end: true },
    { to: '/dashboard/devices', icon: 'bx-devices', label: 'Devices' },
    { to: '/dashboard/measurements', icon: 'bx-line-chart', label: 'Measurements' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <i className="bx bx-atom" />
          <span>DGU <span className="gradient-text">AI</span></span>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bx ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-nav-item status-ok">
            <i className="bx bx-wifi" />
            <span>API Online</span>
            <span className="status-dot online" />
          </div>
          <button className="app-nav-item logout-btn" onClick={handleLogout}>
            <i className="bx bx-log-out" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <div className="app-main-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
