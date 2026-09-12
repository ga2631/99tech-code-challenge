# Problem 2: Interactive Currency Swap Application (Fancy Form)

An interactive, responsive cryptocurrency swap interface built with **React**, **TypeScript**, and **Vite**.

![CurrencySwap Preview](./public/tokens/SWTH.svg)

---

## 🌟 Key Features

- **⚡ Real-time Price Feeds:** Live token price data ingested and deduplicated with offline local fallback (`/prices.json`).
- **🎨 Modern Web3 Aesthetics:** Obsidian dark mode, glassmorphism cards, glowing vibrant gradients, and micro-animations.
- **🔍 Interactive Token Selector:** Quick search by token symbol or name, popular token tags, live balances, and brand icons with graceful fallback.
- **🔄 Instant Exchange Rate Calculation:** Real-time conversion, inverse rate toggle, and USD value estimations.
- **🎛️ Slippage & Deadline Settings:** Customizable slippage tolerance (0.1%, 0.5%, 1.0%, custom) with frontrunning/failure risk warnings.
- **🛡️ Robust Input Validation:**
  - Zero/negative amount prevention.
  - Insufficient balance detection with quick percentage buttons (25%, 50%, 75%, MAX).
  - Same-token pair restriction.
- **📦 Mock Blockchain Execution:** Full simulated transaction pipeline (Broadcasting $\rightarrow$ Mining $\rightarrow$ Success Receipt with Tx Hash and balance updates).
- **📜 Transaction History Log:** Local storage persistence for recent swaps with quick block explorer links.

---

## 🛠 Tech Stack

- **Framework:** React 18 + TypeScript + Vite 6
- **Icons:** `lucide-react` + Switcheo Token SVGs
- **Styling:** Custom Vanilla CSS Design System with CSS variables and glassmorphic styling
- **Deployment & Containerization:** Docker + Nginx multi-stage build

---

## 🚀 Getting Started with Docker & Local Setup

### Option 1: Run Production Build with Docker (Recommended)

From the project root directory:
```bash
# Start Problem 2 via root docker-compose
docker compose up problem2 -d
```

Or from inside `src/problem2`:
```bash
cd src/problem2

# Build and start container in detached mode
docker compose up --build -d
```
Access the application at: **`http://localhost:3000`**

To stop the container:
```bash
docker compose down
```

---

### Option 2: Run Development Mode with Hot-Reload in Docker

If you don't have Node.js installed locally but want to develop with live hot-reloading:
```bash
cd src/problem2
docker compose -f docker-compose.dev.yml up --build
```

---

### Option 3: Run Locally with Node.js & NPM

```bash
# 1. Navigate to problem directory
cd src/problem2

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

---

## 📁 Directory Structure

```text
src/problem2/
├── src/
│   ├── components/
│   │   ├── ConfirmSwapModal.tsx        # Review & confirm modal
│   │   ├── CurrencyInputCard.tsx       # Amount input with token selector
│   │   ├── Header.tsx                  # Top navbar with live feed indicator & wallet
│   │   ├── SlippageSettingsModal.tsx   # Slippage and transaction deadline settings
│   │   ├── SwapDetails.tsx             # Accordion with rate, slippage, and fee breakdown
│   │   ├── SwapForm.tsx                # Main swap form controller & state
│   │   ├── TokenImage.tsx              # SVG loader with fallback letter avatar
│   │   ├── TokenSelectModal.tsx        # Searchable token modal
│   │   ├── TransactionHistoryModal.tsx # Recent transaction drawer
│   │   └── TransactionStatusModal.tsx  # Animated broadcast & success receipt
│   ├── constants/
│   │   └── tokens.ts                   # Token metadata and mock balances
│   ├── services/
│   │   └── priceService.ts             # Price API fetcher & deduplication
│   ├── styles/
│   │   └── index.css                   # Core design tokens and CSS theme
│   ├── types/
│   │   └── token.ts                    # TypeScript definitions
│   ├── utils/
│   │   └── formatters.ts               # Currency and amount formatting utilities
│   ├── App.tsx                         # Root app component
│   └── main.tsx                        # DOM mount entrypoint
├── Dockerfile                          # Multi-stage production container
├── docker-compose.yml                  # Docker Compose configuration
├── index.html                          # Entry HTML
├── package.json                        # NPM package configuration
├── tsconfig.json                       # TypeScript config
└── vite.config.ts                      # Vite build configuration
```
