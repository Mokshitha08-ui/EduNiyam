package in.gov.aicte.approval.auth.dto;

public class InstitutionRegisterResponse {

    private boolean success;
    private String message;
    private String institutionCode;
    private String institutionName;
    private String status;
    private String registeredAt;

    public InstitutionRegisterResponse() {
    }

    public InstitutionRegisterResponse(boolean success, String message, String institutionCode, String institutionName, String status, String registeredAt) {
        this.success = success;
        this.message = message;
        this.institutionCode = institutionCode;
        this.institutionName = institutionName;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(String registeredAt) {
        this.registeredAt = registeredAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success;
        private String message;
        private String institutionCode;
        private String institutionName;
        private String status;
        private String registeredAt;

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder institutionCode(String institutionCode) {
            this.institutionCode = institutionCode;
            return this;
        }

        public Builder institutionName(String institutionName) {
            this.institutionName = institutionName;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder registeredAt(String registeredAt) {
            this.registeredAt = registeredAt;
            return this;
        }

        public InstitutionRegisterResponse build() {
            return new InstitutionRegisterResponse(success, message, institutionCode, institutionName, status, registeredAt);
        }
    }
}
