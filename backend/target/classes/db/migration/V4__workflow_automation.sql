-- Flyway Migration V4: Workflow Automation, Configurable Pathways, and Transition Rules
-- Tables prefix: staff_

-- 1. Enhance Workflow Definitions with Status & Applicable Application Types
ALTER TABLE staff_workflow_definitions ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'ACTIVE';
ALTER TABLE staff_workflow_definitions ADD COLUMN IF NOT EXISTS applicable_application_types VARCHAR(512);

UPDATE staff_workflow_definitions SET status = 'ACTIVE' WHERE status IS NULL;
UPDATE staff_workflow_definitions 
SET applicable_application_types = 'New Technical Institution, Increase in Intake / New Course, Change of Site / Infrastructure'
WHERE id = 'WF-FULL' AND applicable_application_types IS NULL;

UPDATE staff_workflow_definitions 
SET applicable_application_types = 'Introduction of New Technical Courses, Additional Divisions'
WHERE id = 'WF-SCRUTINY-EVC' AND applicable_application_types IS NULL;

UPDATE staff_workflow_definitions 
SET applicable_application_types = 'Extension of Approval (EoA)'
WHERE id = 'WF-ONLY-SCRUTINY' AND applicable_application_types IS NULL;

-- 2. Enhance Workflow Stages with Mandatory Flag, Stage Type, Permitted Next Stages, and Checklist
ALTER TABLE staff_workflow_stages ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT TRUE;
ALTER TABLE staff_workflow_stages ADD COLUMN IF NOT EXISTS stage_type VARCHAR(64) DEFAULT 'SCRUTINY';
ALTER TABLE staff_workflow_stages ADD COLUMN IF NOT EXISTS permitted_next_stages VARCHAR(255);
ALTER TABLE staff_workflow_stages ADD COLUMN IF NOT EXISTS checklist_json TEXT;

-- 3. Enhance Applications with Optimistic Locking Version & Assignment Metadata
ALTER TABLE staff_applications ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE staff_applications ADD COLUMN IF NOT EXISTS assigned_officer_id VARCHAR(64);
ALTER TABLE staff_applications ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
ALTER TABLE staff_applications ADD COLUMN IF NOT EXISTS assignment_reason TEXT;

-- 4. Enhance Deficiencies with Resolution Tracking
ALTER TABLE staff_deficiencies ADD COLUMN IF NOT EXISTS response_notes TEXT;
ALTER TABLE staff_deficiencies ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

-- 5. Seed Missing Stages for WF-SCRUTINY-EVC and WF-ONLY-SCRUTINY if not present
INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-01-SE', 'WF-SCRUTINY-EVC', 'Application Submission', 'SUBMISSION', 1, 3, 'COLLEGE_REP', TRUE, 'SUBMISSION'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-01-SE');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-02-SE', 'WF-SCRUTINY-EVC', 'Document Scrutiny', 'SCRUTINY', 2, 7, 'REGIONAL_OFFICER', TRUE, 'SCRUTINY'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-02-SE');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-03-SE', 'WF-SCRUTINY-EVC', 'EVC Physical Inspection', 'EVC', 3, 10, 'EVC_MEMBER', TRUE, 'EVC'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-03-SE');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-05-SE', 'WF-SCRUTINY-EVC', 'Executive Council Final Decision', 'FINAL_APPROVAL', 4, 5, 'ADMIN', TRUE, 'APPROVAL'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-05-SE');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-01-OS', 'WF-ONLY-SCRUTINY', 'Application Submission', 'SUBMISSION', 1, 2, 'COLLEGE_REP', TRUE, 'SUBMISSION'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-01-OS');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-02-OS', 'WF-ONLY-SCRUTINY', 'Document Scrutiny', 'SCRUTINY', 2, 5, 'REGIONAL_OFFICER', TRUE, 'SCRUTINY'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-02-OS');

INSERT INTO staff_workflow_stages (id, workflow_id, name, code, stage_order, target_days, role_allowed, is_mandatory, stage_type)
SELECT 'STG-05-OS', 'WF-ONLY-SCRUTINY', 'Executive Council Final Decision', 'FINAL_APPROVAL', 3, 3, 'ADMIN', TRUE, 'APPROVAL'
WHERE NOT EXISTS (SELECT 1 FROM staff_workflow_stages WHERE id = 'STG-05-OS');
