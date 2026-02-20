"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";

const MapView = dynamic(() => import("./components/MapView"), { ssr: false });
const DEFAULT_CITY = {
  name: "New Delhi",
  lat: 28.6139,
  lng: 77.2090,
};

const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      overview: "Overview",
      upload: "Upload",
      life: "Life Cycle",
      pricing: "Pricing",
      facilities: "Facilities",
    },
    stats: {
      uploadedProduct: "Uploaded Product",
      currentCondition: "Current Condition",
      remainingLife: "Remaining Life",
      estPrice: "Est. Price",
    },
    header: {
      title: "Dashboard",
      welcome: "Welcome back, complete your circular economy tasks.",
      dashboardBtn: "Dashboard",
      searchPlaceholder: "Search...",
    },
    actions: {
      logout: "Logout",
      profile: "Profile",
    },
    success: {
      requestSent: "Request sent successfully!",
    },
    flow: {
      upload: "Upload Product",
      purpose: "Select Purpose",
      analysis: "AI Analysis",
      price: "Price & Value",
      connect: "Connect Facility",
    },
    upload: {
      title: "Upload Product",
      dragTitle: "Click or drag an image here",
      dragHint: "PNG, JPG, or WEBP up to 10MB",
      changeImage: "Change Image",
      productType: "Product Type",
      productPlaceholder: "e.g., Laptop",
      purpose: "Purpose",
      ageYears: "Age (years)",
      usageDuration: "Usage Duration",
      verifiedPopup: "🎉 Congratulations! Your profile has been successfully verified.",
      years: "Years",
      months: "Months",
      days: "Days",
      materialType: "Material Type",
      weight: "Weight (kg)",
      weightPlaceholder: "e.g., 2.5",
      analyze: "Analyze",
      analyzing: "AI is analyzing product condition...",
    },
    purpose: {
      sell: "Sell",
      repair: "Repair",
      recycle: "Recycle",
    },
    results: {
      condition: "Condition",
      remainingLife: "Remaining Life",
      resalePrice: "Resale Price",
      damageLevel: "Damage Level",
      repairCost: "Repair Cost",
      material: "Material",
      weight: "Weight",
      recyclingValue: "Recycling Value",
      save: "Save",
      saveDetails: "Save Details",
      requiredFields: "Please fill required fields:",
    },
    eco: {
      label: "Eco Score",
      best: "Best for environment 🌍",
      moderate: "Moderate impact",
      verifiedPopup: "🎉 बधाई हो! आपकी प्रोफ़ाइल सफलतापूर्वक सत्यापित हो गई है।",
      low: "Low eco benefit",
    },
    comparison: {
      title: "Compare Options",
      subtitle: "See Sell vs Repair vs Recycle for this product.",
      bestSell: "Best option for environment: Sell (Reuse) ✅",
      bestRepair: "Best option for environment: Repair ✅",
      bestRecycle: "Best option for environment: Recycle ✅",
      bestBadge: "Best ✅",
    },
    ai: {
      title: "AI Recommendation",
    },
    facilities: {
      recommended: "Recommended Facilities",
      nearby: "Nearby Facilities",
      enterCity: "Enter city...",
      listView: "List View",
      mapView: "Map View",
      connect: "Connect",
      viewProfile: "View Profile",
      noRecent: "No recent facilities found.",
      searchPrompt: "Search a city to load nearby facilities.",
    },
    map: {
      yourLocation: "Your location",
      autoCentered: "Auto-centered",
      connect: "Connect",
      whatsapp: "WhatsApp",
      facility: "Facility",
      close: "Close",
    },
    history: {
      title: "My Products / History",
      empty: "No products analyzed yet.",
      purpose: "Purpose",
      value: "Detected value",
      uploaded: "Uploaded",
      ecoScore: "Eco Score",
      aiTip: "AI Tip",
      prevAnalysis: "Your Previous Analysis",
    },
    impact: {
      title: "Your Impact",
      products: "Products analyzed",
      waste: "Waste reduced",
      co2: "CO₂ reduced",
    },
    hero: {
      tag: "AI Powered",
      title: "Circular Economy Marketplace",
      subtitle: "Reduce waste. Reuse smartly. Build a zero-waste future.",
      ecoScore: "Eco Score",
      reuse: "Reuse Potential",
      demand: "Market Demand",
    },
    life: {
      title: "Life Cycle",
      descriptionRepair: "Review damage impact from AI analysis.",
      descriptionDefault: "Predict remaining lifespan based on AI analysis.",
      predict: "Predict",
    },
    pricing: {
      title: "Fair Price",
      demandRepair: "Estimated repair cost",
      demandRecycle: "Estimated recycling value",
      demandSell: "Resale price",
      calculate: "Calculate",
    },
    notifications: {
      save: "सेव करें",
      saveDetails: "विवरण सेव करें",
      requiredFields: "कृपया आवश्यक फ़ील्ड भरें:",
      markAll: "Mark all read",
      empty: "No responses yet.",
      markRead: "Mark read",
    },
    user: {
      verified: "✅ Verified User",
      incomplete: "❌ Profile Incomplete",
    },
    profile: {
      title: "Profile",
      subtitle: "Manage your marketplace details.",
      fullName: "Full Name",
      email: "Email (read-only)",
      phone: "Phone Number",
      address: "Address",
      about: "About Me",
      aboutPlaceholder: "Tell us about your business or products.",
      completed: "Profile Completed 100%",
      incomplete: "Profile Incomplete",
      badgeVerified: "Verified",
      badgeIncomplete: "Incomplete",
      edit: "Edit Profile",
      save: "Save",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updatePassword: "Update Password",
      passwordUpdated: "Password updated successfully.",
      passwordMismatch: "New password and confirm password do not match.",
      passwordRequired: "Please fill all password fields.",
    },
    safety: {
      title: "Safety & Trust",
      note: "Manage your local demo data and sessions.",
      clear: "Clear My Data",
    },
    modals: {
      prefilled: "Pre-filled Message",
      sendMessage: "Send Message",
      rateService: "Rate Service",
      shareExperience: "Share your experience with",
      thisShop: "this shop",
      submitReview: "Submit Review",
      noReviews: "No reviews yet.",
      reviewPlaceholder: "Write a short review...",
      averageRating: "Average Rating",
      totalReviews: "Total Reviews",
      noComments: "(No comments)",
      anonymous: "Anonymous",
    },
    footer: {
      privacyNote: "Your data is stored locally for demo purpose only.",
    },
  },
  hi: {
    nav: {
      dashboard: "डैशबोर्ड",
      overview: "ओवरव्यू",
      upload: "अपलोड",
      life: "लाइफ साइकिल",
      pricing: "प्राइसिंग",
      facilities: "सुविधाएं",
    },
    stats: {
      uploadedProduct: "अपलोडेड उत्पाद",
      currentCondition: "वर्तमान स्थिति",
      remainingLife: "शेष जीवन",
      estPrice: "अनुमानित मूल्य",
    },
    header: {
      title: "डैशबोर्ड",
      welcome: "वापसी पर स्वागत है, अपने सर्कुलर इकॉनमी कार्य पूरे करें।",
      dashboardBtn: "डैशबोर्ड",
      searchPlaceholder: "खोजें...",
    },
    actions: {
      logout: "लॉगआउट",
      profile: "प्रोफ़ाइल",
    },
    success: {
      requestSent: "अनुरोध सफलतापूर्वक भेजा गया!",
    },
    flow: {
      upload: "उत्पाद अपलोड करें",
      purpose: "उद्देश्य चुनें",
      analysis: "AI विश्लेषण",
      price: "मूल्य और वैल्यू",
      connect: "सुविधा से जुड़ें",
    },
    upload: {
      title: "उत्पाद अपलोड करें",
      dragTitle: "यहां क्लिक करें या इमेज ड्रैग करें",
      dragHint: "PNG, JPG, या WEBP 10MB तक",
      changeImage: "इमेज बदलें",
      productType: "उत्पाद प्रकार",
      productPlaceholder: "उदा., लैपटॉप",
      purpose: "उद्देश्य",
      ageYears: "उम्र (वर्ष)",
      usageDuration: "उपयोग अवधि",
      years: "वर्ष",
      months: "महीने",
      days: "दिन",
      materialType: "सामग्री प्रकार",
      weight: "वजन (किग्रा)",
      weightPlaceholder: "उदा., 2.5",
      analyze: "विश्लेषण करें",
      analyzing: "AI उत्पाद की स्थिति का विश्लेषण कर रहा है...",
    },
    purpose: {
      sell: "बेचें",
      repair: "मरम्मत",
      recycle: "रीसायकल",
    },
    results: {
      condition: "स्थिति",
      remainingLife: "शेष जीवन",
      resalePrice: "पुनर्विक्रय मूल्य",
      damageLevel: "क्षति स्तर",
      repairCost: "मरम्मत लागत",
      material: "सामग्री",
      weight: "वजन",
      recyclingValue: "रीसायकल मूल्य",
      selectPurpose: "ऊपर चुनें",
    },
    eco: {
      label: "इको स्कोर",
      best: "पर्यावरण के लिए बेहतर 🌍",
      moderate: "मध्यम प्रभाव",
      low: "कम इको लाभ",
    },
    comparison: {
      title: "विकल्प तुलना",
      subtitle: "इस उत्पाद के लिए बेचें, मरम्मत, रीसायकल तुलना करें।",
      bestSell: "पर्यावरण के लिए सर्वश्रेष्ठ: बेचें (रीयूज़) ✅",
      bestRepair: "पर्यावरण के लिए सर्वश्रेष्ठ: मरम्मत ✅",
      bestRecycle: "पर्यावरण के लिए सर्वश्रेष्ठ: रीसायकल ✅",
      bestBadge: "सर्वश्रेष्ठ ✅",
    },
    ai: {
      title: "AI सिफारिश",
    },
    facilities: {
      recommended: "अनुशंसित सुविधाएं",
      nearby: "नजदीकी सुविधाएं",
      enterCity: "शहर लिखें...",
      listView: "लिस्ट व्यू",
      mapView: "मैप व्यू",
      connect: "कनेक्ट",
      viewProfile: "प्रोफ़ाइल देखें",
      noRecent: "हाल की सुविधाएं नहीं मिलीं।",
      searchPrompt: "नजदीकी सुविधाएं देखने के लिए शहर खोजें।",
    },
    map: {
      yourLocation: "आपका स्थान",
      autoCentered: "ऑटो-सेंटर",
      connect: "कनेक्ट",
      whatsapp: "व्हाट्सएप",
      facility: "सुविधा",
      close: "बंद करें",
    },
    history: {
      title: "मेरे उत्पाद / इतिहास",
      empty: "अभी तक कोई उत्पाद विश्लेषित नहीं।",
      purpose: "उद्देश्य",
      value: "मूल्य",
      uploaded: "अपलोड",
      ecoScore: "इको स्कोर",
      aiTip: "AI सुझाव",
      prevAnalysis: "आपका पिछला विश्लेषण",
    },
    impact: {
      title: "आपका प्रभाव",
      products: "विश्लेषित उत्पाद",
      waste: "कचरा कम",
      co2: "CO₂ कम",
    },
    hero: {
      tag: "AI संचालित",
      title: "सर्कुलर इकॉनमी मार्केटप्लेस",
      subtitle: "कचरा घटाएं। स्मार्ट री-यूज़ करें। शून्य-कचरा भविष्य बनाएं।",
      ecoScore: "इको स्कोर",
      reuse: "री-यूज़ क्षमता",
      demand: "मार्केट मांग",
    },
    life: {
      title: "लाइफ साइकिल",
      descriptionRepair: "AI विश्लेषण से क्षति प्रभाव देखें।",
      descriptionDefault: "AI विश्लेषण से शेष जीवन अनुमान करें।",
      predict: "अनुमान करें",
    },
    pricing: {
      title: "उचित मूल्य",
      demandRepair: "अनुमानित मरम्मत लागत",
      demandRecycle: "अनुमानित रीसायकल मूल्य",
      demandSell: "पुनर्विक्रय मूल्य",
      calculate: "गणना करें",
    },
    notifications: {
      title: "सूचनाएं",
      markAll: "सब पढ़ा हुआ",
      empty: "कोई प्रतिक्रिया नहीं।",
      markRead: "पढ़ा हुआ",
    },
    user: {
      verified: "✅ सत्यापित उपयोगकर्ता",
      incomplete: "❌ प्रोफ़ाइल अधूरी",
    },
    profile: {
      title: "प्रोफ़ाइल",
      subtitle: "अपने मार्केटप्लेस विवरण प्रबंधित करें।",
      fullName: "पूरा नाम",
      email: "ईमेल (रीड-ओनली)",
      phone: "फोन नंबर",
      address: "पता",
      about: "मेरे बारे में",
      aboutPlaceholder: "अपने व्यवसाय या उत्पादों के बारे में बताएं।",
      completed: "प्रोफ़ाइल पूर्ण 100%",
      incomplete: "प्रोफ़ाइल अधूरी",
      badgeVerified: "सत्यापित",
      badgeIncomplete: "अधूरी",
      edit: "प्रोफ़ाइल संपादित करें",
      save: "सेव करें",
      changePassword: "पासवर्ड बदलें",
      currentPassword: "वर्तमान पासवर्ड",
      newPassword: "नया पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      updatePassword: "पासवर्ड अपडेट करें",
      passwordUpdated: "पासवर्ड सफलतापूर्वक अपडेट हुआ।",
      passwordMismatch: "नया पासवर्ड और पुष्टि मेल नहीं खाते।",
      passwordRequired: "कृपया सभी पासवर्ड फ़ील्ड भरें।",
    },
    safety: {
      title: "सेफ्टी और ट्रस्ट",
      note: "अपने लोकल डेमो डेटा और सेशन प्रबंधित करें।",
      clear: "मेरा डेटा साफ करें",
    },
    modals: {
      prefilled: "पहले से भरा संदेश",
      sendMessage: "संदेश भेजें",
      rateService: "सेवा रेट करें",
      shareExperience: "अपने अनुभव साझा करें:",
      thisShop: "यह दुकान",
      submitReview: "रिव्यू सबमिट करें",
      noReviews: "अभी तक कोई रिव्यू नहीं।",
      reviewPlaceholder: "एक छोटा रिव्यू लिखें...",
      averageRating: "औसत रेटिंग",
      totalReviews: "कुल रिव्यू",
      noComments: "(कोई टिप्पणी नहीं)",
      anonymous: "अनाम",
    },
    footer: {
      privacyNote: "आपका डेटा केवल डेमो के लिए लोकल रूप से स्टोर होता है।",
    },
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function analyzeImageFeatures(imageSrc) {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const size = 200;
  canvas.width = size;
  canvas.height = size;

  if (!context) {
    return {
      brightness: 0.5,
      contrast: 0.5,
      sharpness: 0.5,
      edgeDensity: 0.5,
      damageScore: 50,
    };
  }

  context.drawImage(image, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);

  let totalBrightness = 0;
  let totalSquared = 0;
  let edgeSum = 0;
  const pixelCount = size * size;

  const gray = new Array(pixelCount);
  for (let i = 0; i < pixelCount; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const value = (r + g + b) / 3;
    gray[i] = value;
    totalBrightness += value;
  }

  const avgBrightness = totalBrightness / pixelCount;
  for (let i = 0; i < pixelCount; i += 1) {
    const diff = gray[i] - avgBrightness;
    totalSquared += diff * diff;
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const index = y * size + x;
      const right = gray[index + 1];
      const down = gray[index + size];
      const current = gray[index];
      edgeSum += Math.abs(current - right) + Math.abs(current - down);
    }
  }

  const brightness = avgBrightness / 255;
  const contrast = clamp(Math.sqrt(totalSquared / pixelCount) / 128, 0, 1);
  const edgeDensity = clamp(edgeSum / (pixelCount * 255 * 2), 0, 1);
  const sharpness = edgeDensity;
  const damageScore = clamp(
    Math.round((1 - brightness) * 40 + (1 - sharpness) * 40 + (1 - contrast) * 20),
    0,
    100
  );

  return {
    brightness,
    contrast,
    sharpness,
    edgeDensity,
    damageScore,
  };
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `img_${Math.abs(hash)}`;
}

