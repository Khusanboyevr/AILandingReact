const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="container hero-container">
                <div className="hero-content fade-up">
                    <div className="badge">
                        <span className="pulse-dot"></span>
                        № DGU 53519 Dasturi
                    </div>
                    <h1 className="hero-title" style={{ fontSize: '3.6rem' }}>
                        Metrologiya Tekshiruvlari Uchun <span className="gradient-text">Bashoratli AI Tahlil</span> Tizimi
                    </h1>
                    <p className="hero-subtitle">
                        Termostat va quritish shkaflari faoliyatini sun'iy intellekt orqali real vaqt monitoring qiling. Uskunalar holatidagi fizik o'zgarishlarni va gradus og'ishlarini oldindan aniq bashorat qiling.
                    </p>
                    <div className="hero-actions">
                        <a href="#dashboard" className="btn btn-primary btn-lg">Boshqaruv Paneli</a>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Imkoniyatlar
                        </a>
                    </div>
                </div>
                
                <div className="hero-visual fade-up delay-2">
                    <div className="glass-card visual-card">
                        <div className="visual-header">
                            <div className="dots">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="title">AI Bashorat (Termostat T-12)</div>
                        </div>
                        <div className="visual-body">
                            <div className="metric-row">
                                <i className='bx bx-analyse'></i>
                                <div className="metric-info">
                                    <span className="label">Sensordan real vaqt harorat</span>
                                    <span className="value success">37.5°C (Barqaror)</span>
                                </div>
                            </div>
                            
                            <div className="mock-chart">
                                <div className="bar h-60"></div>
                                <div className="bar h-80"></div>
                                <div className="bar h-40"></div>
                                <div className="bar h-100"></div>
                                <div className="bar h-70"></div>
                                <div className="bar h-90"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
