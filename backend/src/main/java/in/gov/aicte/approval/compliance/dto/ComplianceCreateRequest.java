package in.gov.aicte.approval.compliance.dto;

import java.time.LocalDate;

public class ComplianceCreateRequest {
    private String institutionCode;
    private String institutionName;
    private String region;
    private String applicationId;
    private String requirementType;
    private String documentName;
    private String description;
    private String applicableClause;
    private LocalDate dueDate;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String assignedReviewer;
    private String notes;

    public ComplianceCreateRequest() {}

    public String getInstitutionCode() { return institutionCode; }
    public void setInstitutionCode(String institutionCode) { this.institutionCode = institutionCode; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getRequirementType() { return requirementType; }
    public void setRequirementType(String requirementType) { this.requirementType = requirementType; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getApplicableClause() { return applicableClause; }
    public void setApplicableClause(String applicableClause) { this.applicableClause = applicableClause; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getAssignedReviewer() { return assignedReviewer; }
    public void setAssignedReviewer(String assignedReviewer) { this.assignedReviewer = assignedReviewer; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
