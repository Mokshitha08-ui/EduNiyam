package in.gov.aicte.approval.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class InstitutionRegisterRequest {

    @NotBlank(message = "Official Institution Name is required")
    private String institutionName;

    private String institutionCode;

    @NotBlank(message = "Institution Type is required")
    private String institutionType;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Full Address is required")
    private String address;

    @NotBlank(message = "Representative Full Name is required")
    private String representativeName;

    @NotBlank(message = "Official Email Address is required")
    @Email(message = "Invalid official email address format")
    private String email;

    @NotBlank(message = "Contact Number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact Number must be a valid 10-digit mobile number")
    private String contactNumber;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;

    public InstitutionRegisterRequest() {
    }

    public InstitutionRegisterRequest(String institutionName, String institutionCode, String institutionType,
                                      String state, String district, String address, String representativeName,
                                      String email, String contactNumber, String designation,
                                      String password, String confirmPassword) {
        this.institutionName = institutionName;
        this.institutionCode = institutionCode;
        this.institutionType = institutionType;
        this.state = state;
        this.district = district;
        this.address = address;
        this.representativeName = representativeName;
        this.email = email;
        this.contactNumber = contactNumber;
        this.designation = designation;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getInstitutionType() {
        return institutionType;
    }

    public void setInstitutionType(String institutionType) {
        this.institutionType = institutionType;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public void setRepresentativeName(String representativeName) {
        this.representativeName = representativeName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
