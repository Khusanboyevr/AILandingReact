const Contact = () => {
    return (
        <section className="contact" id="contact">
            <div className="container contact-container fade-up">
                <div className="contact-info">
                    <h2 className="section-title">Savollaringiz bormi?<br/>Biz bilan <span className="gradient-text">bog'laning</span></h2>
                    <p className="section-desc">Tizimning bepul demo versiyasini sinab ko'rish yoki hamkorlik qilish uchun bizga murojaat qiling.</p>
                    
                    <div className="contact-details">
                        <div className="c-item">
                            <div className="c-icon"><i className='bx bx-envelope'></i></div>
                            <div>
                                <div className="c-label">Email manzil:</div>
                                <div className="c-value">hello@deepanalytics.uz</div>
                            </div>
                        </div>
                        <div className="c-item">
                            <div className="c-icon"><i className='bx bx-phone'></i></div>
                            <div>
                                <div className="c-label">Telefon raqam:</div>
                                <div className="c-value">+998 90 123 45 67</div>
                            </div>
                        </div>
                        <div className="c-item">
                            <div className="c-icon"><i className='bx bx-map'></i></div>
                            <div>
                                <div className="c-label">Manzil:</div>
                                <div className="c-value">Toshkent sh., Xalqaro biznes markazi, 12-qavat</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="contact-form glass-card">
                    <h3>Xabar yuborish</h3>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Rahmat! Xabaringiz muvaffaqiyatli yuborildi.'); }}>
                        <div className="input-group">
                            <label>To'liq ismingiz</label>
                            <input type="text" placeholder="Ismingizni kiriting" required />
                        </div>
                        <div className="input-group">
                            <label>Email yoki telefon raqamingiz</label>
                            <input type="text" placeholder="example@mail.com" required />
                        </div>
                        <div className="input-group">
                            <label>Xabaringiz</label>
                            <textarea rows="4" placeholder="O'z savolingizni yoki talabingizni yozing..." required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-submit">Xabarni yuborish <i className='bx bx-paper-plane'></i></button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
