package in.gov.aicte.approval.evc.dto;

import in.gov.aicte.approval.evc.entity.EvcMember;

public class EvcMemberDto {

    private String name;
    private String role;
    private String affiliation;
    private String phone;

    public EvcMemberDto() {
    }

    public EvcMemberDto(String name, String role, String affiliation, String phone) {
        this.name = name;
        this.role = role;
        this.affiliation = affiliation;
        this.phone = phone;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String role;
        private String affiliation;
        private String phone;

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

        public EvcMemberDto build() {
            return new EvcMemberDto(this.name, this.role, this.affiliation, this.phone);
        }
    }

    public static EvcMemberDto fromEntity(EvcMember entity) {
        return EvcMemberDto.builder()
                .name(entity.getName())
                .role(entity.getRole())
                .affiliation(entity.getAffiliation())
                .phone(entity.getPhone())
                .build();
    }
}
