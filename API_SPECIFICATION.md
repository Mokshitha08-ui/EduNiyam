# AICTE Approval & Compliance System - Spring Boot REST API Specification

This document defines the REST API contract and PostgreSQL entity data shapes required for integrating the React frontend with the Java / Spring Boot backend (`aicte-backend-service`).

---

## 1. Architecture Overview
- **Backend Framework:** Spring Boot 3.3.x (Java 17/21)
- **Security:** Spring Security 6 with Stateless JWT Bearer Authentication
- **Database:** PostgreSQL 16 with JPA / Hibernate & Liquibase/Flyway migrations
- **File Storage:** AWS S3 / MinIO Object Storage with Presigned URLs for PDF documents & EVC inspection photos
- **Client Base URL:** Defined in `.env` as `VITE_API_BASE_URL` (Default: `http://localhost:8080/api/v1`)

---

## 2. Authentication & IAM Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/login`
Authenticates official or college representative credentials and returns a JWT session token.
- **Request Body:**
```json
{
  "email": "officer@demo.gov.in",
  "password": "StrongPassword@123"
}
```
- **Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "USR-002",
    "name": "Dr. Suresh Kumar Nair",
    "email": "officer@demo.gov.in",
    "role": "REGIONAL_OFFICER",
    "department": "Regional Approval & Scrutiny",
    "region": "South-Western (Bangalore)",
    "institutionCode": null
  }
}
```

---

## 3. Applications Management Endpoints (`/api/v1/applications`)

### `GET /api/v1/applications`
Query applications with pagination, search, and multidimensional filters.
- **Query Parameters:** `page`, `size`, `search`, `region`, `stage`, `status`, `priority`
- **Response `200 OK`:**
```json
{
  "content": [
    {
      "id": "AICTE-2026-SW-8901",
      "institutionName": "Vivekananda Institute of Technology, Bangalore",
      "institutionCode": "1-34981275",
      "applicationType": "Increase in Intake / New Course",
      "region": "South-Western",
      "currentStage": "SCRUTINY",
      "status": "DEFICIENCY_NOTIFIED",
      "assignedOfficer": "Dr. Suresh Kumar Nair",
      "submissionDate": "2026-10-05",
      "nextDeadline": "2026-10-26",
      "priority": "HIGH",
      "deficiencyCount": 1
    }
  ],
  "totalElements": 8,
  "totalPages": 1
}
```

### `GET /api/v1/applications/{id}`
Returns complete application details including document references, scrutiny observations, and stage progression timeline.

### `POST /api/v1/applications/{id}/advance-stage`
Transitions an application to its next configured workflow stage.
- **Request Body:**
```json
{
  "targetStage": "EVC",
  "remarks": "Document scrutiny passed without deficiencies. Recommended for physical EVC."
}
```

### `POST /api/v1/applications/{id}/deficiency`
Returns an application to the institution for regulatory rectifications with mandatory justification.
- **Request Body:**
```json
{
  "reason": "Annexure IV boundary survey map missing in submitted Land Lease Deed.",
  "clauses": ["APH-2026 Table 2.4"]
}
```

### `POST /api/v1/applications/{id}/resubmit`
Submitted by College Representative with rectification responses and new document references.
- **Request Body:**
```json
{
  "responseNotes": "Attached Tahsildar certified boundary map and renewed FDR lien letter.",
  "documentIds": ["DOC-101-V2"]
}
```

---

## 4. EVC Scheduling Endpoints (`/api/v1/evc`)

### `GET /api/v1/evc/schedules`
Retrieve inspection queue, committee rosters, and date conflict statuses.

### `POST /api/v1/evc/schedules/{id}/assign`
Assign committee experts and schedule inspection date.
- **Request Body:**
```json
{
  "proposedDate": "2026-10-28",
  "mode": "PHYSICAL",
  "committeeMemberIds": ["EXP-01", "EXP-02"]
}
```

### `POST /api/v1/evc/schedules/{id}/complete`
Record inspection completion, findings, and upload report metadata.

---

## 5. Compliance & Statutory Repository (`/api/v1/compliance`)

### `GET /api/v1/compliance`
Filter and list statutory undertakings, land leases, fire NOCs, and FDR records.

### `POST /api/v1/compliance/{id}/verify`
Official verification or correction request.
- **Request Body:**
```json
{
  "status": "VERIFIED",
  "reason": "Registered lease deed valid for 30 years verified with Sub-Registrar seal."
}
```

### `POST /api/v1/compliance/{id}/upload`
Multi-part upload endpoint (or generates Presigned S3 PUT URL).

---

## 6. Alerts & Audit Trail Endpoints (`/api/v1/notifications`, `/api/v1/audit`)
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/{id}/read`
- `POST /api/v1/escalations/{id}/acknowledge`
- `GET /api/v1/audit` (Append-only immutable event stream)
