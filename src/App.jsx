import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Landing page components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

// Dashboard app
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import SystemUnavailable from './components/SystemUnavailable';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import MeasurementsPage from './pages/MeasurementsPage';

// API
import { checkHealth } from './api/healthApi';
import demoService from './api/demoService';

const LandingPage = () => {
  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => fadeObserver.observe(el));
    return () => fadeObserver.disconnect();
  }, []);

  return (
    <>
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <Dashboard />
      </main>
      <Footer />
    </>
  );
};

// Toast Component
const Toast = ({ title, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <i className={`bx ${type === 'critical' ? 'bx-error' : type === 'warning' ? 'bx-error-circle' : 'bx-info-circle'}`} />
      <div className="toast-content">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
    </div>
  );
};

function App() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'ok' | 'down'
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // API is completely turned off, forcefully set status to 'ok'
    setApiStatus('ok');
  }, []);

  // Real-time Simulation Loop
  useEffect(() => {
    if (!demoService.isDemoMode()) return;

    const interval = setInterval(() => {
      const updatedDevices = demoService.updateSimulation();
      
      // Randomly trigger alerts
      if (Math.random() > 0.85) {
        const device = updatedDevices[Math.floor(Math.random() * updatedDevices.length)];
        if (device.status === 'critical') {
          addToast({ 
            title: 'Critical Alert', 
            message: `${device.name} temperature is at ${device.measurements[0].temperature}°C!`, 
            type: 'critical' 
          });
        } else if (device.status === 'warning') {
          addToast({ 
            title: 'System Warning', 
            message: `${device.name} is showing unstable readings.`, 
            type: 'warning' 
          });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [apiStatus]);

  if (apiStatus === 'checking') {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, color: 'var(--text-muted)', background: 'var(--bg-dark)'
      }}>
        <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }} />
        <p style={{ fontSize: '1rem' }}>Connecting to DGU AI system...</p>
      </div>
    );
  }

  if (apiStatus === 'down') {
    return <SystemUnavailable />;
  }

  return (
    <>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/devices"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DevicesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/devices/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DeviceDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/measurements"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MeasurementsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </>
  );
}

export default App;
