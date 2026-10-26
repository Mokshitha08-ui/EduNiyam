package in.gov.aicte.approval.application.dto;

public class ObservationVerifyRequest {

    private String decision; // RESOLVED or REOPENED
    private String verificationNotes;

    public ObservationVerifyRequest() {
    }

    public ObservationVerifyRequest(String decision, String verificationNotes) {
        this.decision = decision;
        this.verificationNotes = verificationNotes;
    }

    public String getDecision() {
        return this.decision;
    }

    public String getStatus() {
        return this.decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public void setStatus(String status) {
        this.decision = status;
    }

    public String getVerificationNotes() {
        return this.verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }
}
