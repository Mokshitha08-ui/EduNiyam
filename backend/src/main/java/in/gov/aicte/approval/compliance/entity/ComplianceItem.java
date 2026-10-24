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
    @Column(name = "requirement_type", nullable = false, length = 128)
    private String requirementType;
    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;
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
    private String version;
    @Column(name = "submission_date")
    private LocalDate submissionDate;
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    @Column(name = "file_url", length = 512)
    private String fileUrl;
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

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInstitutionName() {
        return this.institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return this.institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getRequirementType() {
        return this.requirementType;
    }

    public void setRequirementType(String requirementType) {
        this.requirementType = requirementType;
    }

    public String getDocumentName() {
        return this.documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentType() {
        return this.documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileSize() {
        return this.fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDate getIssueDate() {
        return this.issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return this.expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDate getDueDate() {
        return this.dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVerificationStatus() {
        return this.verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getAssignedReviewer() {
        return this.assignedReviewer;
    }

    public void setAssignedReviewer(String assignedReviewer) {
        this.assignedReviewer = assignedReviewer;
    }

    public String getVersion() {
        return this.version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public LocalDate getSubmissionDate() {
        return this.submissionDate;
    }

    public void setSubmissionDate(LocalDate submissionDate) {
        this.submissionDate = submissionDate;
    }

    public String getNotes() {
        return this.notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String institutionName;
        private String institutionCode;
        private String region;
        private String requirementType;
        private String documentName;
        private String documentType = "PDF";
        private String fileSize;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private LocalDate dueDate;
        private String status;
        private String verificationStatus;
        private String assignedReviewer;
        private String version;
        private LocalDate submissionDate;
        private String notes;
        private String fileUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder institutionName(String institutionName) {
            this.institutionName = institutionName;
            return this;
        }

        public Builder institutionCode(String institutionCode) {
            this.institutionCode = institutionCode;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder requirementType(String requirementType) {
            this.requirementType = requirementType;
            return this;
        }

        public Builder documentName(String documentName) {
            this.documentName = documentName;
            return this;
        }

        public Builder documentType(String documentType) {
            this.documentType = documentType;
            return this;
        }

        public Builder fileSize(String fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public Builder issueDate(LocalDate issueDate) {
            this.issueDate = issueDate;
            return this;
        }

        public Builder expiryDate(LocalDate expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }

        public Builder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder verificationStatus(String verificationStatus) {
            this.verificationStatus = verificationStatus;
            return this;
        }

        public Builder assignedReviewer(String assignedReviewer) {
            this.assignedReviewer = assignedReviewer;
            return this;
        }

        public Builder version(String version) {
            this.version = version;
            return this;
        }

        public Builder submissionDate(LocalDate submissionDate) {
            this.submissionDate = submissionDate;
            return this;
        }

        public Builder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public Builder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ComplianceItem build() {
            return new ComplianceItem(this.id, this.institutionName, this.institutionCode, this.region, this.requirementType, this.documentName, this.documentType, this.fileSize, this.issueDate, this.expiryDate, this.dueDate, this.status, this.verificationStatus, this.assignedReviewer, this.version, this.submissionDate, this.notes, this.fileUrl, this.createdAt, this.updatedAt);
        }
    }

}
