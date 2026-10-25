-- Flyway Migration V2: Institutional Sign Up and Status
-- Add columns for institutional registration and verification tracking

ALTER TABLE staff_institutions ADD COLUMN IF NOT EXISTS institution_type VARCHAR(128);
ALTER TABLE staff_institutions ADD COLUMN IF NOT EXISTS district VARCHAR(128);
ALTER TABLE staff_institutions ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'VERIFIED';

-- Update existing institutions to VERIFIED status
UPDATE staff_institutions SET status = 'VERIFIED' WHERE status IS NULL;
