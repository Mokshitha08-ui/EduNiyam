# AICTE Approval Management System — Spring Boot Backend

Complete, functional Spring Boot backend for the AICTE Approval Workflow Automation, Compliance Monitoring, and Alert Management System.

---

## 1. Architecture & Technology Stack

- **Java**: 21 LTS (compiles with Java 21+ bytecode)
- **Framework**: Spring Boot 3.4.5
- **Persistence**: Spring Data JPA & Hibernate 6.6 with Type-Safe Specifications
- **Database**: PostgreSQL with schema prefix `staff_`
- **Database Migrations**: Flyway (schema at `V1__init_schema.sql`)
- **Security**: Spring Security 6 with stateless JWT Bearer Token authentication & BCrypt password hashing
- **Documentation**: Springdoc OpenAPI 3.0 / Swagger UI
- **Metrics & Health**: Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`)
- **Build Tool**: Apache Maven 3.9+
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`)

---

## 2. Directory Structure

```
backend/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── README.md
└── src/
    ├── main/
    │   ├── java/in/gov/aicte/approval/
    │   │   ├── AicteApprovalApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   ├── OpenApiConfig.java
    │   │   │   └── DataSeeder.java
    │   │   ├── security/
    │   │   │   ├── SecurityConfig.java
    │   │   │   ├── JwtTokenProvider.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── UserPrincipal.java
    │   │   │   └── CustomUserDetailsService.java
    │   │   ├── common/
    │   │   │   ├── HealthController.java
    │   │   │   ├── dto/ (ApiResponse, PageResponse)
    │   │   │   └── exception/ (GlobalExceptionHandler, ResourceNotFoundException, BadRequestException)
    │   │   ├── auth/
    │   │   │   ├── AuthController.java
    │   │   │   ├── AuthService.java
    │   │   │   └── dto/ (LoginRequest, AuthResponse, UserDto)
    │   │   ├── user/
    │   │   │   ├── entity/User.java
    │   │   │   ├── repository/UserRepository.java
    │   │   │   ├── service/UserService.java
    │   │   │   └── controller/UserController.java
    │   │   ├── institution/
    │   │   │   ├── entity/Institution.java
    │   │   │   └── repository/InstitutionRepository.java
    │   │   ├── workflow/
    │   │   │   ├── entity/ (WorkflowDefinition, WorkflowStage)
    │   │   │   ├── repository/ (WorkflowDefinitionRepository, WorkflowStageRepository)
    │   │   │   ├── service/WorkflowService.java
    │   │   │   ├── controller/WorkflowController.java
    │   │   │   └── dto/ (WorkflowDto, WorkflowStageDto)
    │   │   ├── application/
    │   │   │   ├── entity/ (Application, ApplicationDocument, ApplicationStageHistory, Observation, RequestedIntake)
    │   │   │   ├── repository/ (ApplicationRepository, ApplicationDocumentRepository, etc.)
    │   │   │   ├── service/ApplicationService.java
    │   │   │   ├── controller/ApplicationController.java
    │   │   │   └── dto/ (ApplicationDto, StageAdvanceRequest, DeficiencyRequest, ResubmitRequest, AssignOfficerRequest, etc.)
    │   │   ├── evc/
    │   │   │   ├── entity/ (EvcSchedule, EvcMember)
    │   │   │   ├── repository/ (EvcScheduleRepository, EvcMemberRepository)
    │   │   │   ├── service/EvcService.java
    │   │   │   ├── controller/EvcController.java
    │   │   │   └── dto/ (EvcScheduleDto, EvcMemberDto, EvcAssignRequest, EvcCompleteRequest)
    │   │   ├── compliance/
    │   │   │   ├── entity/ComplianceItem.java
    │   │   │   ├── repository/ComplianceItemRepository.java
    │   │   │   ├── service/ComplianceService.java
    │   │   │   ├── controller/ComplianceController.java
    │   │   │   └── dto/ (ComplianceItemDto, VerifyComplianceRequest)
    │   │   ├── notification/
    │   │   │   ├── entity/ (Notification, Escalation)
    │   │   │   ├── repository/ (NotificationRepository, EscalationRepository)
    │   │   │   ├── service/NotificationService.java
    │   │   │   ├── controller/NotificationController.java
    │   │   │   ├── controller/EscalationController.java
    │   │   │   └── dto/ (NotificationDto, EscalationDto)
    │   │   ├── audit/
    │   │   │   ├── entity/AuditLog.java
    │   │   │   ├── repository/AuditLogRepository.java
    │   │   │   ├── service/AuditService.java
    │   │   │   ├── controller/AuditController.java
    │   │   │   └── dto/AuditLogDto.java
    │   │   ├── dashboard/
    │   │   │   └── DashboardController.java
    │   │   └── report/
    │   │       └── ReportController.java
    │   └── resources/
    │       ├── application.yml
    │       └── db/migration/
    │           └── V1__init_schema.sql
    └── test/
        └── java/in/gov/aicte/approval/
            ├── AicteApprovalApplicationTests.java
            └── application/ApplicationServiceTest.java
```

---

## 3. PostgreSQL Database Setup

1. Make sure PostgreSQL is running locally or via Docker:
   ```bash
   # Create database if not existing
   psql -U postgres -c "CREATE DATABASE aicte_db;"
   ```

