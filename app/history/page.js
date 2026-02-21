"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FILTERS = ["all", "sell", "repair", "recycle"];

const translations = {
  en: {
    title: "My Products / History",
    empty: "No products analyzed yet",
    filterLabel: "Filter",
    all: "All",
    sell: "Sell",
    repair: "Repair",
    recycle: "Recycle",
    viewTwin: "View Digital Twin",
    viewReport: "View Report",
    generateCert: "Generate Certificate",
    downloadCert: "Download Certificate",
    shareResult: "Share Result",
    back: "Back to Dashboard",
    ecoScore: "Eco Score",
    futurePath: "Future Path",
    date: "Date",
    reportTitle: "Product Report",
    twinTitle: "Digital Twin",
    close: "Close",
    delete: "Delete",
    shareMessage: "I saved {X} kg waste today 🌱",
    certificateTitle: "CERTIFICATE OF APPRECIATION",
    certificateSubtitle: "This certificate is proudly presented to",
    certificateMessage: "Congratulations {name}\nYou saved {waste} kg waste\nYou are an Eco Hero 🌱",
    certificateAward: "Eco Award",
    certificateFooter: "Verified by Eco Platform",
    certificateSignature: "Signature",
    certificateDate: "Date",
  },
  hi: {
    title: "मेरे उत्पाद / इतिहास",
    empty: "अभी तक कोई उत्पाद विश्लेषित नहीं।",
    filterLabel: "फ़िल्टर",
    all: "सब",
    sell: "बेचें",
    repair: "मरम्मत",
    recycle: "रीसायकल",
    viewTwin: "डिजिटल ट्विन देखें",
    viewReport: "रिपोर्ट देखें",
    generateCert: "सर्टिफिकेट बनाएं",
    downloadCert: "सर्टिफिकेट डाउनलोड",
    shareResult: "परिणाम साझा करें",
    back: "डैशबोर्ड पर वापस",
    ecoScore: "इको स्कोर",
    futurePath: "भविष्य पथ",
    date: "तारीख",
    reportTitle: "प्रोडक्ट रिपोर्ट",
    twinTitle: "डिजिटल ट्विन",
    close: "बंद करें",
    delete: "हटाएं",
    shareMessage: "आज मैंने {X} किलो कचरा बचाया 🌱",
    certificateTitle: "प्रशंसा प्रमाणपत्र",
    certificateSubtitle: "यह प्रमाणपत्र गर्व से प्रस्तुत किया जाता है",
    certificateMessage: "बधाई {name}\nआपने {waste} किलो कचरा बचाया\nआप एक इको हीरो हैं 🌱",
    certificateAward: "इको पुरस्कार",
    certificateFooter: "ईको प्लेटफ़ॉर्म द्वारा सत्यापित",
    certificateSignature: "हस्ताक्षर",
    certificateDate: "तारीख",
  },
};

function getLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("tscemLanguage") === "hi" ? "hi" : "en";
}

function formatDate(value, locale) {
  if (!value) return "-";
  return new Date(value).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateCertificateId() {
  return `SCEM-${Date.now().toString(36).toUpperCase()}`;
}

function EcoMeter({ score }) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  return (
    <div className="eco-meter-mini">
      <div className="eco-meter-bar">
        <div className="eco-meter-fill" style={{ width: `${safeScore}%` }} />
      </div>
      <span className="eco-meter-value">{safeScore}/100</span>
    </div>
  );
}

