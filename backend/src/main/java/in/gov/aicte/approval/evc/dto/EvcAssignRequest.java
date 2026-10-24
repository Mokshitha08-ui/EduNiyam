package in.gov.aicte.approval.evc.dto;

import java.time.LocalDate;
import java.util.List;

public class EvcAssignRequest {

    private LocalDate proposedDate;
    private String mode;
    private List<EvcMemberDto> committeeMembers;
    private List<String> committeeMemberIds;

    public EvcAssignRequest() {
    }

    public EvcAssignRequest(LocalDate proposedDate, String mode, List<EvcMemberDto> committeeMembers, List<String> committeeMemberIds) {
        this.proposedDate = proposedDate;
        this.mode = mode;
        this.committeeMembers = committeeMembers;
        this.committeeMemberIds = committeeMemberIds;
    }

    public LocalDate getProposedDate() {
        return this.proposedDate;
    }

    public void setProposedDate(LocalDate proposedDate) {
        this.proposedDate = proposedDate;
    }

    public String getMode() {
        return this.mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public List<EvcMemberDto> getCommitteeMembers() {
        return this.committeeMembers;
    }

    public void setCommitteeMembers(List<EvcMemberDto> committeeMembers) {
        this.committeeMembers = committeeMembers;
    }

    public List<String> getCommitteeMemberIds() {
        return this.committeeMemberIds;
    }

    public void setCommitteeMemberIds(List<String> committeeMemberIds) {
        this.committeeMemberIds = committeeMemberIds;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private LocalDate proposedDate;
        private String mode;
        private List<EvcMemberDto> committeeMembers;
        private List<String> committeeMemberIds;

        public Builder() {}

        public Builder proposedDate(LocalDate proposedDate) {
            this.proposedDate = proposedDate;
            return this;
        }

        public Builder mode(String mode) {
            this.mode = mode;
            return this;
        }

        public Builder committeeMembers(List<EvcMemberDto> committeeMembers) {
            this.committeeMembers = committeeMembers;
            return this;
        }

        public Builder committeeMemberIds(List<String> committeeMemberIds) {
            this.committeeMemberIds = committeeMemberIds;
            return this;
        }

        public EvcAssignRequest build() {
            return new EvcAssignRequest(this.proposedDate, this.mode, this.committeeMembers, this.committeeMemberIds);
        }
    }

}
