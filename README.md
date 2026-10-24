# AICTE Approval Management System

> **AICTE Institutional Approval Workflow Automation & Compliance Management System**  
> Centralized e-governance portal for AICTE officials to manage institutional approval applications, scrutiny stages, Expert Visit Committee (EVC) inspections, compliance requirements, land lease validities, deadline risk scoring, and automated escalations.

---

## 🏛️ Executive Summary & Key Highlights
This system addresses institutional pendency, regulatory compliance tracking, and inspection bottlenecks in the AICTE approval lifecycle. Built desktop-first with responsive tablet/mobile capabilities, it provides customized, role-based workflows for officials and colleges.

### 🌟 Core Capabilities
1. **Executive Approval Dashboard:** High-level KPIs, SLA health, urgent action follow-up queue, interactive Recharts visualizations (processing trends, stage breakdown, regional pendency).
2. **End-to-End Application Management Desk:** Complete application lifecycle from submission to scrutiny, EVC, SAC/SHC hearing, and Council approval, with multi-criteria filtering, sorting, pagination, CSV exports, and validated application submission.
3. **Transparent Deadline-Risk Engine:** Deterministic, rule-based scoring (Low / Medium / High) that explains factors (timeline consumption %, days remaining, deficiency cycles, missing statutory documents) without opaque "black-box" claims.
4. **Configurable Workflow Pipeline & Bottleneck Tracker:** Interactive Kanban board showing stage-by-stage counts, ageing, and automated bottleneck warnings.
5. **Expert Visit Committee (EVC) Scheduling Module:** Interactive inspection queue, dual-view (list queue & month calendar), automated committee roster management from a national expert pool, conflict detection, and signed inspection report logging.
6. **Unified Compliance & Statutory Repository:** Tracking for 30-year land leases, fire safety NOCs, FDR lien letters, Divyangjan access certificates, and 7th CPC undertakings with version tracking, mock uploads, and verification stamps.
7. **Dedicated Institutional College Portal:** Scoped dashboard for college representatives (*Vivekananda Institute of Technology*) with real-time application tracking, deficiency clarification submissions, and a multi-step new application wizard.
8. **Unified Alert & Escalation Centre:** Real-time deadline notifications, deficiency alerts, and hierarchical administrative escalations (Level 1 Regional, Level 2 Bureau Head) with acknowledgement tracking.
9. **Regulatory Audit Trail:** Chronological ledger of all state movements, officer actions, timestamps, and justifications.
10. **Enterprise RBAC & One-Click Demo Personas:** Dedicated views for 6 distinct roles with instant switching for administrative evaluation.
11. **Dual Data Mode (Dummy vs. Live Backend):** Integrated toggle allowing instant switching between self-contained mock demo data and real Spring Boot REST API streaming.

---

## 🔐 Authentication & Demo Accounts

When opening the portal URL, the **Login page opens first**. Unauthenticated access to dashboard routes is strictly prevented via frontend route guards (`ProtectedRoute.jsx`).

| Role Name | Demo Email | Demo Password | Default Destination |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@demo.gov.in` | `demoPassword123` | `/dashboard` |
| **Regional Officer** | `officer@demo.gov.in` | `demoPassword123` | `/dashboard` |
| **Bureau Officer (HQ)** | `bureau@demo.gov.in` | `demoPassword123` | `/dashboard` |
| **EVC Committee Member** | `committee@demo.gov.in` | `demoPassword123` | `/evc` |
| **Compliance Reviewer** | `compliance@demo.gov.in` | `demoPassword123` | `/compliance` |
| **College Representative** | `college@demo.edu.in` | `demoPassword123` | `/college-portal` |

> 💡 **Quick Evaluation Tip:** The login screen features **One-Click Demo Persona buttons** for instantaneous role switching during demonstration reviews. You can also switch roles at any time using the **Role dropdown in the top navigation bar**.
> 
> *Alternative demo password:* `aicte@demo123`

---

## 🔄 Dual Data Mode (Dummy Data vs. Live Data)

The portal features an integrated **Data Mode Toggle** in the top navigation bar and login screen:

### 1. Dummy Data Mode (Default)
- **Behavior:** Utilizes the rich pre-seeded mock dataset stored in client `localStorage`.
- **Purpose:** Ideal for offline demonstrations, user testing, and verifying frontend workflow logic.
- **Safety:** Mutations (advancing stages, creating applications, uploading compliance documents) update local mock state only and never send updates to the real backend.
- **Visual Indicator:** Displayed with an active **"Dummy Data"** badge.

### 2. Live Data Mode
- **Behavior:** Makes live HTTP REST requests via Axios to the Spring Boot backend configured in `VITE_API_BASE_URL`.
- **No Mock Fallback:** Live Data mode strictly queries the backend and displays actual live records. It never silently substitutes mock data for real records.
- **Offline / Failure Handling:** If the Spring Boot backend is offline or an API request fails, a prominent banner is displayed:
  > *"Unable to connect to the live backend at `http://localhost:8080/api/v1`. Check that the Spring Boot server is running or switch to Dummy Data."*
  Includes an interactive **Retry Connection** button and a **Switch to Dummy Data** button.
