package in.gov.aicte.approval.auth.dto;

public class OfficerRequestActionRequest {

    private String assignedRole;
    private String reason;

    public OfficerRequestActionRequest() {
    }

    public OfficerRequestActionRequest(String assignedRole, String reason) {
        this.assignedRole = assignedRole;
        this.reason = reason;
    }

    public String getAssignedRole() {
        return assignedRole;
    }

    public void setAssignedRole(String assignedRole) {
        this.assignedRole = assignedRole;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
