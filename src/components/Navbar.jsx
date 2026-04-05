import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import demoService from '../api/demoService';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(demoService.isDemoMode());

  useEffect(() => {
    setAuthed(isAuthenticated());
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <a href="#" className="logo">
            <i className='bx bx-brain' />
            <span>DeepAnalytics</span>
          </a>
        </div>
        
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#about" className="active" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#dashboard" onClick={() => setMenuOpen(false)}>Dashboard</a>
          {/* Mobile Login Button */}
          <div className="mobile-auth-btn">
            {authed ? (
              <Link to="/dashboard" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                <i className="bx bx-grid-alt" /> Boshqaruv
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                <i className="bx bx-log-in" /> Tizimga kirish
              </Link>
            )}
          </div>
        </nav>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="desktop-auth-btn">
          {authed ? (
            <Link to="/dashboard" className="btn btn-primary nav-btn">
              <i className="bx bx-grid-alt" /> Boshqaruv Paneli
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary nav-btn">
              <i className="bx bx-log-in" /> Tizimga kirish
            </Link>
          )}
        </div>
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={`bx ${menuOpen ? 'bx-x' : 'bx-menu'}`} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
