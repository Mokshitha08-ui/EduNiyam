package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;

public class EvcCancelRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;

    public EvcCancelRequest() {
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}
