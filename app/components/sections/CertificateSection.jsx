import { memo } from "react";

export default memo(function CertificateSection({ certificate, labels }) {
  const name = certificate?.userName || certificate?.productName || labels.ecoHeroFallback;
  const wasteKg = Number(certificate?.wasteKg || 0).toFixed(1);
  return (
    <section id="certificate" className="section certificate-section">
      <div className="section-heading">
        <h2>{labels.title}</h2>
        <p>{labels.subtitle}</p>
      </div>
      <div className="certificate-preview-card">
        <div className="certificate-preview-title">{labels.header}</div>
        <div className="certificate-preview-subtitle">{labels.presentedTo}</div>
        <div className="certificate-preview-name">{name}</div>
        <div className="certificate-preview-message">
          {labels.congrats.replace("{NAME}", name)}
          {"\n"}{labels.wasteLine.replace("{WASTE}", wasteKg)}
          {"\n"}{labels.heroLine}
        </div>
        <div className="certificate-preview-footer">
          <span>{labels.footerVerified}</span>
          <span>{labels.footerQr}</span>
        </div>
      </div>
    </section>
  );
});
