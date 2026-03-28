import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="logo">
          <i className='bx bx-brain' />
          <span>DeepAnalytics</span>
        </a>
        <nav className="nav-links">
          <a href="#about" className="active">About</a>
          <a href="#features">Features</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#contact">Contact</a>
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {authed ? (
            <Link to="/dashboard" className="btn btn-primary nav-btn">
              <i className="bx bx-grid-alt" /> Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary nav-btn">
              <i className="bx bx-log-in" /> Sign In
            </Link>
          )}
        </div>
        <button className="mobile-toggle"><i className='bx bx-menu' /></button>
      </div>
    </header>
  );
};

export default Navbar;
