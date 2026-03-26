const About = () => {
    return (
        <section className="about" id="about">
            <div className="container">
                <div className="section-header fade-up">
                    <h2 className="section-title">Tizim haqida <span className="gradient-text">tasavvur</span></h2>
                    <p className="section-desc">Sun'iy intellektga asoslangan ushbu tahlil tizimi katta hajmdagi ma'lumotlarni qisqa vaqt ichida o'qish, farqlash va ulardan biznes uchun yechimlar chiqarib berishga ixtisoslashgan.</p>
                </div>

                <div className="about-grid">
                    <div className="about-card glass-card fade-up">
                        <div className="icon-box"><i className='bx bx-line-chart'></i></div>
                        <h3>Ma'lumotlar Tahlili</h3>
                        <p>Kompaniyangiz yig'gan har qanday o'lchamdagi ma'lumotlar chuqur tahlil qilinadi va tushunarli vizual statistikaga ko'chiriladi.</p>
                    </div>
                    
                    <div className="about-card glass-card fade-up delay-1">
                        <div className="icon-box"><i className='bx bx-shield-quarter'></i></div>
                        <h3>Xavfsizlik va Ishonch</h3>
                        <p>Xizmatlar eng so'nggi shifrlash protokollari va zamonaviy xavfsizlik algoritmlari yordamida ishonchli himoyalanadi.</p>
                    </div>
                    
                    <div className="about-card glass-card fade-up delay-2">
                        <div className="icon-box"><i className='bx bx-rocket'></i></div>
                        <h3>Biznesni Tezlashtirish</h3>
                        <p>Jarayonlarni to'liq avtomatlashtirish orqali jamoangiz vaqtini tejang va asosiy e'tiborni yangi mijozlar jalb etishga qarating.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
