# LedgerGuard – Dynamic Multi-Tenant Zero-Knowledge Billing Engine

> **Tagline:** Secure Billing. Isolated Data. Trusted Transactions.  
> **Status:** Week 1 Completed — Enterprise API Gateway, JWT Authentication, Dynamic Database Isolation & Enterprise Login Portal.

---

## 🛡️ Project Overview

**LedgerGuard** is an enterprise-grade multi-tenant zero-knowledge billing engine designed for high-assurance fintech, cloud infrastructure, and B2B SaaS platforms.

The platform guarantees strict **data isolation** and **tamper-evident accounting**:
- Each tenant's data is stored in a dynamically isolated database (`ledgerguard_<tenantId>`) resolved at runtime through verified JWT claims.
- Cross-tenant database queries and data leaks are blocked at the API Gateway boundary.
- Zero-knowledge cryptographic models and digital signatures protect transactional privacy and auditability.

---

## 🏛️ System Architecture

```text
                                  +-------------------------------------------------------+
                                  |                 Frontend Client (Vite)                |
                                  |           React 18 + TypeScript + Lucide Icons        |
                                  |             http://localhost:3000                     |
                                  +---------------------------+---------------------------+
                                                              |
                                                    Proxy: /api -> :5000
                                                              |
                                                              v
+-------------------------------------------------------------------------------------------------------------------------+
|                                              Express API Gateway (Port 5000)                                            |
|                                                                                                                         |
|  [Security Middlewares]                                                                                                 |
|    - Helmet (HTTP Header Protection)                                                                                    |
|    - CORS (Whitelisted Client: http://localhost:3000 with credentials: true)                                            |
|    - Express JSON Parser & Global Error Handler ({ success: false, message, code })                                     |
|                                                                                                                         |
|  [Public Routes]                                                                                                        |
|    - GET  /api/v1/health       -> Gateway capabilities check ({ auth: 'jwt-bearer', tenantIsolation: 'claim-enforced' })|
|    - POST /api/v1/auth/login   -> Authenticates tenant credentials & issues signed JWT (role, tenantId, tenantName)      |
|                                                                                                                         |
|  [Protected Routes]                                                                                                     |
|    - GET   /api/v1/auth/me     -> [requireAuthAndTenant] Validates JWT signature & enforces safe tenant slug            |
|    - GET   /api/v1/tenant/context -> [attachTenantDb] Resolves isolated DB pool -> Auto-provisions profile & audit log   |
|    - PATCH /api/v1/tenant/profile -> [attachTenantDb] Updates parameters strictly inside tenant's isolated database      |
+-------------------------------------------------------------+-----------------------------------------------------------+
                                                              |
                                            Dynamic Mongoose Connection Manager
                                            Pool Cache: Map<tenantId, Connection>
                                                              |
                               +------------------------------+-------------------------------+
                               |                                                              |
                               v                                                              v
                 +---------------------------+                                  +---------------------------+
                 | MongoDB: ledgerguard_     |                                  | MongoDB: ledgerguard_     |
                 | tenant_acme               |                                  | tenant_globex             |
                 |                           |                                  |                           |
                 | - TenantProfile           |                                  | - TenantProfile           |
                 | - TenantAuditLog          |                                  | - TenantAuditLog          |
                 +---------------------------+                                  +---------------------------+
```

---

## 📁 Repository Directory Structure

```text
LedgerGuard/
├── server/                                  # Express API Gateway & Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                       # Typed and validated environment configuration
│   │   │   └── tenantDb.ts                  # Dynamic Mongoose connection manager & pool cache
│   │   ├── middleware/
│   │   │   ├── authGateway.ts               # requireAuthAndTenant gateway verification middleware
│   │   │   ├── errorHandler.ts              # Standardized AppError and JSON error formatter
│   │   │   └── tenantContext.ts             # attachTenantDb middleware binding req.tenantDb
│   │   ├── models/
│   │   │   └── tenantModels.ts              # TenantProfile & TenantAuditLog schemas + factory
│   │   ├── modules/
│   │   │   ├── auth/                        # Authentication module (service, controller, routes)
│   │   │   └── tenant/                      # Tenant management module (controller, routes)
│   │   ├── routes/
│   │   │   └── health.routes.ts             # GET /api/v1/health capabilities check
│   │   ├── types/
│   │   │   └── auth.types.ts                # UserRole, JwtPayload, Express Request augmentation
│   │   ├── app.ts                           # Express application setup
│   │   └── index.ts                         # Server entry point & graceful shutdown hooks
│   ├── .env.example                         # Environment variable template
│   ├── package.json                         # Backend dependencies (express, mongoose, jwt, bcryptjs)
│   └── tsconfig.json                        # Strict TypeScript compilation (src -> dist)
├── src/                                     # React 18 Enterprise Frontend Dashboard
│   ├── assets/                              # SVG branding and visual badges
│   ├── components/                          # Modular UI components
│   │   ├── Badge.tsx                        # Semantic status indicators
│   │   ├── DemoDisclaimer.tsx               # Transparent simulation disclaimer banners
│   │   ├── Header.tsx                       # Header with search, live DB badge & Sign Out
│   │   ├── MetricCard.tsx                   # Fintech metric cards
│   │   ├── Modal.tsx                        # Accessible modal dialog
│   │   └── Sidebar.tsx                      # Dark navy collapsible navigation with enclave status
│   ├── data/
│   │   └── demoData.ts                      # Fintech simulation datasets
│   ├── layouts/
│   │   └── DashboardLayout.tsx              # Application shell
│   ├── pages/
│   │   ├── Analytics.tsx                    # Recharts revenue & compute utilization trends
│   │   ├── BillingLedger.tsx                # Paginated ledger table with CSV export
│   │   ├── Login.tsx                        # Enterprise Login Portal with quick demo selector
│   │   ├── Overview.tsx                     # Executive overview & real-time telemetry
│   │   ├── SecurityAudit.tsx                # Cryptographic audit logs & integrity scanner
│   │   ├── Settings.tsx                     # Security clearance & billing engine parameters
│   │   ├── Tenants.tsx                      # Enclave management & tenant provisioning modal
│   │   └── Transactions.tsx                 # ZK transaction stream & inspection modal
│   ├── services/
│   │   └── api.ts                           # Typed fetch client with JWT injection & 401 interceptor
│   ├── types/
│   │   └── index.ts                         # Frontend TypeScript interfaces
│   ├── App.tsx                              # Authentication gate & dashboard router
│   ├── index.css                            # Custom enterprise fintech design system
│   └── main.tsx                             # React DOM entry point
├── index.html                               # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                             # Frontend dependencies & workspace root scripts
├── pnpm-lock.yaml                           # Pinned dependency lockfile
├── pnpm-workspace.yaml                      # Multi-package workspace configuration
├── tsconfig.json                            # Frontend TypeScript configuration
└── vite.config.ts                           # Vite bundler & dev proxy (/api -> :5000)
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **pnpm**: v9.0.0 or later (v11+ supported)
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
Install all workspace dependencies across frontend and backend in one step:
```bash
pnpm install
```

### 2. Configure Backend Environment
Create the `server/.env` file from the provided template:
```bash
# On Windows PowerShell
Copy-Item server/.env.example server/.env