function ProductCard({ item, locale, t, onViewTwin, onViewReport, onDownload, onShare, onDelete, index }) {
  return (
    <div className="history-item-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="history-item-image">
        <img src={item.image} alt={item.productName} />
        <button
          type="button"
          className="history-delete"
          aria-label={t.delete}
          onClick={() => onDelete(item.id)}
        >
          🗑️
        </button>
      </div>
      <div className="history-item-body">
        <h4>{item.productName || "Product"}</h4>
        <div className="history-meta-row">
          <div>
            <span className="history-label">{t.ecoScore}</span>
            <EcoMeter score={item.ecoScore || 0} />
          </div>
          <div>
            <span className="history-label">{t.futurePath}</span>
            <div className={`path-pill ${item.futurePath || item.purpose || ""}`}>
              {(t[item.futurePath] || t[item.purpose] || item.futurePath || item.purpose || "-").toString()}
            </div>
          </div>
        </div>
        <div className="history-date">{t.date}: {formatDate(item.date, locale)}</div>
        <div className="history-actions">
          <button type="button" className="history-action" onClick={() => onViewTwin(item)}>
            {t.viewTwin}
          </button>
          <button type="button" className="history-action" onClick={() => onViewReport(item)}>
            {t.viewReport}
          </button>
          <button
            type="button"
            className="history-action"
            onClick={() => onDownload(item)}
            disabled={!item.certificateId}
          >
            {t.downloadCert}
          </button>
          <button type="button" className="history-action primary" onClick={() => onShare(item)}>
            {t.shareResult}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeItem, setActiveItem] = useState(null);
  const [modalType, setModalType] = useState("");
  const [certificateItem, setCertificateItem] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    setLanguage(getLanguage());
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tscemProductHistory");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((item) => {
          if ((item.futurePath || item.purpose) === "recycle" && !item.certificateId) {
            return { ...item, certificateId: generateCertificateId() };
          }
          return item;
        });
        setHistory(updated);
      } catch (error) {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tscemProductHistory", JSON.stringify(history));
  }, [history]);

  const t = translations[language] || translations.en;
  const locale = language === "hi" ? "hi-IN" : "en-IN";

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((item) => (item.futurePath || item.purpose) === filter);
  }, [history, filter]);

  function handleDelete(id) {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  function openModal(item, type) {
    setActiveItem(item);
    setModalType(type);
  }

  function closeModal() {
    setActiveItem(null);
    setModalType("");
  }

  function handleDownload(item) {
    if (!item?.certificateId) return;
    setCertificateItem(item);
  }

  async function handleDownloadPdf() {
    if (!certificateRef.current || !certificateItem) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    const safeName = (certificateItem.productName || "User").replace(/[^a-z0-9]+/gi, "_");
    pdf.save(`Eco_Certificate_${safeName}.pdf`);
  }

  function handleShare(item) {
    const waste = Number(item.wasteKg || 0);
    const message = t.shareMessage.replace("{X}", waste.toFixed(1));
    const url = window.location.origin;
    const payload = encodeURIComponent(`${message} ${url}`.trim());
    window.open(`https://wa.me/?text=${payload}`, "_blank", "noopener,noreferrer");
  }

  function handleLinkedIn(item) {
    const waste = Number(item.wasteKg || 0);
    const message = t.shareMessage.replace("{X}", waste.toFixed(1));
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(message);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${text}&summary=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="history-page">
      <div className="history-hero">
        <div>
          <h1>{t.title}</h1>
          <p>{t.filterLabel}</p>
        </div>
        <div className="history-toolbar">
          <div className="history-filters">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className={`history-chip ${filter === key ? "active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {t[key]}
              </button>
            ))}
          </div>
          <button type="button" className="history-back" onClick={() => router.push("/")}
          >
            {t.back}
                {t.generateCert}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="history-empty">{t.empty}</div>
      ) : (
        <div className="history-grid-page">
          {filteredHistory.map((item, index) => (
            <ProductCard
              key={item.id}
              item={item}
              locale={locale}
              t={t}
              index={index}
              onViewTwin={(product) => openModal(product, "twin")}
              onViewReport={(product) => openModal(product, "report")}
              onDownload={handleDownload}
              onShare={(product) => handleShare(product)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className={`modal ${activeItem ? "" : "hidden"}`} aria-hidden={!activeItem}>
        <div className="modal-overlay" onClick={closeModal} />
        <div className="modal-card history-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label={t.close} onClick={closeModal}>×</button>
          <h3>{modalType === "twin" ? t.twinTitle : t.reportTitle}</h3>
          <div className="history-modal-body">
            <div className="history-modal-image">
              <img src={activeItem?.image || ""} alt={activeItem?.productName || "Product"} />
            </div>
            <div className="history-modal-details">
              <div><strong>{t.ecoScore}:</strong> {activeItem?.ecoScore || 0}/100</div>
              <div><strong>{t.futurePath}:</strong> {t[activeItem?.futurePath] || t[activeItem?.purpose] || "-"}</div>
              <div><strong>{t.date}:</strong> {formatDate(activeItem?.date, locale)}</div>
              <div><strong>Condition:</strong> {activeItem?.digitalTwinData?.condition || activeItem?.condition || "-"}</div>
              <div><strong>Remaining Life:</strong> {activeItem?.digitalTwinData?.remainingLife ?? "-"}%</div>
              <div><strong>AI Note:</strong> {activeItem?.digitalTwinData?.suggestion || activeItem?.aiSuggestion || "-"}</div>
            </div>
          </div>
          <div className="history-modal-actions">
            <button type="button" className="history-action primary" onClick={() => handleShare(activeItem)}>
              {t.shareResult}
            </button>
            <button type="button" className="history-action" onClick={() => handleLinkedIn(activeItem)}>
              {t.shareResult} LinkedIn
            </button>
          </div>
        </div>
      </div>

      <div className={`modal ${certificateItem ? "" : "hidden"}`} aria-hidden={!certificateItem}>
        <div className="modal-overlay" onClick={() => setCertificateItem(null)} />
        <div className="modal-card certificate-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label={t.close} onClick={() => setCertificateItem(null)}>×</button>
          <div className="certificate-preview" ref={certificateRef}>
            <div className="certificate-leaf" aria-hidden="true">🍃</div>
            <div className="certificate-inner">
              <div className="certificate-title">{t.certificateTitle}</div>
              <div className="certificate-subtitle">{t.certificateSubtitle}</div>
              <div className="certificate-name">
                {certificateItem?.productName || "Eco Champion"}
              </div>
              <div className="certificate-message">
                {t.certificateMessage
                  .replace("{name}", certificateItem?.productName || "Eco Champion")
                  .replace("{waste}", Number(certificateItem?.wasteKg || 0).toFixed(1))}
              </div>
              <div className="certificate-seal">{t.certificateAward}</div>
              <div className="certificate-footer">
                <div>{t.certificateFooter}</div>
                <div className="certificate-meta">
                  <span>{t.certificateDate}: {formatDate(certificateItem?.date, locale)}</span>
                  <span className="certificate-sign">{t.certificateSignature}: __________</span>
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="history-action primary" onClick={handleDownloadPdf}>
            {t.downloadCert}
          </button>
        </div>
      </div>
    </div>
  );
}
