package in.gov.aicte.approval.auth.dto;

import in.gov.aicte.approval.user.entity.OfficerAccessRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.format.DateTimeFormatter;

public class OfficerAccessRequestDto {

    private String id;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Official Email is required")
    @Email(message = "Invalid official email address")
    private String email;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Requested Role is required")
    private String requestedRole;

    @NotBlank(message = "Department / Bureau is required")
    private String department;

    private String region;

    @NotBlank(message = "Contact Number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact Number must be a valid 10-digit mobile number")
    private String contactNumber;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private String confirmPassword;

    private String status;
    private String reviewedBy;
    private String rejectionReason;
    private String createdAt;

    public OfficerAccessRequestDto() {
    }

    public OfficerAccessRequestDto(String id, String fullName, String email, String employeeId, String designation,
                                   String requestedRole, String department, String region, String contactNumber,
                                   String password, String confirmPassword, String status, String reviewedBy,
                                   String rejectionReason, String createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.designation = designation;
        this.requestedRole = requestedRole;
        this.department = department;
        this.region = region;
        this.contactNumber = contactNumber;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.status = status;
        this.reviewedBy = reviewedBy;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
    }

    public static OfficerAccessRequestDto fromEntity(OfficerAccessRequest entity) {
        if (entity == null) return null;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = entity.getCreatedAt() != null ? entity.getCreatedAt().format(fmt) : null;

        return new OfficerAccessRequestDto(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getEmployeeId(),
                entity.getDesignation(),
                entity.getRequestedRole(),
                entity.getDepartment(),
                entity.getRegion(),
                entity.getContactNumber(),
                null, // never expose password
                null,
                entity.getStatus(),
                entity.getReviewedBy(),
                entity.getRejectionReason(),
                formattedDate
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
