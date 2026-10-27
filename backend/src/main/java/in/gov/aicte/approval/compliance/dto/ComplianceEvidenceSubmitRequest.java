package in.gov.aicte.approval.compliance.dto;

import java.time.LocalDate;

public class ComplianceEvidenceSubmitRequest {
    private String declarationText;
    private String documentName;
    private String documentType;
    private String fileSize;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String notes;
    private String textContent;

    public ComplianceEvidenceSubmitRequest() {}

    public String getDeclarationText() { return declarationText; }
    public void setDeclarationText(String declarationText) { this.declarationText = declarationText; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }
}
