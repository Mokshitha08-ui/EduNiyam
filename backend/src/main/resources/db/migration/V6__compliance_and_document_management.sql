-- V6: Compliance Monitoring, Document Management, Versioning, Validity & OCR/AI Advisory Metadata

-- 1. Enhance staff_compliance_items
ALTER TABLE staff_compliance_items
    ADD COLUMN IF NOT EXISTS application_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS applicable_clause VARCHAR(255),
    ADD COLUMN IF NOT EXISTS declaration_text TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255),
    ADD COLUMN IF NOT EXISTS previous_version_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS version_history_json TEXT,
    ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(64) DEFAULT 'NOT_RUN',
    ADD COLUMN IF NOT EXISTS ocr_extracted_json TEXT,
    ADD COLUMN IF NOT EXISTS ai_advisory_json TEXT,
    ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_staff_comp_inst_code ON staff_compliance_items(institution_code);
CREATE INDEX IF NOT EXISTS idx_staff_comp_ver_status ON staff_compliance_items(verification_status);
CREATE INDEX IF NOT EXISTS idx_staff_comp_due_date ON staff_compliance_items(due_date);
CREATE INDEX IF NOT EXISTS idx_staff_comp_expiry_date ON staff_compliance_items(expiry_date);

-- 2. Enhance staff_documents for full Document Management, Versioning, Expiry & Verification
ALTER TABLE staff_documents ALTER COLUMN application_id DROP NOT NULL;

ALTER TABLE staff_documents
    ADD COLUMN IF NOT EXISTS compliance_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS institution_code VARCHAR(64),
    ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS version VARCHAR(32) DEFAULT '1.0',
    ADD COLUMN IF NOT EXISTS previous_version_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS version_history_json TEXT,
    ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS issue_date DATE,
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(128),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS verification_remarks TEXT,
    ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(64) DEFAULT 'NOT_RUN',
    ADD COLUMN IF NOT EXISTS ocr_extracted_json TEXT,
    ADD COLUMN IF NOT EXISTS ai_advisory_json TEXT,
    ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Backfill institution_code and institution_name on existing application documents
UPDATE staff_documents d
SET institution_code = a.institution_code,
    institution_name = a.institution_name
FROM staff_applications a
WHERE d.application_id = a.id
  AND d.institution_code IS NULL;

-- Set sensible default issue/expiry dates on existing seeded documents where applicable for validity tracking
UPDATE staff_documents
SET issue_date = COALESCE(issue_date, upload_date),
    version = COALESCE(version, '1.0'),
    uploaded_by = COALESCE(uploaded_by, 'Institutional Representative')
WHERE version IS NULL OR uploaded_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_staff_docs_inst_code ON staff_documents(institution_code);
CREATE INDEX IF NOT EXISTS idx_staff_docs_comp_id ON staff_documents(compliance_id);
CREATE INDEX IF NOT EXISTS idx_staff_docs_expiry ON staff_documents(expiry_date);
