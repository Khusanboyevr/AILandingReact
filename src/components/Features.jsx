const Features = () => {
    return (
        <section className="features" id="features">
            <div className="container">
                <div className="section-header fade-up">
                    <h2 className="section-title">Asosiy <span className="gradient-text">Imkoniyatlar (Features)</span></h2>
                    <p className="section-desc">Mazkur sun'iy intellekt dasturining asosiy funksiyalari va metrologik afzalliklari.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card fade-up">
                        <div className="f-icon"><i className='bx bx-brain'></i></div>
                        <h3>AI tahlil</h3>
                        <p>Uskunalarning ko'p yillik va joriy tsikllari ma'lumotlarini qabul qilib, sun'iy intellekt yordamida naqshlarni chiqaradi va nosozliklarni tahlil qiladi.</p>
                    </div>
                    <div className="feature-card fade-up delay-1">
                        <div className="f-icon"><i className='bx bx-radar'></i></div>
                        <h3>Real vaqt monitoring</h3>
                        <p>Barcha termostatlar va quritish shkaflaridagi jismoniy (harorat/namlik) ko'rsatkichlarni jonli tarzda uzluksiz kuzatib boradi.</p>
                    </div>
                    <div className="feature-card fade-up delay-2">
                        <div className="f-icon"><i className='bx bx-bell'></i></div>
                        <h3>Oldindan ogohlantirish tizimi</h3>
                        <p>Tizim potentsial xavfni (haroratning me'yordan oshishi/tushishi) sezishi bilanoq sizga birinchilardan bo'lib avtomatik ravishda ogohlantirish xabarini yuboradi.</p>
                    </div>
                    <div className="feature-card fade-up delay-1">
                        <div className="f-icon"><i className='bx bx-pie-chart-alt-2'></i></div>
                        <h3>Grafik va statistik ko'rsatmalar</h3>
                        <p>Bashoratlar va tekshiruv baholari oson tushuniladigan vizual metrologik grafiklar va hisobot statistikalari (PDF, Excel) ko'rinishiga aylantirib beriladi.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
