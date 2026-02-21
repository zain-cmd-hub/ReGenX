export default function CoreFeaturesSection({ features }) {
  return (
    <section id="features" className="section features-section">
      <div className="section-heading">
        <h2>Core Features</h2>
        <p>Powered by AI to deliver measurable circular outcomes.</p>
      </div>
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card">
            <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
            <h4>{feature.title}</h4>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
