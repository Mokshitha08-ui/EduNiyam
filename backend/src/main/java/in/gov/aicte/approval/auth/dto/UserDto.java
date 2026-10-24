package in.gov.aicte.approval.auth.dto;

import in.gov.aicte.approval.user.entity.User;

public class UserDto {

    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private String region;
    private String institutionCode;
    private String institution;
    private String avatar;
    private String phone;
    private String status;
    private String lastLogin;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, String role, String department, String region, String institutionCode, String institution, String avatar, String phone, String status, String lastLogin) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.region = region;
        this.institutionCode = institutionCode;
        this.institution = institution;
        this.avatar = avatar;
        this.phone = phone;
        this.status = status;
        this.lastLogin = lastLogin;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return this.department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getInstitutionCode() {
        return this.institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getInstitution() {
        return this.institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getAvatar() {
        return this.avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getPhone() {
        return this.phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastLogin() {
        return this.lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String email;
        private String role;
        private String department;
        private String region;
        private String institutionCode;
        private String institution;
        private String avatar;
        private String phone;
        private String status;
        private String lastLogin;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder department(String department) {
            this.department = department;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder institutionCode(String institutionCode) {
            this.institutionCode = institutionCode;
            return this;
        }

        public Builder institution(String institution) {
            this.institution = institution;
            return this;
        }

        public Builder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder lastLogin(String lastLogin) {
            this.lastLogin = lastLogin;
            return this;
        }

        public UserDto build() {
            return new UserDto(this.id, this.name, this.email, this.role, this.department, this.region, this.institutionCode, this.institution, this.avatar, this.phone, this.status, this.lastLogin);
        }
    }

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .region(user.getRegion())
                .institutionCode(user.getInstitutionCode())
                .institution(user.getInstitutionName())
                .avatar(user.getAvatarUrl())
                .phone(user.getPhone())
                .status(user.getStatus())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
