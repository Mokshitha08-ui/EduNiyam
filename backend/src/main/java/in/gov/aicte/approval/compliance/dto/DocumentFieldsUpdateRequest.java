package in.gov.aicte.approval.compliance.dto;

import java.time.LocalDate;

public class DocumentFieldsUpdateRequest {

    private String institutionName;
    private String institutionCode;
    private String documentNumber;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String remarks;

    public DocumentFieldsUpdateRequest() {
    }

    public DocumentFieldsUpdateRequest(String institutionName, String institutionCode, String documentNumber, LocalDate issueDate, LocalDate expiryDate, String remarks) {
        this.institutionName = institutionName;
        this.institutionCode = institutionCode;
        this.documentNumber = documentNumber;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.remarks = remarks;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
