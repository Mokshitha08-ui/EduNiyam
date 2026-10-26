package in.gov.aicte.approval.evc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class EvcAssignCommitteeRequest {

    @NotEmpty(message = "Committee members list cannot be empty")
    @Valid
    private List<EvcMemberAssignItem> members;

    public EvcAssignCommitteeRequest() {
    }

    public EvcAssignCommitteeRequest(List<EvcMemberAssignItem> members) {
        this.members = members;
    }

    public List<EvcMemberAssignItem> getMembers() {
        return members;
    }

    public void setMembers(List<EvcMemberAssignItem> members) {
        this.members = members;
    }
}
