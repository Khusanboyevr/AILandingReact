const EmptyState = ({ icon = 'bx-data', title = 'No data found', message = 'There is nothing to display here yet.' }) => (
  <div className="empty-state">
    <i className={`bx ${icon}`} />
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export default EmptyState;
