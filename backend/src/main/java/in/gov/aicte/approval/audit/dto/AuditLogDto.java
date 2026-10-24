package in.gov.aicte.approval.audit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import in.gov.aicte.approval.audit.entity.AuditLog;

public class AuditLogDto {

    private String id;
    private String timestamp;
    @JsonProperty("user")
    private String user;
    private String role;
    private String entityId;
    private String action;
    private String previousState;
    private String newState;
    private String reason;
    private String ipAddress;

    public AuditLogDto() {
    }

    public AuditLogDto(String id, String timestamp, String user, String role, String entityId, String action, String previousState, String newState, String reason, String ipAddress) {
        this.id = id;
        this.timestamp = timestamp;
        this.user = user;
        this.role = role;
        this.entityId = entityId;
        this.action = action;
        this.previousState = previousState;
        this.newState = newState;
        this.reason = reason;
        this.ipAddress = ipAddress;
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

    public String getUser() {
        return this.user;
    }

    public void setUser(String user) {
        this.user = user;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String timestamp;
        private String user;
        private String role;
        private String entityId;
        private String action;
        private String previousState;
        private String newState;
        private String reason;
        private String ipAddress;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder user(String user) {
            this.user = user;
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

        public AuditLogDto build() {
            return new AuditLogDto(this.id, this.timestamp, this.user, this.role, this.entityId, this.action, this.previousState, this.newState, this.reason, this.ipAddress);
        }
    }

    public static AuditLogDto fromEntity(AuditLog entity) {
        return AuditLogDto.builder()
                .id(entity.getId())
                .timestamp(entity.getTimestamp())
                .user(entity.getUserName())
                .role(entity.getRole())
                .entityId(entity.getEntityId())
                .action(entity.getAction())
                .previousState(entity.getPreviousState())
                .newState(entity.getNewState())
                .reason(entity.getReason())
                .ipAddress(entity.getIpAddress())
                .build();
    }
}
