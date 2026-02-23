export default function HistoryPreviewSection({
  items,
  onOpenHistory,
  title,
  subtitle,
  emptyText,
  ecoLabel,
  pathLabel,
  viewAllLabel,
  purposeLabels,
}) {
  return (
    <section id="history" className="section history-preview-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <div className="history-empty">{emptyText}</div>
      ) : (
        <div className="history-preview-grid">
          {items.map((item) => (
            <div key={item.id} className="history-preview-card">
              <img src={item.image} alt={item.productName} />
              <div className="history-preview-body">
                <h4>{item.productName}</h4>
                <div className="history-preview-meta">
                  <span>{ecoLabel}: {item.ecoScore || 0}/100</span>
                  <span>{pathLabel}: {purposeLabels?.[item.futurePath || item.purpose] || item.futurePath || item.purpose}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="history-preview-actions">
        <button type="button" className="btn-secondary" onClick={onOpenHistory}>
          {viewAllLabel}
        </button>
      </div>
    </section>
  );
}