- **Empty States:** When the backend connects but contains no records, proper clean empty states are rendered in tables and dashboards.
- **Persistence:** Selected data mode (`dummy` or `live`) is preserved in `localStorage` across page reloads.

---

## 🛠️ Technology Stack
- **Frontend Framework:** React 18 with Vite 5 (JavaScript JSX)
- **Routing:** React Router DOM v6 with role-based route guards (`ProtectedRoute.jsx`)
- **Styling:** Tailwind CSS with custom AICTE Government Navy (`#0f2942`) enterprise palette & Inter font
- **Data Visualizations:** Recharts (Area charts, Donut charts, Bar charts)
- **Icons:** Lucide React
- **HTTP Client:** Centralized Axios instance (`apiClient.js` & `apiService.js`) with request/response interceptors and JWT authorization headers.
- **State Management & Persistence:** React Context API (`AuthContext`, `AppDataContext`) with dual-mode data synchronization.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)

### Setup Instructions
```bash
# 1. Navigate to the project directory
cd /Users/mokshithagali/Desktop/aicte

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Access the portal in your browser
# URL: http://localhost:3000
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔌 Spring Boot Backend Integration

### 1. Environment Variable Configuration
Copy `.env.example` to `.env` (or configure your shell):
```bash
cp .env.example .env
```
Set `VITE_API_BASE_URL` to your running Spring Boot server endpoint:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. Required Spring Boot REST API Endpoints

The service layer in [`src/services/apiService.js`](file:///Users/mokshithagali/Desktop/aicte/src/services/apiService.js) connects to the following REST endpoints:

| Domain | Method & Path | Description |
| :--- | :--- | :--- |
| **Health** | `GET /api/v1/health` | Backend status & heartbeat check |
| **Auth** | `POST /api/v1/auth/login` | Authenticate credentials and return JWT bearer token |
| **Applications** | `GET /api/v1/applications` | Query applications with filters (`region`, `stage`, `status`) |
| **Applications** | `GET /api/v1/applications/{id}` | Application details, timeline & attachments |
| **Applications** | `POST /api/v1/applications` | Lodge new approval application |
| **Applications** | `POST /api/v1/applications/{id}/advance-stage` | Advance application to next workflow stage |
| **Applications** | `POST /api/v1/applications/{id}/deficiency` | Return application with mandatory deficiency remarks |
| **Applications** | `POST /api/v1/applications/{id}/resubmit` | Institution resubmission with rectification evidence |
| **Applications** | `PATCH /api/v1/applications/{id}/assign-officer` | Assign scrutiny officer |
| **Workflows** | `GET /api/v1/workflows` | Configured approval pathways and SLA days |
| **Compliance** | `GET /api/v1/compliance` | Registered land leases, safety NOCs & FDRs |
| **Compliance** | `POST /api/v1/compliance/{id}/verify` | Official verification / correction request |
| **Compliance** | `POST /api/v1/compliance/{id}/upload` | Upload statutory document evidence (PDF/Images) |
| **EVC** | `GET /api/v1/evc/schedules` | Expert Visit Committee inspection roster |
| **EVC** | `POST /api/v1/evc/schedules/{id}/assign` | Assign committee panel and inspection date |
| **EVC** | `POST /api/v1/evc/schedules/{id}/complete` | Record visit completion & upload report |
| **Alerts** | `GET /api/v1/notifications` | Deadline reminders, deficiency notices |
| **Alerts** | `PATCH /api/v1/notifications/{id}/read` | Mark individual notification as read |
| **Escalations** | `GET /api/v1/escalations` | Level 1 & Level 2 SLA breach escalations |
| **Escalations** | `POST /api/v1/escalations/{id}/acknowledge` | Acknowledge & resolve escalation |
| **Audit** | `GET /api/v1/audit` | Regulatory immutable event ledger |
| **Users** | `GET /api/v1/users` | List portal user accounts and RBAC roles |

*For complete Request/Response JSON payloads and database entity schemas, refer to [`API_SPECIFICATION.md`](file:///Users/mokshithagali/Desktop/aicte/API_SPECIFICATION.md).*

---

## ⚖️ Disclaimer
*All institutional names, application IDs, dates, and compliance records are illustrative mock representations for demonstration and evaluation of the AICTE Approval Management System.*
