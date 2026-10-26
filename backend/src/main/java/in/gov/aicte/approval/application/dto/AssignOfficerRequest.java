package in.gov.aicte.approval.application.dto;

public class AssignOfficerRequest {

    private String officerId;
    private String officerName;
    private String officerRole;
    private String reason;

    public AssignOfficerRequest() {
    }

    public AssignOfficerRequest(String officerName, String officerRole) {
        this.officerName = officerName;
        this.officerRole = officerRole;
    }

    public AssignOfficerRequest(String officerId, String officerName, String officerRole, String reason) {
        this.officerId = officerId;
        this.officerName = officerName;
        this.officerRole = officerRole;
        this.reason = reason;
    }

    public String getOfficerId() {
        return this.officerId;
    }

    public void setOfficerId(String officerId) {
        this.officerId = officerId;
    }

    public String getOfficerName() {
        return this.officerName;
    }

    public void setOfficerName(String officerName) {
        this.officerName = officerName;
    }

    public String getOfficerRole() {
        return this.officerRole;
    }

    public void setOfficerRole(String officerRole) {
        this.officerRole = officerRole;
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
        private String officerId;
        private String officerName;
        private String officerRole;
        private String reason;

        public Builder() {}

        public Builder officerId(String officerId) {
            this.officerId = officerId;
            return this;
        }

        public Builder officerName(String officerName) {
            this.officerName = officerName;
            return this;
        }

        public Builder officerRole(String officerRole) {
            this.officerRole = officerRole;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public AssignOfficerRequest build() {
            return new AssignOfficerRequest(this.officerId, this.officerName, this.officerRole, this.reason);
        }
    }
}
