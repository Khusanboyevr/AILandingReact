import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Landing page components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Contact from './components/Contact';
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
        <Contact />
      </main>
      <Footer />
    </>
  );
};

function App() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'ok' | 'down'

  useEffect(() => {
    checkHealth().then((ok) => setApiStatus(ok ? 'ok' : 'down'));
  }, []);

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
  );
}

export default App;
