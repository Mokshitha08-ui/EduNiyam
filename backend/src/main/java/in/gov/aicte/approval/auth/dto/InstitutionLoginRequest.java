package in.gov.aicte.approval.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InstitutionLoginRequest {

    @NotBlank(message = "Institution Code / College ID is required")
    private String institutionCode;

    @NotBlank(message = "Official Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public InstitutionLoginRequest() {
    }

    public InstitutionLoginRequest(String institutionCode, String email, String password) {
        this.institutionCode = institutionCode;
        this.email = email;
        this.password = password;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
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
}
