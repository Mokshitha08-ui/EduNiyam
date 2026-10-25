# AICTE Approval Management System

> **Unified Institutional & Official Approval Lifecycle Management Platform**  
> Centralized e-governance system for Technical Institutions and AICTE Regulatory Officials to manage approvals, stage-wise scrutinies, physical Expert Visit Committee (EVC) inspections, and compliance tracking.

---

## 🏛️ Unified Authentication Architecture

The portal implements one cohesive, unified authentication system with two primary access streams:

1. **College / Institution**:
   - **Institutional Sign In**: Verified authentication with Institution Code / College ID, Registered Official Email, and Password.
   - **Institutional Sign Up**: Complete institutional registration with institution metadata (Type, State, District, Postal Address) and authorized representative credentials.
   - **Verification Lifecycle**: New colleges enter `PENDING_VERIFICATION` status until validated by the AICTE Regional Bureau.
   - **Institutional Data Isolation**: Automatically isolates application records, documents, and compliance filings strictly to the authenticated institution's Code.

2. **AICTE Officer**:
   - **Designation Selection Desk**: Responsive 5-cadre designation grid with Lucide icons, role specifications, and descriptions:
     1. **Regional Officer** (`REGIONAL_OFFICER`): Regional applications, assignments, and stage-wise monitoring.
     2. **Bureau Officer** (`BUREAU_OFFICER`): Application scrutiny, workflow processing, and deficiency management.
     3. **EVC Committee Member** (`EVC_MEMBER`): Assigned inspections, EVC schedules, and committee evaluations.
     4. **Compliance Reviewer** (`COMPLIANCE_REVIEWER`): Compliance documents, undertakings, and deadlines.
     5. **System Administrator** (`SYSTEM_ADMIN` / `ADMIN`): User management, workflow configuration, and request approvals.
   - **Designation-Specific Sign In**: Official email and password authentication with server-side role validation. Mismatched cadres are strictly rejected (e.g. logging into Regional Officer with a Bureau Officer account is blocked).
   - **Officer Access Request (Sign Up)**: Official staff registration with Employee ID, Designation, Department, Region, and Contact. Sets status to `PENDING_APPROVAL`. System Administrator registration is disallowed for public sign-up.
   - **Administrator Access Request Desk**: Integrated into the Administrator dashboard (`/users`), allowing authorized administrators to review, approve, or reject officer access requests and assign roles with full audit logs.

---

## 🔐 Demo Credentials & Quick Evaluation Matrix

When opening the portal at `http://localhost:5173`, unauthenticated users are directed to `/login`.

### Documented Demo Accounts

| Category | Role / Cadre | Identifier / Code | Email Address | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **College / Institution** | `COLLEGE_REP` | `1-34981275` | `college@demo.edu.in` | `demoPassword123` | Institutional Portal (`/college-portal`) |
| **AICTE Officer** | `REGIONAL_OFFICER` | — | `officer@demo.gov.in` | `demoPassword123` | Approval Dashboard (`/dashboard`) |
| **AICTE Officer** | `BUREAU_OFFICER` | — | `bureau@demo.gov.in` | `demoPassword123` | Approval Dashboard (`/dashboard`) |
| **AICTE Officer** | `EVC_MEMBER` | — | `committee@demo.gov.in` | `demoPassword123` | EVC Scheduling & Roster (`/evc`) |
| **AICTE Officer** | `COMPLIANCE_REVIEWER` | — | `compliance@demo.gov.in` | `demoPassword123` | Compliance Repository (`/compliance`) |
| **AICTE Officer** | `SYSTEM_ADMIN` | — | `admin@demo.gov.in` | `demoPassword123` | Master Admin Console (`/dashboard`) |

> 💡 **One-Click Auto Fill:** In **Dummy Data** mode, click the **"Auto Fill"** button on any Sign In form to instantly populate that role's credentials for rapid testing.
> *Alternative password:* `aicte@demo123`

---

## 🧭 Authentication Navigation & Routing Map

```
/ (Root) ──> Redirects to /login if unauthenticated
               │
               ▼
             /login (Unified Authentication Landing Desk)
               ├── Category 1: College / Institution
               │     ├── Institutional Sign In ──────────> /college-portal
               │     └── Institutional Sign Up ──────────> /pending-verification (status: PENDING_VERIFICATION)
               │
               └── Category 2: AICTE Officer
                     ├── Designation Selection Grid (5 Cards)
                     │     ├── 1. Regional Officer
                     │     ├── 2. Bureau Officer
                     │     ├── 3. EVC Committee Member
                     │     ├── 4. Compliance Reviewer
                     │     └── 5. System Administrator
                     │
                     └── Selected Card Desk:
                           ├── Designation Sign In ──────> Role Dashboard (/dashboard, /evc, /compliance)
                           └── Request Access ───────────> /officer-pending-approval (status: PENDING_APPROVAL)
```

---

## 🔌 Backend REST API Specification

### 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/institution/login` | Authenticate college representative by College ID, Email, Password |
| `POST` | `/auth/institutions/register` | Register new technical institution (`PENDING_VERIFICATION`) |
| `POST` | `/auth/staff/login` | Authenticate AICTE Officer with designation role validation |
| `POST` | `/auth/staff/access-requests` | Submit new Officer Access Request (`PENDING_APPROVAL`) |
| `GET` | `/auth/me` | Fetch authenticated user profile from JWT Bearer token |
| `POST` | `/auth/logout` | Clear user session |

### 2. Administrator Access Request Endpoints (`/api/v1/admin/officer-requests`)
*(Restricted to `ADMIN` / `SYSTEM_ADMIN`)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/officer-requests` | List all officer access requests (optional `?status=PENDING_APPROVAL`) |
| `POST` | `/admin/officer-requests/{id}/approve` | Approve request, activate official account, and assign permitted role |
| `POST` | `/admin/officer-requests/{id}/reject` | Reject request with recorded audit justification |

---

## 🗄️ Database Setup & Flyway Migrations (PostgreSQL 18)

- **Database:** `aicte_db` on `localhost:5432`
- **User:** `postgres`
- **Password:** `541345`

### Migration History
1. `V1__init_schema.sql`: Initial schema creating 15 core tables.
2. `V2__institutional_signup.sql`: Adds institution status, district, and type tracking.
3. `V3__officer_access_requests.sql`: Adds `staff_officer_access_requests` table with status indexes and `employee_id` tracking.

---

## 🚀 Running the System

### 1. Spring Boot Backend
```bash
cd /Users/mokshithagali/Desktop/aicte/backend

# Run automated tests
mvn test

# Package JAR
mvn package -DskipTests

# Run Server (Port 8080)
java -jar target/aicte-approval-backend-1.0.0-SNAPSHOT.jar
```
- Health Check: `http://localhost:8080/api/v1/health`
- Swagger UI Documentation: `http://localhost:8080/api/v1/swagger-ui.html`

### 2. React + Vite Frontend
```bash
cd /Users/mokshithagali/Desktop/aicte

# Install dependencies
npm install

# Start development server
npm run dev -- --host 0.0.0.0 --port 5173

# Production build
npm run build
```
- Access Frontend Portal: `http://localhost:5173`
