package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.compliance.dto.ComplianceItemDto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ApplicationDocumentDto {

    private String id;
    private String applicationId;
    private String complianceId;
    private String documentCode;
    private String institutionCode;
    private String institutionName;
    private String title;
    private String type;
    private String size;
    private String status;
    private String validityStatus;
    private Long daysUntilExpiry;
    private String version;
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
    private String ocrStatus;
    private String ocrExtractedJson;
    private String aiAdvisoryJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationDocumentDto() {
    }

    public ApplicationDocumentDto(String id, String title, String type, String size, String status, LocalDate uploadDate, String fileUrl) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.size = size;
        this.status = status;
        this.uploadDate = uploadDate;
        this.fileUrl = fileUrl;
    }

    public String getId() { return this.id; }
    public void setId(String id) { this.id = id; }

    public String getApplicationId() { return this.applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

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

    public String getValidityStatus() { return this.validityStatus; }
    public void setValidityStatus(String validityStatus) { this.validityStatus = validityStatus; }

    public Long getDaysUntilExpiry() { return this.daysUntilExpiry; }
    public void setDaysUntilExpiry(Long daysUntilExpiry) { this.daysUntilExpiry = daysUntilExpiry; }

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

    public String getOcrStatus() { return this.ocrStatus; }
    public void setOcrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; }

    public String getOcrExtractedJson() { return this.ocrExtractedJson; }
    public void setOcrExtractedJson(String ocrExtractedJson) { this.ocrExtractedJson = ocrExtractedJson; }

    public String getAiAdvisoryJson() { return this.aiAdvisoryJson; }
    public void setAiAdvisoryJson(String aiAdvisoryJson) { this.aiAdvisoryJson = aiAdvisoryJson; }

    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return this.updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String type;
        private String size;
        private String status;
        private LocalDate uploadDate;
        private String fileUrl;

        public Builder() {}

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder size(String size) { this.size = size; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder uploadDate(LocalDate uploadDate) { this.uploadDate = uploadDate; return this; }
        public Builder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }

        public ApplicationDocumentDto build() {
            return new ApplicationDocumentDto(this.id, this.title, this.type, this.size, this.status, this.uploadDate, this.fileUrl);
        }
    }

    public static ApplicationDocumentDto fromEntity(ApplicationDocument entity) {
        ApplicationDocumentDto dto = new ApplicationDocumentDto();
        dto.setId(entity.getId());
        if (entity.getApplication() != null) {
            dto.setApplicationId(entity.getApplication().getId());
            dto.setInstitutionCode(entity.getInstitutionCode() != null ? entity.getInstitutionCode() : entity.getApplication().getInstitutionCode());
            dto.setInstitutionName(entity.getInstitutionName() != null ? entity.getInstitutionName() : entity.getApplication().getInstitutionName());
        } else {
            dto.setInstitutionCode(entity.getInstitutionCode());
            dto.setInstitutionName(entity.getInstitutionName());
        }
        dto.setComplianceId(entity.getComplianceId());
        dto.setDocumentCode(entity.getDocumentCode());
        dto.setTitle(entity.getTitle());
        dto.setType(entity.getType());
        dto.setSize(entity.getSize());
        dto.setStatus(entity.getStatus());
        dto.setValidityStatus(ComplianceItemDto.computeValidityStatus(entity.getExpiryDate(), entity.getTitle()));
        if (entity.getExpiryDate() != null) {
            dto.setDaysUntilExpiry(ChronoUnit.DAYS.between(LocalDate.now(), entity.getExpiryDate()));
        }
        dto.setVersion(entity.getVersion() != null ? entity.getVersion() : "1.0");
        dto.setPreviousVersionId(entity.getPreviousVersionId());
        dto.setVersionHistoryJson(entity.getVersionHistoryJson());
        dto.setUploadedBy(entity.getUploadedBy());
        dto.setUploadDate(entity.getUploadDate());
        dto.setIssueDate(entity.getIssueDate());
        dto.setExpiryDate(entity.getExpiryDate());
        dto.setVerifiedBy(entity.getVerifiedBy());
        dto.setVerifiedAt(entity.getVerifiedAt());
        dto.setVerificationRemarks(entity.getVerificationRemarks());
        dto.setFileUrl(entity.getFileUrl() != null ? entity.getFileUrl() : "/api/v1/documents/" + entity.getId() + "/download");
        dto.setOcrStatus(entity.getOcrStatus() != null ? entity.getOcrStatus() : "NOT_RUN");
        dto.setOcrExtractedJson(entity.getOcrExtractedJson());
        dto.setAiAdvisoryJson(entity.getAiAdvisoryJson());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