2. When the backend launches, **Flyway** automatically runs `V1__init_schema.sql` creating all 14 tables:
   - `staff_users`
   - `staff_institutions`
   - `staff_applications`
   - `staff_workflow_definitions`
   - `staff_workflow_stages`
   - `staff_application_stage_history`
   - `staff_deficiencies`
   - `staff_documents`
   - `staff_requested_intakes`
   - `staff_evc_schedules`
   - `staff_evc_members`
   - `staff_compliance_items`
   - `staff_notifications`
   - `staff_escalations`
   - `staff_audit_logs`

---

## 4. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/aicte_db` |
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `541345` |
| `JWT_SECRET` | Base64-encoded secret key for signing JWTs | *(Preconfigured 256-bit key)* |
| `JWT_EXPIRATION_MS` | Expiration time in milliseconds | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS`| Comma-separated allowed frontend origins | `http://localhost:3000,http://localhost:5173` |
| `SEED_DATA_ENABLED` | Seed development mock dataset on start | `true` |

---

## 5. Demo Accounts & Credentials

All demo accounts share the password: `demoPassword123`

| Role | Name | Email | Password |
|---|---|---|---|
| **System Administrator** | Shri Vikramaditya Rao | `admin@demo.gov.in` | `demoPassword123` |
| **Regional Officer** | Dr. Suresh Kumar Nair | `officer@demo.gov.in` | `demoPassword123` |
| **Bureau Officer** | Dr. Rajesh Sharma | `bureau@demo.gov.in` | `demoPassword123` |
| **EVC Committee Member** | Prof. (Dr.) Ananya Sen | `committee@demo.gov.in` | `demoPassword123` |
| **Compliance Reviewer** | Smt. Priya Varma | `compliance@demo.gov.in` | `demoPassword123` |
| **College Representative**| Dr. R. Ramanathan | `college@demo.edu.in` | `demoPassword123` |

---

## 6. How to Run the Backend

### Local Execution (Maven)
```bash
cd backend

# Compile and package
mvn clean package -DskipTests

# Run application
java -jar target/aicte-approval-backend-1.0.0-SNAPSHOT.jar
```
Or via Spring Boot Maven plugin:
```bash
mvn spring-boot:run
```

### Docker Compose
```bash
cd backend
docker-compose up --build -d
```

---

## 7. Interactive API Documentation & Swagger

- **Swagger UI**: [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/api/v1/api-docs](http://localhost:8080/api/v1/api-docs)
- **Actuator Health**: [http://localhost:8080/api/v1/actuator/health](http://localhost:8080/api/v1/actuator/health)
- **System Health Check**: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

---

## 8. Summary of REST API Endpoints

All endpoints are mounted under `/api/v1`:

### Authentication & Users
- `POST /api/v1/auth/login` — Authenticate and receive JWT token
- `GET /api/v1/auth/me` — Get profile of currently logged-in user
- `GET /api/v1/users` — List all registered official accounts
- `POST /api/v1/users` — Create new user account
- `PATCH /api/v1/users/{id}/status` — Toggle user active status

### Applications & Approval Workflow
- `GET /api/v1/applications` — Query applications with search & multi-dimensional filters
- `GET /api/v1/applications/{id}` — Full application profile, documents, timeline & deficiencies
- `POST /api/v1/applications` — Submit institutional application
- `POST /api/v1/applications/{id}/advance-stage` — Advance stage (Scrutiny -> EVC -> SAC/SHC -> Approval)
- `POST /api/v1/applications/{id}/deficiency` — Return application with deficiency notice
- `POST /api/v1/applications/{id}/resubmit` — Resubmit compliance rectifications by college
- `PATCH /api/v1/applications/{id}/assign-officer` — Assign scrutiny reviewer to application

### Workflows & Approval Pathways
- `GET /api/v1/workflows` — List configured approval pathway definitions
- `GET /api/v1/workflows/{id}` — Get single pathway definition and SLA rules
- `PUT /api/v1/workflows/{id}/config` — Update SLA days and pathway rules

### Expert Visit Committee (EVC) Inspections
- `GET /api/v1/evc/schedules` — List physical inspection schedules
- `GET /api/v1/evc/schedules/{id}` — Get single EVC inspection details
- `POST /api/v1/evc/schedules/{id}/assign` — Assign expert panel and date
- `POST /api/v1/evc/schedules/{id}/complete` — Record inspection completion and upload findings

### Statutory Compliance & Mandatory Undertakings
- `GET /api/v1/compliance` — List compliance items with filter by status/type
- `GET /api/v1/compliance/{id}` — Get compliance record
- `POST /api/v1/compliance/{id}/verify` — Verify or reject statutory submission
- `POST /api/v1/compliance/{id}/upload` — Upload compliance document file

### Notifications, Escalations & Audit Trail
- `GET /api/v1/notifications` — List alerts & reminders
- `PATCH /api/v1/notifications/{id}/read` — Mark notification read
- `PATCH /api/v1/notifications/read-all` — Mark all notifications read
- `GET /api/v1/escalations` — List active SLA breach escalations
- `POST /api/v1/escalations/{id}/acknowledge` — Acknowledge escalation
- `GET /api/v1/audit` — Immutable event stream and audit trail

---

## 9. Prototype Notice

This system is an academic e-Governance prototype for demonstration and testing purposes. It does not connect to real AICTE production databases or official council internal servers.
