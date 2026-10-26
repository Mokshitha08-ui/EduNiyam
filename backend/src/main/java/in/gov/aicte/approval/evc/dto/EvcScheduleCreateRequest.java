package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EvcScheduleCreateRequest {

    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotNull(message = "Proposed date is required")
    private LocalDate proposedDate;

    private String visitTime;
    private String mode;
    private String visitType;
    private String location;
    private String purpose;
    private String instructions;
    private LocalDate schedulingDeadline;

    public EvcScheduleCreateRequest() {
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
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

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDate getSchedulingDeadline() {
        return schedulingDeadline;
    }

    public void setSchedulingDeadline(LocalDate schedulingDeadline) {
        this.schedulingDeadline = schedulingDeadline;
    }
}
