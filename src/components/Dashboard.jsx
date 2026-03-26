import { useState, useEffect } from 'react';

const Dashboard = () => {
    // API ulanganida ishlatiladigan markaziy State: backenddan ma'lumotlarni kutadi
    const [systemData, setSystemData] = useState({
        isLoading: true,
        stats: { precision: "-", risk: "-", activeTime: "-" },
        devices: [],
        alerts: []
    });

    const [activeTab, setActiveTab] = useState('ai');

    // MOCK DATA: API kelguncha UI muammosiz ishlashini namoyish qilish parametrlar 
    const defaultMockResponse = {
        isLoading: false,
        stats: {
            precision: "98.5%", // AI Aniqlik darajasi
            risk: "Past (1.2%)", // Uskuna ishdan chiqish ehtimoli
            activeTime: "140 soat" // Uzluksiz ishlash vaqti
        },
        devices: [
            { id: "TR-01", type: "thermostat", name: "Termostat TC-120", temp: "37.5°C", target: "37.0°C", state: "Norma", prediction: "Barqaror" },
            { id: "QR-05", type: "oven", name: "Quritish Shkafi SH-3", temp: "105.0°C", target: "100.0°C", state: "Xavf", prediction: "30 min ichida keskin qizib ketishi mumkin" },
            { id: "TR-02", type: "thermostat", name: "Termostat TC-80", temp: "-5.0°C", target: "-5.0°C", state: "Norma", prediction: "Muzlash xolati a'lo" },
        ],
        alerts: [
            { id: "AL-1", time: "10:32", msg: "QR-05 (Quritish Shkafi) harorati normadan 5°C yuqori ko'tarildi. Nosozlik xafvi mavjud." },
            { id: "AL-2", time: "08:15", msg: "TR-01 tizimi muvaffaqiyatli sinovdan o'tdi." }
        ]
    };

    const fetchApiData = () => {
        setSystemData(prev => ({ ...prev, isLoading: true }));
        
        // Default mock yuklash (Imitator timer) - haqiqiy API ulanganda ushbu qism server linkiga ulanadi
        setTimeout(() => {
            setSystemData(defaultMockResponse);
        }, 1200);
    };

    useEffect(() => {
        fetchApiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExport = () => {
        alert("📊 Tahlil natijalari asosida to'liq PDF hisoboti shakllantirilmoqda...\n(Haqiqiy backend ulanganda, ushbu tugma asl PDF hujjat yozuvlariga havola yaratadi va yuklaydi)");
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        alert("Yangi API va ruxsat berilgan chegaralar saqlandi!");
    };

    // Dinamik kontent renderi
    const renderContent = () => {
        if (systemData.isLoading) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--primary)' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '3rem' }}></i>
                    <span>Tizim qurilmalardan joriy axborotni taqdim etmoqda...</span>
                </div>
            );
        }

        switch (activeTab) {
            case 'ai':
                return (
                    <>
                        <div className="dash-stats">
                            <div className="dash-stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)' }}><i className='bx bx-target-lock'></i></div>
                                <div className="stat-info">AI Tahlil Aniqligi<br/><b>{systemData.stats.precision}</b></div>
                            </div>
                            <div className="dash-stat-card">
                                <div className="stat-icon alert"><i className='bx bx-error-alt'></i></div>
                                <div className="stat-info">O'rtacha xavf ehtimoli<br/><b>{systemData.stats.risk}</b></div>
                            </div>
                            <div className="dash-stat-card">
                                <div className="stat-icon"><i className='bx bx-time-five'></i></div>
                                <div className="stat-info">Uzluksiz Monitoring<br/><b>{systemData.stats.activeTime}</b></div>
                            </div>
                        </div>
                        
                        <div className="devices-list" style={{ flex: 1, marginTop: '20px' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.1rem' }}>Barcha Uskunalar Sessiyasi:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {systemData.devices.map((dev, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '1.05rem', color: dev.state === 'Xavf' ? '#ef4444' : 'var(--success)' }}>
                                                {dev.name} <span style={{fontSize: '0.8rem', opacity: 0.7, color: 'var(--text-main)'}}> ({dev.id}) </span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                                <i className='bx bx-line-chart'></i> <b style={{color: 'var(--text-main)'}}>AI Bashorati:</b> {dev.prediction}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: dev.state === 'Xavf' ? '#ef4444' : 'var(--text-main)' }}>
                                                {dev.temp} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ {dev.target} (Norma)</span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: {dev.state}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );

            case 'thermostats':
                return (
                    <div className="devices-list" style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}><i className='bx bx-check-shield'></i> Bog'langan Termostatlar</h4>
                        {systemData.devices.filter(d => d.type === 'thermostat').map((dev, idx) => (
                            <div key={idx} style={{ marginBottom: '16px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <b style={{fontSize: '1.1rem'}}>{dev.name} <small>({dev.id})</small></b>
                                    <span style={{color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem'}}>{dev.temp}</span>
                                </div>
                                <div style={{marginTop: '10px', color: 'var(--text-muted)'}}>Holati: {dev.prediction}</div>
                            </div>
                        ))}
                    </div>
                );

            case 'ovens':
                return (
                    <div className="devices-list" style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}><i className='bx bxs-hot'></i> Quritish Shkaflari</h4>
                        {systemData.devices.filter(d => d.type === 'oven').map((dev, idx) => (
                            <div key={idx} style={{ marginBottom: '16px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <b style={{fontSize: '1.1rem', color: '#ef4444'}}>{dev.name} <small>({dev.id})</small></b>
                                    <span style={{color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem'}}>{dev.temp}</span>
                                </div>
                                <div style={{marginTop: '10px', color: 'var(--text-muted)'}}><i className='bx bx-error'></i> {dev.prediction}</div>
                            </div>
                        ))}
                    </div>
                );

            case 'alerts':
                return (
                    <div className="alerts-list" style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem' }}><i className='bx bx-bell'></i> Tizim Ogohlantirishlari (Logs)</h4>
                        {systemData.alerts.length > 0 ? (
                            systemData.alerts.map((al, idx) => (
                                <div key={idx} style={{ padding: '16px', borderLeft: '4px solid #ef4444', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', borderRadius: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold', marginRight: '10px' }}>[{al.time}]</span> {al.msg}
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>Hozircha tizimda ogohlantirishlar mavjud emas.</div>
                        )}
                    </div>
                );

            case 'settings':
                return (
                    <div className="settings-panel" style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '24px', fontSize: '1.2rem' }}><i className='bx bx-slider-alt'></i> API Log Sozlamalari</h4>
                        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)'}}>Haqiqiy API Endpoint manzili (URL):</label>
                                <input type="text" defaultValue="https://api.metrologiya.uz/v1/sensors" required style={{ width: '100%', padding:'12px', color: 'white', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }} />
                            </div>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label style={{display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)'}}>Ruxsat etilgan Termostat og'ishi (°C):</label>
                                <input type="number" step="0.1" defaultValue="0.5" required style={{ width: '100%', padding:'12px', color: 'white', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: '10px' }}>O'zgarishlarni Saqlash</button>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    // Yon menyu tab konfiguratsiyalari
    const tabsConfig = [
        { id: 'ai', icon: 'bx-brain', label: 'AI Bashoratlar' },
        { id: 'thermostats', icon: 'bx-check-shield', label: 'Termostatlar (Live)' },
        { id: 'ovens', icon: 'bxs-hot', label: 'Quritish shkaflari' },
        { id: 'alerts', icon: 'bx-bell', label: 'AI Ogohlantirish Tizimi' },
        { id: 'settings', icon: 'bx-slider-alt', label: 'API Log Sozlamalari' }
    ];

    return (
        <section className="dashboard-preview" id="dashboard">
            <div className="container">
                <div className="section-header fade-up text-center">
                    <h2 className="section-title">AI Tahlil <span className="gradient-text">Boshqaruvi</span></h2>
                    <p className="section-desc">Pastroqda uskunalar datchiklardan kelayotgan real vaqt ma'lumotlari hamda AI ga asoslangan bashorat loglarini interaktiv boshqaruv orqali ko'rishingiz mumkin.</p>
                </div>

                <div className="dashboard-wrapper glass-card fade-up delay-1">
                    <div className="dash-header">
                        <div className="dash-title">Dinamik Bashoratlar va Metrologiya Paneli</div>
                        <div className="dash-actions">
                            <span className="btn-sm" onClick={handleExport}><i className='bx bxs-file-pdf'></i> Export (PDF)</span>
                            <span className="btn-sm primary" onClick={fetchApiData} style={{ pointerEvents: systemData.isLoading ? 'none' : 'auto', opacity: systemData.isLoading ? 0.7 : 1 }}>
                                <i className={`bx bx-refresh ${systemData.isLoading ? 'bx-spin' : ''}`}></i> Yangilash
                            </span>
                        </div>
                    </div>
                    <div className="dash-body">
                        <div className="dash-sidebar">
                            {tabsConfig.map(tab => (
                                <div 
                                    key={tab.id} 
                                    className={`dash-menu ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <i className={`bx ${tab.icon}`}></i> {tab.label}
                                </div>
                            ))}
                        </div>
                        <div className="dash-content" style={{ overflowY: 'auto' }}>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
