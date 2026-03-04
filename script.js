const state = {
  productType: "",
  productAge: 0,
  usageLevel: "moderate",
  productImage: "",
  condition: "-",
  score: 0,
  remainingLife: 0,
  price: 0,
  demand: "",
  facilities: [],
};

const navButtons = document.querySelectorAll(".nav-btn, .cta");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const analyzeBtn = document.getElementById("analyzeBtn");
const uploadLoader = document.getElementById("uploadLoader");
const conditionResult = document.getElementById("conditionResult");
const scoreResult = document.getElementById("scoreResult");
const lifeResult = document.getElementById("lifeResult");
const productTypeInput = document.getElementById("productType");
const productAgeInput = document.getElementById("productAge");
const usageLevelInput = document.getElementById("usageLevel");

const lifeBtn = document.getElementById("predictLifeBtn");
const lifeLoader = document.getElementById("lifeLoader");
const lifeProgress = document.getElementById("lifeProgress");
const lifePercent = document.getElementById("lifePercent");

const priceBtn = document.getElementById("priceBtn");
const priceLoader = document.getElementById("priceLoader");
const priceValue = document.getElementById("priceValue");
const demandValue = document.getElementById("demandValue");

const geoBtn = document.getElementById("geoBtn");
const geoLoader = document.getElementById("geoLoader");
const geoResults = document.getElementById("geoResults");
const locationInput = document.getElementById("locationInput");

const dashProduct = document.getElementById("dashProduct");
const dashAge = document.getElementById("dashAge");
const dashUsage = document.getElementById("dashUsage");
const dashCondition = document.getElementById("dashCondition");
const dashScore = document.getElementById("dashScore");
const dashLife = document.getElementById("dashLife");
const dashPrice = document.getElementById("dashPrice");
const dashDemand = document.getElementById("dashDemand");
const dashFacilities = document.getElementById("dashFacilities");

const connectModal = document.getElementById("connectModal");
const modalClose = document.getElementById("modalClose");
const modalName = document.getElementById("modalName");
const modalType = document.getElementById("modalType");
const modalPhone = document.getElementById("modalPhone");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const modalMessage = document.getElementById("modalMessage");
const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");

const digitalTwinSection = document.getElementById("digitalTwin");
const twinImage = document.getElementById("twinImage");
const twinName = document.getElementById("twinName");
const twinCondition = document.getElementById("twinCondition");
const twinUsage = document.getElementById("twinUsage");
const twinPaths = document.getElementById("twinPaths");
const aiTypingText = document.getElementById("aiTypingText");
const twinTimeline = document.getElementById("twinTimeline");
const timelineProductLabel = document.getElementById("timelineProductLabel");
const timelineTwinLabel = document.getElementById("timelineTwinLabel");
const timelineFutureLabel = document.getElementById("timelineFutureLabel");
const timelineFutureIcon = document.getElementById("timelineFutureIcon");

const beforeAfterRange = document.getElementById("beforeAfterRange");
const beforeOverlay = document.getElementById("beforeOverlay");
const beforeAfterHandle = document.getElementById("beforeAfterHandle");
const beforeImage = document.getElementById("beforeImage");
const afterImage = document.getElementById("afterImage");
const beforeAfterTitle = document.getElementById("beforeAfterTitle");
const beforeLabel = document.getElementById("beforeLabel");
const afterLabel = document.getElementById("afterLabel");

const ecoMeter = document.getElementById("ecoMeter");
const ecoMeterNeedle = document.getElementById("ecoMeterNeedle");
const ecoMeterValue = document.getElementById("ecoMeterValue");

const successFx = document.getElementById("successFx");
const successFxText = document.getElementById("successFxText");
const ecoParticles = document.getElementById("ecoParticles");
const menuToggle = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const certificateModal = document.getElementById("certificateModal");
const certificateClose = document.getElementById("certificateClose");
const certificateMessage = document.getElementById("certificateMessage");
const certUserName = document.getElementById("certUserName");
const certProduct = document.getElementById("certProduct");
const certWaste = document.getElementById("certWaste");
const certDate = document.getElementById("certDate");
const downloadCertificateBtn = document.getElementById("downloadCertificateBtn");
const shareCertificateBtn = document.getElementById("shareCertificateBtn");

const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const profileModalClose = document.getElementById("profileModalClose");
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");
const profileAbout = document.getElementById("profileAbout");
const profileError = document.getElementById("profileError");
const profileSuccessModal = document.getElementById("profileSuccessModal");
const profileSuccessClose = document.getElementById("profileSuccessClose");
const profileSuccessMessage = document.getElementById("profileSuccessMessage");

const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userStatus = document.getElementById("userStatus");

// Trust Panel Elements
const trustPanel = document.getElementById("trustPanel");
const trustDetectedObject = document.getElementById("trustDetectedObject");
const trustDetectionBar = document.getElementById("trustDetectionBar");
const trustDetectionConfidence = document.getElementById("trustDetectionConfidence");
const trustDetectedMaterial = document.getElementById("trustDetectedMaterial");
const trustConditionScore = document.getElementById("trustConditionScore");
const trustGaugeArc = document.getElementById("trustGaugeArc");
const trustConfidenceValue = document.getElementById("trustConfidenceValue");
const trustConfidenceLabel = document.getElementById("trustConfidenceLabel");
const trustImageQuality = document.getElementById("trustImageQuality");
const trustDataMatch = document.getElementById("trustDataMatch");
const trustOriginalPrice = document.getElementById("trustOriginalPrice");
const trustAgeDepreciation = document.getElementById("trustAgeDepreciation");
const trustConditionFactor = document.getElementById("trustConditionFactor");
const trustMarketDemand = document.getElementById("trustMarketDemand");
const trustMaterialValue = document.getElementById("trustMaterialValue");
const trustFinalPrice = document.getElementById("trustFinalPrice");
const trustOurPriceBar = document.getElementById("trustOurPriceBar");
const trustOurPrice = document.getElementById("trustOurPrice");
const trustOlxBar = document.getElementById("trustOlxBar");
const trustOlxPrice = document.getElementById("trustOlxPrice");
const trustFbBar = document.getElementById("trustFbBar");
const trustFbPrice = document.getElementById("trustFbPrice");
const trustCashifyBar = document.getElementById("trustCashifyBar");
const trustCashifyPrice = document.getElementById("trustCashifyPrice");
const trustMarketVerdict = document.getElementById("trustMarketVerdict");
const trustRecommendationBadge = document.getElementById("trustRecommendationBadge");
const trustRecommendationIcon = document.getElementById("trustRecommendationIcon");
const trustRecommendationType = document.getElementById("trustRecommendationType");
const trustRecommendationExplanation = document.getElementById("trustRecommendationExplanation");
const trustRepairCost = document.getElementById("trustRepairCost");
const trustResaleValue = document.getElementById("trustResaleValue");
const trustRecycleValue = document.getElementById("trustRecycleValue");
const trustCo2Saved = document.getElementById("trustCo2Saved");
const trustWaterSaved = document.getElementById("trustWaterSaved");
const trustEnergySaved = document.getElementById("trustEnergySaved");
const trustCircularScore = document.getElementById("trustCircularScore");
const trustPredictionTime = document.getElementById("trustPredictionTime");
const trustMarketDataTime = document.getElementById("trustMarketDataTime");
const trustEnvDataTime = document.getElementById("trustEnvDataTime");
const trustModelVersion = document.getElementById("trustModelVersion");
const trustAccuracyRate = document.getElementById("trustAccuracyRate");
const feedbackButtons = document.getElementById("feedbackButtons");
const feedbackYes = document.getElementById("feedbackYes");
const feedbackNo = document.getElementById("feedbackNo");
const feedbackResponse = document.getElementById("feedbackResponse");

