const LoadingSkeleton = ({ rows = 3, type = 'card' }) => {
  if (type === 'stat') {
    return (
      <div className="skeleton-stats">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <div className="skeleton-circle shimmer" />
            <div className="skeleton-lines">
              <div className="skeleton-line shimmer" style={{ width: '60%' }} />
              <div className="skeleton-line shimmer" style={{ width: '40%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return <div className="skeleton-chart shimmer" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-card shimmer" />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
