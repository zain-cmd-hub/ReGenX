export default function HistoryPreviewSection({ items, onOpenHistory }) {
  return (
    <section id="history" className="section history-preview-section">
      <div className="section-heading">
        <h2>My Products / History</h2>
        <p>Review past analyses and download certificates.</p>
      </div>
      {items.length === 0 ? (
        <div className="history-empty">No products analyzed yet</div>
      ) : (
        <div className="history-preview-grid">
          {items.map((item) => (
            <div key={item.id} className="history-preview-card">
              <img src={item.image} alt={item.productName} />
              <div className="history-preview-body">
                <h4>{item.productName}</h4>
                <div className="history-preview-meta">
                  <span>Eco Score: {item.ecoScore || 0}/100</span>
                  <span>Path: {item.futurePath || item.purpose}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="history-preview-actions">
        <button type="button" className="btn-secondary" onClick={onOpenHistory}>
          View Full History
        </button>
      </div>
    </section>
  );
}
