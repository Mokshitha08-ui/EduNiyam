package in.gov.aicte.approval.evc.dto;

import in.gov.aicte.approval.evc.entity.EvcMember;

public class EvcMemberDto {

    private String name;
    private String role;
    private String affiliation;
    private String phone;
    private String userId;
    private String assignedBy;
    private java.time.LocalDateTime assignedAt;

    public EvcMemberDto() {
    }

    public EvcMemberDto(String name, String role, String affiliation, String phone,
                        String userId, String assignedBy, java.time.LocalDateTime assignedAt) {
        this.name = name;
        this.role = role;
        this.affiliation = affiliation;
        this.phone = phone;
        this.userId = userId;
        this.assignedBy = assignedBy;
        this.assignedAt = assignedAt;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAffiliation() {
        return this.affiliation;
    }

    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
    }

    public String getPhone() {
        return this.phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAssignedBy() {
        return this.assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public java.time.LocalDateTime getAssignedAt() {
        return this.assignedAt;
    }

    public void setAssignedAt(java.time.LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String role;
        private String affiliation;
        private String phone;
        private String userId;
        private String assignedBy;
        private java.time.LocalDateTime assignedAt;

        public Builder() {}

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder affiliation(String affiliation) {
            this.affiliation = affiliation;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder assignedBy(String assignedBy) {
            this.assignedBy = assignedBy;
            return this;
        }

        public Builder assignedAt(java.time.LocalDateTime assignedAt) {
            this.assignedAt = assignedAt;
            return this;
        }

        public EvcMemberDto build() {
            return new EvcMemberDto(this.name, this.role, this.affiliation, this.phone,
                    this.userId, this.assignedBy, this.assignedAt);
        }
    }

    public static EvcMemberDto fromEntity(EvcMember entity) {
        return EvcMemberDto.builder()
                .name(entity.getName())
                .role(entity.getRole())
                .affiliation(entity.getAffiliation())
                .phone(entity.getPhone())
                .userId(entity.getUserId())
                .assignedBy(entity.getAssignedBy())
                .assignedAt(entity.getAssignedAt())
                .build();
    }
}
