import { memo } from "react";

export default memo(function UserActionSection({ children, title, subtitle }) {
  return (
    <section id="actions" className="section action-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="action-content">
        {children}
      </div>
    </section>
  );
});
