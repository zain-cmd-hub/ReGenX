# ReGenX — Smart Circular Economy Marketplace

ReGenX is an AI-powered platform that helps users make sustainable decisions about their products. Upload a product image, get an AI-driven analysis of its condition, estimated resale value, remaining lifespan, and a recommendation to **Sell**, **Repair**, or **Recycle** — with nearby facility connections and eco-impact tracking.

---

## Features

- **AI Product Analysis** — Upload a product image and get instant condition assessment, sustainability score, and pricing powered by Google Gemini.
- **Digital Twin Simulation** — Visualize the future path of your product (sell / repair / recycle) with environmental impact metrics.
- **Fair Price Prediction** — Feature-based valuation engine considering depreciation, brand, condition, and market demand.
- **Eco Certificates** — Generate and download PDF certificates for completed eco-actions.
- **Nearby Facilities** — Find recycling centers, repair shops, and buyers with an interactive Leaflet map.
- **Product History** — Track all analyzed products with Firebase-synced history.
- **EcoBot Chat** — AI chatbot for recycling and sustainability questions.
- **Sustainability Dashboard** — Global impact counters, CO₂ saved, and circular economy scores.
- **Multi-language Support** — English, Hindi, and Hinglish translations.
- **Authentication** — Google sign-in via Firebase Auth with user profiles.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Frontend | React 18, CSS (custom) |
| AI/ML | Google Gemini 2.5 Flash API |
| Auth & DB | Firebase Auth, Firestore |
| Maps | Leaflet + React-Leaflet |
| PDF | jsPDF, html2canvas |
| QR Codes | qrcode |
| Deployment | Vercel |

---

## Project Structure

```
TSCEM (original)/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Main dashboard page
│   ├── globals.css               # Global styles
│   ├── api/                      # API routes (server-side)
│   │   ├── analyze-image/route.js    # Multimodal image analysis (Gemini)
│   │   ├── analyze-product/route.js  # Product valuation prompt (Gemini)
│   │   ├── chat/route.js             # EcoBot chat endpoint (Gemini)
│   │   ├── predict/route.js          # Feature-based price prediction
│   │   └── test-ai/route.js          # AI connectivity test
│   ├── components/               # React components
│   │   ├── EcoBotChat.jsx            # AI chatbot widget
│   │   ├── LoadingSkeleton.jsx       # Loading placeholders
│   │   ├── MapView.jsx               # Leaflet map for facilities
│   │   ├── ModuleCard.jsx            # Dashboard module cards
│   │   ├── SustainabilityDashboard.jsx # Impact metrics dashboard
│   │   └── sections/                 # Page sections
│   │       ├── HeroSection.jsx
│   │       ├── HowItWorksSection.jsx
│   │       ├── CoreFeaturesSection.jsx
│   │       ├── UserActionSection.jsx
│   │       ├── CertificateSection.jsx
│   │       ├── HistoryPreviewSection.jsx
│   │       └── FooterSection.jsx
│   ├── lib/                      # Shared utilities
│   │   ├── firebase.js               # Firebase config & initialization
│   │   ├── userService.js            # User profile CRUD (Firestore)
│   │   ├── translations.js           # i18n strings (en/hi/hl)
│   │   ├── sustainabilityData.js     # Eco metrics & calculations
│   │   └── worldLocations.js         # Country/state/city data
│   ├── login/page.js             # Login page
│   ├── history/page.js           # Full history page
│   └── sustainability/page.js    # Sustainability dashboard page
├── index.html                    # Standalone HTML dashboard
├── login.html                    # Standalone login page
├── script.js                     # Standalone JS for index.html
├── style.css                     # Standalone CSS for index.html
├── next.config.mjs               # Next.js configuration
├── vercel.json                   # Vercel deployment config
├── package.json                  # Dependencies & scripts
└── jsconfig.json                 # JS path aliases
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Google Gemini API key
- A Firebase project (Auth + Firestore enabled)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "TSCEM (original)"

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Deployment

The project is configured for **Vercel**. Push to your Git repository and connect it to Vercel — it will pick up `vercel.json` and `next.config.mjs` automatically.

---

## Author

**Mohammad Abbas** — Amity AI Innovation

---

## License

This project is part of the Amity AI Innovation initiative.
