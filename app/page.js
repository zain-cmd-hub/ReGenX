"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateCondition(age, usage) {
  let score = 80;
  score -= age * 3;
  if (usage === "heavy") score -= 18;
  else if (usage === "moderate") score -= 8;
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

function generateFacilities(location) {
  const baseNames = [
    "GreenFix Repair Hub",
    "ReLoop Recycling",
    "Circular Buyers Collective",
    "EcoRevive Center",
    "SecondLife Exchange",
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

  return baseNames.map((name, index) => ({
    name: `${name} - ${location}`,
    distance: randomBetween(1, 12) + index,
    type: types[index % types.length],
    phone: phoneNumbers[index],
    whatsapp: whatsappNumbers[index],
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
  const [usageLevel, setUsageLevel] = useState("moderate");
  const [productImage, setProductImage] = useState("");
  const [imageHash, setImageHash] = useState("");

  const [condition, setCondition] = useState("-");
  const [score, setScore] = useState(0);
  const [remainingLife, setRemainingLife] = useState(0);
  const [price, setPrice] = useState(0);
  const [demand, setDemand] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [lifeLoading, setLifeLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [location, setLocation] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [activeFacility, setActiveFacility] = useState(null);

  const [liveScore, setLiveScore] = useState(82);
  const [liveReuse, setLiveReuse] = useState(64);
  const [liveDemand] = useState("High");

  useEffect(() => {
    const storedUser = localStorage.getItem("tscemUser");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
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
    });

    const intervalId = setInterval(() => {
      setLiveScore(randomBetween(70, 95));
      setLiveReuse(randomBetween(50, 80));
    }, 3500);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!productImage) {
      setImageHash("");
      setCondition("-");
      setScore(0);
      setRemainingLife(0);
      setPrice(0);
      setDemand("");
      return;
    }

    const hash = hashString(productImage);
    setImageHash(hash);

    const cache = readImageCache();
    const cachedResult = cache[hash];
    if (cachedResult) {
      setCondition(cachedResult.condition);
      setScore(cachedResult.score);
      setRemainingLife(cachedResult.remainingLife);
      setPrice(cachedResult.price);
      setDemand(cachedResult.demand);
    } else {
      setCondition("-");
      setScore(0);
      setRemainingLife(0);
      setPrice(0);
      setDemand("");
    }
  }, [productImage]);

  const dashboardAge = useMemo(() => {
    if (!productAgeInput) return "-";
    return `Age: ${productAgeInput} year(s)`;
  }, [productAgeInput]);

  const dashboardCondition = condition && condition !== "-" ? `Condition: ${condition}` : "-";
  const dashboardScore = score ? `Score: ${score}/100` : "-";
  const dashboardLife = remainingLife ? `Remaining life: ${remainingLife}%` : "-";
  const dashboardPrice = price ? `Estimated price: ₹${price}` : "-";
  const dashboardDemand = demand ? `Demand: ${demand}` : "-";

  function scrollToSection(target) {
    setActiveNav(target);
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setProductImage("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProductImage(loadEvent.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  function handleAnalyze() {
    const ageValue = Number(productAgeInput);
    if (!productImage) {
      alert("Please upload a product image before analyzing.");
      return;
    }

    if (!productTypeInput.trim() || Number.isNaN(ageValue)) {
      alert("Please fill product type and age before analyzing.");
      return;
    }

    setUploadLoading(true);
    setTimeout(() => {
      const hash = imageHash || hashString(productImage);
      const cache = readImageCache();
      const cachedResult = cache[hash];

      if (cachedResult) {
        setCondition(cachedResult.condition);
        setScore(cachedResult.score);
        setRemainingLife(cachedResult.remainingLife);
        setPrice(cachedResult.price);
        setDemand(cachedResult.demand);
        setUploadLoading(false);
        return;
      }

      const nextCondition = calculateCondition(ageValue, usageLevel);
      const nextScore = calculateSustainability(nextCondition, usageLevel, ageValue);
      const nextLife = calculateRemainingLife(nextCondition, ageValue);

      const demandScore = randomBetween(60, 120);
      const demandLabel = demandScore > 100 ? "High" : demandScore > 80 ? "Moderate" : "Low";
      const baseValue = 12000;
      const conditionMultiplier = nextCondition === "Good" ? 1.2 : nextCondition === "Medium" ? 0.9 : 0.6;
      const lifeMultiplier = nextLife / 100;
      const demandMultiplier = demandScore / 100;
      const estimatedPrice = Math.round(baseValue * conditionMultiplier * lifeMultiplier * demandMultiplier);

      const result = {
        condition: nextCondition,
        score: nextScore,
        remainingLife: nextLife,
        price: estimatedPrice,
        demand: demandLabel,
      };

      cache[hash] = result;
      writeImageCache(cache);

      setCondition(result.condition);
      setScore(result.score);
      setRemainingLife(result.remainingLife);
      setPrice(result.price);
      setDemand(result.demand);
      setUploadLoading(false);
    }, 1200);
  }

  function handlePredictLife() {
    if (!condition || condition === "-") {
      alert("Please analyze a product first.");
      return;
    }

    setLifeLoading(true);
    setTimeout(() => {
      const ageValue = Number(productAgeInput || 0);
      const lifeValue = remainingLife || calculateRemainingLife(condition, ageValue);
      setRemainingLife(lifeValue);
      setLifeLoading(false);
    }, 900);
  }

  function handleCalculatePrice() {
    if (!imageHash) {
      alert("Upload an image and analyze it first.");
      return;
    }

    if (!price) {
      alert("Price is only generated once during Analyze Product.");
      return;
    }

    setPriceLoading(true);
    setTimeout(() => {
      setPriceLoading(false);
    }, 400);
  }

  function handleFindFacilities() {
    if (!location.trim()) {
      alert("Please enter a location to find facilities.");
      return;
    }

    setGeoLoading(true);
    setFacilities([]);

    setTimeout(() => {
      setFacilities(generateFacilities(location.trim()));
      setGeoLoading(false);
    }, 1000);
  }

  function buildWhatsappMessage() {
    const name = productTypeInput || "Unknown product";
    const age = productAgeInput ? `${productAgeInput} year(s)` : "Pending";
    const life = remainingLife ? `${remainingLife}%` : "Pending";
    const localScore = score ? `${score}/100` : "Pending";
    const localPrice = price ? `₹${price}` : "Pending";

    return `Hello, I want to connect regarding my product.\n\nProduct: ${name}\nAge: ${age}\nCondition: ${condition}\nRemaining Life: ${life}\nSustainability Score: ${localScore}\nEstimated Price: ${localPrice}\n\nPlease contact me for reuse/repair/recycling.`;
  }

  function openWhatsApp() {
    if (!activeFacility) return;
    const message = encodeURIComponent(buildWhatsappMessage());
    const link = `https://wa.me/${activeFacility.whatsapp}?text=${message}`;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function handleLogout() {
    await signOut(auth);
    localStorage.removeItem("tscemUser");
    router.push("/login");
  }

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
                <span className="user-name">{userProfile.name || "Dev Kulshrestha"}</span>
                <span className="user-role">{userProfile.email || "Admin"}</span>
              </div>
            </div>
            <button className="logout-btn" title="Logout" onClick={handleLogout}>
              <iconify-icon icon="ph:sign-out-bold" />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-welcome">
            <h1>Dashboard</h1>
            <p>Welcome back, complete your circular economy tasks.</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <iconify-icon icon="ph:magnifying-glass-bold" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="icon-btn notification-btn">
              <iconify-icon icon="ph:bell-bold" />
              <span className="badge" />
            </button>
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
                  <strong className="stat-value">{dashboardScore}</strong>
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
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <div className="image-preview">
                    {productImage ? (
                      <img src={productImage} alt="Uploaded product" />
                    ) : (
                      <>
                        <iconify-icon icon="ph:image-bold" style={{ fontSize: "48px", opacity: 0.5 }} />
                        <span>Select Image</span>
                      </>
                    )}
                  </div>
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
                    <div className="col">
                      <label>Usage</label>
                      <select value={usageLevel} onChange={(event) => setUsageLevel(event.target.value)}>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleAnalyze} className="btn-primary full-width">
                    <iconify-icon icon="ph:magic-wand-bold" /> Analyze
                  </button>
                  <div className={`loader ${uploadLoading ? "active" : ""}`} />

                  <div className="results-summary">
                    <div className="res-item"><span>Condition</span><strong>{condition}</strong></div>
                    <div className="res-item"><span>Sus. Score</span><strong>{score ? `${score}/100` : "-"}</strong></div>
                    <div className="res-item"><span>Life</span><strong>{remainingLife ? `${remainingLife}%` : "-"}</strong></div>
                  </div>
                </div>
              </div>
            </section>

            <div className="vertical-stack">
              <section id="life" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:chart-line-up-bold" /> Life Cycle</h3></div>
                <div className="panel-body">
                  <p className="desc-text">Predict remaining lifespan based on AI analysis.</p>
                  <div className="progress-circle-wrap">
                    <div className="progress-bar-container">
                      <div className="progress-fill" style={{ width: `${remainingLife || 0}%` }} />
                    </div>
                    <div className="progress-text"><span>{remainingLife || 0}%</span> Remaining</div>
                  </div>
                  <button onClick={handlePredictLife} className="btn-secondary full-width">Predict</button>
                  <div className={`loader ${lifeLoading ? "active" : ""}`} />
                </div>
              </section>

              <section id="pricing" className="section card-panel small-panel">
                <div className="panel-header"><h3><iconify-icon icon="ph:currency-dollar-bold" /> Fair Price</h3></div>
                <div className="panel-body">
                  <div className="price-display"><span className="currency">₹</span><strong className="huge-text">{price || "-"}</strong></div>
                  <div className="demand-tag">{demand ? `Market demand: ${demand}` : ""}</div>
                  <button onClick={handleCalculatePrice} className="btn-secondary full-width">Calculate</button>
                  <div className={`loader ${priceLoading ? "active" : ""}`} />
                </div>
              </section>
            </div>
          </div>

          <section id="geo" className="section card-panel full-width-panel">
            <div className="panel-header">
              <h3><iconify-icon icon="ph:map-pin-bold" /> Nearby Facilities</h3>
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

            <div className={`loader ${geoLoading ? "active" : ""}`} />
            <div className="geo-grid">
              {facilities.map((item) => (
                <div className="facility-item" key={item.name}>
                  <div className="f-header">
                    <span className="f-name">{item.name}</span>
                    <span className="f-dist">{item.distance} km</span>
                  </div>
                  <span className="f-type">{item.type}</span>
                  <button className="f-action" onClick={() => setActiveFacility(item)}>
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="main-footer">
          <p>© 2026 Smart Circular Economy Marketplace.</p>
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
          <button className="btn-primary full-width" onClick={openWhatsApp}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
