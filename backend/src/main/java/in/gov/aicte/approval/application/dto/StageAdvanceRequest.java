package in.gov.aicte.approval.application.dto;

import java.util.List;

public class StageAdvanceRequest {

    private String targetStage;
    private String remarks;

    public StageAdvanceRequest() {
    }

    public StageAdvanceRequest(String targetStage, String remarks) {
        this.targetStage = targetStage;
        this.remarks = remarks;
    }

    public String getTargetStage() {
        return this.targetStage;
    }

    public void setTargetStage(String targetStage) {
        this.targetStage = targetStage;
    }

    public String getRemarks() {
        return this.remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String targetStage;
        private String remarks;

        public Builder() {}

        public Builder targetStage(String targetStage) {
            this.targetStage = targetStage;
            return this;
        }

        public Builder remarks(String remarks) {
            this.remarks = remarks;
            return this;
        }

        public StageAdvanceRequest build() {
            return new StageAdvanceRequest(this.targetStage, this.remarks);
        }
    }

}