const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const markAllReadBtn = document.getElementById("markAllReadBtn");

let activeFacility = null;
let latestCertificate = null;

const PROFILE_STORAGE_KEY = "regenxProfile";
const LANG_STORAGE_KEY = "regenxLanguage";
const NOTIFICATION_STORAGE_KEY = "regenxNotifications";
const TWIN_TEXTS = {
  en: {
    heading: "Digital Twin of Your Product",
    subtext: "See the future of your product before you decide",
    condition: "Condition",
    usage: "Usage",
    sell: "Sell Path",
    repair: "Repair Path",
    recycle: "Recycle Path",
    best: "Best Choice 🌱",
    impact: "Impact",
    life: "Life Extension",
    waste: "Waste saved",
    co2: "CO₂ reduced",
    water: "Water saved",
    timelineProduct: "Product",
    timelineTwin: "Digital Twin",
    timelineFuture: "Future Path",
    beforeAfter: "Before vs After",
    before: "Pollution / Waste",
    after: "Clean Earth",
    aiLine: "AI is simulating the best circular path for your product...",
  },
  hi: {
    heading: "आपके उत्पाद का डिजिटल ट्विन",
    subtext: "निर्णय से पहले अपने उत्पाद का भविष्य देखें",
    condition: "स्थिति",
    usage: "उपयोग",
    sell: "बेचें पथ",
    repair: "मरम्मत पथ",
    recycle: "रीसायकल पथ",
    best: "सर्वश्रेष्ठ विकल्प 🌱",
    impact: "प्रभाव",
    life: "लाइफ एक्सटेंशन",
    waste: "कचरा बचत",
    co2: "CO₂ कमी",
    water: "जल बचत",
    timelineProduct: "उत्पाद",
    timelineTwin: "डिजिटल ट्विन",
    timelineFuture: "भविष्य पथ",
    beforeAfter: "पहले बनाम बाद में",
    before: "प्रदूषण / कचरा",
    after: "स्वच्छ पृथ्वी",
    aiLine: "AI आपके उत्पाद के लिए सर्वश्रेष्ठ सर्कुलर पथ का सिमुलेशन कर रहा है...",
  },
};

const CLEAN_EARTH_IMAGE = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=60";
let currentEcoValue = 0;
let successFxTimer = null;

function getLanguage() {
  return localStorage.getItem(LANG_STORAGE_KEY) === "hi" ? "hi" : "en";
}

function getTwinTexts() {
  return TWIN_TEXTS[getLanguage()] || TWIN_TEXTS.en;
}

function getSuccessMessage() {
  return getLanguage() === "hi"
    ? "🎉 बधाई हो! आपकी प्रोफ़ाइल सफलतापूर्वक सत्यापित हो गई है।"
    : "🎉 Congratulations! Your profile has been successfully verified.";
}

function getProfileData() {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) {
    return {
      name: "Guest User",
      email: "User",
      phone: "",
      address: "",
      about: "",
    };
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return {
      name: "Guest User",
      email: "User",
      phone: "",
      address: "",
      about: "",
    };
  }
}

function getNotifications() {
  const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function setNotifications(next) {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next));
}

function renderNotifications() {
  if (!notificationList || !notificationCount) return;
  const notifications = getNotifications();
  const unread = notifications.filter((item) => !item.read).length;
  notificationCount.textContent = String(unread || 0);
  notificationCount.style.display = unread > 0 ? "grid" : "none";

  if (notifications.length === 0) {
    notificationList.innerHTML = "<div class=\"notification-empty\">No notifications yet.</div>";
    return;
  }

  notificationList.innerHTML = notifications
    .map((item) => {
      return `
        <div class="notification-item ${item.read ? "read" : ""}" data-id="${item.id}">
          <div>
            <div class="notification-title">${item.title}</div>
            <div class="notification-text">${item.message}</div>
            <div class="notification-meta">${item.time}</div>
          </div>
          ${item.read ? "" : "<button class=\"mark-read\" data-read=\"true\">Mark read</button>"}
        </div>
      `;
    })
    .join("");
}

function addNotification(payload) {
  const notifications = getNotifications();
  notifications.unshift(payload);
  setNotifications(notifications.slice(0, 20));
  renderNotifications();
}

function isProfileComplete(profile) {
  return [profile.name, profile.email, profile.phone, profile.address, profile.about]
    .every((value) => String(value || "").trim().length > 0);
}

function updateProfileUI(profile) {
  const initials = (profile.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  userAvatar.textContent = initials || "U";
  userName.textContent = profile.name || "User";
  userEmail.textContent = profile.email || "-";
  userStatus.textContent = isProfileComplete(profile) ? "✅ Verified User" : "Profile Incomplete";
  userStatus.classList.toggle("verified", isProfileComplete(profile));
  
  // Update header profile image
  const profilePicImg = profileBtn?.querySelector("img");
  if (profilePicImg) {
    const encodedName = encodeURIComponent(profile.name || "Guest User");
    profilePicImg.src = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
  }
}

function showSuccessFx(message) {
  if (!successFx || !successFxText) return;
  successFxText.textContent = message;
  successFx.classList.remove("hidden");
  successFx.setAttribute("aria-hidden", "false");
  if (successFxTimer) clearTimeout(successFxTimer);
  successFxTimer = setTimeout(() => {
    successFx.classList.add("hidden");
    successFx.setAttribute("aria-hidden", "true");
  }, 2200);
}

function typeText(el, text, speed = 22) {
  if (!el) return;
  el.textContent = "";
  let index = 0;
  function step() {
    if (index > text.length) return;
    el.textContent = text.slice(0, index);
    index += 1;
    setTimeout(step, speed);
  }
  step();
}

function setMenuOpen(isOpen) {
  document.body.classList.toggle("menu-open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (menuToggle) menuToggle.setAttribute("aria-expanded", String(isOpen));
  if (sidebarOverlay) sidebarOverlay.setAttribute("aria-hidden", String(!isOpen));
}

function toggleMenu() {
  const isOpen = document.body.classList.contains("menu-open");
  setMenuOpen(!isOpen);
}

function initParticles() {
  if (!ecoParticles) return;
  ecoParticles.innerHTML = "";
  for (let i = 0; i < 16; i += 1) {
    const particle = document.createElement("span");
    particle.className = "leaf-particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;
    particle.style.opacity = `${0.2 + Math.random() * 0.5}`;
    ecoParticles.appendChild(particle);
  }
}

function openProfileModal() {
  try {
    // Close anything else that's open
    setMenuOpen(false);
    if (notificationPanel) notificationPanel.classList.add("hidden");

    // Show modal immediately so the user sees it open
    if (profileModal) {
      profileModal.hidden = false;
      profileModal.classList.remove("hidden");
      profileModal.setAttribute("aria-hidden", "false");
    }

    // Populate form asynchronously so the modal appears instantly
    requestAnimationFrame(() => {
      try {
        const profile = getProfileData();
        if (profileName) profileName.value = profile.name || "";
        if (profileEmail) profileEmail.value = profile.email || "";
        if (profilePhone) profilePhone.value = profile.phone || "";
        if (profileAddress) profileAddress.value = profile.address || "";
        if (profileAbout) profileAbout.value = profile.about || "";
        if (profileError) profileError.textContent = "";
      } catch (formErr) {
        console.error("Error populating profile form:", formErr);
        if (profileError) profileError.textContent = "Could not load profile data.";
      }
    });
  } catch (err) {
    console.error("Error opening profile modal:", err);
  }
}

function closeProfileModal() {
  if (profileModal) {
    profileModal.classList.add("hidden");
    profileModal.hidden = true;
    profileModal.setAttribute("aria-hidden", "true");
  }
  // Ensure body is scrollable
  document.body.style.overflow = "";
}

function openProfileSuccess() {
  if (!profileSuccessModal) return;
  if (profileSuccessMessage) profileSuccessMessage.textContent = getSuccessMessage();
  profileSuccessModal.hidden = false;
  profileSuccessModal.classList.remove("hidden");
  profileSuccessModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    if (profileSuccessModal) {
      profileSuccessModal.classList.add("hidden");
      profileSuccessModal.hidden = true;
      profileSuccessModal.setAttribute("aria-hidden", "true");
    }
  }, 3000);
}

