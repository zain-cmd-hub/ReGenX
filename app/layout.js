import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Smart Circular Economy Marketplace",
  description: "AI Powered Circular Economy Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
