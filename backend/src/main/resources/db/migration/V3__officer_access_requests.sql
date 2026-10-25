-- Flyway Migration V3: AICTE Officer Access Requests
-- Table for officer sign up / access requests requiring administrator approval

ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(64);

CREATE TABLE IF NOT EXISTS staff_officer_access_requests (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    employee_id VARCHAR(64) NOT NULL UNIQUE,
    designation VARCHAR(128) NOT NULL,
    requested_role VARCHAR(64) NOT NULL,
    department VARCHAR(128) NOT NULL,
    region VARCHAR(128),
    contact_number VARCHAR(64) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    reviewed_by VARCHAR(128),
    rejection_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_officer_requests_status ON staff_officer_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_officer_requests_email ON staff_officer_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_staff_officer_requests_empid ON staff_officer_access_requests(employee_id);
