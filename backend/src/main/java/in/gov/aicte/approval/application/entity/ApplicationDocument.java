package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "staff_documents")
public class ApplicationDocument {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = true)
    private Application application;

    @Column(name = "compliance_id", length = 64)
    private String complianceId;

    @Column(name = "document_code", length = 64)
    private String documentCode;

    @Column(name = "institution_code", length = 64)
    private String institutionCode;

    @Column(name = "institution_name", length = 255)
    private String institutionName;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "doc_type", length = 32)
    private String type = "PDF";

    @Column(name = "size", length = 32)
    private String size;

    @Column(name = "status", length = 64)
    private String status = "VERIFIED";

    @Column(name = "version", length = 32)
    private String version = "1.0";

    @Column(name = "previous_version_id", length = 64)
    private String previousVersionId;

    @Column(name = "version_history_json", columnDefinition = "TEXT")
    private String versionHistoryJson;

    @Column(name = "uploaded_by", length = 128)
    private String uploadedBy;

    @Column(name = "upload_date")
    private LocalDate uploadDate;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "verified_by", length = 128)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_remarks", columnDefinition = "TEXT")
    private String verificationRemarks;

    @Column(name = "file_url", length = 512)
    private String fileUrl;

    @Column(name = "storage_key", length = 255)
    private String storageKey;

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

    public ApplicationDocument() {
    }

    public ApplicationDocument(String id, Application application, String title, String type, String size, String status, LocalDate uploadDate, String fileUrl, LocalDateTime createdAt) {
        this.id = id;
        this.application = application;
        this.title = title;
        this.type = type;
        this.size = size;
        this.status = status;
        this.uploadDate = uploadDate;
        this.fileUrl = fileUrl;
        this.createdAt = createdAt;
        if (application != null) {
            this.institutionCode = application.getInstitutionCode();
            this.institutionName = application.getInstitutionName();
        }
    }

    public String getId() { return this.id; }
    public void setId(String id) { this.id = id; }

    public Application getApplication() { return this.application; }
    public void setApplication(Application application) {
        this.application = application;
        if (application != null) {
            if (this.institutionCode == null) this.institutionCode = application.getInstitutionCode();
            if (this.institutionName == null) this.institutionName = application.getInstitutionName();
        }
    }

    public String getComplianceId() { return this.complianceId; }
    public void setComplianceId(String complianceId) { this.complianceId = complianceId; }

    public String getDocumentCode() { return this.documentCode; }
    public void setDocumentCode(String documentCode) { this.documentCode = documentCode; }

    public String getInstitutionCode() { return this.institutionCode; }
    public void setInstitutionCode(String institutionCode) { this.institutionCode = institutionCode; }

    public String getInstitutionName() { return this.institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getTitle() { return this.title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return this.type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return this.size; }
    public void setSize(String size) { this.size = size; }

    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }

    public String getVersion() { return this.version; }
    public void setVersion(String version) { this.version = version; }

    public String getPreviousVersionId() { return this.previousVersionId; }
    public void setPreviousVersionId(String previousVersionId) { this.previousVersionId = previousVersionId; }

    public String getVersionHistoryJson() { return this.versionHistoryJson; }
    public void setVersionHistoryJson(String versionHistoryJson) { this.versionHistoryJson = versionHistoryJson; }

    public String getUploadedBy() { return this.uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDate getUploadDate() { return this.uploadDate; }
    public void setUploadDate(LocalDate uploadDate) { this.uploadDate = uploadDate; }

    public LocalDate getIssueDate() { return this.issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return this.expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getVerifiedBy() { return this.verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return this.verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerificationRemarks() { return this.verificationRemarks; }
    public void setVerificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; }

    public String getFileUrl() { return this.fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStorageKey() { return this.storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

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
        private Application application;
        private String complianceId;
        private String documentCode;
        private String institutionCode;
        private String institutionName;
        private String title;
        private String type = "PDF";
        private String size;
        private String status = "VERIFIED";
        private String version = "1.0";
        private String previousVersionId;
        private String versionHistoryJson;
        private String uploadedBy;
        private LocalDate uploadDate;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String verifiedBy;
        private LocalDateTime verifiedAt;
        private String verificationRemarks;
        private String fileUrl;
        private String storageKey;
        private String ocrStatus = "NOT_RUN";
        private String ocrExtractedJson;
        private String aiAdvisoryJson;
        private LocalDateTime lastReminderSentAt;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) { this.id = id; return this; }
        public Builder application(Application application) { this.application = application; return this; }
        public Builder complianceId(String complianceId) { this.complianceId = complianceId; return this; }
        public Builder documentCode(String documentCode) { this.documentCode = documentCode; return this; }
        public Builder institutionCode(String institutionCode) { this.institutionCode = institutionCode; return this; }
        public Builder institutionName(String institutionName) { this.institutionName = institutionName; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder size(String size) { this.size = size; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder version(String version) { this.version = version; return this; }
        public Builder previousVersionId(String previousVersionId) { this.previousVersionId = previousVersionId; return this; }
        public Builder versionHistoryJson(String versionHistoryJson) { this.versionHistoryJson = versionHistoryJson; return this; }
        public Builder uploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public Builder uploadDate(LocalDate uploadDate) { this.uploadDate = uploadDate; return this; }
        public Builder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public Builder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public Builder verifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; return this; }
        public Builder verifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; return this; }
        public Builder verificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; return this; }
        public Builder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public Builder storageKey(String storageKey) { this.storageKey = storageKey; return this; }
        public Builder ocrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; return this; }
        public Builder ocrExtractedJson(String ocrExtractedJson) { this.ocrExtractedJson = ocrExtractedJson; return this; }
        public Builder aiAdvisoryJson(String aiAdvisoryJson) { this.aiAdvisoryJson = aiAdvisoryJson; return this; }
        public Builder lastReminderSentAt(LocalDateTime lastReminderSentAt) { this.lastReminderSentAt = lastReminderSentAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ApplicationDocument build() {
            ApplicationDocument doc = new ApplicationDocument(this.id, this.application, this.title, this.type, this.size, this.status, this.uploadDate, this.fileUrl, this.createdAt);
            doc.setComplianceId(this.complianceId);
            doc.setDocumentCode(this.documentCode);
            if (this.institutionCode != null) doc.setInstitutionCode(this.institutionCode);
            if (this.institutionName != null) doc.setInstitutionName(this.institutionName);
            doc.setVersion(this.version != null ? this.version : "1.0");
            doc.setPreviousVersionId(this.previousVersionId);
            doc.setVersionHistoryJson(this.versionHistoryJson);
            doc.setUploadedBy(this.uploadedBy);
            doc.setIssueDate(this.issueDate);
            doc.setExpiryDate(this.expiryDate);
            doc.setVerifiedBy(this.verifiedBy);
            doc.setVerifiedAt(this.verifiedAt);
            doc.setVerificationRemarks(this.verificationRemarks);
            doc.setStorageKey(this.storageKey);
            doc.setOcrStatus(this.ocrStatus != null ? this.ocrStatus : "NOT_RUN");
            doc.setOcrExtractedJson(this.ocrExtractedJson);
            doc.setAiAdvisoryJson(this.aiAdvisoryJson);
            doc.setLastReminderSentAt(this.lastReminderSentAt);
            return doc;
        }
    }
}
