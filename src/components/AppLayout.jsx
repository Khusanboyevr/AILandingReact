import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../utils/auth';
import demoService from '../api/demoService';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(demoService.isDemoMode());

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const toggleDemo = (val) => {
    demoService.toggleDemoMode(val);
    window.location.reload();
  };

  const navItems = [
    { to: '/dashboard', icon: 'bx-grid-alt', label: 'Dashboard', end: true },
    { to: '/dashboard/measurements', icon: 'bx-math', label: 'AI Formula' },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="app-mobile-header">
        <div className="app-sidebar-logo mobile-logo">
          <i className="bx bx-atom" />
          <span>DGU <span className="gradient-text">AI</span></span>
          {isDemo && <span className="demo-badge" style={{ marginLeft: 8, fontSize: '0.6rem', padding: '2px 8px' }}>Demo</span>}
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <i className="bx bx-menu" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="app-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="app-sidebar-logo">
          <i className="bx bx-atom" />
          <span>DGU <span className="gradient-text">AI</span></span>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <i className="bx bx-x" />
          </button>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bx ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          {isDemo ? (
            <div className="demo-toggle-container" style={{ border: 'none', padding: '0 12px 12px' }}>
              <div className="demo-badge" style={{ marginBottom: 12, justifyContent: 'center' }}>
                <i className="bx bx-test-tube" /> Demo Mode Active
              </div>
              <button 
                className="btn btn-sm" 
                style={{ width: '100%', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => toggleDemo(false)}
              >
                Switch to Live Mode
              </button>
            </div>
          ) : (
            <div className="app-nav-item status-ok">
              <i className="bx bx-wifi" />
              <span>API Online</span>
              <span className="status-dot online" />
            </div>
          )}
          
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
