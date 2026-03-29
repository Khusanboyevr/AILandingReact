import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import { setToken } from '../utils/auth';
import toast from 'react-hot-toast';
import demoService from '../api/demoService';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Please enter username and password.');
      return;
    }

    setLoading(true);
    
    // Explicitly turn OFF demo mode for real login attempt
    demoService.toggleDemoMode(false);
    
    const result = await login(form.username, form.password);
    
    if (result.success) {
      const token = result.token;
      if (token) {
        setToken(token);
        toast.success('Welcome back! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        toast.error('Login succeeded but no token received.');
      }
    } else {
      // If login failed, we might want to stay in live mode or show error
      toast.error(result.message);
    }
    setLoading(false);
  };


  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="glow-orb orb-1" style={{ opacity: 0.4 }} />
      <div className="glow-orb orb-2" style={{ opacity: 0.25 }} />

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="bx bx-atom" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to the AI Monitoring Dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <div className="login-input-wrap">
              <i className="bx bx-user" />
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap" style={{ position: 'relative' }}>
              <i className="bx bx-lock-alt" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                style={{ paddingRight: '44px' }}
              />
              <i 
                className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '1.2rem',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
          </div>

          <div className="login-options" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
            </label>
            <a href="#" className="forgot-link" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <><i className="bx bx-loader-alt bx-spin" /> Signing In...</>
            ) : (
              <><i className="bx bx-log-in" /> Sign In</>
            )}
          </button>

          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <span style={{ background: 'var(--bg-dark)', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.8rem', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>Or</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--card-border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary login-submit demo-btn-login"
            onClick={() => {
              demoService.toggleDemoMode(true);
              setToken('DEMO_MODE');
              toast.success('Xush kelibsiz! Demo rejimiga o\'tilmoqda...');
              setTimeout(() => navigate('/dashboard'), 800);
            }}
            disabled={loading}
            style={{ marginTop: 0, background: 'transparent', border: '1px solid var(--card-border)' }}
          >
            <i className="bx bx-play-circle" /> Try Demo Mode
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="login-back">
            <i className="bx bx-arrow-back" /> Bosh sahifaga qaytish 
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
