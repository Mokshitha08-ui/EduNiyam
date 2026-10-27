-- V9: Scoped Role/Institutional Notifications and Document Code Tracking

-- 1. Add institution_code to staff_notifications for strict institutional isolation
ALTER TABLE staff_notifications
    ADD COLUMN IF NOT EXISTS institution_code VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_staff_notif_inst_code ON staff_notifications(institution_code);

-- 2. Backfill institution_code on existing notifications from linked entities
-- Backfill from applications
UPDATE staff_notifications n
SET institution_code = a.institution_code
FROM staff_applications a
WHERE n.entity_id = a.id
  AND n.institution_code IS NULL;

-- Backfill from compliance items
UPDATE staff_notifications n
SET institution_code = c.institution_code
FROM staff_compliance_items c
WHERE (n.entity_id = c.id OR n.entity_id = c.application_id)
  AND n.institution_code IS NULL;

-- Backfill from documents
UPDATE staff_notifications n
SET institution_code = d.institution_code
FROM staff_documents d
WHERE n.entity_id = d.id
  AND n.institution_code IS NULL;

-- Set institution_code for known seeded college notifications
UPDATE staff_notifications
SET institution_code = '1-34981275'
WHERE recipient_role = 'COLLEGE_REP'
  AND institution_code IS NULL;

-- 3. Add document_code to staff_documents for structured category requirements
ALTER TABLE staff_documents
    ADD COLUMN IF NOT EXISTS document_code VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_staff_docs_code ON staff_documents(document_code);