# On Linux/macOS
cp server/.env.example server/.env
```

Default configuration in `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_BASE_URI=mongodb://127.0.0.1:27017
JWT_SECRET=ledgerguard_dev_secret_change_in_production
JWT_EXPIRES_IN=8h
```

### 3. Ensure MongoDB is Running
Make sure your local MongoDB instance is active:
```bash
# Verify port 27017 connectivity
# On Windows:
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017

# On Linux/macOS:
nc -zv 127.0.0.1 27017
```

### 4. Run Development Servers

Open two terminal windows:

#### Terminal 1 — Start the Backend Server (Port 5000)
```bash
cd server
pnpm run dev
```
*The server will start at `http://localhost:5000` with hot-reload enabled via `tsx`.*

#### Terminal 2 — Start the Frontend Dashboard (Port 3000)
```bash
pnpm run dev
```
*The Vite development server will start at `http://localhost:3000` with the `/api` proxy active.*

---

## 🔑 Seeded Demo Accounts (One-Click Enclave Switching)

The Enterprise Login Portal includes an interactive **"Quick Demo Enclave Accounts"** helper for seamless testing:

| Organization | Email | Password | Tenant ID | Isolated Database Name | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Acme Financial Corp** | `admin@acme.ledgerguard.io` | `Acme@2026!` | `tenant_acme` | `ledgerguard_tenant_acme` | `TENANT_ADMIN` |
| **Globex Clearing House** | `admin@globex.ledgerguard.io` | `Globex@2026!` | `tenant_globex` | `ledgerguard_tenant_globex` | `TENANT_ADMIN` |
| **LedgerGuard Root Enclave** | `secops@ledgerguard.io` | `Guard@2026!` | `tenant_platform` | `ledgerguard_tenant_platform` | `PLATFORM_ADMIN` |

---

## 🗺️ Engineering Roadmap & Milestones

| Milestone | Scope & Architecture | Status |
| :--- | :--- | :--- |
| **Week 1** | **Core Foundation & Database Isolation**<br>• Professional Enterprise SaaS Fintech Dashboard (7 pages)<br>• Express API Gateway with Helmet & CORS<br>• JWT Authentication & Bcrypt Password Hashing<br>• Claim-Based Gateway Tenant Identification Middleware<br>• Dynamic Mongoose Connection Manager (`ledgerguard_<tenantId>`)<br>• Enterprise Login Portal with One-Click Enclave Switching<br>• Vite Dev Proxy (`/api` -> `http://localhost:5000`) | **COMPLETE** ✅ |
| **Week 2** | **Distributed Concurrency & ACID Billing Ledger**<br>• Redis Distributed Lock Integration (Redlock algorithm)<br>• Atomic Quota Decrements & Concurrent Balance Verification<br>• Double-Entry Ledger Schema & Multi-Document MongoDB Transactions<br>• Micro-settlement Batch Ingestion Pipeline | *UPCOMING* ⏳ |
| **Week 3** | **Real-Time Aggregation Analytics & Usage Telemetry**<br>• MongoDB Aggregation Pipelines (Monthly Spend, Compute Hours, Storage Egress)<br>• Time-Series Event Ingestion & Tenant Quota Alerts<br>• Live Chart Telemetry Streaming via SSE / WebSockets | *UPCOMING* ⏳ |
| **Week 4** | **Cryptographic Verification, Hardening & Deployment**<br>• RSA-4096 / Ed25519 Digital Signatures for Immutable Audit Trail<br>• SHA-256 Merkle Tree State Consistency Attestation<br>• Docker Compose Orchestration (Frontend, API, MongoDB, Redis)<br>• Production Hardening & Internship Evaluation Readiness | *UPCOMING* ⏳ |

> **Architecture Notice:** In Week 1, authentication, tenant identification, and database-level isolation are **fully functional and live against MongoDB**. Financial transaction tables and billing charts currently display simulated models until the live billing engine pipeline is connected in Weeks 2–3.

---

## 🧪 Production Build Verification

To verify that all components compile cleanly:

```bash
# Verify backend compilation
pnpm --filter ledgerguard-server run build

# Verify frontend compilation
pnpm run build
```
Both builds compile with **zero TypeScript errors and zero warnings**.