function closeProfileSuccess() {
  if (profileSuccessModal) {
    profileSuccessModal.classList.add("hidden");
    profileSuccessModal.hidden = true;
    profileSuccessModal.setAttribute("aria-hidden", "true");
  }
}

// Ensure all modals start in correct hidden state
[connectModal, certificateModal, profileModal, profileSuccessModal].forEach((modal) => {
  if (!modal) return;
  const isHidden = modal.classList.contains("hidden");
  modal.hidden = isHidden;
  modal.setAttribute("aria-hidden", isHidden ? "true" : "false");
});

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  });
});

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => setMenuOpen(false));
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 600) {
    setMenuOpen(false);
  }
});

if (notificationBtn && notificationPanel) {
  notificationBtn.addEventListener("click", () => {
    notificationPanel.classList.toggle("hidden");
  });
}

document.addEventListener("click", (event) => {
  if (!notificationPanel || !notificationBtn) return;
  // Don't process outside-click when a modal is open
  if (profileModal && !profileModal.classList.contains("hidden")) return;
  if (profileSuccessModal && !profileSuccessModal.classList.contains("hidden")) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const isInside = notificationPanel.contains(target) || notificationBtn.contains(target);
  if (!isInside) {
    notificationPanel.classList.add("hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (profileSuccessModal && !profileSuccessModal.classList.contains("hidden")) {
    closeProfileSuccess();
  }
  if (profileModal && !profileModal.classList.contains("hidden")) {
    closeProfileModal();
  }
  // Close any other modal with .hidden class management
  document.querySelectorAll(".modal:not(.hidden)").forEach((m) => {
    m.classList.add("hidden");
    m.hidden = true;
    m.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
});

if (markAllReadBtn) {
  markAllReadBtn.addEventListener("click", () => {
    const notifications = getNotifications().map((item) => ({ ...item, read: true }));
    setNotifications(notifications);
    renderNotifications();
  });
}

if (notificationList) {
  notificationList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.read === "true") {
      const item = target.closest(".notification-item");
      if (!item) return;
      const id = item.getAttribute("data-id");
      const notifications = getNotifications().map((note) => (
        note.id === id ? { ...note, read: true } : note
      ));
      setNotifications(notifications);
      renderNotifications();
    }
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openProfileModal();
  });
}

if (profileModalClose) {
  profileModalClose.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeProfileModal();
  });
}

if (profileModal) {
  // Close when clicking overlay (background) — NOT the card itself
  profileModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target === profileModal || (target instanceof HTMLElement && target.dataset.close === "true")) {
      closeProfileModal();
    }
  });
}

if (profileSuccessClose) {
  profileSuccessClose.addEventListener("click", closeProfileSuccess);
}

if (profileSuccessModal) {
  profileSuccessModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "true") {
      closeProfileSuccess();
    }
  });
}

if (beforeAfterRange) {
  beforeAfterRange.addEventListener("input", updateBeforeAfterSlider);
  beforeAfterRange.addEventListener("change", updateBeforeAfterSlider);
}

if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextProfile = {
      name: profileName.value.trim(),
      email: profileEmail.value.trim(),
      phone: profilePhone.value.trim(),
      address: profileAddress.value.trim(),
      about: profileAbout.value.trim(),
    };

    const missing = [];
    if (!nextProfile.name) missing.push("Name");
    if (!nextProfile.email) missing.push("Email");
    if (!nextProfile.phone) missing.push("Phone");
    if (!nextProfile.address) missing.push("Address");
    if (!nextProfile.about) missing.push("About");

    if (missing.length > 0) {
      profileError.textContent = `Please fill required fields: ${missing.join(", ")}`;
      return;
    }

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    updateProfileUI(nextProfile);
    closeProfileModal();
    openProfileSuccess();
    showSuccessFx("✅ Profile saved successfully!");
  });
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) {
    imagePreview.innerHTML = "<span>No image selected</span>";
    state.productImage = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    state.productImage = event.target.result;
    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Uploaded product" />`;
  };
  reader.readAsDataURL(file);
});

updateProfileUI(getProfileData());
renderNotifications();
initParticles();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll("section.section, .card-panel, .stat-card, .facility-item").forEach((el, index) => {
  el.classList.add("reveal-on-scroll");
  el.style.transitionDelay = `${Math.min(index * 30, 220)}ms`;
  revealObserver.observe(el);
});

function showLoader(loaderEl) {
  loaderEl.classList.add("active");
}

function hideLoader(loaderEl) {
  loaderEl.classList.remove("active");
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function triggerRecycleBounce() {
  const recycleIcons = document.querySelectorAll('iconify-icon[icon="ph:recycle-bold"], .recycle-bounce');
  recycleIcons.forEach((icon) => {
    icon.classList.remove("is-triggered");
    requestAnimationFrame(() => {
      icon.classList.add("is-triggered");
      setTimeout(() => icon.classList.remove("is-triggered"), 650);
    });
  });
}

function calculateCondition(age, usage) {
  let score = 80;

  score -= age * 3;

  if (usage === "heavy") {
    score -= 18;
  } else if (usage === "moderate") {
    score -= 8;
  }

  if (score >= 70) return "Good";
  if (score >= 45) return "Medium";
  return "Poor";
}

function calculateSustainability(condition, usage, age) {
  let score = 75;

  if (condition === "Good") score += 15;
  if (condition === "Medium") score += 5;
  if (condition === "Poor") score -= 10;

  if (usage === "light") score += 8;
  if (usage === "heavy") score -= 8;

  score -= age * 2;

  return clamp(score, 12, 98);
}

function calculateRemainingLife(condition, age) {
  const base = condition === "Good" ? 85 : condition === "Medium" ? 60 : 35;
  const adjusted = base - age * 2.2;
  return clamp(Math.round(adjusted), 5, 95);
}

function buildTwinPaths({ condition, usageLevel, age }) {
  const usageFactor = usageLevel === "heavy" ? 1.08 : usageLevel === "moderate" ? 1 : 0.92;
  const conditionFactor = condition === "Good" ? 1.12 : condition === "Medium" ? 1 : 0.86;

  const sell = {
    key: "sell",
    icon: "♻️",
    eco: clamp(Math.round(68 * conditionFactor * usageFactor), 35, 95),
    waste: clamp(Number((1.5 * conditionFactor).toFixed(1)), 0.6, 4.2),
    co2: clamp(Number((1.1 * conditionFactor).toFixed(1)), 0.4, 3.1),
    water: clamp(Math.round(380 * conditionFactor), 120, 950),
    life: `${clamp(Math.round(10 * conditionFactor), 5, 16)} months`,
  };

  const repair = {
    key: "repair",
    icon: "🔧",
    eco: clamp(Math.round(82 * conditionFactor * usageFactor), 40, 99),
    waste: clamp(Number((2.2 * conditionFactor).toFixed(1)), 0.8, 5.5),
    co2: clamp(Number((1.7 * conditionFactor).toFixed(1)), 0.5, 3.8),
    water: clamp(Math.round(520 * conditionFactor), 170, 1200),
    life: `${clamp(Math.round(17 * conditionFactor), 8, 28)} months`,
  };

  const recycle = {
    key: "recycle",
    icon: "🌱",
    eco: clamp(Math.round(74 * usageFactor * (1.08 - age * 0.015)), 35, 97),
    waste: clamp(Number((2.0 * usageFactor).toFixed(1)), 0.8, 5.2),
    co2: clamp(Number((1.3 * usageFactor).toFixed(1)), 0.5, 3.4),
    water: clamp(Math.round(460 * usageFactor), 150, 1000),
    life: `${clamp(Math.round(8 * conditionFactor), 4, 14)} months`,
  };

  const paths = [sell, repair, recycle];
  const best = paths.reduce((prev, current) => (current.eco > prev.eco ? current : prev), sell);
  return { paths, bestKey: best.key };
}

function updateTimeline(bestKey, texts) {
  if (!twinTimeline) return;
  timelineProductLabel.textContent = texts.timelineProduct;
  timelineTwinLabel.textContent = texts.timelineTwin;

  const bestLabel = bestKey === "sell" ? texts.sell : bestKey === "repair" ? texts.repair : texts.recycle;
  const bestIcon = bestKey === "sell" ? "♻️" : bestKey === "repair" ? "🔧" : "🌱";
  timelineFutureLabel.textContent = `${texts.timelineFuture} • ${bestLabel}`;
  timelineFutureIcon.textContent = bestIcon;

  const steps = twinTimeline.querySelectorAll(".timeline-step");
  steps.forEach((step) => {
    step.classList.remove("active", "revealed");
  });

  steps.forEach((step, index) => {
    setTimeout(() => {
      step.classList.add("revealed");
      if (Number(step.dataset.step) === 3) {
        step.classList.add("active");
      }
    }, index * 140);
  });
}

function updateBeforeAfterSlider() {
  if (!beforeAfterRange || !beforeOverlay || !beforeAfterHandle) return;
  const value = Number(beforeAfterRange.value || 50);
  beforeOverlay.style.width = `${value}%`;
  beforeAfterHandle.style.left = `${value}%`;
}

function animateEcoMeter(targetScore) {
  if (!ecoMeter || !ecoMeterNeedle || !ecoMeterValue) return;
  const target = clamp(Math.round(targetScore), 0, 100);
  const start = currentEcoValue;
  const duration = 700;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    ecoMeter.style.setProperty("--score", String(value));
    ecoMeterNeedle.style.setProperty("--needle", String(value));
    ecoMeterValue.textContent = String(value);
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      currentEcoValue = target;
    }
  }

  requestAnimationFrame(frame);
}

