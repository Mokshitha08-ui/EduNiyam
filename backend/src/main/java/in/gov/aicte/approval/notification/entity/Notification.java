package in.gov.aicte.approval.notification.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_notifications")
public class Notification {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "category", nullable = false, length = 64)
    private String category;

    @Column(name = "urgency", nullable = false, length = 32)
    private String urgency;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "entity_type", length = 64)
    private String entityType;

    @Column(name = "entity_id", length = 64)
    private String entityId;

    @Column(name = "timestamp", nullable = false, length = 64)
    private String timestamp;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "recipient_role", nullable = false, length = 64)
    private String recipientRole;

    @Column(name = "link", length = 255)
    private String link;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(String id, String category, String urgency, String title, String message,
                        String entityType, String entityId, String timestamp, boolean isRead,
                        String recipientRole, String link, LocalDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.urgency = urgency;
        this.title = title;
        this.message = message;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.recipientRole = recipientRole;
        this.link = link;
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategory() {
        return this.category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUrgency() {
        return this.urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEntityType() {
        return this.entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return this.entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getTimestamp() {
        return this.timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return this.isRead;
    }

    public boolean getIsRead() {
        return this.isRead;
    }

    public void setRead(boolean read) {
        this.isRead = read;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public String getRecipientRole() {
        return this.recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getLink() {
        return this.link;
    }

    public void setLink(String link) {
        this.link = link;
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
        private String category;
        private String urgency;
        private String title;
        private String message;
        private String entityType;
        private String entityId;
        private String timestamp;
        private boolean isRead = false;
        private String recipientRole;
        private String link;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public Builder urgency(String urgency) {
            this.urgency = urgency;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder entityType(String entityType) {
            this.entityType = entityType;
            return this;
        }

        public Builder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public Builder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public Builder read(boolean read) {
            this.isRead = read;
            return this;
        }

        public Builder recipientRole(String recipientRole) {
            this.recipientRole = recipientRole;
            return this;
        }

        public Builder link(String link) {
            this.link = link;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Notification build() {
            return new Notification(id, category, urgency, title, message, entityType, entityId, timestamp, isRead, recipientRole, link, createdAt);
        }
    }
}
