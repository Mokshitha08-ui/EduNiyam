-- V5: Scrutiny Reviews, Structured Observations, and Enhanced EVC Management

-- 1. Scrutiny & Stage-Wise Reviews Table
CREATE TABLE IF NOT EXISTS staff_reviews (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES staff_applications(id) ON DELETE CASCADE,
    stage VARCHAR(64) NOT NULL,
    review_round INTEGER DEFAULT 1,
    reviewer_id VARCHAR(64),
    reviewer_name VARCHAR(128) NOT NULL,
    reviewer_role VARCHAR(64) NOT NULL,
    decision VARCHAR(64) NOT NULL,
    remarks TEXT,
    checklist_results_json TEXT,
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_reviews_app ON staff_reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_reviewer ON staff_reviews(reviewer_id);

-- 2. Enhance Deficiencies & Observations Table
ALTER TABLE staff_deficiencies
    ADD COLUMN IF NOT EXISTS type VARCHAR(32) DEFAULT 'DEFICIENCY',
    ADD COLUMN IF NOT EXISTS severity VARCHAR(32) DEFAULT 'MAJOR',
    ADD COLUMN IF NOT EXISTS corrective_action TEXT,
    ADD COLUMN IF NOT EXISTS deadline DATE,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(128);

-- 3. Enhance Applications for EVC Flagging
ALTER TABLE staff_applications
    ADD COLUMN IF NOT EXISTS requires_evc BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS evc_reason VARCHAR(255),
    ADD COLUMN IF NOT EXISTS evc_marked_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS evc_marked_at TIMESTAMP;

-- 4. Enhance EVC Schedules
ALTER TABLE staff_evc_schedules
    ADD COLUMN IF NOT EXISTS visit_time VARCHAR(32),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS purpose VARCHAR(255),
    ADD COLUMN IF NOT EXISTS instructions TEXT,
    ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS recommendation VARCHAR(64),
    ADD COLUMN IF NOT EXISTS findings_json TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS report_reviewed_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS report_reviewed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS report_review_notes TEXT;

-- 5. Enhance EVC Members
ALTER TABLE staff_evc_members
    ADD COLUMN IF NOT EXISTS user_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_staff_evc_sched_app ON staff_evc_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_staff_evc_members_user ON staff_evc_members(user_id);
