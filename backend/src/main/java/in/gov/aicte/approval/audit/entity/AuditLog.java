package in.gov.aicte.approval.audit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "staff_audit_logs")
public class AuditLog {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @Column(name = "timestamp", nullable = false, length = 64)
    private String timestamp;
    @Column(name = "user_name", nullable = false, length = 128)
    private String userName;
    @Column(name = "role", nullable = false, length = 64)
    private String role;
    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;
    @Column(name = "action", nullable = false, length = 64)
    private String action;
    @Column(name = "previous_state", length = 64)
    private String previousState;
    @Column(name = "new_state", length = 64)
    private String newState;
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    @Column(name = "ip_address", length = 64)
    private String ipAddress;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public AuditLog(String id, String timestamp, String userName, String role, String entityId, String action, String previousState, String newState, String reason, String ipAddress, LocalDateTime createdAt) {
        this.id = id;
        this.timestamp = timestamp;
        this.userName = userName;
        this.role = role;
        this.entityId = entityId;
        this.action = action;
        this.previousState = previousState;
        this.newState = newState;
        this.reason = reason;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTimestamp() {
        return this.timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getUserName() {
        return this.userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEntityId() {
        return this.entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getAction() {
        return this.action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getPreviousState() {
        return this.previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return this.newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getIpAddress() {
        return this.ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String timestamp;
        private String userName;
        private String role;
        private String entityId;
        private String action;
        private String previousState;
        private String newState;
        private String reason;
        private String ipAddress;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder previousState(String previousState) {
            this.previousState = previousState;
            return this;
        }

        public Builder newState(String newState) {
            this.newState = newState;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder ipAddress(String ipAddress) {
            this.ipAddress = ipAddress;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AuditLog build() {
            return new AuditLog(this.id, this.timestamp, this.userName, this.role, this.entityId, this.action, this.previousState, this.newState, this.reason, this.ipAddress, this.createdAt);
        }
    }

}
