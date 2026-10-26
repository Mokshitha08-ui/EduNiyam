package in.gov.aicte.approval.application.dto;

import jakarta.validation.constraints.NotBlank;

public class EvcMarkRequest {

    @NotBlank(message = "EVC reason is required")
    private String reason;

    public EvcMarkRequest() {
    }

    public EvcMarkRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
