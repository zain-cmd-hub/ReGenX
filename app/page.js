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
  const [productAgeInput, setProductAgeInput] = useState("");
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

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(true);
  const [profileStatus, setProfileStatus] = useState("");
  const [dataClearStatus, setDataClearStatus] = useState("");
  const [flowStep, setFlowStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    about: "",
  });

  const profileCompletion = useMemo(() => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.address,
      profileData.about,
    ];
    const filled = fields.filter((item) => String(item || "").trim().length > 0).length;
    return Math.round((filled / 5) * 100);
  }, [profileData]);

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
  }, [productAgeInput, usageYears, usageMonths, usageDays, purpose, materialType, materialWeight, imageHash]);

  const dashboardAge = useMemo(() => {
    if (!productAgeInput) return "-";
    return `Age: ${productAgeInput} year(s)`;
  }, [productAgeInput]);

  const totalUsageDays = useMemo(() => {
    const years = Number(usageYears) || 0;
    const months = Number(usageMonths) || 0;
    const days = Number(usageDays) || 0;
    return years * 365 + months * 30 + days;
  }, [usageYears, usageMonths, usageDays]);

  const usageSummary = useMemo(() => {
    return `Total Usage: ${totalUsageDays} days`;
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

  const dashboardCondition = condition && condition !== "-" ? `Condition: ${condition}` : "-";
  const dashboardEcoScore = ecoScore ? `Eco: ${ecoScore}/100` : "-";
  const dashboardLife = remainingLife ? `Remaining life: ${remainingLife}%` : "-";
  const dashboardPrice = price ? `Estimated price: ₹${price}` : "-";
  const dashboardDemand = demand ? `Demand: ${demand}` : "-";

  const ecoLabel = useMemo(() => {
    if (!analysisReady) return "";
    if (ecoScore > 70) return "Best for environment";
    if (ecoScore >= 40) return "Moderate impact";
    return "Low environmental benefit";
  }, [analysisReady, ecoScore]);

  const ecoTone = useMemo(() => {
    if (ecoScore > 70) return "eco-high";
    if (ecoScore >= 40) return "eco-mid";
    return "eco-low";
  }, [ecoScore]);

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

  async function handleAnalyze() {
    const ageValue = Number(productAgeInput);
    if (!productImage) {
      alert("Please upload a product image before analyzing.");
      return;
    }

    if (!purpose) {
      alert("Please select a purpose before analyzing.");
      return;
    }

    if (!productTypeInput.trim() || Number.isNaN(ageValue)) {
      alert("Please fill product type and age before analyzing.");
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
    const cacheKey = `${hash}|purpose:${purpose}|age:${ageValue}|usageDays:${totalUsageDays}|type:${productTypeInput.trim()}|material:${materialType}|weight:${materialWeight}`;
    const cache = readImageCache();
    const cachedResult = cache[cacheKey];

    if (cachedResult) {
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
      setUsageMessage(cachedResult.usageMessage || "");
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

      const result = {
        condition: nextCondition,
        score: nextScore,
        remainingLife: remaining,
        price: estimatedPrice,
        demand: "",
        damageLevel: nextDamageLevel,
        repairCost: estimatedRepairCost,
        recyclingValue: recyclingEstimate,
        usageMessage: nextUsageMessage,
        ecoScore: nextEcoScore,
      };

      const historyEntry = {
        id: `${hash}_${Date.now()}`,
        image: productImage,
        productName: productTypeInput.trim(),
        purpose,
        price: purpose === "repair" ? estimatedRepairCost : purpose === "recycle" ? recyclingEstimate : estimatedPrice,
        condition: nextCondition,
        ecoScore: nextEcoScore,
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
      setUsageMessage(result.usageMessage);
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
    const age = productAgeInput ? `${productAgeInput} year(s)` : "Pending";
    const life = remainingLife ? `${remainingLife}%` : "Pending";
    const localScore = score ? `${score}/100` : "Pending";
    const localPrice = price ? `₹${price}` : "Pending";
    const buyerName = profileData.name || "Pending";
    const buyerEmail = profileData.email || "Pending";
    const buyerPhone = profileData.phone || "Pending";

    return `Hello, I want to connect regarding my product.\n\nProduct: ${name}\nAge: ${age}\nCondition: ${condition}\nRemaining Life: ${life}\nSustainability Score: ${localScore}\nEstimated Price: ${localPrice}\n\nContact Details\nName: ${buyerName}\nEmail: ${buyerEmail}\nPhone: ${buyerPhone}\n\nPlease contact me for reuse/repair/recycling.`;
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
    setFlowStep(5);
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

  function handleProfileSave(event) {
    event.preventDefault();
    localStorage.setItem("tscemProfile", JSON.stringify(profileData));
    setProfileStatus("Profile updated successfully");
    setIsProfileEditing(false);
    setTimeout(() => setProfileStatus(""), 2500);
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
    setProductAgeInput("");
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
  const flowSteps = [
    { id: 1, label: "Upload Product" },
    { id: 2, label: "Select Purpose" },
    { id: 3, label: "AI Analysis" },
    { id: 4, label: "Price & Value" },
    { id: 5, label: "Connect Facility" },
  ];

  const shopReviews = shopProfile
    ? reviews.filter((item) => item.shopName === shopProfile.name)
    : [];
  const shopAverage = shopReviews.length
    ? shopReviews.reduce((sum, item) => sum + item.rating, 0) / shopReviews.length
    : 0;

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
            <span>Dashboard</span>
          </button>
          <button className={`nav-btn ${activeNav === "landing" ? "active" : ""}`} onClick={() => scrollToSection("landing")}>
            <iconify-icon icon="ph:house-bold" />
            <span>Overview</span>
          </button>
          <button className={`nav-btn ${activeNav === "upload" ? "active" : ""}`} onClick={() => scrollToSection("upload")}>
            <iconify-icon icon="ph:upload-simple-bold" />
            <span>Upload</span>
          </button>
          <button className={`nav-btn ${activeNav === "life" ? "active" : ""}`} onClick={() => scrollToSection("life")}>
            <iconify-icon icon="ph:chart-line-up-bold" />
            <span>Life Cycle</span>
          </button>
          <button className={`nav-btn ${activeNav === "pricing" ? "active" : ""}`} onClick={() => scrollToSection("pricing")}>
            <iconify-icon icon="ph:currency-dollar-bold" />
            <span>Pricing</span>
          </button>
          <button className={`nav-btn ${activeNav === "geo" ? "active" : ""}`} onClick={() => scrollToSection("geo")}>
            <iconify-icon icon="ph:map-pin-bold" />
            <span>Facilities</span>
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
                    <span className="verified-badge">✅ Verified User</span>
                  ) : null}
                </span>
                <span className="user-role">
                  {userProfile.email || "Admin"}
                  {profileCompletion < 100 ? (
                    <span className="incomplete-badge">❌ Profile Incomplete</span>
                  ) : null}
                </span>
              </div>
            </div>
            <button className="logout-btn" title="Logout" onClick={handleLogout}>
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
            <h1>Dashboard</h1>
            <p>Welcome back, complete your circular economy tasks.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => scrollToSection("history")}>Dashboard</button>
            <div className="search-bar">
              <iconify-icon icon="ph:magnifying-glass-bold" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="icon-btn profile-btn" onClick={() => setIsProfileOpen(true)}>
              <iconify-icon icon="ph:user-circle-bold" />
            </button>

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
                    <span>Notifications</span>
                    <button className="mark-read" onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No responses yet.</div>
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
                              Mark read
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
                src={
                  userProfile.photo ||
                  "https://ui-avatars.com/api/?name=Dev+Kulshrestha&background=0D8ABC&color=fff"
                }
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <main className="content-area">
          <section id="dashboard" className="section dashboard-section">
            <div className="section-header">
              <h3>Overview</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="icon-box"><iconify-icon icon="ph:package-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">Uploaded Product</span>
                  <strong className="stat-value">{productTypeInput || "-"}</strong>
                  <span className="stat-meta">{dashboardAge}</span>
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
                  <span className="stat-label">Remaining Life</span>
                  <strong className="stat-value">{dashboardLife}</strong>
                  <div className="progress-bar-container">
                    <div className="progress-fill" style={{ width: `${remainingLife || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="icon-box"><iconify-icon icon="ph:tag-bold" /></div>
                <div className="stat-info">
                  <span className="stat-label">Est. Price</span>
                  <strong className="stat-value">{dashboardPrice}</strong>
                  <span className="stat-meta">{dashboardDemand}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="card-panel full-width">
                <h4>Recommended Facilities</h4>
                <div className="facility-list">
                  {facilities.length === 0 ? (
                    "No recent facilities found."
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
              <h3><iconify-icon icon="ph:clock-counter-clockwise-bold" /> My Products / History</h3>
            </div>
            <div className="history-grid">
              {productHistory.length === 0 ? (
                <div className="notification-empty">No products analyzed yet.</div>
              ) : (
                productHistory.map((item) => (
                  <div key={item.id} className="history-card">
                    <img src={item.image} alt={item.productName} />
                    <div className="history-info">
                      <h4>{item.productName}</h4>
                      <p className="history-meta">Purpose: {item.purpose}</p>
                      <p className="history-meta">Detected value: ₹{item.price}</p>
                      <p className="history-meta">Eco Score: {item.ecoScore ? `${item.ecoScore}/100` : "-"} 🌱</p>
                      <p className="history-meta">Uploaded: {new Date(item.date).toLocaleDateString()}</p>
                      <p className="history-note">Your Previous Analysis: {item.condition} • {item.suggestion}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="impact" className="section card-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:leaf-bold" /> Your Impact</h3>
            </div>
            <div className="impact-grid">
              <div className="impact-card">
                <iconify-icon icon="ph:package-bold" />
                <div>
                  <strong>{impactStats.totalProducts}</strong>
                  <span>Products analyzed</span>
                </div>
              </div>
              <div className="impact-card">
                <iconify-icon icon="ph:leaf-bold" />
                <div>
                  <strong>{impactStats.wasteSaved} kg</strong>
                  <span>Waste reduced</span>
                </div>
              </div>
              <div className="impact-card">
                <iconify-icon icon="ph:cloud-bold" />
                <div>
                  <strong>{impactStats.co2Reduced} kg</strong>
                  <span>CO₂ reduced</span>
                </div>
              </div>
            </div>
          </section>

          <section id="landing" className="section hero-card">
            <div className="hero-content">
              <span className="tag">AI Powered</span>
              <h2>Circular Economy Marketplace</h2>
              <p>Reduce waste. Reuse smartly. Build a zero-waste future.</p>
              <div className="hero-stats">
                <div className="mini-stat">
                  <span className="val">{liveScore}</span>
                  <span className="lbl">Eco Score</span>
                </div>
                <div className="mini-stat">
                  <span className="val">{liveReuse}%</span>
                  <span className="lbl">Reuse Potential</span>
                </div>
                <div className="mini-stat">
                  <span className="val">{liveDemand}</span>
                  <span className="lbl">Market Demand</span>
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
                <h3><iconify-icon icon="ph:upload-simple-bold" /> Upload Product</h3>
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
                        <span className="upload-title">Click or drag an image here</span>
                        <span className="upload-hint">PNG, JPG, or WEBP up to 10MB</span>
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
                        Change Image
                      </button>
                    ) : null}
                  </label>
                  {fileError ? <p className="upload-error">{fileError}</p> : null}
                </div>
                <div className="form-group">
                  <div>
                    <label>Product Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Laptop"
                      value={productTypeInput}
                      onChange={(event) => setProductTypeInput(event.target.value)}
                    />
                  </div>

                  <div className="purpose-group">
                    <label>Purpose</label>
                    <div className="purpose-buttons">
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "sell" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("sell")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:repeat-bold" />
                        </span>
                        <span className="purpose-label">Sell</span>
                      </button>
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "repair" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("repair")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:wrench-bold" />
                        </span>
                        <span className="purpose-label">Repair</span>
                      </button>
                      <button
                        type="button"
                        className={`purpose-btn ${purpose === "recycle" ? "active" : ""}`}
                        onClick={() => handlePurposeSelect("recycle")}
                      >
                        <span className="purpose-icon">
                          <iconify-icon icon="ph:recycle-bold" />
                        </span>
                        <span className="purpose-label">Recycle</span>
                      </button>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <label>Age (years)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        placeholder="0"
                        value={productAgeInput}
                        onChange={(event) => setProductAgeInput(event.target.value)}
                      />
                    </div>
                  </div>

                  {productImage ? (
                    <div className="usage-block">
                      <label>Usage Duration</label>
                      <div className="row usage-row">
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder="Years"
                            value={usageYears}
                            onChange={(event) => setUsageYears(event.target.value)}
                          />
                        </div>
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder="Months"
                            value={usageMonths}
                            onChange={(event) => setUsageMonths(event.target.value)}
                          />
                        </div>
                        <div className="col">
                          <input
                            type="number"
                            min="0"
                            placeholder="Days"
                            value={usageDays}
                            onChange={(event) => setUsageDays(event.target.value)}
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
                        <label>Material Type</label>
                        <select value={materialType} onChange={(event) => setMaterialType(event.target.value)}>
                          <option value="plastic">Plastic</option>
                          <option value="metal">Metal</option>
                          <option value="glass">Glass</option>
                          <option value="e-waste">E-Waste</option>
                        </select>
                      </div>
                      <div className="col">
                        <label>Weight (kg)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="e.g., 2.5"
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
                    <iconify-icon icon="ph:magic-wand-bold" /> Analyze
                  </button>
                  <div className={`loader ${uploadLoading ? "active" : ""}`} />

                  <div className={`results-summary ${analysisReady ? "show" : ""}`}>
                    {purpose === "sell" ? (
                      <>
                        <div className="res-item"><span>Condition</span><strong>{condition}</strong></div>
                        <div className="res-item"><span>Remaining Life</span><strong>{remainingLife ? `${remainingLife}%` : "-"}</strong></div>
                        <div className="res-item"><span>Resale Price</span><strong>{price ? `₹${price}` : "-"}</strong></div>
                      </>
                    ) : null}
                    {purpose === "repair" ? (
                      <>
                        <div className="res-item"><span>Damage Level</span><strong>{damageLevel ? `${damageLevel}/100` : "-"}</strong></div>
                        <div className="res-item"><span>Repair Cost</span><strong>{repairCost ? `₹${repairCost}` : "-"}</strong></div>
                        <div className="res-item"><span>Condition</span><strong>{condition}</strong></div>
                      </>
                    ) : null}
                    {purpose === "recycle" ? (
                      <>
                        <div className="res-item"><span>Material</span><strong>{materialType || "-"}</strong></div>
                        <div className="res-item"><span>Weight</span><strong>{materialWeight ? `${materialWeight} kg` : "-"}</strong></div>
                        <div className="res-item"><span>Recycling Value</span><strong>{recyclingValue ? `₹${recyclingValue}` : "-"}</strong></div>
                      </>
                    ) : null}
                    {analysisReady ? (
                      <div className={`res-item eco-card ${ecoTone}`}>
                        <span>Eco Score</span>
                        <div className="eco-ring" style={{ "--eco-score": ecoScore }}>
                          <div className="eco-value">{ecoScore}</div>
                          <div className="eco-unit">/ 100 🌱</div>
                        </div>
                        <div className="eco-note">{ecoLabel}</div>
                      </div>
                    ) : null}
                    {!purpose ? (
                      <div className="res-item"><span>Purpose</span><strong>Select above</strong></div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <div className="vertical-stack">
              <section id="life" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:chart-line-up-bold" /> Life Cycle</h3></div>
                <div className="panel-body">
                  <p className="desc-text">
                    {purpose === "repair" ? "Review damage impact from AI analysis." : "Predict remaining lifespan based on AI analysis."}
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
                  <button onClick={handlePredictLife} className="btn-secondary full-width">Predict</button>
                  <div className={`loader ${lifeLoading ? "active" : ""}`} />
                </div>
              </section>

              <section id="pricing" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:currency-dollar-bold" /> Fair Price</h3></div>
                <div className="panel-body">
                  <div className="price-display">
                    <span className="currency">₹</span>
                    <strong className="huge-text">
                      {purpose === "repair" ? (repairCost || "-") : purpose === "recycle" ? (recyclingValue || "-") : (price || "-")}
                    </strong>
                  </div>
                  <div className="demand-tag">
                    {purpose === "repair" ? "Estimated repair cost" : purpose === "recycle" ? "Estimated recycling value" : price ? "Resale price" : ""}
                  </div>
                  <button onClick={handleCalculatePrice} className="btn-secondary full-width">Calculate</button>
                  <div className={`loader ${priceLoading ? "active" : ""}`} />
                </div>
              </section>
            </div>
          </div>

          <section id="geo" className="section card-panel full-width-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:map-pin-bold" /> Nearby Facilities</h3>
              <div className="geo-header-actions">
                <div className="geo-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${showMap ? "" : "active"}`}
                    onClick={() => setShowMap(false)}
                  >
                    List View
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${showMap ? "active" : ""}`}
                    onClick={() => setShowMap(true)}
                  >
                    Map View
                  </button>
                </div>
                <div className="search-inline">
                  <input
                    type="text"
                    placeholder="Enter city..."
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
                <div className="notification-empty">Search a city to load nearby facilities.</div>
              ) : (
                <MapView
                  facilities={facilities}
                  center={userLocation}
                  onConnect={handleConnectClick}
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
                        Connect
                      </button>
                      <button className="f-link" onClick={() => openShopProfile(item)}>
                        View Profile
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
            <span>Your data is stored locally for demo purpose only.</span>
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
            <label>Pre-filled Message</label>
            <div className="message-preview">{buildWhatsappMessage()}</div>
          </div>
          <button className="btn-primary full-width" onClick={handleSendMessage}>
            Send Message
          </button>
          {currentTransaction && activeFacility && currentTransaction.shopName === activeFacility.name ? (
            <button className="btn-secondary full-width" onClick={() => handleOpenRating(activeFacility)}>
              Rate Service
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
          <h3>Rate Service</h3>
          <p className="modal-sub">Share your experience with {currentTransaction?.shopName || "this shop"}.</p>

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
              placeholder="Write a short review..."
              value={ratingText}
              onChange={(event) => setRatingText(event.target.value)}
            />
            {ratingError ? <div className="rating-error">{ratingError}</div> : null}
            {ratingSuccess ? <div className="rating-success">{ratingSuccess}</div> : null}
            <button type="submit" className="btn-primary full-width">
              Submit Review
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
              <span className="score-label">Average Rating</span>
            </div>
            <div className="shop-count">
              <span className="score-value">{shopReviews.length}</span>
              <span className="score-label">Total Reviews</span>
            </div>
          </div>

          <div className="review-list">
            {shopReviews.length === 0 ? (
              <div className="notification-empty">No reviews yet.</div>
            ) : (
              shopReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="review-text">{review.reviewText || "(No comments)"}</div>
                  <div className="review-meta">{review.userEmail || "Anonymous"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`modal ${isProfileOpen ? "" : "hidden"}`} aria-hidden={!isProfileOpen}>
        <div className="modal-overlay" onClick={() => setIsProfileOpen(false)} />
        <div className="modal-card profile-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={() => setIsProfileOpen(false)}>
            ×
          </button>
          <div className="modal-header-icon">
            <iconify-icon icon="ph:user-circle-bold" />
          </div>
          <h3>Profile</h3>
          <p className="modal-sub">Manage your marketplace details.</p>

          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="profile-card">
              <div className="profile-avatar">
                {profileData.name ? profileData.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div>
                <div className="profile-title">
                  {profileData.name || "Your Profile"}
                </div>
                <div className="profile-sub">
                  {profileCompletion === 100 ? "✔ Profile Completed 100%" : "❌ Profile Incomplete"}
                </div>
              </div>
              <span className={`profile-badge ${profileCompletion === 100 ? "verified" : "incomplete"}`}>
                {profileCompletion === 100 ? "Verified" : "Incomplete"}
              </span>
            </div>

            <div className="profile-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span>{profileCompletion}%</span>
            </div>

            <label>
              Full Name
              <input
                type="text"
                value={profileData.name}
                onChange={(event) => setProfileData((prev) => ({ ...prev, name: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              Email (read-only)
              <input type="email" value={profileData.email} readOnly />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={profileData.phone}
                onChange={(event) => setProfileData((prev) => ({ ...prev, phone: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              Address
              <input
                type="text"
                placeholder="City, State"
                value={profileData.address}
                onChange={(event) => setProfileData((prev) => ({ ...prev, address: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>
            <label>
              About Me
              <textarea
                rows="3"
                placeholder="Tell us about your business or products."
                value={profileData.about}
                onChange={(event) => setProfileData((prev) => ({ ...prev, about: event.target.value }))}
                readOnly={!isProfileEditing}
              />
            </label>

            {profileStatus ? <div className="profile-success status-fade">{profileStatus}</div> : null}
            {dataClearStatus ? <div className="profile-warning status-fade">{dataClearStatus}</div> : null}

            <div className="safety-panel">
              <div className="safety-header">
                <iconify-icon icon="ph:shield-check-bold" />
                <span>Safety & Trust</span>
              </div>
              <p className="safety-note">Manage your local demo data and sessions.</p>
              <button
                type="button"
                className="btn-warning full-width"
                onClick={handleClearData}
              >
                Clear My Data
              </button>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsProfileEditing(true)}
              >
                Edit Profile
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="analyze-overlay" role="status" aria-live="polite">
          <div className="analyze-card">
            <div className="spinner-lg" />
            <p className="analyze-text">AI is analyzing product condition...</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
