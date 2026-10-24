package in.gov.aicte.approval.application.dto;


public class AssignOfficerRequest {

    private String officerName;
    private String officerRole;

    public AssignOfficerRequest() {
    }

    public AssignOfficerRequest(String officerName, String officerRole) {
        this.officerName = officerName;
        this.officerRole = officerRole;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String officerName;
        private String officerRole;

        public Builder() {}

        public Builder officerName(String officerName) {
            this.officerName = officerName;
            return this;
        }

        public Builder officerRole(String officerRole) {
            this.officerRole = officerRole;
            return this;
        }

        public AssignOfficerRequest build() {
            return new AssignOfficerRequest(this.officerName, this.officerRole);
        }
    }

}
