const Contact = () => {
    return (
        <section className="contact" id="contact">
            <div className="container fade-up" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div className="contact-info">
                    <h2 className="section-title">Savollaringiz bormi?<br/>Biz bilan <span className="gradient-text">bog'laning</span></h2>
                    <p className="section-desc">Tizimning bepul demo versiyasini sinab ko'rish yoki hamkorlik qilish uchun bizga murojaat qiling.</p>
                    
                    <div className="contact-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                        <div className="c-item" style={{ textAlign: 'left', width: '100%', maxWidth: '300px' }}>
                            <div className="c-icon"><i className='bx bx-envelope'></i></div>
                            <div>
                                <div className="c-label">Email manzil:</div>
                                <div className="c-value">hello@deepanalytics.uz</div>
                            </div>
                        </div>
                        <div className="c-item" style={{ textAlign: 'left', width: '100%', maxWidth: '300px' }}>
                            <div className="c-icon"><i className='bx bx-phone'></i></div>
                            <div>
                                <div className="c-label">Telefon raqam:</div>
                                <div className="c-value">+998 90 123 45 67</div>
                            </div>
                        </div>
                        <div className="c-item" style={{ textAlign: 'left', width: '100%', maxWidth: '300px' }}>
                            <div className="c-icon"><i className='bx bx-map'></i></div>
                            <div>
                                <div className="c-label">Manzil:</div>
                                <div className="c-value">Toshkent sh., Xalqaro biznes markazi, 12-qavat</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
