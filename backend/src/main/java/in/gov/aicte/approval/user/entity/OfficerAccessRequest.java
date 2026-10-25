package in.gov.aicte.approval.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "staff_officer_access_requests")
public class OfficerAccessRequest {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "full_name", nullable = false, length = 128)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 128)
    private String email;

    @Column(name = "employee_id", nullable = false, unique = true, length = 64)
    private String employeeId;

    @Column(name = "designation", nullable = false, length = 128)
    private String designation;

    @Column(name = "requested_role", nullable = false, length = 64)
    private String requestedRole;

    @Column(name = "department", nullable = false, length = 128)
    private String department;

    @Column(name = "region", length = 128)
    private String region;

    @Column(name = "contact_number", nullable = false, length = 64)
    private String contactNumber;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "PENDING_APPROVAL";

    @Column(name = "reviewed_by", length = 128)
    private String reviewedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OfficerAccessRequest() {
    }

    public OfficerAccessRequest(String id, String fullName, String email, String employeeId, String designation,
                                String requestedRole, String department, String region, String contactNumber,
                                String passwordHash, String status, String reviewedBy, String rejectionReason,
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.designation = designation;
        this.requestedRole = requestedRole;
        this.department = department;
        this.region = region;
        this.contactNumber = contactNumber;
        this.passwordHash = passwordHash;
        this.status = status;
        this.reviewedBy = reviewedBy;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String fullName;
        private String email;
        private String employeeId;
        private String designation;
        private String requestedRole;
        private String department;
        private String region;
        private String contactNumber;
        private String passwordHash;
        private String status = "PENDING_APPROVAL";
        private String reviewedBy;
        private String rejectionReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder employeeId(String employeeId) {
            this.employeeId = employeeId;
            return this;
        }

        public Builder designation(String designation) {
            this.designation = designation;
            return this;
        }

        public Builder requestedRole(String requestedRole) {
            this.requestedRole = requestedRole;
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

        public Builder contactNumber(String contactNumber) {
            this.contactNumber = contactNumber;
            return this;
        }

        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder reviewedBy(String reviewedBy) {
            this.reviewedBy = reviewedBy;
            return this;
        }

        public Builder rejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public OfficerAccessRequest build() {
            return new OfficerAccessRequest(id, fullName, email, employeeId, designation, requestedRole, department,
                    region, contactNumber, passwordHash, status, reviewedBy, rejectionReason, createdAt, updatedAt);
        }
    }
}
