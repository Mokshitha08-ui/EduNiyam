package in.gov.aicte.approval.notification.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "staff_escalations")
public class Escalation {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;
    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;
    @Column(name = "level", nullable = false, length = 32)
    private String level;
    @Column(name = "level_title", nullable = false, length = 128)
    private String levelTitle;
    @Column(name = "recipient", nullable = false, length = 128)
    private String recipient;
    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;
    @Column(name = "triggered_at", nullable = false, length = 64)
    private String triggeredAt;
    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE";
    @Column(name = "acknowledged_by", length = 128)
    private String acknowledgedBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Escalation() {
    }

    public Escalation(String id, String entityId, String institutionName, String level, String levelTitle, String recipient, String reason, String triggeredAt, String status, String acknowledgedBy, LocalDateTime createdAt) {
        this.id = id;
        this.entityId = entityId;
        this.institutionName = institutionName;
        this.level = level;
        this.levelTitle = levelTitle;
        this.recipient = recipient;
        this.reason = reason;
        this.triggeredAt = triggeredAt;
        this.status = status;
        this.acknowledgedBy = acknowledgedBy;
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEntityId() {
        return this.entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getInstitutionName() {
        return this.institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getLevel() {
        return this.level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getLevelTitle() {
        return this.levelTitle;
    }

    public void setLevelTitle(String levelTitle) {
        this.levelTitle = levelTitle;
    }

    public String getRecipient() {
        return this.recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getTriggeredAt() {
        return this.triggeredAt;
    }

    public void setTriggeredAt(String triggeredAt) {
        this.triggeredAt = triggeredAt;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAcknowledgedBy() {
        return this.acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
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
        private String entityId;
        private String institutionName;
        private String level;
        private String levelTitle;
        private String recipient;
        private String reason;
        private String triggeredAt;
        private String status = "ACTIVE";
        private String acknowledgedBy;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public Builder institutionName(String institutionName) {
            this.institutionName = institutionName;
            return this;
        }

        public Builder level(String level) {
            this.level = level;
            return this;
        }

        public Builder levelTitle(String levelTitle) {
            this.levelTitle = levelTitle;
            return this;
        }

        public Builder recipient(String recipient) {
            this.recipient = recipient;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder triggeredAt(String triggeredAt) {
            this.triggeredAt = triggeredAt;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder acknowledgedBy(String acknowledgedBy) {
            this.acknowledgedBy = acknowledgedBy;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Escalation build() {
            return new Escalation(this.id, this.entityId, this.institutionName, this.level, this.levelTitle, this.recipient, this.reason, this.triggeredAt, this.status, this.acknowledgedBy, this.createdAt);
        }
    }

}