function updateDigitalTwin() {
  if (!digitalTwinSection || !twinPaths) return;
  if (!state.productImage || !state.productType) {
    digitalTwinSection.classList.add("is-hidden");
    return;
  }

  const texts = getTwinTexts();
  const heading = digitalTwinSection.querySelector(".panel-header h3");
  const subtext = digitalTwinSection.querySelector(".twin-sub");
  if (heading) heading.textContent = texts.heading;
  if (subtext) subtext.textContent = texts.subtext;

  twinImage.src = state.productImage;
  twinName.textContent = state.productType || texts.timelineProduct;
  twinCondition.textContent = `${texts.condition}: ${state.condition || "-"}`;
  twinUsage.textContent = `${texts.usage}: ${state.usageLevel || "-"}`;

  if (beforeImage) beforeImage.src = state.productImage;
  if (afterImage) afterImage.src = CLEAN_EARTH_IMAGE;
  if (beforeAfterTitle) beforeAfterTitle.textContent = texts.beforeAfter;
  if (beforeLabel) beforeLabel.textContent = texts.before;
  if (afterLabel) afterLabel.textContent = texts.after;
  typeText(aiTypingText, texts.aiLine, 18);
  updateBeforeAfterSlider();

  const twinData = buildTwinPaths({
    condition: state.condition || "Medium",
    usageLevel: state.usageLevel || "moderate",
    age: state.productAge || 0,
  });

  twinPaths.innerHTML = twinData.paths
    .map((item) => {
      const bestBadge = item.key === twinData.bestKey
        ? `<span class="twin-badge">${texts.best}</span>`
        : "";
      return `
        <div class="twin-path ${item.key === twinData.bestKey ? "best" : ""}">
          <div class="twin-path-header">
            <span class="twin-icon">${item.icon}</span>
            <strong>${texts[item.key]}</strong>
            ${bestBadge}
          </div>
          <div class="twin-metric"><span>${texts.impact}</span><strong>${item.eco}/100</strong></div>
          <div class="twin-metric">${texts.waste}: <strong>${item.waste} kg</strong></div>
          <div class="twin-metric">${texts.water}: <strong>${item.water} L</strong></div>
          <div class="twin-metric">${texts.co2}: <strong>${item.co2} kg</strong></div>
          <div class="twin-metric">${texts.life}: <strong>${item.life}</strong></div>
        </div>
      `;
    })
    .join("");

  updateTimeline(twinData.bestKey, texts);
  animateEcoMeter(state.score || twinData.paths.find((item) => item.key === twinData.bestKey)?.eco || 0);

  digitalTwinSection.classList.remove("is-hidden");
  digitalTwinSection.classList.add("twin-show");
  setTimeout(() => digitalTwinSection.classList.remove("twin-show"), 520);
}

function animateCounter(element, target, options = {}) {
  const { prefix = "", suffix = "" } = options;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = `${prefix}${current}${suffix}`;
  }, 25);
}

function refreshDashboard() {
  dashProduct.textContent = state.productType || "-";
  dashAge.textContent = state.productAge ? `Age: ${state.productAge} year(s)` : "-";
  if (dashUsage) dashUsage.textContent = state.usageLevel ? `Usage: ${state.usageLevel}` : "-";
  dashCondition.textContent = state.condition ? `Condition: ${state.condition}` : "-";
  dashScore.textContent = state.score ? `Score: ${state.score}/100` : "-";
  dashLife.textContent = state.remainingLife ? `Remaining life: ${state.remainingLife}%` : "-";
  dashPrice.textContent = state.price ? `Estimated price: ₹${state.price}` : "-";
  dashDemand.textContent = state.demand ? `Demand: ${state.demand}` : "-";

  if (state.facilities.length === 0) {
    dashFacilities.textContent = "No recent facilities found.";
  } else {
    dashFacilities.innerHTML = state.facilities
      .slice(0, 3)
      .map(
        (item) => `
      <div class="facility-item" style="border:none; padding:0; box-shadow:none; margin-bottom:12px;">
        <div class="f-header">
           <strong class="f-name" style="font-size:14px;">${item.name}</strong>
           <span class="f-dist" style="font-size:11px;">${item.distance} km</span>
        </div>
        <span class="f-type" style="font-size:12px;">${item.type}</span>
      </div>`
      )
      .join("");
  }
}

function buildWhatsappMessage() {
  const name = state.productType || "Unknown product";
  const age = state.productAge ? `${state.productAge} year(s)` : "Pending";
  const condition = state.condition && state.condition !== "-" ? state.condition : "Pending";
  const life = state.remainingLife ? `${state.remainingLife}%` : "Pending";
  const score = state.score ? `${state.score}/100` : "Pending";
  const price = state.price ? `₹${state.price}` : "Pending";

  return `Hello, I want too connect regarding my product.\n\nProduct: ${name}\nAge: ${age}\nCondition: ${condition}\nRemaining Life: ${life}\nSustainability Score: ${score}\nEstimated Price: ${price}\n\nPlease contact me for reuse/repair/recycling.`;
}

function openModal(facility) {
  activeFacility = facility;
  modalName.textContent = facility.name;
  modalType.textContent = `${facility.type} | ${facility.distance} km away`;
  modalPhone.textContent = facility.phone;
  modalWhatsapp.textContent = facility.whatsapp;

  const message = buildWhatsappMessage();
  modalMessage.textContent = message;

  connectModal.classList.remove("hidden");
  connectModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  connectModal.classList.add("hidden");
  connectModal.setAttribute("aria-hidden", "true");
  activeFacility = null;
}

