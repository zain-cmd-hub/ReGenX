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

let activeFacility = null;
let latestCertificate = null;

const PROFILE_STORAGE_KEY = "tscemProfile";
const LANG_STORAGE_KEY = "tscemLanguage";

function getLanguage() {
  return localStorage.getItem(LANG_STORAGE_KEY) === "hi" ? "hi" : "en";
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
      name: "Dev Kulshrestha",
      email: "Admin",
      phone: "",
      address: "",
      about: "",
    };
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return {
      name: "Dev Kulshrestha",
      email: "Admin",
      phone: "",
      address: "",
      about: "",
    };
  }
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
}

function openProfileModal() {
  const profile = getProfileData();
  profileName.value = profile.name || "";
  profileEmail.value = profile.email || "";
  profilePhone.value = profile.phone || "";
  profileAddress.value = profile.address || "";
  profileAbout.value = profile.about || "";
  profileError.textContent = "";
  profileModal.classList.remove("hidden");
  profileModal.setAttribute("aria-hidden", "false");
}

function closeProfileModal() {
  profileModal.classList.add("hidden");
  profileModal.setAttribute("aria-hidden", "true");
}

function openProfileSuccess() {
  profileSuccessMessage.textContent = getSuccessMessage();
  profileSuccessModal.classList.remove("hidden");
  profileSuccessModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    profileSuccessModal.classList.add("hidden");
    profileSuccessModal.setAttribute("aria-hidden", "true");
  }, 3000);
}

function closeProfileSuccess() {
  profileSuccessModal.classList.add("hidden");
  profileSuccessModal.setAttribute("aria-hidden", "true");
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
});

if (profileBtn) {
  profileBtn.addEventListener("click", openProfileModal);
}

if (profileModalClose) {
  profileModalClose.addEventListener("click", closeProfileModal);
}

if (profileModal) {
  profileModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "true") {
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
  dashUsage.textContent = state.usageLevel ? `Usage: ${state.usageLevel}` : "-";
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
  doc.text("SCEM - Smart Circular Economy Marketplace", 60, 330);

  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94);
  doc.text("Powered by SCEM", 60, 360);

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

    const baseValue = 12000;
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
      <div class="facility-item">
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

  liveScore.textContent = score;
  liveReuse.textContent = `${reuse}%`;
  liveDemand.textContent = demand;
}, 3500);

refreshDashboard();
