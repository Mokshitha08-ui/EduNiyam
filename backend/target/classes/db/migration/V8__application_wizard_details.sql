-- V8: Dynamic Application Wizard Persistence
-- Store application-specific wizard answers and dynamic form metadata

ALTER TABLE staff_applications
    ADD COLUMN IF NOT EXISTS details_json TEXT;
