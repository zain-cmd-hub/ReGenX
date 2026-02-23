export default function HowItWorksSection({ title, subtitle, steps }) {
  return (
    <section id="how" className="section how-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="how-timeline">
        {steps.map((step, index) => (
          <div key={step.title} className="how-step">
            <div className="how-step-index">{index + 1}</div>
            <div className="how-step-icon" aria-hidden="true">{step.icon}</div>
            <div>
              <div className="how-step-title">{step.title}</div>
              <div className="how-step-text">{step.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
