import { memo } from "react";

/**
 * Reusable loading skeleton component for smooth page loading.
 * Use instead of blocking loading spinners.
 */
function LoadingSkeleton({ variant = "page" }) {
  if (variant === "card") {
    return (
      <div className="skeleton-wrapper" style={{ padding: "16px" }}>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-text medium" />
        <div className="skeleton skeleton-text short" />
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div className="skeleton-wrapper" style={{ padding: "24px" }}>
        <div className="skeleton skeleton-text short" style={{ height: "24px", marginBottom: "12px" }} />
        <div className="skeleton skeleton-text full" />
        <div className="skeleton skeleton-text medium" />
        <div className="skeleton skeleton-card" style={{ height: "200px" }} />
      </div>
    );
  }

  // Full page skeleton (default)
  return (
    <div className="auth-loading-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "24px", padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div className="skeleton skeleton-avatar" />
        <div>
          <div className="skeleton skeleton-text" style={{ width: "120px", height: "18px" }} />
          <div className="skeleton skeleton-text" style={{ width: "80px", height: "12px" }} />
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <div className="skeleton skeleton-card" style={{ height: "160px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="skeleton skeleton-card" style={{ height: "100px" }} />
          <div className="skeleton skeleton-card" style={{ height: "100px" }} />
        </div>
        <div className="skeleton skeleton-text full" />
        <div className="skeleton skeleton-text medium" />
        <div className="skeleton skeleton-text short" />
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Loading ReGenX...</p>
    </div>
  );
}

export default memo(LoadingSkeleton);
