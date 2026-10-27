-- V7: Features 48-76 Schema Enhancement
-- Notifications acknowledgement, action completion, escalations resolution, audit, and explainable risk tracking

-- 1. Enhance staff_notifications for acknowledgement and action completion (Features 52, 53)
ALTER TABLE staff_notifications
    ADD COLUMN IF NOT EXISTS recipient_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(128),
    ADD COLUMN IF NOT EXISTS is_acknowledged BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS acknowledged_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS action_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS action_completed_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS action_completed_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_staff_notif_ack ON staff_notifications(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_staff_notif_action_comp ON staff_notifications(action_completed);

-- 2. Enhance staff_escalations for resolution and linking (Feature 54)
ALTER TABLE staff_escalations
    ADD COLUMN IF NOT EXISTS application_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_staff_esc_app ON staff_escalations(application_id);
CREATE INDEX IF NOT EXISTS idx_staff_esc_status ON staff_escalations(status);

-- 3. Enhance staff_applications for explainable risk scoring persistence (Features 70-75)
ALTER TABLE staff_applications
    ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(32) DEFAULT 'LOW',
    ADD COLUMN IF NOT EXISTS risk_factors_json TEXT,
    ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_staff_apps_risk_level ON staff_applications(risk_level);
