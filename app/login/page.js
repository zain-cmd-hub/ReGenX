"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (!isMounted || !result?.user) return;

        const userProfile = {
          name: result.user.displayName || "",
          email: result.user.email || "",
          photo: result.user.photoURL || "",
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

  function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("Use Google sign-in to continue.");
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
              <h3>Welcome Back</h3>
              <p>Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <iconify-icon icon="ph:envelope-simple-bold" />
                  <input
                    type="email"
                    id="email"
                    placeholder="dev@example.com"
                    required
                    defaultValue="dev@example.com"
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
                    defaultValue="password"
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn-primary btn-login">
                <span>Sign In</span>
                <iconify-icon icon="ph:arrow-right-bold" />
              </button>

              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <iconify-icon icon="logos:google-icon" />
                <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
              </button>

              {errorMessage ? (
                <p className="auth-error">{errorMessage}</p>
              ) : null}

              <p className="signup-link">
                Don&apos;t have an account? <a href="#">Create free account</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
