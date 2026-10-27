package in.gov.aicte.approval.compliance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "staff_compliance_items")
public class ComplianceItem {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;
    @Column(name = "institution_code", nullable = false, length = 64)
    private String institutionCode;
    @Column(name = "region", nullable = false, length = 128)
    private String region;
    @Column(name = "application_id", length = 64)
    private String applicationId;
    @Column(name = "requirement_type", nullable = false, length = 128)
    private String requirementType;
    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "applicable_clause", length = 255)
    private String applicableClause;
    @Column(name = "document_type", length = 32)
    private String documentType = "PDF";
    @Column(name = "file_size", length = 32)
    private String fileSize;
    @Column(name = "issue_date")
    private LocalDate issueDate;
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    @Column(name = "due_date")
    private LocalDate dueDate;
    @Column(name = "status", nullable = false, length = 64)
    private String status;
    @Column(name = "verification_status", nullable = false, length = 64)
    private String verificationStatus;
    @Column(name = "assigned_reviewer", length = 128)
    private String assignedReviewer;
    @Column(name = "version", length = 32)
    private String version = "1.0";
    @Column(name = "submission_date")
    private LocalDate submissionDate;
    @Column(name = "submitted_by", length = 128)
    private String submittedBy;
    @Column(name = "declaration_text", columnDefinition = "TEXT")
    private String declarationText;
    @Column(name = "verified_by", length = 128)
    private String verifiedBy;
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    @Column(name = "file_url", length = 512)
    private String fileUrl;
    @Column(name = "storage_key", length = 255)
    private String storageKey;
    @Column(name = "previous_version_id", length = 64)
    private String previousVersionId;
    @Column(name = "version_history_json", columnDefinition = "TEXT")
    private String versionHistoryJson;
    @Column(name = "ocr_status", length = 64)
    private String ocrStatus = "NOT_RUN";
    @Column(name = "ocr_extracted_json", columnDefinition = "TEXT")
    private String ocrExtractedJson;
    @Column(name = "ai_advisory_json", columnDefinition = "TEXT")
    private String aiAdvisoryJson;
    @Column(name = "last_reminder_sent_at")
    private LocalDateTime lastReminderSentAt;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ComplianceItem() {
    }

    public ComplianceItem(String id, String institutionName, String institutionCode, String region, String requirementType, String documentName, String documentType, String fileSize, LocalDate issueDate, LocalDate expiryDate, LocalDate dueDate, String status, String verificationStatus, String assignedReviewer, String version, LocalDate submissionDate, String notes, String fileUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.institutionName = institutionName;
        this.institutionCode = institutionCode;
        this.region = region;
        this.requirementType = requirementType;
        this.documentName = documentName;
        this.documentType = documentType;
        this.fileSize = fileSize;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.dueDate = dueDate;
        this.status = status;
        this.verificationStatus = verificationStatus;
        this.assignedReviewer = assignedReviewer;
        this.version = version;
        this.submissionDate = submissionDate;
        this.notes = notes;
        this.fileUrl = fileUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return this.id; }
    public void setId(String id) { this.id = id; }

    public String getInstitutionName() { return this.institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionCode() { return this.institutionCode; }
    public void setInstitutionCode(String institutionCode) { this.institutionCode = institutionCode; }

    public String getRegion() { return this.region; }
    public void setRegion(String region) { this.region = region; }

    public String getApplicationId() { return this.applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getRequirementType() { return this.requirementType; }
    public void setRequirementType(String requirementType) { this.requirementType = requirementType; }

    public String getDocumentName() { return this.documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDescription() { return this.description; }
    public void setDescription(String description) { this.description = description; }

    public String getApplicableClause() { return this.applicableClause; }
    public void setApplicableClause(String applicableClause) { this.applicableClause = applicableClause; }

    public String getDocumentType() { return this.documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileSize() { return this.fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public LocalDate getIssueDate() { return this.issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return this.expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public LocalDate getDueDate() { return this.dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }

    public String getVerificationStatus() { return this.verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getAssignedReviewer() { return this.assignedReviewer; }
    public void setAssignedReviewer(String assignedReviewer) { this.assignedReviewer = assignedReviewer; }

    public String getVersion() { return this.version; }
    public void setVersion(String version) { this.version = version; }

    public LocalDate getSubmissionDate() { return this.submissionDate; }
    public void setSubmissionDate(LocalDate submissionDate) { this.submissionDate = submissionDate; }

    public String getSubmittedBy() { return this.submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }

    public String getDeclarationText() { return this.declarationText; }
    public void setDeclarationText(String declarationText) { this.declarationText = declarationText; }

    public String getVerifiedBy() { return this.verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return this.verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getNotes() { return this.notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getFileUrl() { return this.fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStorageKey() { return this.storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public String getPreviousVersionId() { return this.previousVersionId; }
    public void setPreviousVersionId(String previousVersionId) { this.previousVersionId = previousVersionId; }

    public String getVersionHistoryJson() { return this.versionHistoryJson; }
    public void setVersionHistoryJson(String versionHistoryJson) { this.versionHistoryJson = versionHistoryJson; }

    public String getOcrStatus() { return this.ocrStatus; }
    public void setOcrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; }

    public String getOcrExtractedJson() { return this.ocrExtractedJson; }
    public void setOcrExtractedJson(String ocrExtractedJson) { this.ocrExtractedJson = ocrExtractedJson; }

    public String getAiAdvisoryJson() { return this.aiAdvisoryJson; }
    public void setAiAdvisoryJson(String aiAdvisoryJson) { this.aiAdvisoryJson = aiAdvisoryJson; }

    public LocalDateTime getLastReminderSentAt() { return this.lastReminderSentAt; }
    public void setLastReminderSentAt(LocalDateTime lastReminderSentAt) { this.lastReminderSentAt = lastReminderSentAt; }

    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String institutionName;
        private String institutionCode;
        private String region;
        private String applicationId;
        private String requirementType;
        private String documentName;
        private String description;
        private String applicableClause;
        private String documentType = "PDF";
        private String fileSize;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private LocalDate dueDate;
        private String status;
        private String verificationStatus;
        private String assignedReviewer;
        private String version = "1.0";
        private LocalDate submissionDate;
        private String submittedBy;
        private String declarationText;
        private String verifiedBy;
        private LocalDateTime verifiedAt;
        private String notes;
        private String fileUrl;
        private String storageKey;
        private String previousVersionId;
        private String versionHistoryJson;
        private String ocrStatus = "NOT_RUN";
        private String ocrExtractedJson;
        private String aiAdvisoryJson;
        private LocalDateTime lastReminderSentAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder() {}

        public Builder id(String id) { this.id = id; return this; }
        public Builder institutionName(String institutionName) { this.institutionName = institutionName; return this; }
        public Builder institutionCode(String institutionCode) { this.institutionCode = institutionCode; return this; }
        public Builder region(String region) { this.region = region; return this; }
        public Builder applicationId(String applicationId) { this.applicationId = applicationId; return this; }
        public Builder requirementType(String requirementType) { this.requirementType = requirementType; return this; }
        public Builder documentName(String documentName) { this.documentName = documentName; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder applicableClause(String applicableClause) { this.applicableClause = applicableClause; return this; }
        public Builder documentType(String documentType) { this.documentType = documentType; return this; }
        public Builder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public Builder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public Builder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder verificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder assignedReviewer(String assignedReviewer) { this.assignedReviewer = assignedReviewer; return this; }
        public Builder version(String version) { this.version = version; return this; }
        public Builder submissionDate(LocalDate submissionDate) { this.submissionDate = submissionDate; return this; }
        public Builder submittedBy(String submittedBy) { this.submittedBy = submittedBy; return this; }
        public Builder declarationText(String declarationText) { this.declarationText = declarationText; return this; }
        public Builder verifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; return this; }
        public Builder verifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public Builder storageKey(String storageKey) { this.storageKey = storageKey; return this; }
        public Builder previousVersionId(String previousVersionId) { this.previousVersionId = previousVersionId; return this; }
        public Builder versionHistoryJson(String versionHistoryJson) { this.versionHistoryJson = versionHistoryJson; return this; }
        public Builder ocrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; return this; }
        public Builder ocrExtractedJson(String ocrExtractedJson) { this.ocrExtractedJson = ocrExtractedJson; return this; }
        public Builder aiAdvisoryJson(String aiAdvisoryJson) { this.aiAdvisoryJson = aiAdvisoryJson; return this; }
        public Builder lastReminderSentAt(LocalDateTime lastReminderSentAt) { this.lastReminderSentAt = lastReminderSentAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ComplianceItem build() {
            ComplianceItem item = new ComplianceItem(this.id, this.institutionName, this.institutionCode, this.region, this.requirementType, this.documentName, this.documentType, this.fileSize, this.issueDate, this.expiryDate, this.dueDate, this.status, this.verificationStatus, this.assignedReviewer, this.version, this.submissionDate, this.notes, this.fileUrl, this.createdAt, this.updatedAt);
            item.setApplicationId(this.applicationId);
            item.setDescription(this.description);
            item.setApplicableClause(this.applicableClause);
            item.setSubmittedBy(this.submittedBy);
            item.setDeclarationText(this.declarationText);
            item.setVerifiedBy(this.verifiedBy);
            item.setVerifiedAt(this.verifiedAt);
            item.setStorageKey(this.storageKey);
            item.setPreviousVersionId(this.previousVersionId);
            item.setVersionHistoryJson(this.versionHistoryJson);
            item.setOcrStatus(this.ocrStatus);
            item.setOcrExtractedJson(this.ocrExtractedJson);
            item.setAiAdvisoryJson(this.aiAdvisoryJson);
            item.setLastReminderSentAt(this.lastReminderSentAt);
            return item;
        }
    }
}
