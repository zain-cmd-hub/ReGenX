import { memo } from "react";

export default memo(function FooterSection({ labels }) {
  return (
    <footer className="main-footer footer-section">
      <div className="footer-grid">
        <div>
          <h4>{labels.aboutTitle}</h4>
          <p>{labels.aboutText}</p>
        </div>
        <div>
          <h4>{labels.contactTitle}</h4>
          <p>{labels.contactEmail}</p>
          <p>{labels.contactPhone}</p>
        </div>
        <div>
          <h4>{labels.socialTitle}</h4>
          <p>{labels.socialLinks}</p>
        </div>
      </div>
      <div className="footer-brand">{labels.brand}</div>
    </footer>
  );
});