function openCertificateModal(payload) {
  latestCertificate = payload;
  certificateMessage.textContent = "🎉 Your Eco Certificate is ready!";
  certUserName.textContent = payload.userName;
  certProduct.textContent = `Product: ${payload.productName}`;
  certWaste.textContent = `Waste saved: ${payload.wasteSavedKg} kg`;
  certDate.textContent = `Date: ${payload.date}`;
  certificateModal.classList.remove("hidden");
  certificateModal.setAttribute("aria-hidden", "false");
}

function closeCertificateModal() {
  certificateModal.classList.add("hidden");
  certificateModal.setAttribute("aria-hidden", "true");
}

function buildCertificatePayload() {
  const profile = getProfileData();
  const userName = profile.name || "User";
  const productName = state.productType || "Product";
  const ageValue = Number(productAgeInput.value || 0);
  const wasteSavedKg = clamp(Number((ageValue * 0.8).toFixed(1)), 0.5, 40);
  const date = new Date().toLocaleDateString();
  return { userName, productName, wasteSavedKg, date };
}

function generateCertificatePdf(payload) {
  const jspdf = window.jspdf;
  if (!jspdf?.jsPDF) return;
  const doc = new jspdf.jsPDF({ unit: "pt", format: "a4" });
  doc.setFillColor(232, 248, 240);
  doc.rect(0, 0, 595, 842, "F");

  doc.setFillColor(16, 163, 74);
  doc.roundedRect(40, 40, 515, 60, 12, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Eco Certificate", 80, 80);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(`Congratulations ${payload.userName}`, 60, 160);
  doc.text(`You saved ${payload.wasteSavedKg} kg waste`, 60, 190);
  doc.text("You are an Eco Hero", 60, 220);

  doc.setFontSize(12);
  doc.text(`Product: ${payload.productName}`, 60, 270);
  doc.text(`Date: ${payload.date}`, 60, 290);
  doc.text("ReGenX - Smart Circular Economy Marketplace", 60, 330);

  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94);
  doc.text("Powered by ReGenX", 60, 360);

  doc.save(`eco-certificate-${payload.productName.replace(/\s+/g, "-")}.pdf`);
}

function shareCertificate(payload) {
  const text = `Eco Certificate for ${payload.userName}. Saved ${payload.wasteSavedKg} kg waste with ${payload.productName}!`;
  if (navigator.share) {
    navigator.share({ title: "Eco Certificate", text }).catch(() => {});
    return;
  }
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
}

// Simulated AI analysis using age and usage rules.
analyzeBtn.addEventListener("click", () => {
  const typeValue = productTypeInput.value.trim();
  const ageValue = Number(productAgeInput.value);
  const usageValue = usageLevelInput.value;

  if (!typeValue || Number.isNaN(ageValue)) {
    alert("Please fill product type and age before analyzing.");
    return;
  }

  state.productType = typeValue;
  state.productAge = ageValue;
  state.usageLevel = usageValue;

  showLoader(uploadLoader);

  setTimeout(() => {
    const condition = calculateCondition(ageValue, usageValue);
    const score = calculateSustainability(condition, usageValue, ageValue);
    const remainingLife = calculateRemainingLife(condition, ageValue);

    state.condition = condition;
    state.score = score;
    state.remainingLife = remainingLife;

    conditionResult.textContent = condition;
    scoreResult.textContent = `${score}/100`;
    lifeResult.textContent = `${remainingLife}%`;

    hideLoader(uploadLoader);
    refreshDashboard();
    updateDigitalTwin();
    triggerRecycleBounce();
  }, 1200);
});

// Life cycle prediction uses the latest AI condition.
lifeBtn.addEventListener("click", () => {
  if (!state.condition || state.condition === "-") {
    alert("Please analyze a product first.");
    return;
  }

  showLoader(lifeLoader);
  lifeProgress.style.width = "0%";
  lifePercent.textContent = "0%";

  setTimeout(() => {
    const lifeValue = state.remainingLife || calculateRemainingLife(state.condition, state.productAge);
    lifeProgress.style.width = `${lifeValue}%`;
    animateCounter(lifePercent, lifeValue, { suffix: "%" });
    hideLoader(lifeLoader);
    refreshDashboard();
  }, 900);
});

// Pricing model blends remaining life, condition, and market demand.
priceBtn.addEventListener("click", () => {
  if (!state.remainingLife) {
    alert("Run life cycle prediction first.");
    return;
  }

  showLoader(priceLoader);

  setTimeout(() => {
    const demandScore = randomBetween(60, 120);
    const demandLabel = demandScore > 100 ? "High" : demandScore > 80 ? "Moderate" : "Low";

    const baseValue = getBasePrice(state.productType);
    const conditionMultiplier = state.condition === "Good" ? 1.2 : state.condition === "Medium" ? 0.9 : 0.6;
    const lifeMultiplier = state.remainingLife / 100;
    const demandMultiplier = demandScore / 100;

    const estimatedPrice = Math.round(baseValue * conditionMultiplier * lifeMultiplier * demandMultiplier);

    state.price = estimatedPrice;
    state.demand = demandLabel;

    priceValue.textContent = "₹0";
    animateCounter(priceValue, estimatedPrice, { prefix: "₹" });
    demandValue.textContent = `Market demand: ${demandLabel}`;

    hideLoader(priceLoader);
    refreshDashboard();
    
    // Save to history
    const futurePath = state.condition === "Good" ? "sell" : state.condition === "Medium" ? "repair" : "recycle";
    addToHistory({
      productType: state.productType,
      condition: state.condition,
      score: state.score,
      remainingLife: state.remainingLife,
      price: estimatedPrice,
      demand: demandLabel,
      futurePath: futurePath,
    });
    
    // Populate and show trust features
    populateTrustFeatures();
  }, 1100);
});

// Mock location-based recommendations.
geoBtn.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (!location) {
    alert("Please enter a location to find facilities.");
    return;
  }

  showLoader(geoLoader);
  geoResults.innerHTML = "";

  setTimeout(() => {
    const facilities = generateFacilities(location);
    state.facilities = facilities;

    geoResults.innerHTML = facilities
      .map((item, index) => {
        return `
      <div class="facility-item reveal-on-scroll is-visible" style="transition-delay:${Math.min(index * 60, 220)}ms;">
        <div class="f-header">
            <span class="f-name">${item.name}</span>
            <span class="f-dist">${item.distance} km</span>
        </div>
        <span class="f-type">${item.type}</span>
        <button class="f-action" data-connect-index="${index}">Connect</button>
      </div>
        `;
      })
      .join("");

    hideLoader(geoLoader);
    refreshDashboard();
  }, 1000);
});

geoResults.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLButtonElement && target.dataset.connectIndex) {
    const index = Number(target.dataset.connectIndex);
    const facility = state.facilities[index];
    if (facility) {
      openModal(facility);
    }
  }
});

connectModal.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.close === "true") {
    closeModal();
  }
});

modalClose.addEventListener("click", closeModal);

modalWhatsappBtn.addEventListener("click", () => {
  if (!activeFacility) return;
  const message = buildWhatsappMessage();
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${activeFacility.whatsapp}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
  const payload = buildCertificatePayload();
  openCertificateModal(payload);
  triggerRecycleBounce();
  showSuccessFx("🎉 Eco action completed!");

  addNotification({
    id: `${Date.now()}_${activeFacility.name.length}`,
    title: "Eco action completed",
    message: `Connected with ${activeFacility.name} for ${state.productType || "your product"}.`,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    read: false,
  });
});

