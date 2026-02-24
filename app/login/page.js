"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { createUserProfile, getUserProfile } from "../lib/userService";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (!isMounted || !result?.user) return;

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
        localStorage.setItem("tscemUser", JSON.stringify(userProfile));
        router.push("/");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          `Google sign-in failed. ${error?.code || "auth/error"}`
        );
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
      localStorage.setItem("tscemUser", JSON.stringify(userProfile));
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
        localStorage.setItem("tscemUser", JSON.stringify(userProfile));
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
        localStorage.setItem("tscemUser", JSON.stringify(userProfile));
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
              <span>SCEM</span>
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
            <div className="visual-footer">
              <div className="stat-pill">
                <iconify-icon icon="ph:users-bold" />
                <span>10k+ Users</span>
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
              <h3>{isRegister ? "Create Account" : "Welcome Back"}</h3>
              <p>
                {isRegister
                  ? "Fill in the details below to register."
                  : "Please enter your details to sign in."}
              </p>
            </div>

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

              {!isRegister && (
                <div className="form-row">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">
                    Forgot password?
                  </a>
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
          </div>
        </div>
      </div>
    </div>
  );
}
