export default function UserActionSection({ children }) {
  return (
    <section id="actions" className="section action-section">
      <div className="section-heading">
        <h2>User Actions</h2>
        <p>Upload, analyze, generate a certificate, and share impact.</p>
      </div>
      <div className="action-content">
        {children}
      </div>
    </section>
  );
}
