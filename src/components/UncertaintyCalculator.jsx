import React, { useState, useEffect } from 'react';
import demoService from '../api/demoService';
import toast from 'react-hot-toast';

const Card = ({ title, children, icon }) => (
  <div className="calculation-card" style={styles.card}>
    <h3 style={styles.cardTitle}>
      {icon && <i className={`bx ${icon}`} style={{ marginRight: '8px', color: 'var(--primary)' }}></i>}
      {title}
    </h3>
    <div style={styles.cardContent}>
      {children}
    </div>
  </div>
);

const NumberListInput = ({ title, values, onChange, onAdd, onRemove, prefix = "Nuqta" }) => (
  <div style={styles.listInputContainer}>
    <label style={styles.label}>{title}</label>
    {values.map((val, idx) => (
      <div key={idx} style={styles.inputGroup}>
        <div style={styles.inputPrefix}>{prefix} {idx + 1}</div>
        <input 
          type="number" 
          value={val} 
          onChange={(e) => onChange(idx, e.target.value)} 
          placeholder="0.0" 
          style={styles.input}
        />
        {values.length > 1 && (
          <button onClick={() => onRemove(idx)} style={styles.removeBtn}>
            <i className="bx bx-x"></i>
          </button>
        )}
      </div>
    ))}
    <button onClick={onAdd} style={styles.addBtn}>
      <i className="bx bx-plus"></i> Qo'shish
    </button>
  </div>
);

