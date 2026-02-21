export default function CertificateSection({ certificate }) {
  return (
    <section id="certificate" className="section certificate-section">
      <div className="section-heading">
        <h2>Certificate + QR Code</h2>
        <p>Generate and share a verified eco certificate.</p>
      </div>
      <div className="certificate-preview-card">
        <div className="certificate-preview-title">CERTIFICATE OF APPRECIATION</div>
        <div className="certificate-preview-subtitle">This certificate is proudly presented to</div>
        <div className="certificate-preview-name">
          {certificate?.userName || certificate?.productName || "Eco Hero"}
        </div>
        <div className="certificate-preview-message">
          Congratulations {certificate?.userName || certificate?.productName || "Eco Hero"}
          {"\n"}You saved {Number(certificate?.wasteKg || 0).toFixed(1)} kg waste
          {"\n"}You are an Eco Hero 🌱
        </div>
        <div className="certificate-preview-footer">
          <span>Verified by Eco Platform</span>
          <span>QR → Impact page</span>
        </div>
      </div>
    </section>
  );
}
