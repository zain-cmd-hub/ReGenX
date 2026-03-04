import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "ReGenX - Smart Circular Economy Marketplace",
  description: "ReGenX - AI Powered Circular Economy Marketplace",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* DNS Prefetch for external services */}
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        <link rel="dns-prefetch" href="https://code.iconify.design" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://code.iconify.design" crossOrigin="anonymous" />
        
        {/* Font stylesheet */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
