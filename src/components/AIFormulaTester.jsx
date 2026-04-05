import { useState } from 'react';
import { createMeasurement } from '../api/measurementsApi';
import toast from 'react-hot-toast';

const AIFormulaTester = ({ title = "Kichik AI Sinovi (Formulani ishlash)" }) => {
  const [formula, setFormula] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!formula.trim()) {
      toast.error('Iltimos, formulani kiriting!');
      return;
    }

    setLoading(true);
    setAiResult(null);

    // Dummy measurement wrapper for the AI demo since backend requires base fields
    const payload = {
      serial_number: 'DEMO-AI-01',
      device_name: 'Public AI Demo',
      device_type: 'thermostat',
      temperature: 20.0,
      sensor_data: JSON.stringify({ formula: formula })
    };

    const result = await createMeasurement(payload);
    setLoading(false);

    if (result.success) {
      toast.success('AI natijasi qabul qilindi!');
      const prediction = result.data?.prediction || result.data?.ai_prediction;
      if (prediction) {
        setAiResult(prediction);
      } else {
        toast.error('AI dan javob kelmadi.');
      }
    } else {
      toast.error(result.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="glass-card measure-form-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px 20px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 600, borderBottomLeftRadius: '12px' }}>
        Live Demo
      </div>
      <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-light)' }}>
        <i className="bx bx-bot" style={{ color: '#8b5cf6', fontSize: '1.5rem' }} /> {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        DGU № 53519 tizimi faqat datchik qiymatlarini tahlil qilmaydi. AI parametrlariga istalgan matematik formulani berib, tahlil samaradorligini hoziroq sinab ko'rishingiz mumkin!
      </p>

      <form onSubmit={handleTest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-input-wrap">
          <i className="bx bx-math" />
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Masalan: x^2 + 5x + 6 = 0"
            disabled={loading}
            style={{ width: '100%', border: 'none', background: 'transparent' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? (
            <><i className="bx bx-loader-alt bx-spin" /> AI ishlamoqda...</>
          ) : (
            <><i className="bx bx-send" /> Tekshirib ko'rish</>
          )}
        </button>
      </form>

      {/* Result Display */}
      {aiResult && (
        <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', marginBottom: 12, fontWeight: 600 }}>
             <i className="bx bx-check-shield" style={{ fontSize: '1.2rem' }} /> Tahlil Natijasi:
          </div>
          
          {aiResult.advice && (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {aiResult.advice}
            </div>
          )}
          
          {aiResult.recommendation && (
            <div style={{ marginTop: 12, padding: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', fontSize: '0.9rem', color: '#a78bfa' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}><i className="bx bx-bulb" /> Recommendation:</strong>
              {aiResult.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFormulaTester;
