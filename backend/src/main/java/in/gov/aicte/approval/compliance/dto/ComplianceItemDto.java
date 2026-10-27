package in.gov.aicte.approval.compliance.dto;

import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ComplianceItemDto {

    private String id;
    private String institutionName;
    private String institutionCode;
    private String region;
    private String applicationId;
    private String requirementType;
    private String documentName;
    private String description;
    private String applicableClause;
    private String documentType;
    private String fileSize;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private LocalDate dueDate;
    private String status;
    private String verificationStatus;
    private String deadlineStatus;
    private String validityStatus;
    private Long daysUntilDue;
    private Long daysUntilExpiry;
    private String assignedReviewer;
    private String version;
    private LocalDate submissionDate;
    private String submittedBy;
    private String declarationText;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private String notes;
    private String fileUrl;
    private String versionHistoryJson;
    private String ocrStatus;
    private String ocrExtractedJson;
    private String aiAdvisoryJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplianceItemDto() {
    }

    public ComplianceItemDto(String id, String institutionName, String institutionCode, String region, String requirementType, String documentName, String documentType, String fileSize, LocalDate issueDate, LocalDate expiryDate, LocalDate dueDate, String status, String verificationStatus, String assignedReviewer, String version, LocalDate submissionDate, String notes, String fileUrl) {
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

    public String getDeadlineStatus() { return this.deadlineStatus; }
    public void setDeadlineStatus(String deadlineStatus) { this.deadlineStatus = deadlineStatus; }

    public String getValidityStatus() { return this.validityStatus; }
    public void setValidityStatus(String validityStatus) { this.validityStatus = validityStatus; }

    public Long getDaysUntilDue() { return this.daysUntilDue; }
    public void setDaysUntilDue(Long daysUntilDue) { this.daysUntilDue = daysUntilDue; }

    public Long getDaysUntilExpiry() { return this.daysUntilExpiry; }
    public void setDaysUntilExpiry(Long daysUntilExpiry) { this.daysUntilExpiry = daysUntilExpiry; }

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

    public String getVersionHistoryJson() { return this.versionHistoryJson; }
    public void setVersionHistoryJson(String versionHistoryJson) { this.versionHistoryJson = versionHistoryJson; }

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

    public static String computeDeadlineStatus(LocalDate dueDate, String verificationStatus) {
        boolean isVerified = "VERIFIED".equalsIgnoreCase(verificationStatus) || "COMPLIANT".equalsIgnoreCase(verificationStatus);
        if (isVerified) {
            return "COMPLETED";
        }
        if (dueDate == null) {
            return "NO_DEADLINE";
        }
        LocalDate today = LocalDate.now();
        if (dueDate.isBefore(today)) {
            return "OVERDUE";
        }
        if (!dueDate.isAfter(today.plusDays(14))) {
            return "DUE_SOON";
        }
        return "UPCOMING";
    }

    public static String computeValidityStatus(LocalDate expiryDate, String requirementType) {
        if (expiryDate == null) {
            if (requirementType != null && (
                    requirementType.toLowerCase().contains("lease") ||
                    requirementType.toLowerCase().contains("safety") ||
                    requirementType.toLowerCase().contains("noc") ||
                    requirementType.toLowerCase().contains("fdr"))) {
                return "UNKNOWN_VALIDITY";
            }
            return "NO_EXPIRY";
        }
        LocalDate today = LocalDate.now();
        if (expiryDate.isBefore(today)) {
            return "EXPIRED";
        }
        if (!expiryDate.isAfter(today.plusDays(30))) {
            return "EXPIRING_SOON";
        }
        return "VALID";
    }

    public static ComplianceItemDto fromEntity(ComplianceItem entity) {
        LocalDate today = LocalDate.now();
        ComplianceItemDto dto = new ComplianceItemDto();
        dto.setId(entity.getId());
        dto.setInstitutionName(entity.getInstitutionName());
        dto.setInstitutionCode(entity.getInstitutionCode());
        dto.setRegion(entity.getRegion());
        dto.setApplicationId(entity.getApplicationId());
        dto.setRequirementType(entity.getRequirementType());
        dto.setDocumentName(entity.getDocumentName());
        dto.setDescription(entity.getDescription());
        dto.setApplicableClause(entity.getApplicableClause());
        dto.setDocumentType(entity.getDocumentType());
        dto.setFileSize(entity.getFileSize());
        dto.setIssueDate(entity.getIssueDate());
        dto.setExpiryDate(entity.getExpiryDate());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus());
        dto.setVerificationStatus(entity.getVerificationStatus());
        dto.setDeadlineStatus(computeDeadlineStatus(entity.getDueDate(), entity.getVerificationStatus()));
        dto.setValidityStatus(computeValidityStatus(entity.getExpiryDate(), entity.getRequirementType()));
        if (entity.getDueDate() != null) {
            dto.setDaysUntilDue(ChronoUnit.DAYS.between(today, entity.getDueDate()));
        }
        if (entity.getExpiryDate() != null) {
            dto.setDaysUntilExpiry(ChronoUnit.DAYS.between(today, entity.getExpiryDate()));
        }
        dto.setAssignedReviewer(entity.getAssignedReviewer());
        dto.setVersion(entity.getVersion());
        dto.setSubmissionDate(entity.getSubmissionDate());
        dto.setSubmittedBy(entity.getSubmittedBy());
        dto.setDeclarationText(entity.getDeclarationText());
        dto.setVerifiedBy(entity.getVerifiedBy());
        dto.setVerifiedAt(entity.getVerifiedAt());
        dto.setNotes(entity.getNotes());
        dto.setFileUrl(entity.getFileUrl() != null ? entity.getFileUrl() : "/api/v1/compliance/" + entity.getId() + "/download");
        dto.setVersionHistoryJson(entity.getVersionHistoryJson());
        dto.setOcrStatus(entity.getOcrStatus() != null ? entity.getOcrStatus() : "NOT_RUN");
        dto.setOcrExtractedJson(entity.getOcrExtractedJson());
        dto.setAiAdvisoryJson(entity.getAiAdvisoryJson());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
