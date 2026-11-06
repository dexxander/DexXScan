# DexXScan — Website Security Assessment & Penetration Testing Platform

> **Next-Gen Cybersecurity SaaS Web Application** for authorized perimeter security evaluation, vulnerability scanning, attack surface analysis, and professional executive audit reporting.

![DexXScan Banner](https://img.shields.io/badge/Platform-DexXScan_SecOps-22c55e?style=for-the-badge)
![Status](https://img.shields.io/badge/Mode-Local_Demonstration_Prototype-eab308?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Stack-React_19_+_TypeScript_+_Vite_+_Tailwind-3b82f6?style=for-the-badge)

---

## 1. Project Overview & Architecture

**DexXScan** is a cybersecurity SaaS platform designed to evaluate websites for potential security vulnerabilities, configuration weaknesses, exposed network ports, and compliance discrepancies (OWASP Top 10, PCI-DSS v4.0).

This repository houses the **complete, responsive frontend web application** designed specifically for future integration with an asynchronous **Python FastAPI backend scanning engine** that coordinates OWASP ZAP, Nmap, SSLyze, and custom Python security evaluators.

### Core Architecture Principles:
- **No In-Browser Exploitation:** Scanning is never executed inside client browsers; browser-based logic is strictly limited to telemetry visualization, scoping, triage, and orchestration.
- **Demonstration Mode Transparency:** Real assessment telemetry requires connecting to the FastAPI scanning daemon. In local prototype mode, demonstration data is clearly flagged with `[DEMO DATA]` badges to ensure test observations are never misrepresented as live external probes.
- **Pre-Flight Target Ownership Authorization:** Targets require ownership verification (DNS TXT challenge records or HTTP challenge tokens under `/.well-known/`) and explicit legal certification before any assessment can be initiated. Active network probes are disabled by default.

---

## 2. Visual Design System

Crafted to evoke the aesthetics of enterprise Security Operations Centers (SOC), high-end Red Team command dashboards, and modern developer security tooling.

| Element | Color Hex | Role |
| :--- | :--- | :--- |
| **Main Background** | `#090B10` | Deep midnight cybersecurity canvas |
| **Sidebar Surface** | `#0D1017` | Persistent navigation rail |
| **Card Background** | `#121722` | Content containers & data panels |
| **Elevated Surface** | `#171E2B` | Hover states, modals, & controls |
| **Primary Accent** | `#22C55E` | Security green / pass indicators |
| **Secondary Accent** | `#3B82F6` | Electric blue telemetry & active vectors |
| **Borders** | `#252D3B` | Subtle technical division |
| **Typography** | Inter & JetBrains Mono | Clean sans-serif and monospace logs |

### Severity Spectrum:
- **Critical (CVSS 9.0–10.0):** `#EF4444` (Red)
- **High (CVSS 7.0–8.9):** `#F97316` (Orange)
- **Medium (CVSS 4.0–6.9):** `#EAB308` (Yellow)
- **Low (CVSS 0.1–3.9):** `#3B82F6` (Blue)
- **Informational:** `#64748B` (Slate)

---

## 3. Application Pages & Features

### 1. Dashboard (`/dashboard`)
- **Key Metrics:** Total Targets, Total Scans, Critical Findings, and Open Triage items.
- **Security Assessment Activity:** Interactive Recharts line graph with 7d, 30d, and 90d filters.
- **Vulnerability Distribution:** Severity donut chart with real-time percentage breakdown.
- **Recent Assessments Table:** Quick status tracking, findings summary pills, and direct detail routing.
- **Critical Findings Highlight:** Instant triage queue for high-risk vulnerabilities.

### 2. Registered Targets (`/targets`)
- **Target Inventory:** Authorized website targets, verification status, and risk level.
- **Add Target Dialog:** Domain URL input, scope notes, and strict legal authorization checkbox.
- **Ownership Verification Modal:** Support for **DNS TXT** challenge (`_dexxscan-challenge.<domain>`) and **HTTP Challenge File** (`/.well-known/dexxscan-challenge.txt`) with copy-to-clipboard utilities and live verification check.

### 3. New Security Assessment (`/new-scan`)
- **Multi-Step Configurator:**
  1. *Select Authorized Target:* Verifies domain authorization status.
  2. *Select Profile:* **Quick Scan** (headers, TLS, cookies), **Standard Scan** (passive OWASP ZAP rules & crawl), **Comprehensive Scan** (ports, injection checks, AXFR), or **Custom Scan**.
  3. *Select Modules:* HTTP Security Headers, SSL/TLS Assessment (SSLyze), Cookie Security, DNS Security, Network Exposure (Nmap), Web Vulnerabilities (OWASP ZAP).
  4. *Safety & Authorization:* Intensity throttling (`stealth`, `balanced`, `aggressive`), timeout controls, explicit active testing confirmation, and responsible disclosure agreement.
- **Simulated Scan Runner:** Animated console output simulating real-time module execution before transitioning directly into the completed scan telemetry.

### 4. Scan History (`/scan-history`)
- Historical audit catalog with status filters (Completed, Running, Queued, Failed, Cancelled).
- **Compare Audits Modal:** Side-by-side delta analysis between two scan sessions (baseline vs regression) evaluating score deltas and finding counts.
- Re-run scan capabilities.

### 5. Assessment Details (`/scan-details`)
- **Composite Security Score Gauge:** Circular SVG score gauge (0–100) with proprietary risk assessment disclaimer and letter grades (A+ through F).
- **Vulnerability Summary:** Breakdown across all 5 severity tiers.
- **Execution Timeline:** Per-module duration and completion timestamps.
- **Categorized Results:** Tabbed finding explorer across Web App, SSL/TLS, Headers, Cookies, and DNS.

### 6. Vulnerability Management (`/vulnerabilities`)
- Search, filter by severity, category, target domain, and remediation status.
- **Detailed Vulnerability Panel / Modal:**
  - Finding name, CVSS score, CWE identifier, and confidence rating.
  - Sanitized technical proof of concept & HTTP request-response evidence in monospace blocks.
  - Potential security impact and recommended remediation code snippets.
  - Advisory references to OWASP Top 10 and MITRE CWE.
  - Interactive **Remediation Status Selector** (`Open`, `In Progress`, `Fixed`, `Accepted Risk`) persisted in local state.

### 7. Security Reports (`/reports`)
- Catalog of compiled executive security reports.
- **Executive PDF Report Preview Layout:** Clean white document layout designed specifically for print and PDF export via `window.print()` / browser PDF engine.
- Includes cover page, confidential watermark, executive summary, target scope, vulnerability distribution matrix, detailed evidence PoC, remediation roadmap, and testing limitations disclaimer.

### 8. Security Analytics (`/analytics`)
- Macro posture metrics: Mean Time to Triage (MTTT) and remediation completion rate.
- Influx trends over time (Area chart).
- Weakness category frequency (Bar chart).
- Multi-target security posture comparison.

### 9. System & Engine Settings (`/settings`)
- **Integrations:** Real live status checker for the Python FastAPI backend engine (`http://127.0.0.1:8000/api/v1/health`), OWASP ZAP daemon endpoints, Nmap path, and SSLyze modules.
- **Scanning Policies:** Default profile, timeout, request concurrency, and rate limits.
- **Security & Workspace:** Session durations, 2FA, and audit logging parameters.

---

## 4. Centralized API Service Layer

The application utilizes a centralized service layer located in `src/services/api.ts` wired to `import.meta.env.VITE_API_BASE_URL` (defaulting to `http://127.0.0.1:8000`).

```typescript
// Authentication
authService.getCurrentUser()
authService.login(email)
authService.logout()

// Targets
targetService.getTargets()
targetService.createTarget({ domain, description, isAuthorized, verificationMethod })
targetService.verifyTarget(id)
targetService.deleteTarget(id)

// Scans
scanService.getScans()
scanService.getScanDetails(id)
scanService.createScan({ targetId, profile, modules, notes })
scanService.stopScan(id)

// Findings
findingService.getFindings()
findingService.getFindingDetails(id)
findingService.updateFindingStatus(id, status)

// Reports
reportService.getReports()
reportService.generateReport(scanId)
reportService.deleteReport(id)
```

When the FastAPI server is offline, the API client gracefully switches to local persistence via `localStorage`, ensuring complete functionality for testing and demonstrations without breaking.

---

## 5. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended, tested on Node v24)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/DexXScan/dexxscan-web.git
cd DexXScan

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### Production Build & Preview
```bash
# Typecheck and build minified bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Future Python FastAPI Backend Integration

To connect the live scanning engine:
1. Ensure the Python backend is running on `http://127.0.0.1:8000`:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
2. DexXScan will automatically detect the health check at `/api/v1/health` and switch the status pill from **Demo Mode** to **FastAPI: Online (8000)**.
