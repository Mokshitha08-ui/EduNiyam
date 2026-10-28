package in.gov.aicte.approval.compliance.dto;


public class VerifyComplianceRequest {

    private String status;
    private String reason;
    private String remarks;
    private String correctedInstitutionName;
    private String correctedInstitutionCode;
    private String correctedDocumentNumber;
    private java.time.LocalDate correctedIssueDate;
    private java.time.LocalDate correctedExpiryDate;

    public VerifyComplianceRequest() {
    }

    public VerifyComplianceRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
        this.remarks = reason;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return this.reason != null ? this.reason : this.remarks;
    }

    public void setReason(String reason) {
        this.reason = reason;
        if (this.remarks == null) {
            this.remarks = reason;
        }
    }

    public String getRemarks() {
        return this.remarks != null ? this.remarks : this.reason;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
        if (this.reason == null) {
            this.reason = remarks;
        }
    }

    public String getCorrectedInstitutionName() {
        return correctedInstitutionName;
    }

    public void setCorrectedInstitutionName(String correctedInstitutionName) {
        this.correctedInstitutionName = correctedInstitutionName;
    }

    public String getCorrectedInstitutionCode() {
        return correctedInstitutionCode;
    }

    public void setCorrectedInstitutionCode(String correctedInstitutionCode) {
        this.correctedInstitutionCode = correctedInstitutionCode;
    }

    public String getCorrectedDocumentNumber() {
        return correctedDocumentNumber;
    }

    public void setCorrectedDocumentNumber(String correctedDocumentNumber) {
        this.correctedDocumentNumber = correctedDocumentNumber;
    }

    public java.time.LocalDate getCorrectedIssueDate() {
        return correctedIssueDate;
    }

    public void setCorrectedIssueDate(java.time.LocalDate correctedIssueDate) {
        this.correctedIssueDate = correctedIssueDate;
    }

    public java.time.LocalDate getCorrectedExpiryDate() {
        return correctedExpiryDate;
    }

    public void setCorrectedExpiryDate(java.time.LocalDate correctedExpiryDate) {
        this.correctedExpiryDate = correctedExpiryDate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String status;
        private String reason;

        public Builder() {}

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public VerifyComplianceRequest build() {
            return new VerifyComplianceRequest(this.status, this.reason);
        }
    }

}
