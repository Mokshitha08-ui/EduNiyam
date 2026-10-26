package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;

public class EvcMemberAssignItem {

    private String userId;

    @NotBlank(message = "Member name is required")
    private String name;

    @NotBlank(message = "Member role is required")
    private String role;

    private String affiliation;
    private String phone;

    public EvcMemberAssignItem() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAffiliation() {
        return affiliation;
    }

    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
