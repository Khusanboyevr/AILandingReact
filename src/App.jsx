import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
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
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
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
}

export default App;