if (certificateClose) {
  certificateClose.addEventListener("click", closeCertificateModal);
}

if (certificateModal) {
  certificateModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "true") {
      closeCertificateModal();
    }
  });
}

if (downloadCertificateBtn) {
  downloadCertificateBtn.addEventListener("click", () => {
    if (!latestCertificate) return;
    generateCertificatePdf(latestCertificate);
    showSuccessFx("🎉 Certificate downloaded!");
  });
}

if (shareCertificateBtn) {
  shareCertificateBtn.addEventListener("click", () => {
    if (!latestCertificate) return;
    shareCertificate(latestCertificate);
  });
}

function generateFacilities(location) {
  const baseNames = [
    "GreenFix Repair Hub",
    "ReLoop Recycling",
    "Circular Buyers Collective",
    "EcoRevive Center",
    "SecondLife Exchange",
    "Urban Repair Studio",
  ];

  const types = ["Repair Shop", "Recycling Center", "Buyer"];

  const phoneNumbers = [
    "+91 98765 43210",
    "+91 98111 22334",
    "+91 97979 88990",
    "+91 97654 32109",
    "+91 98989 77880",
  ];

  const whatsappNumbers = [
    "919876543210",
    "919811122334",
    "919797988990",
    "919765432109",
    "919898977880",
  ];

  return baseNames.slice(0, 5).map((name, index) => {
    const distance = randomBetween(1, 12) + index;
    const type = types[index % types.length];
    return {
      name: `${name} - ${location}`,
      distance,
      type,
      phone: phoneNumbers[index],
      whatsapp: whatsappNumbers[index],
    };
  });
}

// Live stats make the landing page feel dynamic.
setInterval(() => {
  const liveScore = document.getElementById("liveScore");
  const liveReuse = document.getElementById("liveReuse");
  const liveDemand = document.getElementById("liveDemand");

  const score = randomBetween(70, 95);
  const reuse = randomBetween(50, 80);
  const demand = ["High", "Moderate", "Low"][randomBetween(0, 2)];

  if (liveScore) liveScore.textContent = score;
  if (liveReuse) liveReuse.textContent = `${reuse}%`;
  if (liveDemand) liveDemand.textContent = demand;
}, 3500);

// ==========================================
// TRUST FEATURES - Populate Functions
// ==========================================

const PRODUCT_BASE_PRICES = {
  laptop: 45000,
  phone: 25000,
  tablet: 30000,
  tv: 35000,
  refrigerator: 28000,
  "washing machine": 22000,
  microwave: 8000,
  ac: 32000,
  camera: 35000,
  watch: 15000,
  headphones: 8000,
  speaker: 12000,
  default: 15000
};

const PRODUCT_MATERIALS = {
  laptop: "Aluminum, Plastic, Lithium-ion",
  phone: "Glass, Aluminum, Lithium-ion",
  tablet: "Aluminum, Glass, Lithium-ion",
  tv: "Plastic, Glass, LED/OLED",
  refrigerator: "Steel, Plastic, Copper",
  "washing machine": "Steel, Plastic, Rubber",
  microwave: "Steel, Glass, Plastic",
  ac: "Copper, Aluminum, Plastic",
  camera: "Magnesium Alloy, Glass, Plastic",
  watch: "Steel/Aluminum, Glass, Lithium",
  headphones: "Plastic, Aluminum, Copper",
  speaker: "Wood/Plastic, Paper, Copper",
  default: "Mixed Materials"
};

function getBasePrice(productType) {
  const type = productType.toLowerCase();
  for (const [key, value] of Object.entries(PRODUCT_BASE_PRICES)) {
    if (type.includes(key)) return value;
  }
  return PRODUCT_BASE_PRICES.default;
}

function getMaterial(productType) {
  const type = productType.toLowerCase();
  for (const [key, value] of Object.entries(PRODUCT_MATERIALS)) {
    if (type.includes(key)) return value;
  }
  return PRODUCT_MATERIALS.default;
}

