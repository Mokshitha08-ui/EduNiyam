package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EvcRescheduleRequest {

    @NotNull(message = "Proposed date is required")
    private LocalDate proposedDate;

    private String visitTime;

    @NotBlank(message = "Reschedule reason is required")
    private String rescheduleReason;

    public EvcRescheduleRequest() {
    }

    public LocalDate getProposedDate() {
        return proposedDate;
    }

    public void setProposedDate(LocalDate proposedDate) {
        this.proposedDate = proposedDate;
    }

    public String getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(String visitTime) {
        this.visitTime = visitTime;
    }

    public String getRescheduleReason() {
        return rescheduleReason;
    }

    public void setRescheduleReason(String rescheduleReason) {
        this.rescheduleReason = rescheduleReason;
    }
}
