"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import SustainabilityDashboard from "../components/SustainabilityDashboard";
import Link from "next/link";

export default function SustainabilityPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: "", email: "", photo: "" });
  const [activeNav, setActiveNav] = useState("sustainability");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("regenxUser");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setAuthLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("regenxUser");
      localStorage.removeItem("regenxProfile");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Loading...</p>
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
          <Link href="/" className="nav-btn">
            <iconify-icon icon="ph:house-bold" />
            <span>Dashboard</span>
          </Link>
          <Link href="/sustainability" className="nav-btn active">
            <iconify-icon icon="ph:leaf-bold" />
            <span>Sustainability</span>
          </Link>
          <Link href="/history" className="nav-btn">
            <span className="nav-emoji" aria-hidden="true">📦</span>
            <span>History</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-profile">
              <div className="avatar">
                {userProfile.name ? userProfile.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="user-info">
                <span className="user-name">{userProfile.name || "User"}</span>
                <span className="user-role">{userProfile.email || ""}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <iconify-icon icon="ph:sign-out-bold" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <iconify-icon icon={isMenuOpen ? "ph:x-bold" : "ph:list-bold"} />
        </button>
        <div className="mobile-brand">
          <iconify-icon icon="ph:recycle-bold" />
          <span>ReGenX</span>
        </div>
        <div className="mobile-avatar">
          {userProfile.name ? userProfile.name.slice(0, 2).toUpperCase() : "U"}
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      <main className="main-content sustainability-page-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <Link href="/" className="back-btn">
              <iconify-icon icon="ph:arrow-left-bold" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="page-title-section">
              <div className="page-icon">
                <iconify-icon icon="ph:leaf-bold" />
              </div>
              <div>
                <h1>AI Sustainability Dashboard</h1>
                <p>Real-time environmental metrics and your contribution to the circular economy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Dashboard */}
        <div className="sustainability-page-wrapper">
          <SustainabilityDashboard 
            productType="electronics"
            action="recycle"
            isVisible={true}
          />
        </div>
      </main>
    </div>
  );
}