function readImageCache() {
  try {
    const raw = localStorage.getItem("tscemImageCache");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writeImageCache(cache) {
  localStorage.setItem("tscemImageCache", JSON.stringify(cache));
}

function computeEcoScore({ purpose, condition, remainingLife }) {
  if (!purpose) return 0;

  const baseScore =
    purpose === "sell" ? 82 :
      purpose === "repair" ? 55 :
        purpose === "recycle" ? 25 : 0;

  const conditionBoost = condition === "Good" ? 8 : condition === "Medium" ? 0 : condition === "Poor" ? -8 : 0;
  const lifeBoost = clamp(Math.round(((Number(remainingLife || 0) - 50) / 5)), -10, 10);

  return clamp(Math.round(baseScore + conditionBoost + lifeBoost), 0, 100);
}

function computeCo2Saving(purpose, remainingLife) {
  const life = clamp(Number(remainingLife || 0), 0, 100);
  if (purpose === "sell") return (1.2 + (life / 100) * 1.3).toFixed(1);
  if (purpose === "repair") return (0.8 + (life / 100) * 0.7).toFixed(1);
  return (0.3 + (life / 100) * 0.5).toFixed(1);
}

function computeAiSuggestion({ purpose, condition, remainingLife, ecoScore }) {
  const life = clamp(Number(remainingLife || 0), 0, 100);
  let recommended = "recycle";

  if (condition === "Good") {
    recommended = "sell";
  } else if (condition === "Medium" && life > 40) {
    recommended = "repair";
  } else if (condition === "Poor" && life < 20) {
    recommended = "recycle";
  } else if (ecoScore >= 70) {
    recommended = "sell";
  } else if (ecoScore >= 40) {
    recommended = "repair";
  }

  const years = clamp(Math.max(1, Math.round(life / 40)), 1, 3);
  const co2 = computeCo2Saving(recommended, life);

  return {
    action: recommended,
    years,
    co2,
  };
}

function formatAiSuggestion({ action, years, co2 }, language) {
  const lang = language === "hi" ? "hi" : "en";
  if (!action || !years || !co2) return "";

  if (lang === "hi") {
    if (action === "sell") {
      return `यह उत्पाद पुन: उपयोग के लिए बेचा जा सकता है और लगभग ${years} वर्ष तक चल सकता है। इससे लगभग ${co2}kg CO₂ की बचत होती है।`;
    }
    if (action === "repair") {
      return `यह उत्पाद आसानी से मरम्मत किया जा सकता है और लगभग ${years} वर्ष तक चल सकता है। इससे लगभग ${co2}kg CO₂ की बचत होती है।`;
    }
    return `स्थिति के अनुसार इसे जिम्मेदारी से रीसायकल करें। इससे लगभग ${co2}kg CO₂ की बचत होती है।`;
  }

  const yearLabel = years === 1 ? "year" : "years";
  if (action === "sell") {
    return `This product can be reused via resale for about ${years} more ${yearLabel}. This saves ~${co2}kg CO₂.`;
  }
  if (action === "repair") {
    return `This product can be repaired easily and reused for about ${years} more ${yearLabel}. This saves ~${co2}kg CO₂.`;
  }
  return `Condition suggests responsible recycling to recover materials. This saves ~${co2}kg CO₂.`;
}

function generateFacilities(location, baseCoords) {
  const baseNames = [
    "GreenFix Repair Hub",
    "ReLoop Recycling",
    "Circular Buyers Collective",
    "EcoRevive Center",
    "SecondLife Exchange",
  ];

  const types = ["Repair Shop", "Recycling Center", "Buyer", "Second-hand Store", "Service Center"];
  const categories = ["repair", "recycling", "buyer", "second-hand", "service"];

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

  const offset = location.length % 5;
  const baseLat = baseCoords?.lat ?? DEFAULT_CITY.lat;
  const baseLng = baseCoords?.lng ?? DEFAULT_CITY.lng;

  return baseNames.map((name, index) => ({
    name: `${name} - ${location}`,
    distance: 2 + index + offset,
    type: types[index % types.length],
    category: categories[index % categories.length],
    phone: phoneNumbers[index],
    whatsapp: whatsappNumbers[index],
    whatsappLink: `https://wa.me/${whatsappNumbers[index]}`,
    latitude: baseLat + ((index + 1) * 0.004 + offset * 0.001) * (index % 2 === 0 ? 1 : -1),
    longitude: baseLng + ((index + 2) * 0.003 + offset * 0.001) * (index % 2 === 0 ? -1 : 1),
  }));
}

export default function DashboardPage() {
  const router = useRouter();

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    photo: "",
  });

  const [activeNav, setActiveNav] = useState("dashboard");
  const [productTypeInput, setProductTypeInput] = useState("");
  const [productImage, setProductImage] = useState("");
  const [imageHash, setImageHash] = useState("");
  const [purpose, setPurpose] = useState("");
  const [materialType, setMaterialType] = useState("metal");
  const [materialWeight, setMaterialWeight] = useState("");
  const [usageYears, setUsageYears] = useState("");
  const [usageMonths, setUsageMonths] = useState("");
  const [usageDays, setUsageDays] = useState("");
  const [usageMessage, setUsageMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const [condition, setCondition] = useState("-");
  const [score, setScore] = useState(0);
  const [remainingLife, setRemainingLife] = useState(0);
  const [price, setPrice] = useState(0);
  const [demand, setDemand] = useState("");
  const [damageLevel, setDamageLevel] = useState(0);
  const [repairCost, setRepairCost] = useState(0);
  const [recyclingValue, setRecyclingValue] = useState(0);
  const [ecoScore, setEcoScore] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [ecoScoreSell, setEcoScoreSell] = useState(0);
  const [ecoScoreRepair, setEcoScoreRepair] = useState(0);
  const [ecoScoreRecycle, setEcoScoreRecycle] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiSuggestionAction, setAiSuggestionAction] = useState("");
  const [aiSuggestionYears, setAiSuggestionYears] = useState(0);
  const [aiSuggestionCo2, setAiSuggestionCo2] = useState("");
  const [analysisReady, setAnalysisReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [lifeLoading, setLifeLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [location, setLocation] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_CITY);
  const [facilities, setFacilities] = useState([]);
  const [activeFacility, setActiveFacility] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimerRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(true);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");
  const [dataClearStatus, setDataClearStatus] = useState("");
  const [isProfileVerifiedOpen, setIsProfileVerifiedOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [flowStep, setFlowStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    about: "",
  });

  const profileCompletion = useMemo(() => {
    const requiredFields = [
      profileData.name,
      profileData.email,
      profileData.phone,
    ];
    const filled = requiredFields.filter((item) => String(item || "").trim().length > 0).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [profileData]);

  const resolvedProfile = useMemo(() => {
    const name = profileData.name || userProfile.name || "";
    const email = profileData.email || userProfile.email || "";
    const avatarName = encodeURIComponent(name || "User");
    const photo =
      userProfile.photo ||
      `https://ui-avatars.com/api/?name=${avatarName}&background=0D8ABC&color=fff`;
    return { name, email, photo };
  }, [profileData.name, profileData.email, userProfile.name, userProfile.email, userProfile.photo]);

  const profileInitials = useMemo(() => {
    const base = (resolvedProfile.name || "User").trim();
    const parts = base.split(" ").filter(Boolean);
    const initials = parts.slice(0, 2).map((item) => item[0]).join("");
    return (initials || "U").toUpperCase();
  }, [resolvedProfile.name]);

  const [reviews, setReviews] = useState([]);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);

  const [productHistory, setProductHistory] = useState([]);
  const [impactStats, setImpactStats] = useState({
    totalProducts: 0,
    wasteSaved: 0,
    co2Reduced: 0,
  });

  const [liveScore, setLiveScore] = useState(82);
  const [liveReuse, setLiveReuse] = useState(64);
  const [liveDemand] = useState("High");

  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profileBaselineRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_CITY);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          name: "Current Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUserLocation(DEFAULT_CITY);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("tscemTheme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("tscemLanguage");
    if (storedLanguage === "hi" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tscemTheme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("tscemLanguage", language);
  }, [language]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!aiSuggestionAction) return;
    const nextText = formatAiSuggestion({
      action: aiSuggestionAction,
      years: aiSuggestionYears,
      co2: aiSuggestionCo2,
    }, language);
    if (nextText) {
      setAiSuggestion(nextText);
    }
  }, [aiSuggestionAction, aiSuggestionYears, aiSuggestionCo2, language]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("tscemUser");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }

    const storedProfile = localStorage.getItem("tscemProfile");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
      setIsProfileEditing(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem("tscemUser");
        router.push("/login");
        return;
      }

      const nextProfile = {
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
      };
      localStorage.setItem("tscemUser", JSON.stringify(nextProfile));
      setUserProfile(nextProfile);

      setProfileData((prev) => {
        const merged = {
          ...prev,
          name: prev.name || nextProfile.name,
          email: prev.email || nextProfile.email,
        };
        localStorage.setItem("tscemProfile", JSON.stringify(merged));
        return merged;
      });
    });

    const scoreCycle = [82, 85, 88, 84, 90];
    const reuseCycle = [64, 66, 62, 68, 65];
    let index = 0;

    const intervalId = setInterval(() => {
      setLiveScore(scoreCycle[index % scoreCycle.length]);
      setLiveReuse(reuseCycle[index % reuseCycle.length]);
      index += 1;
    }, 3500);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!userProfile.name && !userProfile.email) return;
    setProfileData((prev) => {
      let updated = false;
      const next = { ...prev };
      if (!next.name && userProfile.name) {
        next.name = userProfile.name;
        updated = true;
      }
      if (!next.email && userProfile.email) {
        next.email = userProfile.email;
        updated = true;
      }
      if (updated) {
        localStorage.setItem("tscemProfile", JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, [userProfile]);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!isProfileMenuOpen) return;
      const target = event.target;
      if (profileMenuRef.current?.contains(target) || profileButtonRef.current?.contains(target)) {
        return;
      }
      setIsProfileMenuOpen(false);
      setIsPasswordOpen(false);
    }

    function handleEscape(event) {
      if (event.key !== "Escape") return;
      setIsProfileMenuOpen(false);
      setIsPasswordOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isProfileModalOpen) return;
    profileBaselineRef.current = { ...profileData };
    setProfileError("");
    setProfileStatus("");
  }, [isProfileModalOpen]);

  useEffect(() => {
    const stored = localStorage.getItem("tscemNotifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tscemNotifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const storedReviews = localStorage.getItem("tscemReviews");
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tscemReviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("tscemProductHistory");
    if (storedHistory) {
      setProductHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tscemProductHistory", JSON.stringify(productHistory));
  }, [productHistory]);

  function resetAnalysis() {
    setCondition("-");
    setScore(0);
    setRemainingLife(0);
    setPrice(0);
    setDemand("");
    setDamageLevel(0);
    setRepairCost(0);
    setRecyclingValue(0);
    setEcoScore(0);
    setSellPrice(0);
    setEcoScoreSell(0);
    setEcoScoreRepair(0);
    setEcoScoreRecycle(0);
    setAiSuggestion("");
    setAiSuggestionAction("");
    setAiSuggestionYears(0);
    setAiSuggestionCo2("");
    setUsageMessage("");
    setAnalysisReady(false);
  }

  useEffect(() => {
    if (!productImage) {
      setImageHash("");
      resetAnalysis();
      setPurpose("");
      setFlowStep(0);
      return;
    }

    const hash = hashString(productImage);
    setImageHash(hash);
    resetAnalysis();
    setUsageYears("");
    setUsageMonths("");
    setUsageDays("");
    setPurpose("");
    setFlowStep(1);
  }, [productImage]);

  useEffect(() => {
    if (imageHash) {
      resetAnalysis();
    }
  }, [usageYears, usageMonths, usageDays, purpose, materialType, materialWeight, imageHash]);

  const totalUsageDays = useMemo(() => {
    const years = Number(usageYears) || 0;
    const months = Number(usageMonths) || 0;
    const days = Number(usageDays) || 0;
    return years * 365 + months * 30 + days;
  }, [usageYears, usageMonths, usageDays]);

  const usageSummary = useMemo(() => {
    const years = Number(usageYears) || 0;
    const months = Number(usageMonths) || 0;
    const days = Number(usageDays) || 0;
    const breakdown = formatUsageBreakdown(years, months, days);
    return `Usage Duration: ${breakdown} (${totalUsageDays} days)`;
  }, [usageYears, usageMonths, usageDays, totalUsageDays]);

  const dashboardUsage = useMemo(() => {
    if (totalUsageDays <= 0) return "-";
    return `Usage: ${totalUsageDays} days`;
  }, [totalUsageDays]);

  const usageTier = useMemo(() => {
    if (totalUsageDays <= 180) return "low";
    if (totalUsageDays <= 720) return "medium";
    return "high";
  }, [totalUsageDays]);

  const impactTotals = useMemo(() => {
    let waste = 0;
    let co2 = 0;

    productHistory.forEach((item) => {
      if (item.purpose === "recycle") {
        waste += 2.4;
        co2 += 1.3;
      } else if (item.purpose === "repair") {
        waste += 1.6;
        co2 += 0.9;
      } else {
        waste += 0.9;
        co2 += 0.5;
      }
    });

    return {
      totalProducts: productHistory.length,
      wasteSaved: Number(waste.toFixed(1)),
      co2Reduced: Number(co2.toFixed(1)),
    };
  }, [productHistory]);

  useEffect(() => {
    const duration = 800;
    const start = Date.now();

    function tick() {
      const progress = Math.min(1, (Date.now() - start) / duration);
      setImpactStats({
        totalProducts: Math.round(impactTotals.totalProducts * progress),
        wasteSaved: Number((impactTotals.wasteSaved * progress).toFixed(1)),
        co2Reduced: Number((impactTotals.co2Reduced * progress).toFixed(1)),
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [impactTotals]);

  const t = translations[language] || translations.en;
  const flowSteps = useMemo(() => ([
    { id: 1, label: t.flow.upload },
    { id: 2, label: t.flow.purpose },
    { id: 3, label: t.flow.analysis },
    { id: 4, label: t.flow.price },
    { id: 5, label: t.flow.connect },
  ]), [t]);
  const dashboardCondition = condition && condition !== "-" ? `${t.stats.currentCondition}: ${condition}` : "-";
  const dashboardEcoScore = ecoScore ? `${ecoScore}/100` : "-";
  const dashboardLife = remainingLife ? `${t.stats.remainingLife}: ${remainingLife}%` : "-";
  const dashboardPrice = price ? `${t.stats.estPrice}: ₹${price}` : "-";
  const dashboardDemand = demand ? `Demand: ${demand}` : "-";

  const ecoLabel = useMemo(() => {
    if (!analysisReady) return "";
    if (ecoScore > 70) return t.eco.best;
    if (ecoScore >= 40) return t.eco.moderate;
    return t.eco.low;
  }, [analysisReady, ecoScore, t]);

  const ecoTone = useMemo(() => {
    if (ecoScore > 70) return "eco-high";
    if (ecoScore >= 40) return "eco-mid";
    return "eco-low";
  }, [ecoScore]);

  const comparisonOptions = useMemo(() => ([
    {
      key: "sell",
      icon: "ph:repeat-bold",
      value: sellPrice,
      ecoScore: ecoScoreSell,
      meta: "Reuse",
    },
    {
      key: "repair",
      icon: "ph:wrench-bold",
      value: repairCost,
      ecoScore: ecoScoreRepair,
      meta: "Repair",
    },
    {
      key: "recycle",
      icon: "ph:recycle-bold",
      value: recyclingValue,
      ecoScore: ecoScoreRecycle,
      meta: "Recycle",
    },
  ]), [sellPrice, repairCost, recyclingValue, ecoScoreSell, ecoScoreRepair, ecoScoreRecycle]);

  const bestEcoOption = useMemo(() => {
    if (!analysisReady) return null;
    return comparisonOptions.reduce((best, current) => {
      if (!best || current.ecoScore > best.ecoScore) return current;
      return best;
    }, null);
  }, [analysisReady, comparisonOptions]);

  const ecoRecommendation = useMemo(() => {
    if (!bestEcoOption) return "";
    if (bestEcoOption.key === "sell") return t.comparison.bestSell;
    if (bestEcoOption.key === "repair") return t.comparison.bestRepair;
    return t.comparison.bestRecycle;
  }, [bestEcoOption, t]);

  function scrollToSection(target) {
    setActiveNav(target);
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleFileSelection(file) {
    if (!file) {
      setProductImage("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file (JPG, PNG, WEBP).");
      setProductImage("");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProductImage(loadEvent.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    handleFileSelection(file);
    event.target.value = "";
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave() {
    setIsDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFileSelection(file);
  }

  function sanitizeUsageInput(value) {
    if (value === "") return "";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "";
    return String(Math.max(0, Math.floor(numeric)));
  }

  function formatUsageBreakdown(years, months, days) {
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);
    return parts.length ? parts.join(" ") : "0d";
  }

  async function handleAnalyze() {
    const ageValue = Math.max(0, Math.round(totalUsageDays / 365));
    if (!productImage) {
      alert("Please upload a product image before analyzing.");
      return;
    }

    if (!purpose) {
      alert("Please select a purpose before analyzing.");
      return;
    }

    if (!productTypeInput.trim()) {
      alert("Please fill product type before analyzing.");
      return;
    }

    if (totalUsageDays <= 0) {
      alert("Please enter product usage before analyzing.");
      return;
    }

    setFlowStep((prev) => (prev < 3 ? 3 : prev));

    if (purpose === "recycle" && (!materialWeight || Number(materialWeight) <= 0)) {
      alert("Please enter material weight for recycling analysis.");
      return;
    }

    setUploadLoading(true);
    setIsAnalyzing(true);

    const hash = imageHash || hashString(productImage);
    const cacheKey = `${hash}|purpose:${purpose}|usageDays:${totalUsageDays}|type:${productTypeInput.trim()}|material:${materialType}|weight:${materialWeight}`;
    const cache = readImageCache();
    const cachedResult = cache[cacheKey];

    if (cachedResult) {
      const fallbackSuggestion = computeAiSuggestion({
        purpose,
        condition: cachedResult.condition,
        remainingLife: cachedResult.remainingLife,
        ecoScore: cachedResult.ecoScore ?? 0,
      });
      const cachedSuggestion = cachedResult.aiSuggestionAction
        ? {
          action: cachedResult.aiSuggestionAction || fallbackSuggestion.action,
          years: cachedResult.aiSuggestionYears || fallbackSuggestion.years,
          co2: cachedResult.aiSuggestionCo2 || fallbackSuggestion.co2,
        }
        : fallbackSuggestion;
      const cachedSuggestionText = formatAiSuggestion(cachedSuggestion, language);
      const cachedSellPrice = cachedResult.sellPrice ?? cachedResult.price ?? 0;
      const cachedEcoScoreSell = cachedResult.ecoScoreSell ?? computeEcoScore({
        purpose: "sell",
        condition: cachedResult.condition,
        remainingLife: cachedResult.remainingLife,
      });
      const cachedEcoScoreRepair = cachedResult.ecoScoreRepair ?? computeEcoScore({
        purpose: "repair",
        condition: cachedResult.condition,
        remainingLife: cachedResult.remainingLife,
      });
      const cachedEcoScoreRecycle = cachedResult.ecoScoreRecycle ?? computeEcoScore({
        purpose: "recycle",
        condition: cachedResult.condition,
        remainingLife: cachedResult.remainingLife,
      });
      const cachedEcoScore = cachedResult.ecoScore ?? computeEcoScore({
        purpose,
        condition: cachedResult.condition,
        remainingLife: cachedResult.remainingLife,
      });
      setCondition(cachedResult.condition);
      setScore(cachedResult.score);
      setRemainingLife(cachedResult.remainingLife);
      setPrice(cachedResult.price);
      setDemand(cachedResult.demand);
      setDamageLevel(cachedResult.damageLevel || 0);
      setRepairCost(cachedResult.repairCost || 0);
      setRecyclingValue(cachedResult.recyclingValue || 0);
      setSellPrice(cachedSellPrice);
      setUsageMessage(cachedResult.usageMessage || "");
      setAiSuggestion(cachedSuggestionText || "");
      setAiSuggestionAction(cachedSuggestion.action || "");
      setAiSuggestionYears(cachedSuggestion.years || 0);
      setAiSuggestionCo2(cachedSuggestion.co2 || "");
      setEcoScoreSell(cachedEcoScoreSell);
      setEcoScoreRepair(cachedEcoScoreRepair);
      setEcoScoreRecycle(cachedEcoScoreRecycle);
      setEcoScore(cachedEcoScore);
      setAnalysisReady(true);
      setUploadLoading(false);
      setIsAnalyzing(false);
      return;
    }

    try {
      const features = await analyzeImageFeatures(productImage);
      const damageFactor = features.damageScore;
      const damageImpact = clamp(damageFactor * 0.6, 0, 60);
      const usageImpact = clamp((totalUsageDays / (365 * 5)) * 60, 0, 60);
      const remaining = clamp(Math.round(100 - (usageImpact + damageImpact)), 0, 100);

      const clearImage = features.brightness >= 0.55 && features.sharpness >= 0.25;
      const poorImage = features.brightness < 0.35 || features.sharpness < 0.15;
      const lowAge = ageValue <= 2;
      const highAge = ageValue >= 6;

      let nextCondition = "Medium";
      if (clearImage && lowAge) nextCondition = "Good";
      if (poorImage && highAge) nextCondition = "Poor";

      const conditionWeights = {
        Good: 1.0,
        Medium: 0.7,
        Poor: 0.4,
      };

      const basePrice = 12000;
      const usageMultiplier = usageTier === "low" ? 1.1 : usageTier === "medium" ? 1.0 : 0.85;
      const estimatedPrice = Math.round(
        basePrice * (remaining / 100) * conditionWeights[nextCondition] * usageMultiplier
      );

      const nextScore = clamp(Math.round(remaining - damageFactor * 0.2), 10, 98);
      const nextDamageLevel = clamp(Math.round(damageFactor), 0, 100);
      const repairFactor = 50;
      const estimatedRepairCost = Math.round(nextDamageLevel * repairFactor + totalUsageDays * 2);

      const scrapRates = {
        plastic: 15,
        metal: 80,
        glass: 12,
        "e-waste": 120,
      };
      const weightValue = Number(materialWeight || 0);
      const recycleMultiplier = usageTier === "low" ? 1.0 : usageTier === "medium" ? 0.9 : 0.8;
      const recyclingEstimate = Math.round(weightValue * scrapRates[materialType] * recycleMultiplier);

      let nextUsageMessage = "";
      if (purpose === "sell") {
        nextUsageMessage = usageTier === "low"
          ? "Low usage detected, resale value increased."
          : usageTier === "medium"
            ? "Medium usage detected, normal resale value."
            : "High usage detected, resale value reduced.";
      }
      if (purpose === "repair") {
        nextUsageMessage = usageTier === "high"
          ? "High usage detected, repair recommended."
          : usageTier === "medium"
            ? "Medium usage detected, standard repairs expected."
            : "Low usage detected, minor repairs expected.";
      }
      if (purpose === "recycle") {
        nextUsageMessage = usageTier === "high"
          ? "High usage detected, recycling value adjusted."
          : usageTier === "medium"
            ? "Medium usage detected, recycling value normal."
            : "Low usage detected, material value preserved.";
      }

      console.log("[AI] Image metrics", {
        brightness: features.brightness.toFixed(2),
        sharpness: features.sharpness.toFixed(2),
        contrast: features.contrast.toFixed(2),
        edgeDensity: features.edgeDensity.toFixed(2),
        damageScore: features.damageScore,
      });
      console.log("[AI] Factors", {
        usageImpact: usageImpact.toFixed(2),
        damageImpact: damageImpact.toFixed(2),
        remainingLife: remaining,
        condition: nextCondition,
        conditionWeight: conditionWeights[nextCondition],
        resalePrice: estimatedPrice,
        repairCost: estimatedRepairCost,
        recyclingValue: recyclingEstimate,
        usageMessage: nextUsageMessage,
      });

      const nextEcoScore = computeEcoScore({
        purpose,
        condition: nextCondition,
        remainingLife: remaining,
      });

      const nextSuggestion = computeAiSuggestion({
        purpose,
        condition: nextCondition,
        remainingLife: remaining,
        ecoScore: nextEcoScore,
      });
      const nextSuggestionText = formatAiSuggestion(nextSuggestion, language);

      const nextEcoScoreSell = computeEcoScore({
        purpose: "sell",
        condition: nextCondition,
        remainingLife: remaining,
      });
      const nextEcoScoreRepair = computeEcoScore({
        purpose: "repair",
        condition: nextCondition,
        remainingLife: remaining,
      });
      const nextEcoScoreRecycle = computeEcoScore({
        purpose: "recycle",
        condition: nextCondition,
        remainingLife: remaining,
      });

      const result = {
        condition: nextCondition,
        score: nextScore,
        remainingLife: remaining,
        price: estimatedPrice,
        sellPrice: estimatedPrice,
        demand: "",
        damageLevel: nextDamageLevel,
        repairCost: estimatedRepairCost,
        recyclingValue: recyclingEstimate,
        usageMessage: nextUsageMessage,
        ecoScore: nextEcoScore,
        ecoScoreSell: nextEcoScoreSell,
        ecoScoreRepair: nextEcoScoreRepair,
        ecoScoreRecycle: nextEcoScoreRecycle,
        aiSuggestion: nextSuggestionText,
        aiSuggestionAction: nextSuggestion.action,
        aiSuggestionYears: nextSuggestion.years,
        aiSuggestionCo2: nextSuggestion.co2,
      };

      const historyEntry = {
        id: `${hash}_${Date.now()}`,
        image: productImage,
        productName: productTypeInput.trim(),
        purpose,
        price: purpose === "repair" ? estimatedRepairCost : purpose === "recycle" ? recyclingEstimate : estimatedPrice,
        sellPrice: estimatedPrice,
        repairCost: estimatedRepairCost,
        recycleValue: recyclingEstimate,
        condition: nextCondition,
        ecoScore: nextEcoScore,
        ecoScoreSell: nextEcoScoreSell,
        ecoScoreRepair: nextEcoScoreRepair,
        ecoScoreRecycle: nextEcoScoreRecycle,
        aiSuggestion: nextSuggestionText,
        aiSuggestionAction: nextSuggestion.action,
        aiSuggestionYears: nextSuggestion.years,
        aiSuggestionCo2: nextSuggestion.co2,
        suggestion: nextUsageMessage || "Analysis complete.",
        date: new Date().toISOString(),
      };

      cache[cacheKey] = result;
      writeImageCache(cache);

      setProductHistory((prev) => [historyEntry, ...prev]);

      setCondition(result.condition);
      setScore(result.score);
      setRemainingLife(result.remainingLife);
      setPrice(result.price);
      setDemand(result.demand);
      setDamageLevel(result.damageLevel);
      setRepairCost(result.repairCost);
      setRecyclingValue(result.recyclingValue);
      setSellPrice(result.sellPrice);
      setUsageMessage(result.usageMessage);
      setAiSuggestion(result.aiSuggestion);
      setAiSuggestionAction(result.aiSuggestionAction);
      setAiSuggestionYears(result.aiSuggestionYears || 0);
      setAiSuggestionCo2(result.aiSuggestionCo2 || "");
      setEcoScoreSell(result.ecoScoreSell);
      setEcoScoreRepair(result.ecoScoreRepair);
      setEcoScoreRecycle(result.ecoScoreRecycle);
      setEcoScore(result.ecoScore);
      setAnalysisReady(true);
    } catch (error) {
      console.error("[AI] Image analysis failed", error);
      alert("Image analysis failed. Please try another image.");
    } finally {
      setUploadLoading(false);
      setIsAnalyzing(false);
    }
  }

  function handlePredictLife() {
    if (!remainingLife) {
      alert("Please analyze a product first.");
      return;
    }

    setLifeLoading(true);
    setTimeout(() => {
      setLifeLoading(false);
    }, 400);
  }

  function handleCalculatePrice() {
    if (!imageHash) {
      alert("Upload an image and analyze it first.");
      return;
    }

    if (!analysisReady) {
      alert("Analyze the product to generate results first.");
      return;
    }

    setFlowStep((prev) => (prev < 4 ? 4 : prev));

    setPriceLoading(true);
    setTimeout(() => {
      setPriceLoading(false);
    }, 300);
  }

  function handleFindFacilities() {
    if (!location.trim()) {
      alert("Please enter a location to find facilities.");
      return;
    }

    if (!purpose) {
      alert("Select a purpose to filter facilities.");
      return;
    }

    setGeoLoading(true);
    setFacilities([]);

    setTimeout(() => {
      const allFacilities = generateFacilities(location.trim(), userLocation);
      const filtered = allFacilities.filter((item) => {
        if (purpose === "sell") return item.category === "buyer" || item.category === "second-hand";
        if (purpose === "repair") return item.category === "repair" || item.category === "service";
        if (purpose === "recycle") return item.category === "recycling";
        return true;
      });
      setFacilities(filtered);
      setGeoLoading(false);
    }, 600);
  }

  function buildWhatsappMessage() {
    const name = productTypeInput || "Unknown product";
    const usageBreakdown = formatUsageBreakdown(
      Number(usageYears) || 0,
      Number(usageMonths) || 0,
      Number(usageDays) || 0
    );
    const usageLine = totalUsageDays > 0
      ? `${usageBreakdown} (${totalUsageDays} days)`
      : "Pending";
    const life = remainingLife ? `${remainingLife}%` : "Pending";
    const localScore = score ? `${score}/100` : "Pending";
    const localPrice = price ? `₹${price}` : "Pending";
    const buyerName = profileData.name || "Pending";
    const buyerEmail = profileData.email || "Pending";
    const buyerPhone = profileData.phone || "Pending";

    return `Hello, I want to connect regarding my product.\n\nProduct: ${name}\nUsage Duration: ${usageLine}\nCondition: ${condition}\nRemaining Life: ${life}\nSustainability Score: ${localScore}\nEstimated Price: ${localPrice}\n\nContact Details\nName: ${buyerName}\nEmail: ${buyerEmail}\nPhone: ${buyerPhone}\n\nPlease contact me for reuse/repair/recycling.`;
  }

  function openWhatsApp() {
    if (!activeFacility) return;
    const message = encodeURIComponent(buildWhatsappMessage());
    const link = `https://wa.me/${activeFacility.whatsapp}?text=${message}`;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function createNotificationPayload(facility) {
    const purposeLabel = purpose === "sell" ? "Sell" : purpose === "repair" ? "Repair" : "Recycle";
    const productSummary = `${productTypeInput || "Product"} • Usage ${totalUsageDays} days`;
    let message = "";

    if (purpose === "sell") {
      message = `Interested in buying your product. Estimated price: ₹${price || "-"}`;
    } else if (purpose === "repair") {
      message = `Ready to repair your product. Estimated cost: ₹${repairCost || "-"}`;
    } else {
      message = `Accepting product for recycling. Estimated value: ₹${recyclingValue || "-"}`;
    }

    return {
      id: `${Date.now()}_${facility.name.length}`,
      shopName: facility.name,
      purpose: purposeLabel,
      productSummary,
      message,
      timestamp: Date.now(),
      read: false,
    };
  }

  function getTransactionId(facility) {
    return `${facility.name}|${purpose}|${imageHash}|${totalUsageDays}`;
  }

  function hasReviewed(transactionId) {
    return reviews.some((item) => item.transactionId === transactionId);
  }

  function handleOpenRating(facility) {
    const transactionId = getTransactionId(facility);
    if (hasReviewed(transactionId)) {
      setRatingError("You already rated this transaction.");
      setTimeout(() => setRatingError(""), 2500);
      return;
    }

    setRatingValue(0);
    setRatingText("");
    setRatingError("");
    setRatingSuccess("");
    setCurrentTransaction({
      id: transactionId,
      shopName: facility.name,
      purpose,
      productSummary: `${productTypeInput || "Product"} • Usage ${totalUsageDays} days`,
      timestamp: Date.now(),
    });
    setIsRatingOpen(true);
  }

  function handleSubmitRating(event) {
    event.preventDefault();
    if (!currentTransaction) return;

    if (ratingValue <= 0) {
      setRatingError("Please select a rating before submitting.");
      return;
    }

    if (hasReviewed(currentTransaction.id)) {
      setRatingError("You already rated this transaction.");
      return;
    }

    const reviewEntry = {
      id: `${currentTransaction.id}_${Date.now()}`,
      transactionId: currentTransaction.id,
      userEmail: profileData.email || userProfile.email || "",
      shopName: currentTransaction.shopName,
      serviceType: currentTransaction.purpose,
      rating: ratingValue,
      reviewText: ratingText,
      date: new Date().toISOString(),
    };

    setReviews((prev) => [reviewEntry, ...prev]);
    setRatingSuccess("Review submitted successfully.");
    setTimeout(() => {
      setIsRatingOpen(false);
      setRatingSuccess("");
    }, 1200);
  }

  function openShopProfile(facility) {
    setShopProfile(facility);
  }

  function scheduleNotification(facility) {
    const delay = 5000 + (facility.name.length % 6) * 1000;
    setTimeout(() => {
      const notification = createNotificationPayload(facility);
      setNotifications((prev) => [notification, ...prev]);
    }, delay);
  }

  function handleSendMessage() {
    if (!activeFacility) return;
    if (flowStep < 4) {
      alert("Please complete analysis and pricing before connecting.");
      return;
    }
    openWhatsApp();
    scheduleNotification(activeFacility);
    triggerSuccessAnimation();
    setFlowStep(5);
    setCurrentTransaction({
      id: getTransactionId(activeFacility),
      shopName: activeFacility.name,
      purpose,
      productSummary: `${productTypeInput || "Product"} • Usage ${totalUsageDays} days`,
      timestamp: Date.now(),
    });
  }

  function handlePurposeSelect(nextPurpose) {
    setPurpose(nextPurpose);
    setFlowStep((prev) => (prev < 2 ? 2 : prev));
  }

  function handleConnectClick(facility) {
    if (flowStep < 4) {
      alert("Please complete analysis and pricing before connecting.");
      return;
    }
    setActiveFacility(facility);
    triggerSuccessAnimation();
    setFlowStep(5);
  }

  function triggerSuccessAnimation() {
    setShowSuccess(true);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  function markNotificationRead(id) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  async function handleLogout() {
    await signOut(auth);
    localStorage.removeItem("tscemUser");
    setUserProfile({ name: "", email: "", photo: "" });
    alert("You have been logged out successfully.");
    router.push("/login");
  }

  function toggleProfileMenu() {
    setIsNotifOpen(false);
    setIsProfileMenuOpen((prev) => {
      if (prev) {
        setIsPasswordOpen(false);
      }
      return !prev;
    });
  }

  function openProfileModal() {
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
    setIsPasswordOpen(false);
    if (profileCompletion < 100) {
      setIsProfileEditing(true);
    }
  }

  function closeProfileModal() {
    setIsProfileModalOpen(false);
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!passwordData.current || !passwordData.next || !passwordData.confirm) {
      setPasswordStatus({ type: "error", message: t.profile.passwordRequired });
      return;
    }
    if (passwordData.next !== passwordData.confirm) {
      setPasswordStatus({ type: "error", message: t.profile.passwordMismatch });
      return;
    }
    localStorage.setItem("tscemPassword", passwordData.next);
    setPasswordStatus({ type: "success", message: t.profile.passwordUpdated });
    setPasswordData({ current: "", next: "", confirm: "" });
    setTimeout(() => setPasswordStatus(null), 2500);
  }

  async function handleProfileMenuLogout() {
    setIsProfileMenuOpen(false);
    setIsPasswordOpen(false);
    await handleLogout();
  }

  function handleProfileSave(event) {
    event.preventDefault();
    if (missingProfileFields.length > 0) {
      setProfileError(`${t.profile.requiredFields} ${missingProfileFields.join(", ")}`);
      return;
    }
    localStorage.setItem("tscemProfile", JSON.stringify(profileData));
    profileBaselineRef.current = { ...profileData };
    setProfileStatus("");
    setProfileError("");
    setIsProfileEditing(false);
    setIsProfileVerifiedOpen(true);
    setTimeout(() => setIsProfileVerifiedOpen(false), 3000);
  }

  function handleClearData() {
    const confirmed = window.confirm("Are you sure you want to delete all your data?");
    if (!confirmed) return;

    localStorage.removeItem("tscemProfile");
    localStorage.removeItem("tscemImageCache");
    localStorage.removeItem("tscemNotifications");
    localStorage.removeItem("tscemReviews");
    localStorage.removeItem("tscemProductHistory");
    localStorage.removeItem("tscemUser");

    setProductHistory([]);
    setNotifications([]);
    setReviews([]);
    setFacilities([]);
    setActiveFacility(null);
    setShopProfile(null);
    setProductImage("");
    setImageHash("");
    setProductTypeInput("");
    setUsageYears("");
    setUsageMonths("");
    setUsageDays("");
    setMaterialWeight("");
    setMaterialType("metal");
    setPurpose("");
    setFlowStep(0);
    setFileError("");
    resetAnalysis();
    setProfileData({
      name: "",
      email: "",
      phone: "",
      address: "",
      about: "",
    });
    setIsProfileEditing(true);
    setProfileStatus("");
    setDataClearStatus("All demo data has been cleared.");
    setTimeout(() => setDataClearStatus(""), 2500);
  }

  const unreadCount = notifications.filter((item) => !item.read).length;
  const shopReviews = shopProfile
    ? reviews.filter((item) => item.shopName === shopProfile.name)
    : [];
  const shopAverage = shopReviews.length
    ? shopReviews.reduce((sum, item) => sum + item.rating, 0) / shopReviews.length
    : 0;
  const profileDisplayName = resolvedProfile.name || "Your Name";
  const profileDisplayEmail = resolvedProfile.email || "Add your email";
  const requiredProfileFields = useMemo(() => ({
    name: t.profile.fullName,
    email: t.profile.email,
    phone: t.profile.phone,
    address: t.profile.address,
    about: t.profile.about,
  }), [t.profile.fullName, t.profile.email, t.profile.phone, t.profile.address, t.profile.about]);
  const missingProfileFields = useMemo(() => {
    return Object.entries(requiredProfileFields)
      .filter(([key]) => !String(profileData[key] || "").trim())
      .map(([, label]) => label);
  }, [profileData, requiredProfileFields]);
  const isProfileDirty = useMemo(() => {
    const baseline = profileBaselineRef.current;
    if (!baseline) return false;
    const keys = ["name", "email", "phone", "address", "about"];
    return keys.some((key) => String(baseline[key] || "") !== String(profileData[key] || ""));
  }, [profileData]);

  return (
    <div className="dashboard-body">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">
            <iconify-icon icon="ph:recycle-bold" />
          </div>
          <span className="brand-name">SCEM</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeNav === "dashboard" ? "active" : ""}`} onClick={() => scrollToSection("dashboard")}>
            <iconify-icon icon="ph:squares-four-bold" />
            <span>{t.nav.dashboard}</span>
          </button>
          <button className={`nav-btn ${activeNav === "landing" ? "active" : ""}`} onClick={() => scrollToSection("landing")}>
            <iconify-icon icon="ph:house-bold" />
            <span>{t.nav.overview}</span>
          </button>
          <button className={`nav-btn ${activeNav === "upload" ? "active" : ""}`} onClick={() => scrollToSection("upload")}>
            <iconify-icon icon="ph:upload-simple-bold" />
            <span>{t.nav.upload}</span>
          </button>
          <button className={`nav-btn ${activeNav === "life" ? "active" : ""}`} onClick={() => scrollToSection("life")}>
            <iconify-icon icon="ph:chart-line-up-bold" />
            <span>{t.nav.life}</span>
          </button>
          <button className={`nav-btn ${activeNav === "pricing" ? "active" : ""}`} onClick={() => scrollToSection("pricing")}>
            <iconify-icon icon="ph:currency-dollar-bold" />
            <span>{t.nav.pricing}</span>
          </button>
          <button className={`nav-btn ${activeNav === "geo" ? "active" : ""}`} onClick={() => scrollToSection("geo")}>
            <iconify-icon icon="ph:map-pin-bold" />
            <span>{t.nav.facilities}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-profile">
              <div className="avatar">
                {userProfile.name ? userProfile.name.slice(0, 2).toUpperCase() : "DK"}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {userProfile.name || "Dev Kulshrestha"}
                  {profileCompletion === 100 ? (
                    <span className="verified-badge">{t.user.verified}</span>
                  ) : null}
                </span>
                <span className="user-role">
                  {userProfile.email || "Admin"}
                  {profileCompletion < 100 ? (
                    <span className="incomplete-badge">{t.user.incomplete}</span>
                  ) : null}
                </span>
              </div>
            </div>
            <button className="logout-btn" title={t.actions.logout} onClick={handleLogout}>
              <iconify-icon icon="ph:sign-out-bold" />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <div className="flow-steps">
          {flowSteps.map((step) => {
            const isCompleted = flowStep > step.id;
            const isActive = flowStep === step.id;

            return (
              <div
                key={step.id}
                className={`flow-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
              >
                <div className="step-circle">
                  {isCompleted ? "✓" : step.id}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        <header className="top-header">
          <div className="header-welcome">
            <h1>{t.header.title}</h1>
            <p>{t.header.welcome}</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <iconify-icon icon="ph:magnifying-glass-bold" />
              <input type="text" placeholder={t.header.searchPlaceholder} />
            </div>
            <div className="lang-toggle" role="group" aria-label="Language">
              <button
                type="button"
                className={`lang-btn ${language === "hi" ? "active" : ""}`}
                onClick={() => setLanguage("hi")}
              >
                🇮🇳 Hindi
              </button>
              <button
                type="button"
                className={`lang-btn ${language === "en" ? "active" : ""}`}
                onClick={() => setLanguage("en")}
              >
                🇬🇧 English
              </button>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
            >
              <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
              <span className="theme-label">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <div className="profile-menu-wrapper" ref={profileMenuRef}>
              <button
                ref={profileButtonRef}
                type="button"
                className="icon-btn profile-btn"
                onClick={toggleProfileMenu}
                aria-label={t.actions.profile}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="dialog"
              >
                <iconify-icon icon="ph:user-circle-bold" />
              </button>
              {isProfileMenuOpen ? (
                <div className="profile-menu" role="dialog" aria-label={t.profile.title}>
                  <div className="profile-menu-header">
                    <div className="profile-menu-avatar">
                      <img src={resolvedProfile.photo} alt="Profile" />
                    </div>
                    <div className="profile-menu-meta">
                      <div className="profile-menu-name">{profileDisplayName}</div>
                      <div className="profile-menu-email">{profileDisplayEmail}</div>
                      <div className={`profile-menu-status ${profileCompletion === 100 ? "complete" : "incomplete"}`}>
                        {profileCompletion === 100 ? t.profile.completed : t.profile.incomplete}
                      </div>
                    </div>
                  </div>

                  <div className="profile-menu-actions">
                    <button type="button" className="profile-menu-btn" onClick={openProfileModal}>
                      {t.profile.edit}
                    </button>
                    <button
                      type="button"
                      className="profile-menu-btn"
                      onClick={() => setIsPasswordOpen((prev) => !prev)}
                    >
                      {t.profile.changePassword}
                    </button>
                    <button type="button" className="profile-menu-btn danger" onClick={handleProfileMenuLogout}>
                      {t.actions.logout}
                    </button>
                  </div>

                  {isPasswordOpen ? (
                    <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
                      <label>
                        {t.profile.currentPassword}
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(event) => {
                            setPasswordStatus(null);
                            setPasswordData((prev) => ({ ...prev, current: event.target.value }));
                          }}
                        />
                      </label>
                      <label>
                        {t.profile.newPassword}
                        <input
                          type="password"
                          value={passwordData.next}
                          onChange={(event) => {
                            setPasswordStatus(null);
                            setPasswordData((prev) => ({ ...prev, next: event.target.value }));
                          }}
                        />
                      </label>
                      <label>
                        {t.profile.confirmPassword}
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(event) => {
                            setPasswordStatus(null);
                            setPasswordData((prev) => ({ ...prev, confirm: event.target.value }));
                          }}
                        />
                      </label>
                      <div className="profile-password-actions">
                        <button type="submit" className="profile-menu-btn primary">
                          {t.profile.updatePassword}
                        </button>
                      </div>
                      {passwordStatus ? (
                        <div
                          className={`${passwordStatus.type === "success" ? "profile-success" : "profile-warning"} status-fade`}
                        >
                          {passwordStatus.message}
                        </div>
                      ) : null}
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="notification-wrapper">
              <button
                className="icon-btn notification-btn"
                onClick={() => setIsNotifOpen((prev) => !prev)}
              >
                <iconify-icon icon="ph:bell-bold" />
                {unreadCount > 0 ? (
                  <span className="badge-count">{unreadCount}</span>
                ) : null}
              </button>

              {isNotifOpen ? (
                <div className="notification-panel">
                  <div className="notification-header">
                    <span>{t.notifications.title}</span>
                    <button className="mark-read" onClick={markAllRead}>
                      {t.notifications.markAll}
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">{t.notifications.empty}</div>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.id} className={`notification-item ${item.read ? "read" : ""}`}>
                          <div>
                            <div className="notification-title">{item.shopName}</div>
                            <div className="notification-text">{item.message}</div>
                            <div className="notification-meta">
                              {item.purpose} • {item.productSummary} • {formatTime(item.timestamp)}
                            </div>
                          </div>
                          {!item.read ? (
                            <button className="mark-read" onClick={() => markNotificationRead(item.id)}>
                              {t.notifications.markRead}
                            </button>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="profile-pic">
              <img
                src={resolvedProfile.photo}
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <main className="content-area">
          <section id="dashboard" className="section dashboard-section">
            <div className="section-header">
              <h3>{t.nav.overview}</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="icon-box"><iconify-icon icon="ph:package-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">Uploaded Product</span>
                  <strong className="stat-value">{productTypeInput || "-"}</strong>
                  <span className="stat-meta">{dashboardUsage}</span>
                </div>
              </div>

              <div className="stat-card green">
                <div className="icon-box"><iconify-icon icon="ph:leaf-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">Eco Score</span>
                  <strong className="stat-value">{dashboardEcoScore}</strong>
                  <span className="stat-meta">{dashboardCondition}</span>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="icon-box"><iconify-icon icon="ph:chart-pie-slice-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">{t.stats.remainingLife}</span>
                  <strong className="stat-value">{dashboardLife}</strong>
                  <div className="progress-bar-container">
                    <div className="progress-fill" style={{ width: `${remainingLife || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="icon-box"><iconify-icon icon="ph:tag-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">{t.stats.estPrice}</span>
                  <strong className="stat-value">{dashboardPrice}</strong>
                  <span className="stat-meta">{dashboardDemand}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="card-panel full-width">
                <h4>{t.facilities.recommended}</h4>
                <div className="facility-list">
                  {facilities.length === 0 ? (
                    t.facilities.noRecent
                  ) : (
                    facilities.slice(0, 3).map((item) => (
                      <div className="facility-item" key={item.name}>
                        <div className="f-header">
                          <strong className="f-name">{item.name}</strong>
                          <span className="f-dist">{item.distance} km</span>
                        </div>
                        <span className="f-type">{item.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="history" className="section card-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:clock-counter-clockwise-bold" /> {t.history.title}</h3>
            </div>
            <div className="history-grid">
              {productHistory.length === 0 ? (
                <div className="notification-empty">{t.history.empty}</div>
              ) : (
                productHistory.map((item) => (
                  <div key={item.id} className="history-card">
                    <img src={item.image} alt={item.productName} />
                    <div className="history-info">
                      <h4>{item.productName}</h4>
                      <p className="history-meta">{t.history.purpose}: {t.purpose[item.purpose] || item.purpose}</p>
                      <p className="history-meta">{t.history.value}: ₹{item.price}</p>
                      <p className="history-meta">{t.history.ecoScore}: {item.ecoScore ? `${item.ecoScore}/100` : "-"} 🌱</p>
                      {item.aiSuggestion ? (
                        <p className="history-meta">
                          {t.history.aiTip}: {item.aiSuggestionAction && item.aiSuggestionYears && item.aiSuggestionCo2
                            ? formatAiSuggestion({
                              action: item.aiSuggestionAction,
                              years: item.aiSuggestionYears,
                              co2: item.aiSuggestionCo2,
                            }, language)
                            : item.aiSuggestion}
                        </p>
                      ) : null}
                      <p className="history-meta">{t.history.uploaded}: {new Date(item.date).toLocaleDateString()}</p>
                      <p className="history-note">{t.history.prevAnalysis}: {item.condition} • {item.suggestion}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="impact" className="section card-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:leaf-bold" /> {t.impact.title}</h3>
            </div>
            <div className="impact-grid">
              <div className="impact-card">
                <iconify-icon icon="ph:package-bold" />
                <div>
                  <strong>{impactStats.totalProducts}</strong>
                  <span>{t.impact.products}</span>
                </div>
              </div>
              <div className="impact-card">
                <iconify-icon icon="ph:leaf-bold" />
                <div>
                  <strong>{impactStats.wasteSaved} kg</strong>
                  <span>{t.impact.waste}</span>
                </div>
              </div>
              <div className="impact-card">
                <iconify-icon icon="ph:cloud-bold" />
                <div>
                  <strong>{impactStats.co2Reduced} kg</strong>
                  <span>{t.impact.co2}</span>
                </div>
              </div>
            </div>
          </section>

          <section id="landing" className="section hero-card">
            <div className="hero-content">
              <span className="tag">{t.hero.tag}</span>
              <h2>{t.hero.title}</h2>
              <p>{t.hero.subtitle}</p>
              <div className="hero-stats">
                <div className="mini-stat">
                  <span className="val">{liveScore}</span>
                  <span className="lbl">{t.hero.ecoScore}</span>
                </div>
                <div className="mini-stat">
                  <span className="val">{liveReuse}%</span>
                  <span className="lbl">{t.hero.reuse}</span>
                </div>
                <div className="mini-stat">
                  <span className="val">{liveDemand}</span>
                  <span className="lbl">{t.hero.demand}</span>
                </div>
              </div>
            </div>
            <div className="hero-illustration">
              <iconify-icon icon="solar:smart-home-angle-bold-duotone" style={{ fontSize: "180px", color: "var(--primary)", opacity: 0.8 }} />
            </div>
          </section>

          <div className="grid-layout">
            <section id="upload" className="section card-panel">
              <div className="panel-header">
                <h3><iconify-icon icon="ph:upload-simple-bold" /> {t.upload.title}</h3>
                <button className="more-btn"><iconify-icon icon="ph:dots-three-bold" /></button>
              </div>
              <div className="upload-container">
                <div className="upload-area">
                  <input
                    ref={fileInputRef}
                    id="productImageInput"
                    className="upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="productImageInput"
                    className={`upload-card ${isDragActive ? "drag" : ""} ${productImage ? "has-image" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {productImage ? (
                      <img className="upload-preview" src={productImage} alt="Uploaded product" />
                    ) : (
                      <div className="upload-content">
                        <iconify-icon icon="ph:cloud-arrow-up-bold" className="upload-icon" />
                        <span className="upload-title">{t.upload.dragTitle}</span>
                        <span className="upload-hint">{t.upload.dragHint}</span>
                      </div>
                    )}
                    {productImage ? (
                      <button
                        type="button"
                        className="change-btn"
                        onClick={(event) => {
                          event.preventDefault();
                          fileInputRef.current?.click();
                        }}
                      >
                        {t.upload.changeImage}
                      </button>
                    ) : null}
                  </label>
                  {fileError ? <p className="upload-error">{fileError}</p> : null}
                </div>
                <div className="form-group">
                  <div>
                    <label>{t.upload.productType}</label>
                    <input
                      type="text"
                      placeholder={t.upload.productPlaceholder}
                      value={productTypeInput}
                      onChange={(event) => setProductTypeInput(event.target.value)}
                    />
                  </div>

                  <div className="purpose-group">
                    <label>{t.upload.purpose}</label>
                    <div className="purpose-buttons">
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "sell" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("sell")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:repeat-bold" />
                        </span>
                        <span className="purpose-label">{t.purpose.sell}</span>
                      </button>
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "repair" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("repair")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:wrench-bold" />
                        </span>
                        <span className="purpose-label">{t.purpose.repair}</span>
                      </button>
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "recycle" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("recycle")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:recycle-bold" />
                        </span>
                        <span className="purpose-label">{t.purpose.recycle}</span>
                      </button>
                    </div>
                  </div>

                  {productImage ? (
                    <div className="usage-block">
                      <label>{t.upload.usageDuration}</label>
                      <div className="row usage-row">
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder={t.upload.years}
                            value={usageYears}
                            onChange={(event) => setUsageYears(sanitizeUsageInput(event.target.value))}
                          />
                        </div>
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder={t.upload.months}
                            value={usageMonths}
                            onChange={(event) => setUsageMonths(sanitizeUsageInput(event.target.value))}
                          />
                        </div>
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder={t.upload.days}
                            value={usageDays}
                            onChange={(event) => setUsageDays(sanitizeUsageInput(event.target.value))}
                          />
                        </div>
                      </div>
                      <div className="usage-summary">{usageSummary}</div>
                      {usageMessage ? (
                        <div className="usage-message">{usageMessage}</div>
                      ) : null}
                    </div>
                  ) : null}

                  {purpose === "recycle" ? (
                    <div className="row">
                      <div className="col">
                        <label>{t.upload.materialType}</label>
                        <select value={materialType} onChange={(event) => setMaterialType(event.target.value)}>
                          <option value="plastic">Plastic</option>
                          <option value="metal">Metal</option>
                          <option value="glass">Glass</option>
                          <option value="e-waste">E-Waste</option>
                        </select>
                      </div>
                      <div className="col">
                        <label>{t.upload.weight}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder={t.upload.weightPlaceholder}
                          value={materialWeight}
                          onChange={(event) => setMaterialWeight(event.target.value)}
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={handleAnalyze}
                    className="btn-primary full-width"
                    disabled={!productImage || !purpose || totalUsageDays <= 0}
                  >
                    <iconify-icon icon="ph:magic-wand-bold" /> {t.upload.analyze}
                  </button>
                  <div className={`loader ${uploadLoading ? "active" : ""}`} />

                  <div className={`results-summary ${analysisReady ? "show" : ""}`}>
                    {purpose === "sell" ? (
                      <>
                        <div className="res-item"><span>{t.results.condition}</span><strong>{condition}</strong></div>
                        <div className="res-item"><span>{t.results.remainingLife}</span><strong>{remainingLife ? `${remainingLife}%` : "-"}</strong></div>
                        <div className="res-item"><span>{t.results.resalePrice}</span><strong>{price ? `₹${price}` : "-"}</strong></div>
                      </>
                    ) : null}
                    {purpose === "repair" ? (
                      <>
                        <div className="res-item"><span>{t.results.damageLevel}</span><strong>{damageLevel ? `${damageLevel}/100` : "-"}</strong></div>
                        <div className="res-item"><span>{t.results.repairCost}</span><strong>{repairCost ? `₹${repairCost}` : "-"}</strong></div>
                        <div className="res-item"><span>{t.results.condition}</span><strong>{condition}</strong></div>
                      </>
                    ) : null}
                    {purpose === "recycle" ? (
                      <>
                        <div className="res-item"><span>{t.results.material}</span><strong>{materialType || "-"}</strong></div>
                        <div className="res-item"><span>{t.results.weight}</span><strong>{materialWeight ? `${materialWeight} kg` : "-"}</strong></div>
                        <div className="res-item"><span>{t.results.recyclingValue}</span><strong>{recyclingValue ? `₹${recyclingValue}` : "-"}</strong></div>
                      </>
                    ) : null}
                    {!purpose ? (
                      <div className="res-item"><span>{t.upload.purpose}</span><strong>{t.results.selectPurpose}</strong></div>
                    ) : null}
                  </div>

                  {analysisReady ? (
                    <div className={`eco-score-card ${ecoTone}`}>
                      <div className="eco-score-ring" style={{ "--eco-score": ecoScore }}>
                        <div className="eco-score-center">
                          <div className="eco-score-value">{ecoScore}</div>
                          <div className="eco-score-unit">/ 100</div>
                          <div className="eco-score-leaf">🌱</div>
                        </div>
                      </div>
                      <div className="eco-score-label">{t.eco.label}</div>
                      <div className="eco-score-note">{ecoLabel}</div>
                    </div>
                  ) : null}

                  {analysisReady ? (
                    <div className="comparison-panel">
                      <div className="comparison-header">
                        <div>
                          <h4>{t.comparison.title}</h4>
                          <p>{t.comparison.subtitle}</p>
                        </div>
                        {ecoRecommendation ? (
                          <div className="comparison-reco">
                            <iconify-icon icon="ph:leaf-bold" />
                            <span>{ecoRecommendation}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="comparison-grid">
                        {comparisonOptions.map((option) => {
                          const isBest = bestEcoOption?.key === option.key;
                          return (
                            <div key={option.key} className={`comparison-card ${isBest ? "best" : ""}`}>
                              <div className="comparison-title">
                                <iconify-icon icon={option.icon} />
                                <span>{t.purpose[option.key]}</span>
                              </div>
                              <div className="comparison-value">
                                {option.value ? `₹${option.value}` : "-"}
                              </div>
                              <div className="comparison-meta">{t.eco.label}: {option.ecoScore}/100</div>
                              {isBest ? (
                                <div className="comparison-badge">{t.comparison.bestBadge}</div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {analysisReady && aiSuggestion ? (
                    <div className="ai-suggestion-card">
                      <div className="ai-suggestion-header">
                        <iconify-icon icon="ph:robot-bold" />
                        <span>{t.ai.title}</span>
                      </div>
                      <p className="ai-suggestion-text">{aiSuggestion}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="vertical-stack">
              <section id="life" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:chart-line-up-bold" /> {t.life.title}</h3></div>
                <div className="panel-body">
                  <p className="desc-text">
                    {purpose === "repair" ? t.life.descriptionRepair : t.life.descriptionDefault}
                  </p>
                  <div className="progress-circle-wrap">
                    <div className="progress-bar-container">
                      <div className="progress-fill" style={{ width: `${purpose === "repair" ? damageLevel : remainingLife || 0}%` }} />
                    </div>
                    <div className="progress-text">
                      <span>{purpose === "repair" ? damageLevel : remainingLife || 0}%</span>
                      {purpose === "repair" ? " Damage" : " Remaining"}
                    </div>
                  </div>
                  <button onClick={handlePredictLife} className="btn-secondary full-width">{t.life.predict}</button>
                  <div className={`loader ${lifeLoading ? "active" : ""}`} />
                </div>
              </section>

              <section id="pricing" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:currency-dollar-bold" /> {t.pricing.title}</h3></div>
                <div className="panel-body">
                  <div className="price-display">
                    <span className="currency">₹</span>
                    <strong className="huge-text">
                      {purpose === "repair" ? (repairCost || "-") : purpose === "recycle" ? (recyclingValue || "-") : (price || "-")}
                    </strong>
                  </div>
                  <div className="demand-tag">
                    {purpose === "repair" ? t.pricing.demandRepair : purpose === "recycle" ? t.pricing.demandRecycle : price ? t.pricing.demandSell : ""}
                  </div>
                  <button onClick={handleCalculatePrice} className="btn-secondary full-width">{t.pricing.calculate}</button>
                  <div className={`loader ${priceLoading ? "active" : ""}`} />
                </div>
              </section>
            </div>
          </div>

          <section id="geo" className="section card-panel full-width-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:map-pin-bold" /> {t.facilities.nearby}</h3>
              <div className="geo-header-actions">
                <div className="geo-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${showMap ? "" : "active"}`}
                    onClick={() => setShowMap(false)}
                  >
                    {t.facilities.listView}
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${showMap ? "active" : ""}`}
                    onClick={() => setShowMap(true)}
                  >
                    {t.facilities.mapView}
                  </button>
                </div>
                <div className="search-inline">
                  <input
                    type="text"
                    placeholder={t.facilities.enterCity}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                  <button className="icon-only-btn" onClick={handleFindFacilities}>
                    <iconify-icon icon="ph:arrow-right-bold" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`loader ${geoLoading ? "active" : ""}`} />
            {showMap ? (
              facilities.length === 0 ? (
                <div className="notification-empty">{t.facilities.searchPrompt}</div>
              ) : (
                <MapView
                  facilities={facilities}
                  center={userLocation}
                  onConnect={handleConnectClick}
                  labels={t.map}
                />
              )
            ) : (
              <div className="geo-grid">
                {facilities.map((item) => (
                  <div className="facility-item" key={item.name}>
                    <div className="f-header">
                      <span className="f-name">{item.name}</span>
                      <span className="f-dist">{item.distance} km</span>
                    </div>
                    <span className="f-type">{item.type}</span>
                    <div className="facility-actions">
                      <button className="f-action" onClick={() => handleConnectClick(item)}>
                        {t.facilities.connect}
                      </button>
                      <button className="f-link" onClick={() => openShopProfile(item)}>
                        {t.facilities.viewProfile}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="main-footer">
          <p>© 2026 Smart Circular Economy Marketplace.</p>
          <div className="privacy-note">
            <span className="privacy-icon">🔒</span>
            <span>{t.footer.privacyNote}</span>
          </div>
        </footer>
      </div>

      <div className={`modal ${activeFacility ? "" : "hidden"}`} aria-hidden={!activeFacility}>
        <div className="modal-overlay" onClick={() => setActiveFacility(null)} />
        <div className="modal-card" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={() => setActiveFacility(null)}>
            ×
          </button>
          <div className="modal-header-icon">
            <iconify-icon icon="logos:whatsapp-icon" />
          </div>
          <h3>{activeFacility?.name || "Facility"}</h3>
          <p className="modal-sub">
            {activeFacility ? `${activeFacility.type} | ${activeFacility.distance} km away` : "-"}
          </p>

          <div className="contact-details">
            <div className="contact-row">
              <iconify-icon icon="ph:phone-bold" />
              <span>{activeFacility?.phone || "-"}</span>
            </div>
          </div>

          <div className="modal-message-box">
            <label>{t.modals.prefilled}</label>
            <div className="message-preview">{buildWhatsappMessage()}</div>
          </div>
          <button className="btn-primary full-width" onClick={handleSendMessage}>
            {t.modals.sendMessage}
          </button>
          {currentTransaction && activeFacility && currentTransaction.shopName === activeFacility.name ? (
            <button className="btn-secondary full-width" onClick={() => handleOpenRating(activeFacility)}>
              {t.modals.rateService}
            </button>
          ) : null}
        </div>
      </div>

      <div className={`modal ${isRatingOpen ? "" : "hidden"}`} aria-hidden={!isRatingOpen}>
        <div className="modal-overlay" onClick={() => setIsRatingOpen(false)} />
        <div className="modal-card rating-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={() => setIsRatingOpen(false)}>
            ×
          </button>
          <div className="modal-header-icon">
            <iconify-icon icon="ph:star-fill" />
          </div>
          <h3>{t.modals.rateService}</h3>
          <p className="modal-sub">{t.modals.shareExperience} {currentTransaction?.shopName || t.modals.thisShop}.</p>

          <form className="rating-form" onSubmit={handleSubmitRating}>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${ratingValue >= star ? "active" : ""}`}
                  onClick={() => setRatingValue(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows="3"
              placeholder={t.modals.reviewPlaceholder}
              value={ratingText}
              onChange={(event) => setRatingText(event.target.value)}
            />
            {ratingError ? <div className="rating-error">{ratingError}</div> : null}
            {ratingSuccess ? <div className="rating-success">{ratingSuccess}</div> : null}
            <button type="submit" className="btn-primary full-width">
              {t.modals.submitReview}
            </button>
          </form>
        </div>
      </div>

      <div className={`modal ${shopProfile ? "" : "hidden"}`} aria-hidden={!shopProfile}>
        <div className="modal-overlay" onClick={() => setShopProfile(null)} />
        <div className="modal-card shop-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={() => setShopProfile(null)}>
            ×
          </button>
          <div className="modal-header-icon">
            <iconify-icon icon="ph:storefront-bold" />
          </div>
          <h3>{shopProfile?.name || "Shop"}</h3>
          <p className="modal-sub">{shopProfile?.type || "Service"}</p>

          <div className="shop-rating">
            <div className="shop-score">
              <span className="score-value">{shopAverage ? shopAverage.toFixed(1) : "0.0"}</span>
              <span className="score-label">{t.modals.averageRating}</span>
            </div>
            <div className="shop-count">
              <span className="score-value">{shopReviews.length}</span>
              <span className="score-label">{t.modals.totalReviews}</span>
            </div>
          </div>

          <div className="review-list">
            {shopReviews.length === 0 ? (
              <div className="notification-empty">{t.modals.noReviews}</div>
            ) : (
              shopReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="review-text">{review.reviewText || t.modals.noComments}</div>
                  <div className="review-meta">{review.userEmail || t.modals.anonymous}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`modal ${isProfileModalOpen ? "" : "hidden"}`} aria-hidden={!isProfileModalOpen}>
        <div className="modal-overlay" onClick={closeProfileModal} />
        <div className="modal-card profile-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={closeProfileModal}>
            ×
          </button>
          <div className="modal-header-icon">
            <iconify-icon icon="ph:user-circle-bold" />
          </div>
          <h3>{t.profile.title}</h3>
          <p className="modal-sub">{t.profile.subtitle}</p>

          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="profile-card">
              <div className="profile-avatar">
                {resolvedProfile.photo ? (
                  <img src={resolvedProfile.photo} alt="Profile" />
                ) : (
                  profileInitials
                )}
              </div>
              <div>
                <div className="profile-title">
                  {profileData.name || "Your Profile"}
                </div>
                <div className="profile-sub">
                  {profileCompletion === 100 ? `✔ ${t.profile.completed}` : `❌ ${t.profile.incomplete}`}
                </div>
              </div>
              <span className={`profile-badge ${profileCompletion === 100 ? "verified" : "incomplete"}`}>
                {profileCompletion === 100 ? t.profile.badgeVerified : t.profile.badgeIncomplete}
              </span>
            </div>

            <div className="profile-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span>{profileCompletion}%</span>
            </div>

            <label>
              {t.profile.fullName}
              <input
                type="text"
                value={profileData.name}
                onChange={(event) => {
                  setProfileError("");
                  setProfileData((prev) => ({ ...prev, name: event.target.value }));
                }}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              {t.profile.email}
              <input type="email" value={profileData.email} readOnly />
            </label>
            <label>
              {t.profile.phone}
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={profileData.phone}
                onChange={(event) => {
                  setProfileError("");
                  setProfileData((prev) => ({ ...prev, phone: event.target.value }));
                }}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              {t.profile.address}
              <input
                type="text"
                placeholder="City, State"
                value={profileData.address}
                onChange={(event) => {
                  setProfileError("");
                  setProfileData((prev) => ({ ...prev, address: event.target.value }));
                }}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              {t.profile.about}
              <textarea
                rows="3"
                placeholder={t.profile.aboutPlaceholder}
                value={profileData.about}
                onChange={(event) => {
                  setProfileError("");
                  setProfileData((prev) => ({ ...prev, about: event.target.value }));
                }}
                readOnly={!isProfileEditing}
              />
            </label>

            {profileStatus ? <div className="profile-success status-fade">{profileStatus}</div> : null}
            {profileError ? <div className="profile-warning status-fade">{profileError}</div> : null}
            {dataClearStatus ? <div className="profile-warning status-fade">{dataClearStatus}</div> : null}

            <div className="safety-panel">
              <div className="safety-header">
                <iconify-icon icon="ph:shield-check-bold" />
                <span>{t.safety.title}</span>
              </div>
              <p className="safety-note">{t.safety.note}</p>
              <button
                type="button"
                className="btn-warning full-width"
                onClick={handleClearData}
              >
                {t.safety.clear}
              </button>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsProfileEditing(true)}
              >
                {t.profile.edit}
              </button>
              {isProfileEditing ? (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={missingProfileFields.length > 0}
                >
                  {t.profile.saveDetails}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className={`modal ${isProfileVerifiedOpen ? "" : "hidden"}`} aria-hidden={!isProfileVerifiedOpen}>
        <div className="modal-overlay" onClick={() => setIsProfileVerifiedOpen(false)} />
        <div className="modal-card profile-verified-modal" role="dialog" aria-modal="true">
          <button
            className="modal-close"
            aria-label="Close"
            onClick={() => setIsProfileVerifiedOpen(false)}
          >
            ×
          </button>
          <div className="verified-icon">✅</div>
          <h3>{t.profile.title}</h3>
          <p className="verified-message">{t.profile.verifiedPopup}</p>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="analyze-overlay" role="status" aria-live="polite">
          <div className="analyze-card">
            <div className="spinner-lg" />
            <p className="analyze-text">{t.upload.analyzing}</p>
          </div>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="success-toast" role="status" aria-live="polite">
          <div className="confetti">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={`confetti_${index}`} className={`confetti-piece confetti-${index + 1}`} />
            ))}
          </div>
          <div className="success-content">
            <div className="success-check">
              <span className="success-check-mark" />
            </div>
            <div className="success-text">🎉 {t.success.requestSent}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
