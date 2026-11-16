# LedgerGuard – Dynamic Multi-Tenant Zero-Knowledge Billing Engine
### Initial Frontend Dashboard Foundation

> **Branding Tagline:** Secure Billing. Isolated Data. Trusted Transactions.  
> **Simulation Notice:** All financial metrics, tenant isolation indicators, zero-knowledge proof hashes, and audit events displayed in this initial frontend phase are synthetic models created for interface and architectural evaluation.

---

## 🛡️ Overview

**LedgerGuard** is an enterprise-grade multi-tenant zero-knowledge billing engine designed for high-assurance fintech and cloud infrastructure environments. This repository contains the Phase 1 frontend dashboard foundation, built with a modern enterprise SaaS fintech design direction:

- **Dark Navy Sidebar (`#090E1A`)** with collapsible navigation and persistent enclave status.
- **Clean Light Dashboard Background (`#F8FAFC`)** with rounded cards, subtle borders, and refined elevation.
- **Vibrant Enterprise Blue Accent (`#2563EB`)** with high-contrast accessibility and status tokens.
- **Shield & Checkmark Brand Identity** reflecting cryptographic data isolation and trusted transactions.
- **Responsive Architecture** supporting desktop, tablet, and mobile layouts.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **Package Manager**: `pnpm` (or `npm`)

### 1. Installation
```bash
# If using pnpm
pnpm install

# If using npm
npm install
```

### 2. Start the Development Server
```bash
# Start local Vite dev server on port 3000
pnpm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Production Build & Preview
```bash
# Compile TypeScript & bundle production assets
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 📁 Project Architecture & Folder Structure

```
LedgerGuard/
├── src/
│   ├── assets/              # Static branding and graphic assets
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx        # Status badge tokens (Active, Settled, Flagged, etc.)
│   │   ├── DemoDisclaimer.tsx # Simulation & demo mode warning banners
│   │   ├── Header.tsx       # Top bar with search, notification drawer, user menu
│   │   ├── MetricCard.tsx   # Enterprise summary metric cards
│   │   ├── Modal.tsx        # Accessible dialog window with backdrop blur
│   │   └── Sidebar.tsx      # Dark navy sidebar with collapse & active indicator
│   ├── data/
│   │   └── demoData.ts      # Comprehensive, realistic fintech sample dataset
│   ├── layouts/
│   │   └── DashboardLayout.tsx # Responsive shell (Sidebar + Header + Content)
│   ├── pages/
│   │   ├── Overview.tsx     # 4 summary metrics, revenue & activity charts, tables
│   │   ├── Tenants.tsx      # Tenant enclave management & interactive Add Tenant modal
│   │   ├── BillingLedger.tsx# Paginated ledger table with search & CSV export
│   │   ├── Transactions.tsx # Stream of ZK transactions & detailed inspection modal
│   │   ├── Analytics.tsx    # Recharts trends, monthly usage, tenant expenditure
│   │   ├── SecurityAudit.tsx# Enclave isolation checks, audit logs & scan simulator
│   │   └── Settings.tsx     # User clearance profile & billing engine parameters
│   ├── types/
│   │   └── index.ts         # Strictly typed TypeScript models
│   ├── App.tsx              # Main application router and shared session state
│   ├── index.css            # Custom enterprise fintech design system & tokens
│   └── main.tsx             # React 18 DOM mount point
├── index.html               # HTML5 shell with Google Fonts & favicon
├── package.json             # Dependencies and build scripts
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Vite bundler configuration
```

---

## 🧩 Key Implemented Features

| Feature | Description |
| :--- | :--- |
| **Overview Dashboard** | 4 summary metric cards (Total Tenants, Revenue, Transactions, System Integrity), Recharts Revenue Area chart & Transaction Line chart, recent transactions, and tenant quota progress. |
| **Tenants Management** | Searchable & filterable tenant enclaves table. Functional **"Add Tenant"** modal that dynamically appends to local React state with validation. |
| **Billing Ledger** | Tabular ledger with status filters (`Settled`, `Pending Settlement`, `Audited`, `Disputed`), pagination controls, filtered volume summary, and simulated CSV export. |
| **Transactions Registry** | Transaction log with status filters. Click **"Inspect"** to open a modal displaying line-item fee breakdowns, ZK proof hash, and public inputs hash with one-click copy. |
| **Analytics Engine** | Recharts multi-tier revenue area chart, tenant expenditure donut breakdown, monthly enclave compute bar chart, and ZK-proof generation trends with time range selectors (`30D`, `90D`, `YTD`). |
| **Security & Audit** | Hardware enclave memory health indicators, signature verification status, filterable audit log entries table, chronological threat detection timeline, and simulated **"Run Integrity Scan"** action. |
| **Platform Settings** | Profile management with security clearance level, billing settlement cycle configuration, ZK circuit optimization selector, and API credential placeholders. |
| **Interactive Modals & Toasts** | Floating toast notifications for state changes, slide-out notification drawer, and user profile flyout. |