function populateTrustFeatures() {
  if (!trustPanel) return;
  
  // Show the trust panel
  trustPanel.classList.remove("is-hidden");
  
  const predictionTime = new Date();
  const productType = state.productType || "Product";
  const condition = state.condition || "Medium";
  const age = state.productAge || 0;
  const usage = state.usageLevel || "moderate";
  const score = state.score || 70;
  const price = state.price || 0;
  const demand = state.demand || "Moderate";
  
  // Calculate base price and breakdown
  const basePrice = getBasePrice(productType);
  const ageDepreciation = Math.round(basePrice * (age * 0.08));
  const conditionMultiplier = condition === "Good" ? 0.95 : condition === "Medium" ? 0.75 : 0.5;
  const demandMultiplier = demand === "High" ? 1.15 : demand === "Moderate" ? 1.0 : 0.85;
  const materialValue = Math.round(basePrice * 0.1);
  
  // Detection confidence based on various factors
  const imageQuality = state.productImage ? randomBetween(85, 98) : randomBetween(70, 85);
  const dataMatch = randomBetween(88, 97);
  const overallConfidence = Math.round((imageQuality * 0.4 + dataMatch * 0.6));
  
  // 1. Image Verification
  if (trustDetectedObject) trustDetectedObject.textContent = productType;
  if (trustDetectionBar) trustDetectionBar.style.setProperty("--confidence", `${imageQuality}%`);
  if (trustDetectionConfidence) trustDetectionConfidence.textContent = `${imageQuality}%`;
  if (trustDetectedMaterial) trustDetectedMaterial.textContent = getMaterial(productType);
  if (trustConditionScore) trustConditionScore.textContent = `${condition} (${score}/100)`;
  
  // 2. Prediction Confidence Meter
  if (trustGaugeArc) {
    const arcLength = (overallConfidence / 100) * 157;
    trustGaugeArc.setAttribute("stroke-dasharray", `${arcLength} 157`);
  }
  if (trustConfidenceValue) {
    animateCounter(trustConfidenceValue, overallConfidence, {});
  }
  if (trustConfidenceLabel) {
    trustConfidenceLabel.textContent = overallConfidence >= 90 ? "Highly Reliable" : 
                                       overallConfidence >= 75 ? "Reliable" : "Moderate";
  }
  if (trustImageQuality) trustImageQuality.textContent = `${imageQuality}%`;
  if (trustDataMatch) trustDataMatch.textContent = `${dataMatch}%`;
  
  // 3. Prediction Breakdown
  if (trustOriginalPrice) trustOriginalPrice.textContent = `₹${basePrice.toLocaleString()}`;
  if (trustAgeDepreciation) trustAgeDepreciation.textContent = `-₹${ageDepreciation.toLocaleString()}`;
  if (trustConditionFactor) trustConditionFactor.textContent = `×${conditionMultiplier.toFixed(2)}`;
  if (trustMarketDemand) trustMarketDemand.textContent = `×${demandMultiplier.toFixed(2)}`;
  if (trustMaterialValue) trustMaterialValue.textContent = `+₹${materialValue.toLocaleString()}`;
  if (trustFinalPrice) trustFinalPrice.textContent = `₹${price.toLocaleString()}`;
  
  // 4. Market Price Comparison
  const olxPrice = Math.round(price * (0.9 + Math.random() * 0.3));
  const fbPrice = Math.round(price * (0.85 + Math.random() * 0.35));
  const cashifyPrice = Math.round(price * (0.7 + Math.random() * 0.2));
  const maxPrice = Math.max(price, olxPrice, fbPrice, cashifyPrice);
  
  if (trustOurPriceBar) trustOurPriceBar.style.width = `${(price / maxPrice) * 100}%`;
  if (trustOurPrice) trustOurPrice.textContent = `₹${price.toLocaleString()}`;
  if (trustOlxBar) trustOlxBar.style.width = `${(olxPrice / maxPrice) * 100}%`;
  if (trustOlxPrice) trustOlxPrice.textContent = `₹${olxPrice.toLocaleString()}`;
  if (trustFbBar) trustFbBar.style.width = `${(fbPrice / maxPrice) * 100}%`;
  if (trustFbPrice) trustFbPrice.textContent = `₹${fbPrice.toLocaleString()}`;
  if (trustCashifyBar) trustCashifyBar.style.width = `${(cashifyPrice / maxPrice) * 100}%`;
  if (trustCashifyPrice) trustCashifyPrice.textContent = `₹${cashifyPrice.toLocaleString()}`;
  
  if (trustMarketVerdict) {
    const avgMarket = (olxPrice + fbPrice + cashifyPrice) / 3;
    const diff = ((price - avgMarket) / avgMarket) * 100;
    if (Math.abs(diff) < 15) {
      trustMarketVerdict.innerHTML = `<iconify-icon icon="ph:check-circle-bold"></iconify-icon><span>Price within market range (±${Math.abs(diff).toFixed(0)}%)</span>`;
      trustMarketVerdict.style.background = "rgba(34, 197, 94, 0.1)";
      trustMarketVerdict.style.color = "#16a34a";
    } else if (diff < 0) {
      trustMarketVerdict.innerHTML = `<iconify-icon icon="ph:arrow-down-bold"></iconify-icon><span>Below market average (${Math.abs(diff).toFixed(0)}% lower)</span>`;
      trustMarketVerdict.style.background = "rgba(59, 130, 246, 0.1)";
      trustMarketVerdict.style.color = "#3b82f6";
    } else {
      trustMarketVerdict.innerHTML = `<iconify-icon icon="ph:arrow-up-bold"></iconify-icon><span>Above market average (${diff.toFixed(0)}% higher)</span>`;
      trustMarketVerdict.style.background = "rgba(245, 158, 11, 0.1)";
      trustMarketVerdict.style.color = "#f59e0b";
    }
  }
  
  // 5. AI Recommendation
  const repairCost = Math.round(price * (0.15 + Math.random() * 0.15));
  const resaleValue = price;
  const recycleValue = Math.round(price * 0.2);
  
  let recommendation = "Resell";
  let recIcon = "ph:storefront-bold";
  let recExplanation = "The product is in good condition with high resale value. Selling directly will maximize your returns.";
  let recClass = "resell";
  
  if (condition === "Poor" || score < 40) {
    recommendation = "Recycle";
    recIcon = "ph:recycle-bold";
    recExplanation = "Due to the product's condition, recycling is the most environmentally responsible option. Material recovery can still provide value.";
    recClass = "recycle";
  } else if (repairCost < resaleValue * 0.3 && condition !== "Good") {
    recommendation = "Repair";
    recIcon = "ph:wrench-bold";
    recExplanation = `Repair cost (₹${repairCost.toLocaleString()}) is significantly lower than potential resale value increase. Repairing could boost value by ₹${Math.round(resaleValue * 0.4).toLocaleString()}.`;
    recClass = "repair";
  }
  
  if (trustRecommendationBadge) {
    trustRecommendationBadge.className = `recommendation-badge ${recClass}`;
  }
  if (trustRecommendationIcon) trustRecommendationIcon.setAttribute("icon", recIcon);
  if (trustRecommendationType) trustRecommendationType.textContent = recommendation;
  if (trustRecommendationExplanation) trustRecommendationExplanation.textContent = recExplanation;
  if (trustRepairCost) trustRepairCost.textContent = `₹${repairCost.toLocaleString()}`;
  if (trustResaleValue) trustResaleValue.textContent = `₹${resaleValue.toLocaleString()}`;
  if (trustRecycleValue) trustRecycleValue.textContent = `₹${recycleValue.toLocaleString()}`;
  
  // 6. Environmental Impact
  const co2Factor = score / 100;
  const co2Saved = (2.5 + Math.random() * 3 * co2Factor).toFixed(1);
  const waterSaved = Math.round(150 + Math.random() * 200 * co2Factor);
  const energySaved = (15 + Math.random() * 25 * co2Factor).toFixed(1);
  const circularScore = Math.round(score * 0.9 + randomBetween(5, 15));
  
  if (trustCo2Saved) trustCo2Saved.textContent = `${co2Saved} kg`;
  if (trustWaterSaved) trustWaterSaved.textContent = `${waterSaved} L`;
  if (trustEnergySaved) trustEnergySaved.textContent = `${energySaved} kWh`;
  if (trustCircularScore) trustCircularScore.textContent = `${Math.min(circularScore, 100)}/100`;
  
  // 8. Timestamps
  const timeAgo = "Just now";
  const marketUpdate = ["Today", "1 hour ago", "2 hours ago"][randomBetween(0, 2)];
  const envUpdate = ["Today", "Yesterday", "This week"][randomBetween(0, 2)];
  
  if (trustPredictionTime) trustPredictionTime.textContent = timeAgo;
  if (trustMarketDataTime) trustMarketDataTime.textContent = marketUpdate;
  if (trustEnvDataTime) trustEnvDataTime.textContent = envUpdate;
  
  // 9. Model Version
  if (trustModelVersion) trustModelVersion.textContent = "Version 2.1.0";
  
  // 10. Accuracy Rate
  if (trustAccuracyRate) trustAccuracyRate.textContent = `${randomBetween(91, 96)}%`;
  
  // Reset feedback buttons
  if (feedbackButtons) feedbackButtons.classList.remove("hidden");
  if (feedbackResponse) feedbackResponse.classList.add("hidden");
  if (feedbackYes) feedbackYes.classList.remove("selected");
  if (feedbackNo) feedbackNo.classList.remove("selected");
  
  // Scroll to trust panel
  setTimeout(() => {
    trustPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
}

// Feedback handlers
if (feedbackYes) {
  feedbackYes.addEventListener("click", () => {
    feedbackYes.classList.add("selected");
    feedbackNo.classList.remove("selected");
    setTimeout(() => {
      feedbackButtons.classList.add("hidden");
      feedbackResponse.classList.remove("hidden");
    }, 300);
    addNotification({ title: "Feedback Received", message: "Thank you for confirming the prediction accuracy!", icon: "✅" });
  });
}

if (feedbackNo) {
  feedbackNo.addEventListener("click", () => {
    feedbackNo.classList.add("selected");
    feedbackYes.classList.remove("selected");
    setTimeout(() => {
      feedbackButtons.classList.add("hidden");
      feedbackResponse.innerHTML = `<iconify-icon icon="ph:info-bold"></iconify-icon><span>Thank you! Your feedback helps us improve our AI model.</span>`;
      feedbackResponse.classList.remove("hidden");
    }, 300);
    addNotification({ title: "Feedback Received", message: "We'll use your feedback to improve predictions.", icon: "📝" });
  });
}

// ─────────────────────────────────────
// History Functionality (Firebase + localStorage)
// ─────────────────────────────────────
const historyGrid = document.getElementById("historyGrid");
const historyEmpty = document.getElementById("historyEmpty");
const historyFilter = document.getElementById("historyFilter");
let productHistory = [];
let currentUserId = null;

const HISTORY_STORAGE_KEY = "regenxProductHistory";
const HISTORY_COLLECTION = "productHistory";

// Get current user ID (from Firebase auth or localStorage)
function getCurrentUserId() {
  if (typeof firebaseAuth !== "undefined" && firebaseAuth.currentUser) {
    return firebaseAuth.currentUser.uid;
  }
  // Fallback to localStorage guest ID
  let guestId = localStorage.getItem("regenxGuestId");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("regenxGuestId", guestId);
  }
  return guestId;
}

// Load history from Firebase and localStorage
async function loadHistory() {
  currentUserId = getCurrentUserId();
  
  // First load from localStorage (faster)
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      productHistory = JSON.parse(stored);
      renderHistory();
    }
  } catch (e) {
    productHistory = [];
  }
  
  // Then sync from Firebase if available
  if (typeof firebaseDb !== "undefined") {
    try {
      const snapshot = await firebaseDb
        .collection(HISTORY_COLLECTION)
        .where("userId", "==", currentUserId)
        .limit(50)
        .get();
      
      if (!snapshot.empty) {
        let firebaseHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending (client-side to avoid composite index)
        firebaseHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Merge with localStorage (Firebase takes priority)
        const existingIds = new Set(firebaseHistory.map(h => h.id));
        const localOnly = productHistory.filter(h => !existingIds.has(h.id));
        productHistory = [...firebaseHistory, ...localOnly];
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(productHistory));
        renderHistory();
      }
    } catch (e) {
      console.log("Firebase sync skipped:", e.message);
    }
  }
}

