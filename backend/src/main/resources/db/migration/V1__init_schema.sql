-- Flyway Migration V1: AICTE Approval Management System Schema
-- Prefix: staff_

-- 1. Users Table
CREATE TABLE IF NOT EXISTS staff_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL,
    department VARCHAR(128),
    region VARCHAR(128),
    institution_code VARCHAR(64),
    institution_name VARCHAR(255),
    phone VARCHAR(64),
    avatar_url VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    last_login VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);

-- 2. Institutions Table
CREATE TABLE IF NOT EXISTS staff_institutions (
    code VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    address TEXT,
    contact_email VARCHAR(128),
    contact_phone VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workflow Definitions Table
CREATE TABLE IF NOT EXISTS staff_workflow_definitions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    version VARCHAR(32),
    effective_date DATE,
    is_default BOOLEAN DEFAULT FALSE,
    rules_json TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workflow Stages Table
CREATE TABLE IF NOT EXISTS staff_workflow_stages (
    id VARCHAR(64) PRIMARY KEY,
    workflow_id VARCHAR(64) NOT NULL REFERENCES staff_workflow_definitions(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL,
    stage_order INTEGER NOT NULL,
    target_days INTEGER NOT NULL,
    role_allowed VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_wf_stages_wf ON staff_workflow_stages(workflow_id);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS staff_applications (
    id VARCHAR(64) PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    institution_code VARCHAR(64) NOT NULL,
    application_type VARCHAR(128) NOT NULL,
    programme VARCHAR(255),
    region VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    workflow_id VARCHAR(64) REFERENCES staff_workflow_definitions(id),
    current_stage VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    assigned_officer VARCHAR(128),
    officer_role VARCHAR(64),
    submission_date DATE,
    stage_start_date DATE,
    next_deadline DATE,
    deficiency_count INTEGER DEFAULT 0,
    missing_doc_count INTEGER DEFAULT 0,
    deficiency_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_apps_region ON staff_applications(region);
CREATE INDEX IF NOT EXISTS idx_staff_apps_stage ON staff_applications(current_stage);
CREATE INDEX IF NOT EXISTS idx_staff_apps_status ON staff_applications(status);

-- 6. Application Stage History / Timeline Table
CREATE TABLE IF NOT EXISTS staff_application_stage_history (
    id BIGSERIAL PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    stage VARCHAR(128) NOT NULL,
    status VARCHAR(64) NOT NULL,
    stage_date DATE,
    note TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_app_hist_app ON staff_application_stage_history(application_id);

-- 7. Application Observations & Deficiencies Table
CREATE TABLE IF NOT EXISTS staff_deficiencies (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    observation_date DATE,
    officer VARCHAR(128),
    stage VARCHAR(64),
    status VARCHAR(64),
    remarks TEXT,
    clauses TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_defic_app ON staff_deficiencies(application_id);

-- 8. Application Documents Table
CREATE TABLE IF NOT EXISTS staff_documents (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(32) DEFAULT 'PDF',
    size VARCHAR(32),
    status VARCHAR(64) DEFAULT 'VERIFIED',
    upload_date DATE,
    file_url VARCHAR(512),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_docs_app ON staff_documents(application_id);

-- 9. Requested Intake Table
CREATE TABLE IF NOT EXISTS staff_requested_intakes (
    id BIGSERIAL PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    course VARCHAR(255) NOT NULL,
    current_intake INTEGER DEFAULT 0,
    proposed_intake INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_staff_intake_app ON staff_requested_intakes(application_id);

-- 10. EVC Schedules Table
CREATE TABLE IF NOT EXISTS staff_evc_schedules (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    region VARCHAR(128) NOT NULL,
    visit_type VARCHAR(128),
    status VARCHAR(64) NOT NULL,
    scheduling_deadline DATE,
    proposed_date DATE,
    mode VARCHAR(32) DEFAULT 'PHYSICAL',
    conflict_status VARCHAR(32) DEFAULT 'NONE',
    completion_date DATE,
    report_status VARCHAR(64),
    observations TEXT,
    geo_tagged_photos_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. EVC Committee Members Table
CREATE TABLE IF NOT EXISTS staff_evc_members (
    id BIGSERIAL PRIMARY KEY,
    schedule_id VARCHAR(64) NOT NULL REFERENCES staff_evc_schedules(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    affiliation VARCHAR(255),
    phone VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_staff_evc_members_sched ON staff_evc_members(schedule_id);

-- 12. Compliance Items Table
CREATE TABLE IF NOT EXISTS staff_compliance_items (
    id VARCHAR(64) PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    institution_code VARCHAR(64) NOT NULL,
    region VARCHAR(128) NOT NULL,
    requirement_type VARCHAR(128) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(32) DEFAULT 'PDF',
    file_size VARCHAR(32),
    issue_date DATE,
    expiry_date DATE,
    due_date DATE,
    status VARCHAR(64) NOT NULL,
    verification_status VARCHAR(64) NOT NULL,
    assigned_reviewer VARCHAR(128),
    version VARCHAR(32),
    submission_date DATE,
    notes TEXT,
    file_url VARCHAR(512),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_comp_region ON staff_compliance_items(region);
CREATE INDEX IF NOT EXISTS idx_staff_comp_status ON staff_compliance_items(status);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS staff_notifications (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    urgency VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(64),
    entity_id VARCHAR(64),
    timestamp VARCHAR(64) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    recipient_role VARCHAR(64) NOT NULL,
    link VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_notif_role ON staff_notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_staff_notif_read ON staff_notifications(is_read);

-- 14. Escalations Table
CREATE TABLE IF NOT EXISTS staff_escalations (
    id VARCHAR(64) PRIMARY KEY,
    entity_id VARCHAR(64) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    level VARCHAR(32) NOT NULL,
    level_title VARCHAR(128) NOT NULL,
    recipient VARCHAR(128) NOT NULL,
    reason TEXT NOT NULL,
    triggered_at VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    acknowledged_by VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS staff_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    previous_state VARCHAR(64),
    new_state VARCHAR(64),
    reason TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_audit_entity ON staff_audit_logs(entity_id);
