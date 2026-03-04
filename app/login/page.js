"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { createUserProfile, getUserProfile } from "../lib/userService";
import { SUSTAINABILITY_DATA, GLOBAL_IMPACT_COUNTER } from "../lib/sustainabilityData";

// Circular Gauge Component
function CircularGauge({ value, maxValue, label, color, size = 70 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = (animatedValue / maxValue) * 100;
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="circular-gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className="gauge-svg">
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="gauge-content">
        <span className="gauge-value" style={{ color }}>{Math.round(animatedValue)}</span>
        <span className="gauge-unit">%</span>
      </div>
      <span className="gauge-label">{label}</span>
    </div>
  );
}

// Impact Stat Card Component
function ImpactStatCard({ icon, value, unit, label, color, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`impact-stat-card ${isVisible ? 'visible' : ''}`} style={{ '--accent-color': color }}>
      <div className="stat-icon">
        <iconify-icon icon={icon} />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}<small>{unit}</small></span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'india'
  const [impactCounter, setImpactCounter] = useState(GLOBAL_IMPACT_COUNTER);

  // Animate impact counter
  useEffect(() => {
    const interval = setInterval(() => {
      setImpactCounter(prev => ({
        ...prev,
        co2Saved: prev.co2Saved + Math.floor(Math.random() * 5),
        waterSaved: prev.waterSaved + Math.floor(Math.random() * 20),
        wasteRecycled: prev.wasteRecycled + Math.floor(Math.random() * 3),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Timeout to ensure we don't stay stuck on loading forever
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setAuthChecking(false);
      }
    }, 3000);

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (!isMounted || !result?.user) return;

        const user = result.user;
        try {
          await createUserProfile(user.uid, {
            name: user.displayName || "",
            email: user.email || "",
            photo: user.photoURL || "",
          });
        } catch (e) {
          console.error("Profile creation error:", e);
        }
        const userProfile = {
          name: user.displayName || "",
          email: user.email || "",
          photo: user.photoURL || "",
        };
        localStorage.setItem("regenxUser", JSON.stringify(userProfile));
        router.push("/");
      } catch (error) {
        if (!isMounted) return;
        console.error("Redirect result error:", error);
        setAuthChecking(false);
      }
    }

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        setAuthChecking(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [router]);

  async function handleGoogleLogin() {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await createUserProfile(user.uid, {
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
      });
      const userProfile = {
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
      };
      localStorage.setItem("regenxUser", JSON.stringify(userProfile));
      router.push("/");
    } catch (error) {
      const errorCode = error?.code || "auth/error";
      if (errorCode === "auth/popup-blocked" || errorCode === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setErrorMessage(`Google sign-in failed. ${errorCode}`);
    } finally {
      setIsLoading(false);
    }
  }

  function getFirebaseErrorMessage(code) {
    switch (code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "No account found with this email. Please register first.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account already exists with this email. Please sign in.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return `Authentication error. (${code})`;
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
    } catch (error) {
      const errorCode = error?.code || "auth/error";
      if (errorCode === "auth/user-not-found" || errorCode === "auth/invalid-credential") {
        setErrorMessage("No account found with this email address.");
      } else if (errorCode === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (errorCode === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please wait a moment and try again.");
      } else {
        setErrorMessage(`Failed to send reset email. (${errorCode})`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        // ── Register new user ──────────────────────────────────────────
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const resolvedName = displayName.trim() || email.split("@")[0];
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        await createUserProfile(credential.user.uid, {
          name: resolvedName,
          email: credential.user.email || "",
          photo: credential.user.photoURL || "",
        });
        const userProfile = {
          name: resolvedName,
          email: credential.user.email || "",
          photo: credential.user.photoURL || "",
        };
        localStorage.setItem("regenxUser", JSON.stringify(userProfile));
        router.push("/");
      } else {
        // ── Sign in existing user ──────────────────────────────────────
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        // Fetch profile from Firestore (may already exist from previous signup)
        let firestoreProfile = null;
        try { firestoreProfile = await getUserProfile(credential.user.uid); } catch (_) {}
        const resolvedName = firestoreProfile?.name || credential.user.displayName || email.split("@")[0];
        const userProfile = {
          name: resolvedName,
          email: credential.user.email || "",
          photo: firestoreProfile?.photo || credential.user.photoURL || "",
        };
        localStorage.setItem("regenxUser", JSON.stringify(userProfile));
        // Also ensure Firestore doc exists for older accounts
        if (!firestoreProfile) {
          await createUserProfile(credential.user.uid, userProfile);
        }
        router.push("/");
      }
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error?.code || "auth/error"));
    } finally {
      setIsLoading(false);
    }
  }

  if (authChecking) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-visual">
          <div className="visual-content">
            <div className="brand">
              <iconify-icon icon="ph:recycle-bold" />
              <span>ReGenX</span>
            </div>
            <h2>
              Reduce Waste.
              <br />
              Reuse Smartly.
            </h2>
            <p>
              Join the AI-powered circular economy marketplace and build a
              zero-waste future today.
            </p>

            {/* Global Impact Counter */}
            <div className="global-impact-banner">
              <div className="impact-banner-title">
                <iconify-icon icon="ph:globe-bold" />
                <span>Global Impact by ReGenX Users</span>
              </div>
              <div className="impact-counter-grid">
                <div className="impact-counter-item">
                  <iconify-icon icon="ph:cloud-bold" style={{ color: '#3b82f6' }} />
                  <span className="counter-value">{impactCounter.co2Saved.toLocaleString()}</span>
                  <span className="counter-label">kg CO₂ Saved</span>
                </div>
                <div className="impact-counter-item">
                  <iconify-icon icon="ph:drop-bold" style={{ color: '#06b6d4' }} />
                  <span className="counter-value">{impactCounter.waterSaved.toLocaleString()}</span>
                  <span className="counter-label">L Water Saved</span>
                </div>
                <div className="impact-counter-item">
                  <iconify-icon icon="ph:recycle-bold" style={{ color: '#22c55e' }} />
                  <span className="counter-value">{impactCounter.wasteRecycled.toLocaleString()}</span>
                  <span className="counter-label">kg Recycled</span>
                </div>
              </div>
            </div>

            {/* Environmental Impact Tabs */}
            <div className="env-impact-section">
              <div className="env-tabs">
                <button 
                  className={`env-tab ${activeTab === 'global' ? 'active' : ''}`}
                  onClick={() => setActiveTab('global')}
                >
                  🌍 Global
                </button>
                <button 
                  className={`env-tab ${activeTab === 'india' ? 'active' : ''}`}
                  onClick={() => setActiveTab('india')}
                >
                  🇮🇳 India
                </button>
              </div>

              <div className="env-impact-card">
                <div className="env-card-header">
                  <h4>{activeTab === 'global' ? '🌍 Global Environmental Statistics' : '🇮🇳 India Environmental Statistics'}</h4>
                  <span className="live-badge">
                    <span className="live-dot"></span>
                    Live Data
                  </span>
                </div>

                <div className="env-gauges-grid">
                  <CircularGauge 
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.recyclingRate.value : SUSTAINABILITY_DATA.india.recyclingRate.value}
                    maxValue={100}
                    label="Recycling Rate"
                    color="#22c55e"
                  />
                  <CircularGauge 
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.circularIndex.value : SUSTAINABILITY_DATA.india.circularIndex.value}
                    maxValue={100}
                    label="Circular Index"
                    color="#3b82f6"
                  />
                  <CircularGauge 
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.energyRenewable.value : SUSTAINABILITY_DATA.india.energyRenewable.value}
                    maxValue={100}
                    label="Renewable Energy"
                    color="#f59e0b"
                  />
                </div>

                <div className="env-stats-grid">
                  <ImpactStatCard 
                    icon="ph:cloud-bold"
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.co2.value : SUSTAINABILITY_DATA.india.co2.value}
                    unit={activeTab === 'global' ? SUSTAINABILITY_DATA.global.co2.unit : SUSTAINABILITY_DATA.india.co2.unit}
                    label="CO₂ Emissions"
                    color="#ef4444"
                    delay={0}
                  />
                  <ImpactStatCard 
                    icon="ph:drop-bold"
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.water.value : SUSTAINABILITY_DATA.india.water.value}
                    unit={activeTab === 'global' ? SUSTAINABILITY_DATA.global.water.unit : SUSTAINABILITY_DATA.india.water.unit}
                    label="Water Consumption"
                    color="#06b6d4"
                    delay={100}
                  />
                  <ImpactStatCard 
                    icon="ph:trash-bold"
                    value={activeTab === 'global' ? SUSTAINABILITY_DATA.global.waste.value : SUSTAINABILITY_DATA.india.waste.value}
                    unit={activeTab === 'global' ? SUSTAINABILITY_DATA.global.waste.unit : SUSTAINABILITY_DATA.india.waste.unit}
                    label="Waste Generated"
                    color="#f97316"
                    delay={200}
                  />
                </div>
              </div>
            </div>

            <div className="visual-footer">
              <div className="stat-pill">
                <iconify-icon icon="ph:users-bold" />
                <span>{impactCounter.usersContributing.toLocaleString()}+ Users</span>
              </div>
              <div className="stat-pill">
                <iconify-icon icon="ph:leaf-bold" />
                <span>50k+ Items Saved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-wrapper">
          <div className="login-form-card">
            <div className="form-header">
              <h3>{isForgotPassword ? "Reset Password" : isRegister ? "Create Account" : "Welcome Back"}</h3>
              <p>
                {isForgotPassword
                  ? "Enter your email to receive a password reset link."
                  : isRegister
                  ? "Fill in the details below to register."
                  : "Please enter your details to sign in."}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} noValidate>
                {resetEmailSent ? (
                  <div className="reset-success" style={{ textAlign: "center", padding: "20px 0" }}>
                    <iconify-icon icon="ph:check-circle-bold" style={{ fontSize: "48px", color: "#22c55e" }} />
                    <p style={{ marginTop: "12px", color: "#22c55e", fontWeight: "500" }}>
                      Password reset email sent!
                    </p>
                    <p style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                      Check your inbox for {email}
                    </p>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-icon-wrapper">
                      <iconify-icon icon="ph:envelope-simple-bold" />
                      <input
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage("");
                        }}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {!resetEmailSent && (
                  <button
                    type="submit"
                    className="btn-primary btn-login"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? "Sending..." : "Send Reset Link"}</span>
                    {!isLoading && <iconify-icon icon="ph:paper-plane-bold" />}
                  </button>
                )}

                {errorMessage ? (
                  <p className="auth-error">{errorMessage}</p>
                ) : null}

                <p className="signup-link">
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    onClick={() => { setIsForgotPassword(false); setErrorMessage(""); setResetEmailSent(false); }}
                  >
                    ← Back to Sign In
                  </button>
                </p>
              </form>
            ) : (
            <form onSubmit={handleLogin} noValidate>
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="displayName">Full Name</label>
                  <div className="input-icon-wrapper">
                    <iconify-icon icon="ph:user-bold" />
                    <input
                      type="text"
                      id="displayName"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <iconify-icon icon="ph:envelope-simple-bold" />
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-icon-wrapper">
                  <iconify-icon icon="ph:lock-key-bold" />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                  />
                </div>
              </div>

              {!isRegister && !isForgotPassword && (
                <div className="form-row">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    onClick={() => { setIsForgotPassword(true); setErrorMessage(""); setResetEmailSent(false); }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-login"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? isRegister
                      ? "Creating account..."
                      : "Signing in..."
                    : isRegister
                    ? "Create Account"
                    : "Sign In"}
                </span>
                {!isLoading && <iconify-icon icon="ph:arrow-right-bold" />}
              </button>

              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <iconify-icon icon="logos:google-icon" />
                <span>{isLoading ? "Please wait..." : "Sign in with Google"}</span>
              </button>

              {errorMessage ? (
                <p className="auth-error">{errorMessage}</p>
              ) : null}

              <p className="signup-link">
                {isRegister ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                      onClick={() => { setIsRegister(false); setErrorMessage(""); }}
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                      onClick={() => { setIsRegister(true); setErrorMessage(""); }}
                    >
                      Create free account
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
