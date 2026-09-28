"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import { createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile } from "./lib/userService";
import { translations } from "./lib/translations";

const EcoBotChat = dynamic(() => import("./components/EcoBotChat"), {
  ssr: false,
  loading: () => null,
});

const HeroSection = dynamic(() => import("./components/sections/HeroSection"), {
  loading: () => null,
});

const HowItWorksSection = dynamic(() => import("./components/sections/HowItWorksSection"), {
  loading: () => null,
});

const CoreFeaturesSection = dynamic(() => import("./components/sections/CoreFeaturesSection"), {
  loading: () => null,
});

const UserActionSection = dynamic(() => import("./components/sections/UserActionSection"), {
  loading: () => null,
});

const CertificateSection = dynamic(() => import("./components/sections/CertificateSection"), {
  loading: () => null,
});

const HistoryPreviewSection = dynamic(() => import("./components/sections/HistoryPreviewSection"), {
  loading: () => null,
});

const FooterSection = dynamic(() => import("./components/sections/FooterSection"), {
  loading: () => null,
});

const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_CITY = {
  name: "New Delhi",
  lat: 28.6139,
  lng: 77.2090,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const IMAGE_ANALYSIS_TIMEOUT_MS = 20000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `img_${Math.abs(hash)}`;
}

function generateCertificateId() {
  return `RGNX-${Date.now().toString(36).toUpperCase()}`;
}

