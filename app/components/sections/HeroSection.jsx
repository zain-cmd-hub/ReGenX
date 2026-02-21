export default function HeroSection({ title, tagline, onUpload, onAnalyze }) {
  return (
    <section id="hero" className="section hero-section">
      <div className="hero-inner">
        <div className="hero-badge">AI + Circular Economy</div>
        <h1>{title}</h1>
        <p>{tagline}</p>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={onUpload}>
            Upload Product
          </button>
          <button type="button" className="btn-secondary" onClick={onAnalyze}>
            Analyze Product
          </button>
        </div>
      </div>
    </section>
  );
}
