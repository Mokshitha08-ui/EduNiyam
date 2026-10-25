package in.gov.aicte.approval.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class StaffLoginRequest {

    @NotBlank(message = "Official Email is required")
    @Email(message = "Invalid official email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String requestedRole;

    public StaffLoginRequest() {
    }

    public StaffLoginRequest(String email, String password, String requestedRole) {
        this.email = email;
        this.password = password;
        this.requestedRole = requestedRole;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }
}