// Save history to localStorage and Firebase
async function saveHistory() {
  // Always save to localStorage
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(productHistory));
  } catch (e) {
    console.warn("Could not save history to localStorage");
  }
}

// Compress image for Firebase storage (limit to 100KB)
function compressImageForStorage(base64Image) {
  if (!base64Image) return "";
  // If image is small enough, keep it
  if (base64Image.length < 100000) return base64Image;
  // Otherwise, skip storing the full image in database (keep in localStorage only)
  return ""; // Return empty to save space in Firestore
}

// Save single item to Firebase
async function saveToFirebase(entry) {
  if (typeof firebaseDb !== "undefined") {
    try {
      // Create a copy without large image for database storage
      const dbEntry = {
        ...entry,
        image: compressImageForStorage(entry.image),
        userId: getCurrentUserId(),
      };
      await firebaseDb.collection(HISTORY_COLLECTION).doc(entry.id).set(dbEntry);
      console.log("History saved to database");
      addNotification({ title: "History Saved", message: "Product saved to your history!", icon: "💾" });
    } catch (e) {
      console.warn("Could not save to Firebase:", e.message);
    }
  }
}

// Delete from Firebase
async function deleteFromFirebase(id) {
  if (typeof firebaseDb !== "undefined") {
    try {
      await firebaseDb.collection(HISTORY_COLLECTION).doc(id).delete();
    } catch (e) {
      console.warn("Could not delete from Firebase:", e.message);
    }
  }
}

function addToHistory(item) {
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    image: state.productImage || "",
    productName: item.productType || "Product",
    condition: item.condition || "-",
    score: item.score || 0,
    remainingLife: item.remainingLife || 0,
    price: item.price || 0,
    demand: item.demand || "",
    futurePath: item.futurePath || "sell",
    ecoScore: item.score || 0,
    date: new Date().toISOString(),
    userId: getCurrentUserId(),
  };
  productHistory.unshift(entry);
  saveHistory();
  saveToFirebase(entry); // Save to Firebase database
  renderHistory();
}

async function deleteHistoryItem(id) {
  const confirmed = window.confirm("Delete this item from history?");
  if (!confirmed) return;
  
  productHistory = productHistory.filter(item => item.id !== id);
  saveHistory();
  deleteFromFirebase(id); // Delete from Firebase
  renderHistory();
}

function formatHistoryDate(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderHistory() {
  if (!historyGrid) return;
  
  const filterValue = historyFilter ? historyFilter.value : "all";
  const filtered = filterValue === "all" 
    ? productHistory 
    : productHistory.filter(item => item.futurePath === filterValue);
  
  if (filtered.length === 0) {
    historyGrid.innerHTML = "";
    if (historyEmpty) historyEmpty.style.display = "block";
    return;
  }
  
  if (historyEmpty) historyEmpty.style.display = "none";
  
  historyGrid.innerHTML = filtered.map((item, index) => {
    const imageHtml = item.image 
      ? `<img src="${item.image}" alt="${item.productName}" />` 
      : `<div class="no-image"><iconify-icon icon="ph:image-bold"></iconify-icon></div>`;
    
    return `
      <div class="history-card" style="animation: fadeInUp 0.3s ease ${index * 0.05}s both;">
        <div class="history-card-image">
          ${imageHtml}
          <button class="history-delete-btn" data-delete-id="${item.id}" title="Delete">
            <iconify-icon icon="ph:trash-bold"></iconify-icon>
          </button>
        </div>
        <div class="history-card-body">
          <h4 class="history-card-title">${item.productName}</h4>
          <div class="history-card-meta">
            <span class="history-meta-item">
              <iconify-icon icon="ph:heart-half-bold"></iconify-icon>
              ${item.condition}
            </span>
            <span class="history-meta-item">
              <iconify-icon icon="ph:leaf-bold"></iconify-icon>
              ${item.ecoScore}/100
            </span>
            <span class="history-meta-item">
              <iconify-icon icon="ph:clock-bold"></iconify-icon>
              ${item.remainingLife}%
            </span>
          </div>
          <div class="history-card-price">₹${item.price.toLocaleString("en-IN")}</div>
          <span class="history-card-path ${item.futurePath}">${item.futurePath}</span>
          <div class="history-card-date">${formatHistoryDate(item.date)}</div>
          <div class="history-card-actions">
            <button class="history-action-btn secondary" data-view-id="${item.id}">
              <iconify-icon icon="ph:eye-bold"></iconify-icon>
              View
            </button>
            <button class="history-action-btn primary" data-share-id="${item.id}">
              <iconify-icon icon="ph:share-bold"></iconify-icon>
              Share
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  // Attach delete handlers
  historyGrid.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteHistoryItem(btn.dataset.deleteId);
    });
  });
  
  // Attach share handlers
  historyGrid.querySelectorAll("[data-share-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = productHistory.find(h => h.id === btn.dataset.shareId);
      if (item) {
        const text = `🌱 Eco Analysis: ${item.productName}\nCondition: ${item.condition}\nEco Score: ${item.ecoScore}/100\nEstimated Price: ₹${item.price.toLocaleString("en-IN")}\nRecommendation: ${item.futurePath}\n\nAnalyzed with ReGenX`;
        if (navigator.share) {
          navigator.share({ title: "Eco Analysis", text }).catch(() => {});
        } else {
          const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
          window.open(whatsappLink, "_blank", "noopener,noreferrer");
        }
      }
    });
  });
}

// Filter change handler 
if (historyFilter) {
  historyFilter.addEventListener("change", renderHistory);
}

// Firebase auth state listener - reload history when user logs in/out
if (typeof firebaseAuth !== "undefined") {
  firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid;
      console.log("User logged in:", user.email);
      // Update user profile UI
      const userNameEl = document.getElementById("userName");
      const userAvatarEl = document.getElementById("userAvatar");
      const userEmailEl = document.getElementById("userEmail");
      const userStatusEl = document.getElementById("userStatus");
      const profileBtnEl = document.getElementById("profileBtn");
      
      const displayName = user.displayName || user.email.split("@")[0];
      const initials = displayName
        .split(/[\s_]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
      
      if (userNameEl) userNameEl.textContent = displayName;
      if (userAvatarEl) userAvatarEl.textContent = initials || "U";
      if (userEmailEl) userEmailEl.textContent = user.email || "";
      if (userStatusEl) {
        userStatusEl.textContent = "✅ Verified";
        userStatusEl.classList.add("verified");
      }
      if (profileBtnEl) {
        const img = profileBtnEl.querySelector("img");
        if (img) img.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
      }
    } else {
      currentUserId = getCurrentUserId();
      console.log("User logged out, using guest ID");
    }
    // Reload history with correct user ID
    loadHistory();
  });
}

// Load history on page load
loadHistory();

refreshDashboard();