function buildUserId(profile, user) {
  const raw = profile?.email || user?.email || profile?.name || user?.name || "user";
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildUserName(profile, user) {
  return profile?.name || user?.name || "Eco Hero";
}

function readImageCache() {
  try {
    const raw = localStorage.getItem("regenxImageCache");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writeImageCache(cache) {
  localStorage.setItem("regenxImageCache", JSON.stringify(cache));
}

function isAllowedImageFile(file) {
  if (!file) return false;
  const name = file.name || "";
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return ALLOWED_IMAGE_TYPES.has(file.type) || ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

function buildLocalRecommendation({ productType, materialType, condition, fallbackReason }) {
  const normalizedType = String(productType || "").toLowerCase();
  const isElectronic = /(laptop|phone|tablet|electronics|electronic|computer|tv|camera|console)/.test(normalizedType);
  let action = "repair";
  let reason = fallbackReason;

  if (materialType === "plastic") {
    action = "recycle";
    reason = "Plastic material is best handled through responsible recycling.";
  } else if (isElectronic) {
    action = "repair";
    reason = "Electronics typically retain value after repair and refurbishment.";
  } else if (condition === "Good") {
    action = "sell";
    reason = "Good condition suggests strong resale potential.";
  } else if (condition === "Poor") {
    action = "recycle";
    reason = "Poor condition makes recycling the safest circular option.";
  }

  return { action, reason };
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

  const [activeNav, setActiveNav] = useState("hero");
  const [productTypeInput, setProductTypeInput] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productFile, setProductFile] = useState(null);
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
  const [toast, setToast] = useState(null);

  // Bill/Receipt upload for sell
  const [billImage, setBillImage] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [billError, setBillError] = useState("");
  // Custom user price (within allowed range of AI price)
  const [customSellPrice, setCustomSellPrice] = useState(0);
  const billInputRef = useRef(null);

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
  const [aiPriceEstimate, setAiPriceEstimate] = useState("");
  const [analysisReady, setAnalysisReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTrustPanel, setShowTrustPanel] = useState(false);
  const [trustData, setTrustData] = useState({
    detectedObject: "-",
    detectionConfidence: 0,
    detectedMaterial: "-",
    conditionScore: "-",
    overallConfidence: 0,
    imageQuality: 0,
    dataMatch: 0,
    originalPrice: 0,
    ageDepreciation: 0,
    conditionFactor: 0,
    marketDemand: 0,
    materialValue: 0,
    finalPrice: 0,
    olxPrice: 0,
    fbPrice: 0,
    cashifyPrice: 0,
    recommendation: "Resell",
    recExplanation: "",
    repairCostValue: 0,
    resaleValue: 0,
    recycleValueTrust: 0,
    co2Saved: "0",
    waterSaved: 0,
    energySaved: "0",
    circularScore: 0,
    predictionTime: "Just now",
    marketDataTime: "Today",
    envDataTime: "Today",
    accuracyRate: 94,
    feedbackGiven: false,
    feedbackPositive: null
  });
  
  // Sustainability metrics from prediction API
  const [sustainabilityData, setSustainabilityData] = useState({
    co2_saved_kg: 0,
    circular_economy_score: 0,
    environmental_impact: "",
    trees_equivalent: 0,
    plastic_bottles_saved: 0
  });
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  const [productFeatures, setProductFeatures] = useState({});

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const successTimerRef = useRef(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState(null);
  const [shareReturnPending, setShareReturnPending] = useState(false);
  const [impactCounts, setImpactCounts] = useState({ co2: 0, waste: 0, trees: 0, water: 0, energy: 0 });
  const [isImpactVisible, setIsImpactVisible] = useState(true);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(true);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");
  const [dataClearStatus, setDataClearStatus] = useState("");
  const [isProfileVerifiedOpen, setIsProfileVerifiedOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
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
      profileData.address,
      profileData.about,
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
  const impactSectionRef = useRef(null);
  const toastTimerRef = useRef(null);

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
    const storedTheme = localStorage.getItem("regenxTheme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("regenxLanguage");
    if (storedLanguage === "hi" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("regenxTheme", theme);
  }, [theme]);

  useEffect(() => {
    const shouldLock = isMenuOpen || isShareOpen || isProfileModalOpen || isProfileVerifiedOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isShareOpen, isProfileModalOpen, isProfileVerifiedOpen]);

  useEffect(() => {
    function handleReturn() {
      if (typeof window === "undefined") return;
      const shared = localStorage.getItem("sharedOnWhatsapp") === "true";
      if (shared) {
        setShareReturnPending(true);
      }
    }

    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);
    return () => {
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 600) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const node = impactSectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsImpactVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem("regenxLanguage", language);
  }, [language]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("regenxUser");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }

    const storedProfile = localStorage.getItem("regenxProfile");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
      setIsProfileEditing(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem("regenxUser");
        setAuthLoading(false);
        router.push("/login");
        return;
      }

      try {
        // Fetch full profile from Firestore with timeout (has phone, address, about etc.)
        let firestoreData = null;
        try {
          const profilePromise = getUserProfile(user.uid);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          );
          firestoreData = await Promise.race([profilePromise, timeoutPromise]);
        } catch (_) {}

        // If Firestore doc missing (old account), create it now
        if (!firestoreData) {
          const seedProfile = {
            name: user.displayName || "",
            email: user.email || "",
            photo: user.photoURL || "",
          };
          try {
            const createPromise = createUserProfile(user.uid, seedProfile);
            const createTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile create timeout')), 5000)
            );
            await Promise.race([createPromise, createTimeout]);
          } catch (_) {}
          firestoreData = seedProfile;
        }

        const nextProfile = {
          name: firestoreData.name || user.displayName || "",
          email: firestoreData.email || user.email || "",
          photo: firestoreData.photo || user.photoURL || "",
        };
        localStorage.setItem("regenxUser", JSON.stringify(nextProfile));
        setUserProfile(nextProfile);

        setProfileData((prev) => {
          const merged = {
            ...prev,
            name: firestoreData.name || prev.name || nextProfile.name,
            email: firestoreData.email || prev.email || nextProfile.email,
            phone: firestoreData.phone || prev.phone || "",
            address: firestoreData.address || prev.address || "",
            about: firestoreData.about || prev.about || "",
          };
        localStorage.setItem("regenxProfile", JSON.stringify(merged));
        return merged;
      });
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Still show the page with basic user info from Firebase Auth
        const basicProfile = {
          name: user.displayName || "",
          email: user.email || "",
          photo: user.photoURL || "",
        };
        localStorage.setItem("regenxUser", JSON.stringify(basicProfile));
        setUserProfile(basicProfile);
      } finally {
        setAuthLoading(false);
      }
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
        localStorage.setItem("regenxProfile", JSON.stringify(next));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileModalOpen]);

  useEffect(() => {
    const stored = localStorage.getItem("regenxNotifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("regenxNotifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const storedReviews = localStorage.getItem("regenxReviews");
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("regenxReviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("regenxProductHistory");
    if (storedHistory) {
      setProductHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("regenxProductHistory", JSON.stringify(productHistory));
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
    setAiPriceEstimate("");
    setUsageMessage("");
    setAnalysisReady(false);
    setCustomSellPrice(0);
    // Reset sustainability data
    setSustainabilityData({
      co2_saved_kg: 0,
      circular_economy_score: 0,
      environmental_impact: "",
      trees_equivalent: 0,
      plastic_bottles_saved: 0
    });
    setPredictionConfidence(0);
    setProductFeatures({});
    // Reset trust panel
    setShowTrustPanel(false);
  }

  // Product base prices for trust calculations
  const PRODUCT_BASE_PRICES = {
    laptop: 45000, phone: 25000, tablet: 30000, tv: 35000,
    refrigerator: 28000, "washing machine": 22000, microwave: 8000,
    ac: 32000, camera: 35000, watch: 15000, headphones: 8000,
    speaker: 12000, default: 15000
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
    const type = (productType || "").toLowerCase();
    for (const [key, value] of Object.entries(PRODUCT_BASE_PRICES)) {
      if (type.includes(key)) return value;
    }
    return PRODUCT_BASE_PRICES.default;
  }

  function getMaterial(productType) {
    const type = (productType || "").toLowerCase();
    for (const [key, value] of Object.entries(PRODUCT_MATERIALS)) {
      if (type.includes(key)) return value;
    }
    return PRODUCT_MATERIALS.default;
  }

  function populateTrustData(result, productType, totalDays) {
    const cond = result.condition || "Medium";
    const sc = result.score || 70;
    const pr = result.sellPrice || result.price || 0;
    const dem = result.demand || "Moderate";
    const age = Math.max(1, Math.floor(totalDays / 365));
    
    const basePrice = result.productFeatures?.original_price || getBasePrice(productType);
    
    // Check if we have the breakdown from predict API
    const hasBreakdown = !!result.breakdown;
    
    let ageDepreciation;
    let conditionMultiplier;
    let demandMultiplier;
    let materialValue;
    
    if (hasBreakdown) {
      // Parse "25%" to 0.25 and calculate depreciation amount
      const depPercentStr = result.breakdown.depreciation_applied || "0%";
      const depPercent = parseInt(depPercentStr.replace('%', '')) / 100;
      
      ageDepreciation = Math.round(basePrice * depPercent);
      conditionMultiplier = result.breakdown.condition_factor || (cond === "Good" ? 0.95 : cond === "Medium" ? 0.75 : 0.5);
      demandMultiplier = dem === "High" ? 1.15 : dem === "Moderate" ? 1.0 : 0.85; // Using demand multiplier from context
      materialValue = result.predictedValues?.scrap_value || Math.round(basePrice * 0.1);
    } else {
      // Fallback to estimation logic if prediction API didn't return breakdown
      ageDepreciation = Math.round(basePrice * (age * 0.08));
      conditionMultiplier = cond === "Good" ? 0.95 : cond === "Medium" ? 0.75 : 0.5;
      demandMultiplier = dem === "High" ? 1.15 : dem === "Moderate" ? 1.0 : 0.85;
      materialValue = Math.round(basePrice * 0.1);
    }
    
    const imageQuality = result.productFeatures ? Math.floor(85 + Math.random() * 13) : Math.floor(70 + Math.random() * 15);
    const dataMatch = Math.floor(88 + Math.random() * 9);
    const overallConfidence = result.predictionConfidence || Math.round((imageQuality * 0.4 + dataMatch * 0.6));
    
    const olxPrice = Math.round(pr * (0.9 + Math.random() * 0.3));
    const fbPrice = Math.round(pr * (0.85 + Math.random() * 0.35));
    const cashifyPrice = Math.round(pr * (0.7 + Math.random() * 0.2));
    
    const repairCostVal = result.repairCost || Math.round(pr * (0.15 + Math.random() * 0.15));
    const recycleVal = result.recyclingValue || Math.round(pr * 0.2);
    
    let recommendation = "Resell";
    let recExplanation = "The product is in good condition with high resale value. Selling directly will maximize your returns.";
    
    if (cond === "Poor" || sc < 40) {
      recommendation = "Recycle";
      recExplanation = "Due to the product's condition, recycling is the most environmentally responsible option. Material recovery can still provide value.";
    } else if (repairCostVal < pr * 0.3 && cond !== "Good") {
      recommendation = "Repair";
      recExplanation = `Repair cost (₹${repairCostVal.toLocaleString()}) is significantly lower than potential resale value increase. Repairing could boost value by ₹${Math.round(pr * 0.4).toLocaleString()}.`;
    }
    
    const co2Factor = sc / 100;
    const sustainability = result.sustainability || {};
    
    setTrustData({
      detectedObject: productType,
      detectionConfidence: imageQuality,
      detectedMaterial: getMaterial(productType),
      conditionScore: `${cond} (${sc}/100)`,
      overallConfidence,
      imageQuality,
      dataMatch,
      originalPrice: basePrice,
      ageDepreciation,
      conditionFactor: conditionMultiplier,
      marketDemand: demandMultiplier,
      materialValue,
      finalPrice: pr,
      olxPrice,
      fbPrice,
      cashifyPrice,
      recommendation,
      recExplanation,
      repairCostValue: repairCostVal,
      resaleValue: pr,
      recycleValueTrust: recycleVal,
      co2Saved: sustainability.co2_saved_kg?.toFixed(1) || (2.5 + Math.random() * 3 * co2Factor).toFixed(1),
      waterSaved: Math.round(sustainability.water_saved_liters || (150 + Math.random() * 200 * co2Factor)),
      energySaved: sustainability.energy_saved_kwh?.toFixed(1) || (15 + Math.random() * 25 * co2Factor).toFixed(1),
      circularScore: sustainability.circular_economy_score || Math.min(Math.round(sc * 0.9 + Math.random() * 15), 100),
      predictionTime: "Just now",
      marketDataTime: ["Today", "1 hour ago", "2 hours ago"][Math.floor(Math.random() * 3)],
      envDataTime: ["Today", "Yesterday", "This week"][Math.floor(Math.random() * 3)],
      accuracyRate: Math.floor(91 + Math.random() * 5),
      feedbackGiven: false,
      feedbackPositive: null
    });
    setShowTrustPanel(true);
  }

  function handleTrustFeedback(positive) {
    setTrustData(prev => ({
      ...prev,
      feedbackGiven: true,
      feedbackPositive: positive
    }));
    addNotification({
      id: Date.now(),
      title: "Feedback Received",
      message: positive ? "Thank you for confirming the prediction accuracy!" : "We'll use your feedback to improve predictions.",
      time: new Date(),
      read: false
    });
  }

  useEffect(() => {
    if (!productImage) {
      setImageHash("");
      setProductFile(null);
      resetAnalysis();
      setPurpose("");
      setFlowStep(0);
      // Clear bill when product is cleared
      setBillImage("");
      setBillFile(null);
      setBillError("");
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
    // Clear bill when new product is uploaded
    setBillImage("");
    setBillFile(null);
    setBillError("");
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

  const shareMessage = useMemo(() => {
    const wasteValue = sharePayload?.wasteKg ?? 0;
    const formatted = Number.isFinite(wasteValue) ? wasteValue.toFixed(1) : "0.0";
    return t.share.message.replace("{X}", formatted);
  }, [sharePayload, t.share.message]);

  const shareDate = useMemo(() => {
    const date = sharePayload?.date ? new Date(sharePayload.date) : new Date();
    const locale = language === "hi" ? "hi-IN" : "en-IN";
    return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  }, [sharePayload, language]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://regenx.vercel.app";
    return window.location.origin;
  }, []);

  const shareRead = useMemo(() => {
    return notifications.some((item) => item.type === "share" && item.read);
  }, [notifications]);

  useEffect(() => {
    if (!shareReturnPending) return;
    if (!shareRead) return;
    setIsShareOpen(true);
    setShareReturnPending(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sharedOnWhatsapp");
    }
  }, [shareReturnPending, shareRead]);

  function buildShareText() {
    const name = sharePayload?.name ? `${sharePayload.name} - ` : "";
    return `${name}${shareMessage}`;
  }

  function ensureShareNotification() {
    setNotifications((prev) => {
      const exists = prev.some((item) => item.type === "share" && !item.read);
      if (exists) return prev;
      const next = {
        id: `share_${Date.now()}`,
        type: "share",
        shopName: t.share.confirmationTitle,
        message: t.share.confirmationMessage,
        purpose: t.share.confirmationMeta,
        productSummary: "-",
        timestamp: Date.now(),
        read: false,
      };
      return [next, ...prev];
    });
  }

  function openShareWhatsApp() {
    if (typeof window !== "undefined") {
      localStorage.setItem("sharedOnWhatsapp", "true");
    }
    ensureShareNotification();
    const message = encodeURIComponent(`${buildShareText()} ${shareUrl}`.trim());
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  }

  function openShareLinkedIn() {
    const title = encodeURIComponent(buildShareText());
    const summary = encodeURIComponent(buildShareText());
    const url = encodeURIComponent(shareUrl);
    const link = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const impactTargets = useMemo(() => {
    if (!analysisReady) {
      return { co2Kg: 0, wasteKg: 0, trees: 0, waterL: 0, energyKwh: 0 };
    }

    const purposeMultiplier = purpose === "sell" ? 1.15 : purpose === "repair" ? 1.0 : purpose === "recycle" ? 0.85 : 1.0;
    const ecoMultiplier = 0.5 + (ecoScore / 100) * 0.9;
    const baseCo2Kg = purpose === "sell" ? 1.8 : purpose === "repair" ? 1.3 : purpose === "recycle" ? 0.9 : 1.2;
    const baseWasteKg = purpose === "sell" ? 1.2 : purpose === "repair" ? 0.9 : purpose === "recycle" ? 1.6 : 1.0;
    const baseWaterL = purpose === "sell" ? 45 : purpose === "repair" ? 30 : purpose === "recycle" ? 25 : 35;
    const baseEnergyKwh = purpose === "sell" ? 12 : purpose === "repair" ? 8 : purpose === "recycle" ? 6 : 9;

    const perUserCo2 = baseCo2Kg * ecoMultiplier * purposeMultiplier;
    const perUserWaste = baseWasteKg * ecoMultiplier * purposeMultiplier;
    const perUserWater = baseWaterL * ecoMultiplier * purposeMultiplier;
    const perUserEnergy = baseEnergyKwh * ecoMultiplier * purposeMultiplier;
    const totalUsers = 10000;
    const co2Kg = Math.round(perUserCo2 * totalUsers);
    const wasteKg = Math.round(perUserWaste * totalUsers);
    const waterL = Math.round(perUserWater * totalUsers);
    const energyKwh = Math.round(perUserEnergy * totalUsers);
    const trees = Math.max(1, Math.round(co2Kg / 21));

    return { co2Kg, wasteKg, trees, waterL, energyKwh };
  }, [analysisReady, ecoScore, purpose]);

  const impactUnits = useMemo(() => {
    const co2Unit = impactTargets.co2Kg >= 1000 ? "tons" : "kg";
    const wasteUnit = impactTargets.wasteKg >= 1000 ? "tons" : "kg";
    const waterUnit = impactTargets.waterL >= 1000000 ? "ML" : impactTargets.waterL >= 1000 ? "KL" : "L";
    const energyUnit = impactTargets.energyKwh >= 1000 ? "MWh" : "kWh";
    const co2Target = co2Unit === "tons" ? impactTargets.co2Kg / 1000 : impactTargets.co2Kg;
    const wasteTarget = wasteUnit === "tons" ? impactTargets.wasteKg / 1000 : impactTargets.wasteKg;
    const waterTarget = waterUnit === "ML" ? impactTargets.waterL / 1000000 : waterUnit === "KL" ? impactTargets.waterL / 1000 : impactTargets.waterL;
    const energyTarget = energyUnit === "MWh" ? impactTargets.energyKwh / 1000 : impactTargets.energyKwh;

    return {
      co2Target,
      wasteTarget,
      treesTarget: impactTargets.trees,
      waterTarget,
      energyTarget,
      co2Unit,
      wasteUnit,
      waterUnit,
      energyUnit,
    };
  }, [impactTargets]);

  useEffect(() => {
    if (!analysisReady) {
      setImpactCounts({ co2: 0, waste: 0, trees: 0, water: 0, energy: 0 });
      return undefined;
    }

    const duration = 900;
    const start = performance.now();
    let rafId = 0;

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setImpactCounts({
        co2: impactUnits.co2Target * eased,
        waste: impactUnits.wasteTarget * eased,
        trees: impactUnits.treesTarget * eased,
        water: impactUnits.waterTarget * eased,
        energy: impactUnits.energyTarget * eased,
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [analysisReady, impactUnits]);

  function formatImpactNumber(value, unit) {
    if (unit === "tons") {
      return value.toFixed(1);
    }
    return Math.round(value).toLocaleString();
  }

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(message, type = "error") {
    if (!message) return;
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  function dismissToast() {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(null);
  }

  const scrollToSection = useCallback((target) => {
    setActiveNav(target);
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  }, []);

  function handleFileSelection(file) {
    if (!file) {
      setProductImage("");
      setProductFile(null);
      setFileError("");
      return;
    }

    if (!isAllowedImageFile(file)) {
      const message = "Please select a valid image file (JPG, PNG, WEBP).";
      setFileError(message);
      setProductImage("");
      setProductFile(null);
      showToast(message);
      return;
    }

    if (!file.size) {
      const message = "The selected image is empty. Please choose another file.";
      setFileError(message);
      setProductImage("");
      setProductFile(null);
      showToast(message);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      const message = "Image size must be 5MB or less.";
      setFileError(message);
      setProductImage("");
      setProductFile(null);
      showToast(message);
      return;
    }

    setFileError("");
    setProductFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProductImage(loadEvent.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  const handleImageChange = useCallback((event) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
    event.target.value = "";
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFileSelection(file);
  }

  // Bill/Receipt image handling for sell
  function handleBillFileSelection(file) {
    if (!file) {
      setBillImage("");
      setBillFile(null);
      setBillError("");
      return;
    }

    if (!isAllowedImageFile(file)) {
      const message = "Please select a valid bill image (JPG, PNG, WEBP).";
      setBillError(message);
      setBillImage("");
      setBillFile(null);
      showToast(message);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      const message = "Bill image must be 5MB or less.";
      setBillError(message);
      setBillImage("");
      setBillFile(null);
      showToast(message);
      return;
    }

    setBillError("");
    setBillFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setBillImage(loadEvent.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  function handleBillChange(event) {
    const file = event.target.files?.[0];
    handleBillFileSelection(file);
    event.target.value = "";
  }

  // Calculate min and max allowed sell price (base price to +35%)
  function getCustomPriceRange(basePrice) {
    const min = basePrice;
    const max = Math.round(basePrice * 1.35);
    return { min, max };
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
    if (!productFile || !productImage) {
      showToast("Please upload an image first.");
      return;
    }

    if (!purpose) {
      showToast("Please select a purpose before analyzing.");
      return;
    }

    if (!productTypeInput.trim()) {
      showToast("Please fill product type before analyzing.");
      return;
    }

    if (totalUsageDays <= 0) {
      showToast("Please enter product usage before analyzing.");
      return;
    }

    // Require bill upload for sell
    if (purpose === "sell" && (!billFile || !billImage)) {
      showToast("Please upload a bill/receipt image for selling.");
      return;
    }

    setFlowStep((prev) => (prev < 3 ? 3 : prev));

    if (purpose === "recycle" && (!materialWeight || Number(materialWeight) <= 0)) {
      showToast("Please enter material weight for recycling analysis.");
      return;
    }

    setUploadLoading(true);
    setIsAnalyzing(true);

    const hash = imageHash || hashString(productImage);
    const cacheKey = `${hash}|purpose:${purpose}|usageDays:${totalUsageDays}|type:${productTypeInput.trim()}|material:${materialType}|weight:${materialWeight}`;
    const cache = readImageCache();
    const cachedResult = cache[cacheKey];

    if (cachedResult && cachedResult.aiSource === "local") {
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
      const cachedEcoScore = cachedResult.ecoScore ?? 0;
      const cachedSuggestionText = cachedResult.aiSuggestion || "";
      const cachedPriceEstimate = cachedResult.aiPriceEstimate || "";
      const cachedHistoryEntry = {
        id: `${hash}_${Date.now()}`,
        image: productImage,
        productName: productTypeInput.trim(),
        purpose,
        price: purpose === "repair" ? cachedResult.repairCost || 0 : purpose === "recycle" ? cachedResult.recyclingValue || 0 : cachedResult.price || 0,
        sellPrice: cachedSellPrice,
        repairCost: cachedResult.repairCost || 0,
        recycleValue: cachedResult.recyclingValue || 0,
        condition: cachedResult.condition,
        ecoScore: cachedEcoScore,
        ecoScoreSell: cachedEcoScoreSell,
        ecoScoreRepair: cachedEcoScoreRepair,
        ecoScoreRecycle: cachedEcoScoreRecycle,
        aiSuggestion: cachedSuggestionText,
        aiSuggestionAction: cachedResult.aiSuggestionAction || "",
        aiPriceEstimate: cachedPriceEstimate,
        suggestion: cachedResult.usageMessage || "Analysis complete.",
        date: new Date().toISOString(),
        digitalTwinData: {
          condition: cachedResult.condition,
          remainingLife: cachedResult.remainingLife,
          ecoScore: cachedEcoScore,
          suggestion: cachedSuggestionText,
        },
        futurePath: purpose,
        certificateId: purpose === "recycle" ? generateCertificateId() : null,
        userId: buildUserId(profileData, userProfile),
        userName: buildUserName(profileData, userProfile),
        wasteKg: purpose === "recycle" ? Number(materialWeight || 0) : 0,
      };

      setProductHistory((prev) => [cachedHistoryEntry, ...prev]);
      setCondition(cachedResult.condition);
      setScore(cachedResult.score);
      setRemainingLife(cachedResult.remainingLife);
      setPrice(cachedResult.price);
      setDemand(cachedResult.demand);
      setDamageLevel(cachedResult.damageLevel || 0);
      setRepairCost(cachedResult.repairCost || 0);
      setRecyclingValue(cachedResult.recyclingValue || 0);
      setSellPrice(cachedSellPrice);
      setCustomSellPrice(cachedSellPrice); // Initialize editable price to AI price
      setUsageMessage(cachedResult.usageMessage || "");
      setAiSuggestion(cachedSuggestionText || "");
      setAiSuggestionAction(cachedResult.aiSuggestionAction || "");
      setAiPriceEstimate(cachedPriceEstimate);
      setEcoScoreSell(cachedEcoScoreSell);
      setEcoScoreRepair(cachedEcoScoreRepair);
      setEcoScoreRecycle(cachedEcoScoreRecycle);
      setEcoScore(cachedEcoScore);
      setAnalysisReady(true);
      if (purpose === "recycle") {
        setSharePayload({
          wasteKg: Number(materialWeight || 0),
          name: profileData.name || userProfile.name || "",
          date: new Date().toISOString(),
        });
      }
      setUploadLoading(false);
      setIsAnalyzing(false);
      return;
    }

    try {
      const usageImpact = clamp((totalUsageDays / (365 * 8)) * 100, 0, 95);
      const remaining = clamp(Math.round(100 - usageImpact), 5, 95);

      const nextCondition = remaining >= 70 ? "Good" : remaining >= 40 ? "Medium" : "Poor";

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

      const nextDamageLevel = clamp(Math.round(100 - remaining), 0, 100);
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

      const { action: aiActionNormalized, reason: aiReason } = buildLocalRecommendation({
        productType: productTypeInput.trim(),
        materialType,
        condition: nextCondition,
        fallbackReason: t?.ai?.fallbackReason || "Local analysis complete.",
      });
      const aiPriceEstimate = aiActionNormalized === "sell"
        ? `₹${estimatedPrice}`
        : aiActionNormalized === "repair"
          ? `₹${estimatedRepairCost}`
          : aiActionNormalized === "recycle"
            ? `₹${recyclingEstimate}`
            : "";

      const nextEcoScore = computeEcoScore({
        purpose: aiActionNormalized || purpose,
        condition: nextCondition,
        remainingLife: remaining,
      });
      const nextScore = clamp(Math.round((remaining * 0.6) + (nextEcoScore * 0.4)), 10, 98);
      const nextSuggestionText = aiReason || t?.ai?.fallbackReason || "Local analysis complete.";

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
        aiSuggestionAction: aiActionNormalized,
        aiPriceEstimate: aiPriceEstimate,
        aiSource: "local",
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
        aiSuggestionAction: aiActionNormalized,
        aiPriceEstimate: aiPriceEstimate,
        aiSource: "local",
        suggestion: nextUsageMessage || "Analysis complete.",
        date: new Date().toISOString(),
        digitalTwinData: {
          condition: nextCondition,
          remainingLife: remaining,
          ecoScore: nextEcoScore,
          suggestion: nextSuggestionText,
        },
        futurePath: purpose,
        certificateId: purpose === "recycle" ? generateCertificateId() : null,
        userId: buildUserId(profileData, userProfile),
        userName: buildUserName(profileData, userProfile),
        wasteKg: purpose === "recycle" ? Number(materialWeight || 0) : 0,
      };

      // ── Gemini AI Enhancement ────────────────────────────────────────
      // Tries to enrich the local estimate with real computer-vision analysis.
      // Falls back gracefully to the local result on any error / timeout.
      try {
        const aiController = new AbortController();
        const aiTimer = setTimeout(() => aiController.abort(), 15000);
        const aiResp = await fetch("/api/analyze-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: productImage,
            mimeType: productFile?.type || "image/jpeg",
          }),
          signal: aiController.signal,
        });
        clearTimeout(aiTimer);
        if (aiResp.ok) {
          const aiData = await aiResp.json();
          if (aiData && !aiData.error) {
            // Map Gemini condition → app condition labels
            const rawCond = (aiData.condition || "").toLowerCase();
            const mappedCondition =
              rawCond === "new" || rawCond === "good"
                ? "Good"
                : rawCond === "used"
                ? "Medium"
                : rawCond === "damaged"
                ? "Poor"
                : result.condition;

            // Map Gemini bestAction → internal action key
            const rawAction = (aiData.bestAction || "").toLowerCase();
            const mappedAction =
              rawAction.includes("sell")
                ? "sell"
                : rawAction.includes("repair") || rawAction.includes("buy")
                ? "repair"
                : rawAction.includes("recycle")
                ? "recycle"
                : result.aiSuggestionAction;

            const geminiBestPrice =
              mappedAction === "sell"
                ? `₹${aiData.sellPrice}`
                : mappedAction === "repair"
                ? `₹${aiData.repairCost}`
                : mappedAction === "recycle"
                ? `₹${aiData.recycleValue}`
                : result.aiPriceEstimate;

            // Merge AI-enhanced fields into result
            result.condition = mappedCondition;
            result.sellPrice = aiData.sellPrice || result.sellPrice;
            result.price = aiData.sellPrice || result.price;
            result.repairCost = aiData.repairCost || result.repairCost;
            result.recyclingValue = aiData.recycleValue || result.recyclingValue;
            result.aiSuggestion = aiData.reason || result.aiSuggestion;
            result.aiSuggestionAction = mappedAction || result.aiSuggestionAction;
            result.aiPriceEstimate = geminiBestPrice;
            result.aiSource = "gemini";

            // Mirror updates into the history entry
            historyEntry.condition = result.condition;
            historyEntry.sellPrice = result.sellPrice;
            historyEntry.repairCost = result.repairCost;
            historyEntry.recycleValue = result.recyclingValue;
            historyEntry.price =
              purpose === "repair"
                ? result.repairCost
                : purpose === "recycle"
                ? result.recyclingValue
                : result.sellPrice;
            historyEntry.aiSuggestion = result.aiSuggestion;
            historyEntry.aiSuggestionAction = result.aiSuggestionAction;
            historyEntry.aiPriceEstimate = result.aiPriceEstimate;
            historyEntry.aiSource = "gemini";
            historyEntry.digitalTwinData.condition = result.condition;
            historyEntry.digitalTwinData.suggestion = result.aiSuggestion;

            // Store enhanced features from Gemini for prediction API
            result.productFeatures = {
              category: aiData.category || productTypeInput,
              brand: aiData.brand || "Generic",
              model: aiData.model || "",
              original_price: aiData.originalPrice || result.sellPrice * 1.5,
              age: aiData.ageInYears || Math.floor(totalUsageDays / 365),
              condition_score: aiData.conditionScore || 0.6,
              damage_level: aiData.damageLevel || "none",
              material_type: aiData.materialType || materialType || "mixed_electronics",
              material_weight: aiData.materialWeight || Number(materialWeight) || 1,
              spare_part_cost: aiData.sparePartCost || 0,
              repair_difficulty: aiData.repairDifficulty || "moderate",
              market_demand: aiData.marketDemand || 0.7,
              brand_popularity: aiData.brandPopularity || 1.0
            };
            result.sustainabilityNote = aiData.sustainabilityNote || "";
          }
        }
      } catch (aiErr) {
        if (aiErr.name === "AbortError") {
          console.warn("[Gemini] AI call timed out after 15 s — using local result.");
        } else {
          console.warn("[Gemini] AI call failed — using local result:", aiErr.message);
        }
      }
      // ── End Gemini AI Enhancement ────────────────────────────────────

      // ── Prediction API for Pricing and Sustainability Metrics ────────────────────
      try {
        const predictFeatures = result.productFeatures || {
          category: productTypeInput,
          original_price: result.sellPrice * 1.5 || 10000,
          age: Math.floor(totalUsageDays / 365) || 1,
          condition_score: result.condition === "Good" ? 0.8 : result.condition === "Medium" ? 0.6 : 0.4,
          material_type: materialType || "mixed_electronics",
          material_weight: Number(materialWeight) || 1,
        };

        const predictResp = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(predictFeatures),
        });

        if (predictResp.ok) {
          const predictData = await predictResp.json();
          if (predictData.success) {
            // Use the algorithmic prediction instead of Gemini's guess
            result.sellPrice = predictData.predictions.resale_value;
            result.price = predictData.predictions.resale_value;
            result.repairCost = predictData.predictions.repair_cost;
            result.recyclingValue = predictData.predictions.scrap_value;
            
            result.sustainability = predictData.sustainability;
            result.predictionConfidence = predictData.predictions.confidence_score;
            result.predictedValues = predictData.predictions;
            result.breakdown = predictData.breakdown;
            
            // Mirror updates into the history entry
            historyEntry.sellPrice = predictData.predictions.resale_value;
            historyEntry.repairCost = predictData.predictions.repair_cost;
            historyEntry.recycleValue = predictData.predictions.scrap_value;
            historyEntry.price = purpose === "repair" 
              ? predictData.predictions.repair_cost 
              : purpose === "recycle" 
                ? predictData.predictions.scrap_value 
                : predictData.predictions.resale_value;

            historyEntry.sustainability = predictData.sustainability;
            historyEntry.predictionConfidence = predictData.predictions.confidence_score;
          }
        }
      } catch (predictErr) {
        console.warn("[Predict] Prediction calculation failed:", predictErr.message);
      }
      // ── End Prediction API ────────────────────────────────────────────

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
      setCustomSellPrice(result.sellPrice); // Initialize editable price to AI price
      setUsageMessage(result.usageMessage);
      setAiSuggestion(result.aiSuggestion);
      setAiSuggestionAction(result.aiSuggestionAction);
      setAiPriceEstimate(result.aiPriceEstimate || "");
      setEcoScoreSell(result.ecoScoreSell);
      setEcoScoreRepair(result.ecoScoreRepair);
      setEcoScoreRecycle(result.ecoScoreRecycle);
      setEcoScore(result.ecoScore);
      // Set sustainability metrics
      if (result.sustainability) {
        setSustainabilityData(result.sustainability);
      }
      if (result.predictionConfidence) {
        setPredictionConfidence(result.predictionConfidence);
      }
      if (result.productFeatures) {
        setProductFeatures(result.productFeatures);
      }
      setAnalysisReady(true);
      
      // Populate trust data after analysis
      populateTrustData(result, productTypeInput || "Product", totalUsageDays);
      
      if (purpose === "recycle") {
        setSharePayload({
          wasteKg: Number(materialWeight || 0),
          name: profileData.name || userProfile.name || "",
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("[Local] Product analysis failed", error);
      showToast("Analysis failed. Please try again.");
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

  const handlePurposeSelect = useCallback((nextPurpose) => {
    setPurpose(nextPurpose);
    setFlowStep((prev) => (prev < 2 ? 2 : prev));
  }, []);

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

  const closeShareModal = useCallback(() => {
    setIsShareOpen(false);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  function markNotificationRead(id) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  async function handleLogout() {
    await signOut(auth);
    localStorage.removeItem("regenxUser");
    setUserProfile({ name: "", email: "", photo: "" });
    alert("You have been logged out successfully.");
    router.push("/login");
  }

  const toggleProfileMenu = useCallback(() => {
    setIsNotifOpen(false);
    setIsProfileMenuOpen((prev) => {
      if (prev) {
        setIsPasswordOpen(false);
      }
      return !prev;
    });
  }, []);

  function openProfileModal() {
    setIsProfileModalOpen(true);
    setIsProfileMenuOpen(false);
    setIsPasswordOpen(false);
    setIsProfileEditing(true);
    setProfileData((prev) => ({
      ...prev,
      email: prev.email || userProfile.email || "",
    }));
  }

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

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
    const nextProfile = {
      ...profileData,
      email: profileData.email || userProfile.email || "",
    };
    localStorage.setItem("regenxProfile", JSON.stringify(nextProfile));
    setProfileData(nextProfile);
    profileBaselineRef.current = { ...nextProfile };
    setProfileStatus("");
    setProfileError("");
    setIsProfileEditing(false);
    setIsProfileVerifiedOpen(true);
    setTimeout(() => setIsProfileVerifiedOpen(false), 3000);
    closeProfileModal();

    // Persist to Firestore in background
    const currentUser = auth.currentUser;
    if (currentUser) {
      updateUserProfile(currentUser.uid, {
        name: nextProfile.name || "",
        email: nextProfile.email || "",
        phone: nextProfile.phone || "",
        address: nextProfile.address || "",
        about: nextProfile.about || "",
      }).catch((err) => console.error("Profile Firestore save failed:", err));
    }
  }

  const handleOpenHistory = useCallback(() => {
    router.push("/history");
  }, [router]);

  function handleClearData() {
    const confirmed = window.confirm("Are you sure you want to delete all your data?");
    if (!confirmed) return;

    localStorage.removeItem("regenxProfile");
    localStorage.removeItem("regenxImageCache");
    localStorage.removeItem("regenxNotifications");
    localStorage.removeItem("regenxReviews");
    localStorage.removeItem("regenxProductHistory");
    localStorage.removeItem("regenxUser");

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
    setBillImage("");
    setBillFile(null);
    setBillError("");
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

  async function handleDeleteAccount() {
    setDeleteAccountLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("No user logged in.");
        setDeleteAccountLoading(false);
        return;
      }

      // Delete user profile from Firestore
      try {
        await deleteUserProfile(user.uid);
      } catch (firestoreErr) {
        console.warn("Could not delete Firestore profile:", firestoreErr);
      }

      // Clear all local storage data
      localStorage.removeItem("regenxProfile");
      localStorage.removeItem("regenxImageCache");
      localStorage.removeItem("regenxNotifications");
      localStorage.removeItem("regenxReviews");
      localStorage.removeItem("regenxProductHistory");
      localStorage.removeItem("regenxUser");
      localStorage.removeItem("regenxTheme");
      localStorage.removeItem("regenxLanguage");

      // Delete the Firebase Auth user account
      await deleteUser(user);

      // Close modals and redirect to login
      setIsDeleteAccountOpen(false);
      setIsProfileModalOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      if (error.code === "auth/requires-recent-login") {
        showToast("Please log out and log in again, then try deleting your account.");
      } else {
        showToast("Failed to delete account. Please try again.");
      }
    } finally {
      setDeleteAccountLoading(false);
    }
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

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Loading ReGenX...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-body ${isMenuOpen ? "menu-open" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">
            <iconify-icon icon="ph:recycle-bold" />
          </div>
          <span className="brand-name">ReGenX</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeNav === "hero" ? "active" : ""}`} onClick={() => scrollToSection("hero")}>
            <iconify-icon icon="ph:house-bold" />
            <span>{t.nav.hero}</span>
          </button>
          <button className={`nav-btn ${activeNav === "how" ? "active" : ""}`} onClick={() => scrollToSection("how")}>
            <iconify-icon icon="ph:stack-bold" />
            <span>{t.nav.how}</span>
          </button>
          <button className={`nav-btn ${activeNav === "features" ? "active" : ""}`} onClick={() => scrollToSection("features")}>
            <iconify-icon icon="ph:magic-wand-bold" />
            <span>{t.nav.features}</span>
          </button>
          <button className={`nav-btn ${activeNav === "impact" ? "active" : ""}`} onClick={() => scrollToSection("impact")}>
            <iconify-icon icon="ph:leaf-bold" />
            <span>{t.nav.impact}</span>
          </button>
          <button className={`nav-btn ${activeNav === "actions" ? "active" : ""}`} onClick={() => scrollToSection("actions")}>
            <iconify-icon icon="ph:upload-simple-bold" />
            <span>{t.nav.actions}</span>
          </button>
          <button className={`nav-btn ${activeNav === "geo" ? "active" : ""}`} onClick={() => scrollToSection("geo")}>
            <iconify-icon icon="ph:map-pin-bold" />
            <span>{t.nav.facilities}</span>
          </button>
          <button className={`nav-btn ${activeNav === "history" ? "active" : ""}`} onClick={() => scrollToSection("history")}>
            <span className="nav-emoji" aria-hidden="true">📦</span>
            <span>{t.nav.history}</span>
          </button>
          <a href="/sustainability" className="nav-btn sustainability-link">
            <iconify-icon icon="ph:chart-donut-bold" />
            <span>AI Sustainability</span>
          </a>
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

      <div
        className="sidebar-overlay"
        aria-hidden={!isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />

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
          <button
            type="button"
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <iconify-icon icon="ph:list-bold" />
          </button>
          <div className="header-welcome">
            <h1>{t.header.title}</h1>
            <p>{t.header.welcome}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="history-link-btn" onClick={handleOpenHistory}>
              <span aria-hidden="true">📦</span>
              <span>{t.history.title}</span>
            </button>
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
                className={`lang-btn ${language === "hl" ? "active" : ""}`}
                onClick={() => setLanguage("hl")}
              >
                🔀 Hinglish
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

        {toast ? (
          <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
            <span>{toast.message}</span>
            <button type="button" className="toast-close" onClick={dismissToast} aria-label="Dismiss">
              ×
            </button>
          </div>
        ) : null}

        <main className="content-area">
          <HeroSection
            title={t.landing.heroTitle}
            tagline={t.landing.heroTagline}
            badge={t.landing.heroBadge}
            primaryCta={t.landing.heroUploadCta}
            secondaryCta={t.landing.heroAnalyzeCta}
            onUpload={() => scrollToSection("actions")}
            onAnalyze={() => scrollToSection("actions")}
          />

          <HowItWorksSection
            title={t.landing.howTitle}
            subtitle={t.landing.howSubtitle}
            steps={[
              { title: t.landing.howStep1Title, icon: "📤", text: t.landing.howStep1Text },
              { title: t.landing.howStep2Title, icon: "🧠", text: t.landing.howStep2Text },
              { title: t.landing.howStep3Title, icon: "♻️", text: t.landing.howStep3Text },
              { title: t.landing.howStep4Title, icon: "🏅", text: t.landing.howStep4Text },
            ]}
          />

          <CoreFeaturesSection
            title={t.landing.featuresTitle}
            subtitle={t.landing.featuresSubtitle}
            features={[
              { title: t.landing.feature1Title, icon: "🧩", text: t.landing.feature1Text },
              { title: t.landing.feature2Title, icon: "🌿", text: t.landing.feature2Text },
              { title: t.landing.feature3Title, icon: "🤖", text: t.landing.feature3Text },
              { title: t.landing.feature4Title, icon: "🧭", text: t.landing.feature4Text },
            ]}
          />

          <UserActionSection
            title={t.landing.actionsTitle}
            subtitle={t.landing.actionsSubtitle}
          >
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
                      accept="image/png,image/jpeg,image/webp"
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

                    {/* Bill/Receipt upload for Sell */}
                    {purpose === "sell" ? (
                      <div className="bill-upload-section" style={{ marginTop: "16px", marginBottom: "16px" }}>
                        <label style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}>
                          <iconify-icon icon="ph:receipt-bold" style={{ marginRight: "6px" }} />
                          Bill / Receipt Image (Required)
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          ref={billInputRef}
                          onChange={handleBillChange}
                          style={{ display: "none" }}
                        />
                        <div
                          className={`upload-area bill-upload ${billImage ? "has-image" : ""}`}
                          style={{
                            border: "2px dashed var(--border-color, #ddd)",
                            borderRadius: "8px",
                            padding: "16px",
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: billImage ? "var(--bg-secondary, #f9f9f9)" : "transparent",
                          }}
                          onClick={() => billInputRef.current?.click()}
                        >
                          {billImage ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={billImage}
                                alt="Bill preview"
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                              />
                              <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: "500", color: "#22c55e" }}>✓ Bill uploaded</div>
                                <button
                                  type="button"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary-color, #3b82f6)",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: "13px",
                                    textDecoration: "underline",
                                  }}
                                  onClick={(e) => { e.stopPropagation(); billInputRef.current?.click(); }}
                                >
                                  Change bill
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <iconify-icon icon="ph:file-image-bold" style={{ fontSize: "32px", color: "#888" }} />
                              <div style={{ marginTop: "8px", color: "#666" }}>Click to upload bill/receipt</div>
                              <div style={{ fontSize: "12px", color: "#999" }}>JPG, PNG, WEBP up to 5MB</div>
                            </div>
                          )}
                        </div>
                        {billError ? <p className="upload-error" style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>{billError}</p> : null}
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
                      disabled={!productImage || !productFile || !purpose || totalUsageDays <= 0 || isAnalyzing || (purpose === "sell" && !billImage)}
                      aria-busy={isAnalyzing}
                    >
                      <iconify-icon icon="ph:magic-wand-bold" /> {t.upload.analyze}
                    </button>
                    <div className={`loader ${uploadLoading ? "active" : ""}`} />
                    {isAnalyzing ? (
                      <div className="analysis-status">{t.upload.analyzing}</div>
                    ) : null}

                    <div className={`results-summary ${analysisReady ? "show" : ""}`}>
                      {purpose === "sell" ? (
                        <>
                          <div className="res-item"><span>{t.results.condition}</span><strong>{condition}</strong></div>
                          <div className="res-item"><span>{t.results.remainingLife}</span><strong>{remainingLife ? `${remainingLife}%` : "-"}</strong></div>
                          <div className="res-item"><span>AI Suggested Price</span><strong>{sellPrice ? `₹${sellPrice}` : "-"}</strong></div>
                          {analysisReady && sellPrice > 0 ? (
                            <div className="custom-price-section" style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--bg-secondary, #f5f5f5)", borderRadius: "8px" }}>
                              <label style={{ fontWeight: "500", display: "block", marginBottom: "8px" }}>
                                <iconify-icon icon="ph:currency-inr-bold" style={{ marginRight: "4px" }} />
                                Your Selling Price
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <input
                                  type="number"
                                  min={getCustomPriceRange(sellPrice).min}
                                  max={getCustomPriceRange(sellPrice).max}
                                  value={customSellPrice}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const { min, max } = getCustomPriceRange(sellPrice);
                                    if (val >= min && val <= max) {
                                      setCustomSellPrice(val);
                                    } else if (val < min) {
                                      setCustomSellPrice(min);
                                    } else if (val > max) {
                                      setCustomSellPrice(max);
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    border: "1px solid var(--border-color, #ddd)",
                                    borderRadius: "6px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                  }}
                                />
                                <span style={{ fontSize: "13px", color: "#666", whiteSpace: "nowrap" }}>
                                  ₹{getCustomPriceRange(sellPrice).min} - ₹{getCustomPriceRange(sellPrice).max}
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
                                You can adjust price up to 35% above AI estimate
                              </div>
                            </div>
                          ) : null}
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
                      {analysisReady ? (
                        <div className="res-item"><span>{t.results.priceEstimate}</span><strong>{aiPriceEstimate || "-"}</strong></div>
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
                        <div className="ai-suggestion-grid">
                          <div className="ai-suggestion-item">
                            <span>{t.ai.actionLabel}</span>
                            <strong>{aiSuggestionAction ? t.purpose[aiSuggestionAction] : "-"}</strong>
                          </div>
                          <div className="ai-suggestion-item">
                            <span>{t.ai.priceLabel}</span>
                            <strong>{aiPriceEstimate || "-"}</strong>
                          </div>
                        </div>
                        <div className="ai-suggestion-reason">
                          <span>{t.ai.reasonLabel}</span>
                          <p className="ai-suggestion-text">{aiSuggestion}</p>
                        </div>
                        {predictionConfidence > 0 && (
                          <div className="ai-confidence">
                            <span>Prediction Confidence:</span>
                            <div className="confidence-bar">
                              <div className="confidence-fill" style={{ width: `${predictionConfidence}%` }} />
                            </div>
                            <strong>{predictionConfidence}%</strong>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Sustainability Metrics Card */}
                    {analysisReady && sustainabilityData.circular_economy_score > 0 ? (
                      <div className="sustainability-card">
                        <div className="sustainability-header">
                          <iconify-icon icon="ph:leaf-bold" />
                          <span>Sustainability Impact</span>
                        </div>
                        <div className="sustainability-grid">
                          <div className="sustainability-item co2">
                            <iconify-icon icon="ph:cloud-bold" />
                            <div className="sustainability-value">
                              <strong>{sustainabilityData.co2_saved_kg} kg</strong>
                              <span>CO₂ Saved</span>
                            </div>
                          </div>
                          <div className="sustainability-item score">
                            <iconify-icon icon="ph:recycle-bold" />
                            <div className="sustainability-value">
                              <strong>{sustainabilityData.circular_economy_score}%</strong>
                              <span>Circular Economy Score</span>
                            </div>
                          </div>
                          <div className="sustainability-item trees">
                            <iconify-icon icon="ph:tree-bold" />
                            <div className="sustainability-value">
                              <strong>{sustainabilityData.trees_equivalent}</strong>
                              <span>Trees Equivalent</span>
                            </div>
                          </div>
                          <div className="sustainability-item bottles">
                            <iconify-icon icon="ph:bottle-bold" />
                            <div className="sustainability-value">
                              <strong>{sustainabilityData.plastic_bottles_saved}</strong>
                              <span>Bottles Saved</span>
                            </div>
                          </div>
                        </div>
                        <div className="sustainability-impact">
                          <span>{sustainabilityData.environmental_impact}</span>
                        </div>
                      </div>
                    ) : null}

                    {analysisReady && purpose === "recycle" ? (
                      <div className="share-cta">
                        <div className="share-cta-text">{t.share.cta}</div>
                        <div className="share-cta-actions">
                          <button type="button" className="share-btn whatsapp" onClick={openShareWhatsApp}>
                            {t.share.shareWhatsapp}
                          </button>
                          <button type="button" className="share-btn linkedin" onClick={openShareLinkedIn}>
                            {t.share.shareLinkedin}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <div className="vertical-stack">
                <section className="section card-panel small-panel">
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

                <section className="section card-panel small-panel">
                  <div className="panel-header"><h3><iconify-icon icon="ph:currency-inr-bold" /> {t.pricing.title}</h3></div>
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

            {/* Trust Features Panel */}
            {showTrustPanel && analysisReady && (
              <section id="trustPanel" className="section card-panel full-width-panel trust-panel">
                <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3><iconify-icon icon="ph:shield-check-bold" /> AI Prediction Trust Report</h3>
                  <div className="trust-badge" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", padding: "0.5rem 1rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600 }}>
                    <iconify-icon icon="ph:seal-check-fill" />
                    <span>Verified Analysis</span>
                  </div>
                </div>

                <div className="trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginTop: "1.5rem" }}>
                  
                  {/* 1. Image Verification */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:image-square-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Image Verification</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px dashed var(--border-color)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Detected Object</span>
                        <strong>{trustData.detectedObject}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px dashed var(--border-color)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Detection Confidence</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "80px", height: "8px", background: "var(--bg-surface)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${trustData.detectionConfidence}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: "4px" }} />
                          </div>
                          <span>{trustData.detectionConfidence}%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px dashed var(--border-color)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Detected Material</span>
                        <strong style={{ fontSize: "0.85rem", textAlign: "right", maxWidth: "180px" }}>{trustData.detectedMaterial}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Condition Score</span>
                        <strong>{trustData.conditionScore}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Prediction Confidence Meter */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:gauge-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Prediction Confidence</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem 0" }}>
                        <svg viewBox="0 0 120 80" style={{ width: "160px", height: "90px" }}>
                          <path d="M10,70 A50,50 0 0,1 110,70" fill="none" stroke="#e0e0e0" strokeWidth="12" strokeLinecap="round"/>
                          <path d="M10,70 A50,50 0 0,1 110,70" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(trustData.overallConfidence / 100) * 157} 157`}/>
                          <defs>
                            <linearGradient id="gaugeGrad">
                              <stop offset="0%" stopColor="#ef4444"/>
                              <stop offset="50%" stopColor="#f59e0b"/>
                              <stop offset="100%" stopColor="#22c55e"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ display: "flex", alignItems: "baseline", marginTop: "-20px" }}>
                          <strong style={{ fontSize: "2.5rem", fontWeight: 700 }}>{trustData.overallConfidence}</strong>
                          <span style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>%</span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {trustData.overallConfidence >= 90 ? "Highly Reliable" : trustData.overallConfidence >= 75 ? "Reliable" : "Moderate"}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-color)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Image Quality</span>
                          <span style={{ fontWeight: 600, color: "var(--primary)" }}>{trustData.imageQuality}%</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Data Match</span>
                          <span style={{ fontWeight: 600, color: "var(--primary)" }}>{trustData.dataMatch}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Price Breakdown */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:list-numbers-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Price Calculation Breakdown</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Original Product Price</span>
                        <span style={{ fontWeight: 600 }}>₹{trustData.originalPrice.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Age Depreciation</span>
                        <span style={{ fontWeight: 600, color: "#ef4444" }}>-₹{trustData.ageDepreciation.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Condition Factor</span>
                        <span style={{ fontWeight: 600 }}>×{trustData.conditionFactor.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Market Demand</span>
                        <span style={{ fontWeight: 600 }}>×{trustData.marketDemand.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Material Value</span>
                        <span style={{ fontWeight: 600 }}>+₹{trustData.materialValue.toLocaleString()}</span>
                      </div>
                      <div style={{ height: "1px", background: "var(--border-color)", margin: "0.5rem 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0" }}>
                        <span style={{ fontWeight: 600 }}>Final Estimated Price</span>
                        <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary)" }}>₹{trustData.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Market Price Comparison */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:chart-bar-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Market Price Comparison</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      {[
                        { label: "Our Estimate", price: trustData.finalPrice, color: "linear-gradient(90deg, var(--primary), var(--secondary))" },
                        { label: "OLX Average", price: trustData.olxPrice, color: "#f59e0b" },
                        { label: "FB Marketplace", price: trustData.fbPrice, color: "#3b82f6" },
                        { label: "Cashify/Sell Old", price: trustData.cashifyPrice, color: "#8b5cf6" }
                      ].map((item, idx) => {
                        const maxPrice = Math.max(trustData.finalPrice, trustData.olxPrice, trustData.fbPrice, trustData.cashifyPrice);
                        return (
                          <div key={idx} style={{ display: "grid", gridTemplateColumns: "100px 1fr 70px", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.label}</span>
                            <div style={{ height: "12px", background: "var(--bg-surface)", borderRadius: "6px", overflow: "hidden" }}>
                              <div style={{ width: `${(item.price / maxPrice) * 100}%`, height: "100%", background: item.color, borderRadius: "6px" }} />
                            </div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, textAlign: "right" }}>₹{item.price.toLocaleString()}</span>
                          </div>
                        );
                      })}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", padding: "0.75rem", background: "rgba(34, 197, 94, 0.1)", borderRadius: "8px", color: "#16a34a", fontSize: "0.9rem" }}>
                        <iconify-icon icon="ph:check-circle-bold" />
                        <span>Price within market range</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. AI Recommendation */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:lightbulb-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>AI Recommendation</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: trustData.recommendation === "Repair" ? "rgba(59, 130, 246, 0.1)" : trustData.recommendation === "Recycle" ? "rgba(245, 158, 11, 0.1)" : "rgba(34, 197, 94, 0.1)", borderRadius: "12px", marginBottom: "1rem" }}>
                        <iconify-icon icon={trustData.recommendation === "Repair" ? "ph:wrench-bold" : trustData.recommendation === "Recycle" ? "ph:recycle-bold" : "ph:storefront-bold"} style={{ fontSize: "2rem", color: trustData.recommendation === "Repair" ? "#3b82f6" : trustData.recommendation === "Recycle" ? "#f59e0b" : "#22c55e" }} />
                        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: trustData.recommendation === "Repair" ? "#3b82f6" : trustData.recommendation === "Recycle" ? "#f59e0b" : "#22c55e" }}>{trustData.recommendation}</span>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "8px", borderLeft: "3px solid var(--primary)" }}>
                        {trustData.recExplanation}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Repair Cost</span>
                          <span style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.25rem" }}>₹{trustData.repairCostValue.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Resale Value</span>
                          <span style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.25rem" }}>₹{trustData.resaleValue.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "8px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Recycle Value</span>
                          <span style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.25rem" }}>₹{trustData.recycleValueTrust.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. Environmental Impact */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:leaf-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Environmental Impact</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                        {[
                          { icon: "ph:cloud-bold", value: `${trustData.co2Saved} kg`, label: "CO₂ Saved", gradient: "linear-gradient(135deg, #64748b, #475569)" },
                          { icon: "ph:drop-bold", value: `${trustData.waterSaved} L`, label: "Water Saved", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
                          { icon: "ph:lightning-bold", value: `${trustData.energySaved} kWh`, label: "Energy Saved", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
                          { icon: "ph:arrows-clockwise-bold", value: `${trustData.circularScore}/100`, label: "Circular Score", gradient: "linear-gradient(135deg, #22c55e, #16a34a)" }
                        ].map((item, idx) => (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem", background: "var(--bg-surface)", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: item.gradient, marginBottom: "0.5rem" }}>
                              <iconify-icon icon={item.icon} style={{ fontSize: "1.5rem", color: "white" }} />
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{item.value}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 7. Data Sources */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:database-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Data Sources</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      {[
                        { icon: "ph:globe-bold", name: "Global Carbon Atlas" },
                        { icon: "ph:bank-bold", name: "World Bank Climate Data" },
                        { icon: "ph:recycle-bold", name: "Recycling Industry Database" },
                        { icon: "ph:storefront-bold", name: "Second-hand Market APIs" }
                      ].map((source, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "8px", marginBottom: "0.5rem" }}>
                          <iconify-icon icon={source.icon} style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                          <span style={{ flex: 1, fontSize: "0.9rem" }}>{source.name}</span>
                          <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 600, background: "rgba(34, 197, 94, 0.15)", color: "#16a34a" }}>Verified</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 8. Timestamps */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:clock-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Prediction Timestamps</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      {[
                        { icon: "ph:magic-wand-bold", label: "Prediction Generated", value: trustData.predictionTime },
                        { icon: "ph:database-bold", label: "Market Data Updated", value: trustData.marketDataTime },
                        { icon: "ph:cloud-arrow-down-bold", label: "Environmental Data", value: trustData.envDataTime }
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: idx < 2 ? "1px dashed var(--border-color)" : "none" }}>
                          <iconify-icon icon={item.icon} style={{ fontSize: "1.5rem", color: "var(--primary)" }} />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.label}</span>
                            <strong style={{ fontSize: "0.95rem" }}>{item.value}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 9. Model Info */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:cpu-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>AI Model Information</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))", borderRadius: "12px", marginBottom: "1rem" }}>
                        <iconify-icon icon="ph:robot-bold" style={{ fontSize: "2.5rem", color: "#8b5cf6" }} />
                        <div>
                          <strong style={{ fontSize: "1.1rem" }}>AI Valuation Engine</strong>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Version 2.1.0</div>
                        </div>
                      </div>
                      {[
                        { icon: "ph:eye-bold", name: "YOLOv8 Image Analysis" },
                        { icon: "ph:brain-bold", name: "Gemini 2.0 Flash" },
                        { icon: "ph:chart-line-up-bold", name: "Circular Economy Model" }
                      ].map((tech, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "var(--bg-surface)", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                          <iconify-icon icon={tech.icon} style={{ fontSize: "1rem", color: "#8b5cf6" }} />
                          <span>{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 10. User Feedback */}
                  <div className="trust-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <div className="trust-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}>
                      <iconify-icon icon="ph:chat-circle-text-bold" style={{ fontSize: "1.25rem", color: "var(--primary)" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Was this prediction accurate?</h4>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      {!trustData.feedbackGiven ? (
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <button onClick={() => handleTrustFeedback(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", border: "2px solid var(--border-color)", borderRadius: "12px", background: "var(--bg-card)", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600, color: "#16a34a", transition: "all 0.2s ease" }}>
                            <iconify-icon icon="ph:thumbs-up-bold" style={{ fontSize: "1.5rem" }} />
                            <span>Yes, Accurate</span>
                          </button>
                          <button onClick={() => handleTrustFeedback(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", border: "2px solid var(--border-color)", borderRadius: "12px", background: "var(--bg-card)", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600, color: "#dc2626", transition: "all 0.2s ease" }}>
                            <iconify-icon icon="ph:thumbs-down-bold" style={{ fontSize: "1.5rem" }} />
                            <span>No, Inaccurate</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", background: "rgba(34, 197, 94, 0.1)", borderRadius: "12px", color: "#16a34a", fontSize: "0.9rem" }}>
                          <iconify-icon icon="ph:check-circle-bold" style={{ fontSize: "1.25rem" }} />
                          <span>Thank you for your feedback! It helps improve our AI.</span>
                        </div>
                      )}
                      <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span><strong style={{ color: "var(--primary)" }}>{trustData.accuracyRate}%</strong> users found predictions accurate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

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
          </UserActionSection>

          <CertificateSection
            certificate={productHistory[0]}
            labels={{
              title: t.landing.certificateTitle,
              subtitle: t.landing.certificateSubtitle,
              header: t.landing.certificateHeader,
              presentedTo: t.landing.certificatePresentedTo,
              congrats: t.landing.certificateCongrats,
              wasteLine: t.landing.certificateWasteLine,
              heroLine: t.landing.certificateHeroLine,
              footerVerified: t.landing.certificateFooterVerified,
              footerQr: t.landing.certificateFooterQr,
              ecoHeroFallback: t.landing.ecoHeroFallback,
            }}
          />

          <HistoryPreviewSection
            items={productHistory.slice(0, 3)}
            onOpenHistory={handleOpenHistory}
            title={t.landing.historyTitle}
            subtitle={t.landing.historySubtitle}
            emptyText={t.landing.historyEmpty}
            ecoLabel={t.landing.historyEcoLabel}
            pathLabel={t.landing.historyPathLabel}
            viewAllLabel={t.landing.historyViewAll}
            purposeLabels={t.purpose}
          />

          <section id="impact" className="section impact-section" ref={impactSectionRef}>
            <div className="section-heading">
              <h2>{t.landing.impactHeading}</h2>
              <p>{t.landing.impactSubheading}</p>
            </div>
            
            {/* Impact Chain Diagram */}
            <div className={`impact-chain ${isImpactVisible ? "is-visible" : ""}`}>
              <h4 className="chain-title">{t.impactMode.chainTitle}</h4>
              <div className="chain-flow">
                {t.impactMode.chainSteps?.map((step, index) => (
                  <div key={index} className="chain-step">
                    <div className="chain-step-icon">{step.icon}</div>
                    <span className="chain-step-label">{step.label}</span>
                    {index < (t.impactMode.chainSteps?.length || 0) - 1 && (
                      <div className="chain-arrow">
                        <iconify-icon icon="ph:arrow-right-bold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`impact-mode ${isImpactVisible ? "is-visible" : ""}`}>
              <div className="impact-mode-header">
                <h4>{t.impactMode.title}</h4>
                <p>{t.impactMode.subtitle}</p>
              </div>
              <div className="impact-mode-grid expanded">
                <div className="impact-mode-card">
                  <div className="impact-mode-icon">🌍</div>
                  <div className="impact-mode-label">{t.impactMode.co2}</div>
                  <div className="impact-mode-value">
                    {formatImpactNumber(impactCounts.co2, impactUnits.co2Unit)}
                    <span className="impact-mode-unit">{impactUnits.co2Unit}</span>
                  </div>
                </div>
                <div className="impact-mode-card">
                  <div className="impact-mode-icon">♻️</div>
                  <div className="impact-mode-label">{t.impactMode.waste}</div>
                  <div className="impact-mode-value">
                    {formatImpactNumber(impactCounts.waste, impactUnits.wasteUnit)}
                    <span className="impact-mode-unit">{impactUnits.wasteUnit}</span>
                  </div>
                </div>
                <div className="impact-mode-card">
                  <div className="impact-mode-icon">💧</div>
                  <div className="impact-mode-label">{t.impactMode.water}</div>
                  <div className="impact-mode-value">
                    {formatImpactNumber(impactCounts.water, impactUnits.waterUnit)}
                    <span className="impact-mode-unit">{impactUnits.waterUnit}</span>
                  </div>
                </div>
                <div className="impact-mode-card">
                  <div className="impact-mode-icon">⚡</div>
                  <div className="impact-mode-label">{t.impactMode.energy}</div>
                  <div className="impact-mode-value">
                    {formatImpactNumber(impactCounts.energy, impactUnits.energyUnit)}
                    <span className="impact-mode-unit">{impactUnits.energyUnit}</span>
                  </div>
                </div>
                <div className="impact-mode-card">
                  <div className="impact-mode-icon">🌳</div>
                  <div className="impact-mode-label">{t.impactMode.trees}</div>
                  <div className="impact-mode-value">
                    {Math.round(impactCounts.trees).toLocaleString()}
                    <span className="impact-mode-unit">{t.impactMode.treesSuffix}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Sustainability Dashboard CTA */}
          <section id="sustainability" className="section sustainability-cta-section">
            <div className="sustainability-cta-card">
              <div className="cta-visual">
                <div className="cta-icon-bg">
                  <iconify-icon icon="ph:leaf-bold" />
                </div>
                <div className="cta-particles">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="cta-content">
                <span className="cta-badge">🌍 Environmental Impact</span>
                <h3>AI Sustainability Dashboard</h3>
                <p>Track real-time environmental metrics, see your contribution to the circular economy, and get AI-powered insights on your sustainability impact.</p>
                <ul className="cta-features">
                  <li><iconify-icon icon="ph:check-circle-bold" /> Global & local environmental data</li>
                  <li><iconify-icon icon="ph:check-circle-bold" /> Live impact counters</li>
                  <li><iconify-icon icon="ph:check-circle-bold" /> AI sustainability insights</li>
                  <li><iconify-icon icon="ph:check-circle-bold" /> Location-based metrics</li>
                </ul>
                <a href="/sustainability" className="cta-button">
                  <span>Open Sustainability Dashboard</span>
                  <iconify-icon icon="ph:arrow-right-bold" />
                </a>
              </div>
            </div>
          </section>
        </main>

        <FooterSection
          labels={{
            aboutTitle: t.landing.footerAboutTitle,
            aboutText: t.landing.footerAboutText,
            contactTitle: t.landing.footerContactTitle,
            contactEmail: t.landing.footerContactEmail,
            contactPhone: t.landing.footerContactPhone,
            socialTitle: t.landing.footerSocialTitle,
            socialLinks: t.landing.footerSocialLinks,
            brand: t.landing.footerBrand,
          }}
        />
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

      <div className={`modal ${isShareOpen ? "" : "hidden"}`} aria-hidden={!isShareOpen}>
        <div className="modal-overlay" onClick={closeShareModal} />
        <div className="modal-card share-modal" role="dialog" aria-modal="true">
          <button className="modal-close" aria-label="Close" onClick={closeShareModal}>
            ×
          </button>
          <div className="share-header">
            <div className="share-badge">♻️</div>
            <h3>{t.share.thanksHeading}</h3>
          </div>

          <div className="share-card">
            <div className="share-card-top">
              <div className="share-logos">
                <span className="share-logo">ReGenX</span>
                <iconify-icon icon="ph:recycle-bold" />
              </div>
              <div className="share-icons">🌱 ♻️ 🌍</div>
            </div>
            <div className="share-message">{shareMessage}</div>
            {sharePayload?.name ? (
              <div className="share-name">{sharePayload.name}</div>
            ) : null}
            <div className="share-meta">
              <span>{t.share.resultLabel}</span>
              <span>{t.share.dateLabel}: {shareDate}</span>
            </div>
          </div>

          <div className="share-actions">
            <button type="button" className="share-btn whatsapp" onClick={openShareWhatsApp}>
              {t.share.shareWhatsapp}
            </button>
            <button type="button" className="share-btn linkedin" onClick={openShareLinkedIn}>
              {t.share.shareLinkedin}
            </button>
          </div>
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
            <div className="profile-form-body">
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
                />
              </label>
              <label>
                {t.profile.email}
                <input type="email" value={resolvedProfile.email || ""} readOnly />
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
                <button
                  type="button"
                  className="btn-danger full-width"
                  style={{ marginTop: "10px", backgroundColor: "#dc2626", color: "#fff" }}
                  onClick={() => setIsDeleteAccountOpen(true)}
                >
                  <iconify-icon icon="ph:trash-bold" style={{ marginRight: "6px" }} />
                  Delete My Account
                </button>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="submit"
                className="btn-primary full-width"
                disabled={missingProfileFields.length > 0}
              >
                {t.profile.saveDetails}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <div className={`modal ${isDeleteAccountOpen ? "" : "hidden"}`} aria-hidden={!isDeleteAccountOpen}>
        <div className="modal-overlay" onClick={() => !deleteAccountLoading && setIsDeleteAccountOpen(false)} />
        <div className="modal-card delete-account-modal" role="dialog" aria-modal="true" style={{ maxWidth: "400px" }}>
          <button
            className="modal-close"
            aria-label="Close"
            onClick={() => !deleteAccountLoading && setIsDeleteAccountOpen(false)}
            disabled={deleteAccountLoading}
          >
            ×
          </button>
          <div className="modal-header-icon" style={{ backgroundColor: "#fef2f2" }}>
            <iconify-icon icon="ph:warning-bold" style={{ color: "#dc2626", fontSize: "32px" }} />
          </div>
          <h3 style={{ color: "#dc2626" }}>Delete Account</h3>
          <p className="modal-sub" style={{ textAlign: "center", marginBottom: "16px" }}>
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </p>
          <div style={{ backgroundColor: "#fef2f2", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#991b1b", margin: 0 }}>
              <strong>This will permanently delete:</strong>
            </p>
            <ul style={{ fontSize: "13px", color: "#991b1b", margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Your profile information</li>
              <li>Your login credentials</li>
              <li>All saved data & history</li>
              <li>Your Firebase account</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setIsDeleteAccountOpen(false)}
              disabled={deleteAccountLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              style={{ flex: 1, backgroundColor: "#dc2626", color: "#fff" }}
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading}
            >
              {deleteAccountLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
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

      {/* ── EcoBot floating chat widget ── */}
      <EcoBotChat theme={theme} />

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
