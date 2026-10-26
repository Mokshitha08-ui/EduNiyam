package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;

public class EvcReportReviewRequest {

    @NotBlank(message = "Review decision is required")
    private String decision; // ACCEPTED or RETURNED

    private String reviewNotes;

    public EvcReportReviewRequest() {
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}
