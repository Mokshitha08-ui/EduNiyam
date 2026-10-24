package in.gov.aicte.approval.compliance.dto;


public class VerifyComplianceRequest {

    private String status;
    private String reason;

    public VerifyComplianceRequest() {
    }

    public VerifyComplianceRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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
