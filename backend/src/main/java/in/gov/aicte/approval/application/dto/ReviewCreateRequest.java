package in.gov.aicte.approval.application.dto;

import java.util.List;
import java.util.Map;

public class ReviewCreateRequest {

    private String stage;
    private String decision; // RECOMMEND_APPROVAL, RECOMMEND_REJECTION, DEFICIENCY_REQUIRED, FORWARD_NEXT_STAGE
    private String remarks;
    private List<Map<String, Object>> checklistResults;
    private Boolean isDraft = false;

    public ReviewCreateRequest() {
    }

    public ReviewCreateRequest(String stage, String decision, String remarks, List<Map<String, Object>> checklistResults, Boolean isDraft) {
        this.stage = stage;
        this.decision = decision;
        this.remarks = remarks;
        this.checklistResults = checklistResults;
        this.isDraft = isDraft != null ? isDraft : false;
    }

    public String getStage() {
        return this.stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getDecision() {
        return this.decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getRemarks() {
        return this.remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<Map<String, Object>> getChecklistResults() {
        return this.checklistResults;
    }

    public void setChecklistResults(List<Map<String, Object>> checklistResults) {
        this.checklistResults = checklistResults;
    }

    public Boolean getIsDraft() {
        return this.isDraft != null && this.isDraft;
    }

    public boolean isDraft() {
        return this.isDraft != null && this.isDraft;
    }

    public void setIsDraft(Boolean isDraft) {
        this.isDraft = isDraft;
    }
}
