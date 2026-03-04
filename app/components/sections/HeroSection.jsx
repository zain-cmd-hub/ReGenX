import { memo } from "react";

export default memo(function HeroSection({ title, tagline, badge, primaryCta, secondaryCta, onUpload, onAnalyze }) {
  return (
    <section id="hero" className="section hero-section">
      <div className="hero-inner">
        <div className="hero-badge">{badge}</div>
        <h1>{title}</h1>
        <p>{tagline}</p>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={onUpload}>
            {primaryCta}
          </button>
          <button type="button" className="btn-secondary" onClick={onAnalyze}>
            {secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
});
