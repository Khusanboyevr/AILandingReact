import React from 'react';
import UncertaintyCalculator from '../components/UncertaintyCalculator';

const MeasurementsPage = () => {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '0' }}>
        <div>
          <h1 className="page-title">Noaniqlikni Baholash Maketi</h1>
          <p className="page-sub">Harorat o'lchov vositalarini kalibrlashdagi xatoliklarni xalqaro GUM standarti bo'yicha hisoblash tizimi</p>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <UncertaintyCalculator />
      </div>
    </div>
  );
};

export default MeasurementsPage;
