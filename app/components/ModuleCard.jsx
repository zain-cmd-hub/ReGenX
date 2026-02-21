export default function ModuleCard({ icon, title, text }) {
  return (
    <div className="module-card">
      <div className="module-icon" aria-hidden="true">{icon}</div>
      <h4 className="module-title">{title}</h4>
      <p className="module-text">{text}</p>
    </div>
  );
}
