import { useEffect, useState } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <a href="#" className="logo">
                    <i className='bx bx-brain'></i>
                    <span>DeepAnalytics</span>
                </a>
                <nav className="nav-links">
                    <a href="#about" className="active">Tizim haqida</a>
                    <a href="#features">Imkoniyatlar</a>
                    <a href="#dashboard">Dashboard</a>
                    <a href="#benefits">Afzalliklar</a>
                </nav>
                <a href="#contact" className="btn btn-primary nav-btn">Bog'lanish</a>
                <button className="mobile-toggle"><i className='bx bx-menu'></i></button>
            </div>
        </header>
    );
};

export default Navbar;