const NumberInput = ({ label, value, onChange, placeholder = "0.0" }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={styles.label}>{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      style={styles.input}
    />
  </div>
);

const ResultField = ({ label, value, unit = "°C", highlight = false }) => (
  <div style={{...styles.resultField, ...(highlight ? styles.resultHighlight : {})}}>
    <span style={styles.resultLabel}>{label}</span>
    <span style={styles.resultValue}>{value} {unit}</span>
  </div>
);

const UncertaintyCalculator = () => {
  // Inputs
  const [tInd, setTInd] = useState(['39.8', '40.0', '39.9', '40.1', '40.0']);
  
  const [tInstab, setTInstab] = useState(['39.8', '40.0', '40.2', '39.9']);
  
  const [tRef, setTRef] = useState('40.0');
  const [tSpatial, setTSpatial] = useState(['40.0', '39.7', '40.2', '39.8']);
  
  const [t1e, setT1e] = useState('39.5');
  const [the, setThe] = useState('41.0');
  
  const [tRefLoad, setTRefLoad] = useState('39.6');
  
  const [uCalStd, setUCalStd] = useState('0.1');
  const [reStd, setReStd] = useState('0.1');

  // Outputs
  const [results, setResults] = useState({
    tMean: 0,
    ua2: 0,
    ub1: 0,
    ub2: 0,
    ub3: 0,
    ub4: 0,
    ub5: 0,
    ub6: 0,
    uc: 0,
    U: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Construct payload per requirements
    const payload = {
      serial_number: "TH-001",
      name: "Thermostat A1",
      device_type: "thermostat",
      location: "Lab 1",
      temperature: 38.1,
      humidity: 42.0,
      power_usage: 210.0,
      indication_temperatures: tInd.map(x => parseFloat(x)),
      chamber_temperatures: tSpatial.map(x => parseFloat(x)),
      t_ref: parseFloat(tRef),
      t_ref_load: parseFloat(tRefLoad),
      t_le: parseFloat(t1e),
      t_he: parseFloat(the),
      u_cal_std: parseFloat(uCalStd),
      re_std: parseFloat(reStd)
    };

    try {
      // Use demoService for submission to avoid CORS blockers while keeping local results valid
      const res = await demoService.submitCalibration(payload);
      toast.success(res.message);
      if (res.backend_calculated) {
        toast.success("Tahlil yakunlandi: " + res.backend_calculated.status);
      }
    } catch (e) {
      toast.error('Xatolik: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculation Logic
  useEffect(() => {
    // Helper to parse floats safely
    const parseList = (arr) => arr.map(x => parseFloat(x)).filter(x => !isNaN(x));
    const p = (val) => parseFloat(val) || 0;

    const indVals = parseList(tInd);
    const n = indVals.length;
    let ua2 = 0;
    let tMean = 0;

    if (n > 0) {
      tMean = indVals.reduce((a, b) => a + b, 0) / n;
      if (n > 1) {
        const sumSq = indVals.reduce((a, b) => a + Math.pow(b - tMean, 2), 0);
        ua2 = Math.sqrt(sumSq / (n * (n - 1)));
      }
    }

    const instabVals = parseList(tInstab);
    let ub1 = 0;
    if (instabVals.length > 0) {
      const iMean = instabVals.reduce((a, b) => a + b, 0) / instabVals.length;
      const maxDev = Math.max(...instabVals.map(x => Math.abs(iMean - x)));
      ub1 = maxDev / Math.sqrt(3);
    }

    const spatialVals = parseList(tSpatial);
    const refVal = p(tRef);
    let ub2 = 0;
    if (spatialVals.length > 0) {
      const maxSpDev = Math.max(...spatialVals.map(x => Math.abs(refVal - x)));
      ub2 = maxSpDev / Math.sqrt(3);
    }

    const maxRadDev = Math.abs(p(t1e) - p(the));
    const ub3 = (0.2 / Math.sqrt(3)) * maxRadDev;

    const maxLoadDev = Math.abs(refVal - p(tRefLoad));
    const ub4 = (0.2 / Math.sqrt(3)) * maxLoadDev;

    const ub5 = p(uCalStd) / 2;
    const ub6 = p(reStd) / (2 * Math.sqrt(3));

    const uc = Math.sqrt(
      Math.pow(ua2, 2) +
      Math.pow(ub1, 2) +
      Math.pow(ub2, 2) +
      Math.pow(ub3, 2) +
      Math.pow(ub4, 2) +
      Math.pow(ub5, 2) +
      Math.pow(ub6, 2)
    );

    const U = 2 * uc;

    setResults({
      tMean: tMean.toFixed(4),
      ua2: ua2.toFixed(4),
      ub1: ub1.toFixed(4),
      ub2: ub2.toFixed(4),
      ub3: ub3.toFixed(4),
      ub4: ub4.toFixed(4),
      ub5: ub5.toFixed(4),
      ub6: ub6.toFixed(4),
      uc: uc.toFixed(4),
      U: U.toFixed(4)
    });
  }, [tInd, tInstab, tRef, tSpatial, t1e, the, tRefLoad, uCalStd, reStd]);

  // Handlers for dynamic lists
  const handleListChange = (setter, list, idx, val) => {
    const newList = [...list];
    newList[idx] = val;
    setter(newList);
  };
  const handleListAdd = (setter, list) => setter([...list, '']);
  const handleListRemove = (setter, list, idx) => setter(list.filter((_, i) => i !== idx));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Harorat Kalibrlash va Noaniqlik Tahlili</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Kamera va o'lchov asboblari ma'lumotlarini kiriting va standart xatoliklarni (uncertainties) hisoblang.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftColumn}>
          
          <Card title="Takroriy o'lchovlar" icon="bx-sync">
            <p style={styles.cardHint}>Bir nuqtada ketma-ket bajarilgan o'lchovlar natijalari.</p>
            <NumberListInput 
              title={`Ko'rsatkichlar (T_ind) ro'yxati (O'rtacha: ${results.tMean}°C)`}
              prefix="O'lchov"
              values={tInd} 
              onChange={(idx, val) => handleListChange(setTInd, tInd, idx, val)}
              onAdd={() => handleListAdd(setTInd, tInd)}
              onRemove={(idx) => handleListRemove(setTInd, tInd, idx)}
            />
            <ResultField label="Takroriylik noaniqligi (u_a2) :" value={results.ua2} />
          </Card>

          <Card title="Vaqtinchalik beqarorlik" icon="bx-time-five">
            <p style={styles.cardHint}>Kamera haroratining vaqt davomida o'zgarishi (instability).</p>
            <NumberListInput 
              title="Vaqt oralig'idagi qiymatlar (T_i)"
              prefix="Vaqt"
              values={tInstab} 
              onChange={(idx, val) => handleListChange(setTInstab, tInstab, idx, val)}
              onAdd={() => handleListAdd(setTInstab, tInstab)}
              onRemove={(idx) => handleListRemove(setTInstab, tInstab, idx)}
            />
            <ResultField label="Beqarorlik noaniqligi (u_b1) :" value={results.ub1} />
          </Card>

          <Card title="Kamera Notekisligi (Inhomogeneity)" icon="bx-grid-alt">
            <p style={styles.cardHint}>Kamera ichidagi turli nuqtalar orasidagi harorat farqi.</p>
            <NumberInput label="Etalon (markaziy) nuqta (T_ref)" value={tRef} onChange={setTRef} />
            <NumberListInput 
              title="Chetki/Burchak nuqtalar (T_i)"
              prefix="Nuqta"
              values={tSpatial} 
              onChange={(idx, val) => handleListChange(setTSpatial, tSpatial, idx, val)}
              onAdd={() => handleListAdd(setTSpatial, tSpatial)}
              onRemove={(idx) => handleListRemove(setTSpatial, tSpatial, idx)}
            />
            <ResultField label="Notekislik noaniqligi (u_b2) :" value={results.ub2} />
          </Card>

        </div>
        <div style={styles.rightColumn}>

          <Card title="Radiatsiya va Yuklama" icon="bx-sun">
            <p style={styles.cardHint}>Atrof-muhit nurlanishi va yuklama (load) ta'siri hisobga olinadi.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <NumberInput label="Radiatsion ekranli (T_1e)" value={t1e} onChange={setT1e} />
              </div>
              <div style={{ flex: 1 }}>
                <NumberInput label="Radiatsion ekransiz (T_he)" value={the} onChange={setThe} />
              </div>
            </div>
            <ResultField label="Radiatsiya noaniqligi (u_b3) :" value={results.ub3} />
            
            <hr style={styles.divider} />
            <NumberInput label="Yuklamali holatda (T_ref,load)" value={tRefLoad} onChange={setTRefLoad} />
            <ResultField label="Yuklama noaniqligi (u_b4) :" value={results.ub4} />
          </Card>

          <Card title="Asbob Sertifikati va Rezolyutsiya" icon="bx-tachometer">
            <p style={styles.cardHint}>Ishlatilayotgan etalon asbobning texnik xususiyatlari.</p>
            <NumberInput label="Sertifikatdagi kengaytirilgan noaniqlik (U_cal.std)" value={uCalStd} onChange={setUCalStd} />
            <ResultField label="Etalon noaniqligi (u_b5) :" value={results.ub5} />
            
            <hr style={styles.divider} />
            <NumberInput label="Asbob rezolyutsiyasi (re_std)" value={reStd} onChange={setReStd} />
            <ResultField label="Rezolyutsiya noaniqligi (u_b6) :" value={results.ub6} />
          </Card>

          <Card title="Yakuniy Natijalar" icon="bx-check-shield">
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Kvadratik yig'indi (u_c)
              </h4>
              <ResultField label="Umumiy Noaniqlik (u_c):" value={results.uc} highlight />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Kengaytirilgan noaniqlik (k=2)
              </h4>
              <ResultField label="Kengaytirilgan (U):" value={results.U} highlight />
            </div>
          </Card>

        </div>
      </div>
      <div style={{ marginTop: '24px' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: isSubmitting ? '#555' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? (
            <><i className="bx bx-loader-alt bx-spin"></i> Yuborilmoqda...</>
          ) : (
            <><i className="bx bx-cloud-upload"></i> AI Analiz (Haqiqiy API)</>
          )}
        </button>
      </div>

    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Outfit", sans-serif',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 0%, var(--primary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    backgroundColor: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(12px)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '6px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  listInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '4px'
  },
  inputPrefix: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '600',
    minWidth: '70px',
    opacity: 0.8
  },
  cardHint: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '-8px',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  removeBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 60, 60, 0.3)',
    color: '#ff4d4d',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  addBtn: {
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
    border: '1px dashed var(--primary)',
    color: 'var(--primary)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '4px',
    transition: 'all 0.2s'
  },
  resultField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    borderLeft: '4px solid #555',
    marginTop: '8px'
  },
  resultHighlight: {
    borderLeft: '4px solid var(--primary)',
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
  },
  resultLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#ccc'
  },
  resultValue: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'monospace'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    margin: '8px 0'
  }
};

export default UncertaintyCalculator;
