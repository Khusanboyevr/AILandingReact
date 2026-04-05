import { useState, useEffect } from 'react';
import { createMeasurement } from '../api/measurementsApi';
import { getDevices } from '../api/devicesApi';
import toast from 'react-hot-toast';

const MeasurementsPage = () => {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    device: '',
    temperature: '',
    humidity: '',
    power_usage: '',
    sensor_data: '',
    formula: '',
  });
  const [aiResult, setAiResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDevices = async () => {
      const result = await getDevices();
      if (result.success) {
        setDevices(result.data?.results || result.data || []);
      }
      setLoadingDevices(false);
    };
    fetchDevices();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear the specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.formula) {
      newErrors.formula = 'Iltimos, formulani kiriting.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      serial_number: 'AI-FORMULA-MODE',
      device_name: 'Formula Sandbox Console',
      device_type: 'thermostat',
      temperature: 20.0,
      sensor_data: JSON.stringify({ formula: form.formula })
    };

    const result = await createMeasurement(payload);
    
    setSubmitting(false);

    if (result.success) {
      if (result.offline) {
        toast.error(result.warning || 'Saved locally due to server error.', { icon: '💾' });
      } else {
        toast.success('Measurement and Formula submitted successfully!');
        const prediction = result.data?.prediction || result.data?.ai_prediction;
        if (prediction) {
          setAiResult(prediction);
        }
      }
      setForm({
        device: form.device, // Keep selected device
        temperature: '',
        humidity: '',
        power_usage: '',
        sensor_data: '',
        formula: '',
      });
      setErrors({});
    } else {
      toast.error(result.message);
      if (result.fieldErrors) {
        // Map backend field errors to frontend inputs
        const backendErrors = {};
        for (const [key, value] of Object.entries(result.fieldErrors)) {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        }
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Formula Sandbox</h1>
          <p className="page-sub">Test complex mathematical formulas securely with AI</p>
        </div>
      </div>

      <div className="measure-layout">
        {/* Form */}
        <div className="glass-card measure-form-card">
          <h3 style={{ marginBottom: 24 }}><i className="bx bx-math" /> Formula Input Panel</h3>

          <form onSubmit={handleSubmit} className="modal-form">


            {/* Formula Field (Optional) */}
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>AI Formula / Savol (Masalan: Matematik formula) <span style={{color: 'var(--accent)', fontSize: '0.8rem'}}>(Yangi)</span></label>
              <div className={`form-input-wrap ${errors.formula ? 'error' : ''}`}>
                <i className="bx bx-math" />
                <input
                  type="text"
                  name="formula"
                  value={form.formula}
                  onChange={handleChange}
                  placeholder="Misol uchun: x^2 + 5x + 6 = 0, yechimini top"
                  disabled={submitting}
                />
              </div>
              {errors.formula && <p className="form-error">{errors.formula}</p>}
            </div>



            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 8, gridColumn: '1 / -1' }}>
              {submitting ? (
                <><i className="bx bx-loader-alt bx-spin" /> Transmitting...</>
              ) : (
                <><i className="bx bx-upload" /> Submit Measurement</>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="glass-card measure-info-card">
          <div className="info-icon">
            <i className="bx bx-info-circle" />
          </div>
          <h3>Submission Guidelines</h3>
          <p>Please follow these instructions when manually submitting data:</p>
          <ul className="info-list">
             <li>
                <i className="bx bx-info-circle" />
                <span>Ushbu Maxsus bo'lim faqat formulalar va erkin mantiqiy savollarni tahlil qilish uchun mo'ljallangan. Boshqa datchik moslamalari ataylab o'chirib qo'yilgan.</span>
              </li>
            <li>
              <i className="bx bx-math" />
              <span><strong>AI Formula / Savol</strong>: Bu maydonga ixtiyoriy misol yoki formulani kiritishingiz mumkin, va AI sizga tahlil bilan birga uni ishlab beradi.</span>
            </li>
            <li>
              <i className="bx bx-time" />
              <span>The <strong>timestamp</strong> is automatically added by the server at the exact moment of reception.</span>
            </li>
          </ul>
        </div>

        {/* AI Result Presentation! */}
        {aiResult && (
          <div className="glass-card measure-info-card" style={{ marginTop: 24, borderLeft: '4px solid #10b981' }}>
            <div className="info-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <i className="bx bx-check-double" />
            </div>
            <h3 style={{ color: '#10b981' }}>AI Formula Result & Feedback</h3>
            <p><strong>Status:</strong> {aiResult.status_label || aiResult.status || 'Success'}</p>
            {aiResult.advice && (
              <div style={{ marginTop: 12, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <strong>AI Advice/Yechim:</strong><br />
                <span style={{ color: 'var(--text-light)', whiteSpace: 'pre-wrap' }}>{aiResult.advice}</span>
              </div>
            )}
            {aiResult.recommendation && (
              <div style={{ marginTop: 12, padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                <strong style={{ color: '#8b5cf6' }}>Recommendation:</strong><br />
                {aiResult.recommendation}
              </div>
            )}
            {aiResult.gemini_response && (
              <div style={{ marginTop: 12, padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                <strong style={{ color: '#3b82f6' }}>Raw AI Details:</strong><br />
                <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {typeof aiResult.gemini_response === 'string' ? aiResult.gemini_response : JSON.stringify(aiResult.gemini_response, null, 2)}
                </span>
              </div>
            )}
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: 24 }}
              onClick={() => setAiResult(null)}
            >
              Yopish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementsPage;
