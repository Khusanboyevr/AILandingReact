import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import demoService from '../api/demoService';
import AIFormulaTester from '../components/AIFormulaTester';

const SignUpPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Barcha maydonlarni toldiring.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Parollar mos kelmadi!');
      return;
    }

    setLoading(true);
    
    // Using demo logic to simulate registration since real API doesn't have standard signup in Swagger
    // In production, this would call register() from authApi
    setTimeout(() => {
        setLoading(false);
        toast.success('Muvaffaqiyatli royxatdan otdingiz! Tizimga kiring.');
        navigate('/login');
    }, 1500);
  };

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="glow-orb orb-1" style={{ opacity: 0.4 }} />
      <div className="glow-orb orb-2" style={{ opacity: 0.25 }} />

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="bx bx-user-plus" />
          </div>
          <h1>Royxatdan otish</h1>
          <p>Tizimga yangi hisob qoshish</p>
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
                placeholder="Foydalanuvchi nomini kiriting"
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <i className="bx bx-envelope" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email manzilini kiriting"
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Parol</label>
            <div className="login-input-wrap" style={{ position: 'relative' }}>
              <i className="bx bx-lock-alt" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Parolni kiriting"
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

          <div className="login-field">
            <label htmlFor="confirmPassword">Parolni tasdiqlang</label>
            <div className="login-input-wrap">
              <i className="bx bx-check-shield" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Parolni qayta kiriting"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <><i className="bx bx-loader-alt bx-spin" /> Yaratilmoqda...</>
            ) : (
              <><i className="bx bx-user-check" /> Royxatdan otish</>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 15, fontSize: '0.9rem' }}>
             <span style={{ color: 'var(--text-muted)' }}>Hisobingiz bormi? </span>
             <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Tizimga kirish</Link>
          </div>
        </form>

        <div className="login-footer">
          <Link to="/" className="login-back">
            <i className="bx bx-arrow-back" /> Bosh sahifaga qaytish 
          </Link>
        </div>
      </div>

      {/* AI DEMO INTEGRATION SIDE */}
      <div style={{ marginTop: 40, width: '100%', maxWidth: '480px', animation: 'slideUp 0.6s ease-out forwards 0.2s', opacity: 0 }}>
        <AIFormulaTester title="Akkount ochishdan oldin AI ni sinab ko'ring" />
      </div>
    </div>
  );
};

export default SignUpPage;
