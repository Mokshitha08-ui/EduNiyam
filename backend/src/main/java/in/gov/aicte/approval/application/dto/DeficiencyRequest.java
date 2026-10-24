package in.gov.aicte.approval.application.dto;

import java.util.List;

public class DeficiencyRequest {

    private String reason;
    private List<String> clauses;

    public DeficiencyRequest() {
    }

    public DeficiencyRequest(String reason, List<String> clauses) {
        this.reason = reason;
        this.clauses = clauses;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<String> getClauses() {
        return this.clauses;
    }

    public void setClauses(List<String> clauses) {
        this.clauses = clauses;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String reason;
        private List<String> clauses;

        public Builder() {}

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder clauses(List<String> clauses) {
            this.clauses = clauses;
            return this;
        }

        public DeficiencyRequest build() {
            return new DeficiencyRequest(this.reason, this.clauses);
        }
    }

}
