package in.gov.aicte.approval.notification.dto;

import in.gov.aicte.approval.notification.entity.Notification;

public class NotificationDto {

    private String id;
    private String category;
    private String urgency;
    private String title;
    private String message;
    private String entityType;
    private String entityId;
    private String timestamp;
    private boolean read;
    private String recipientRole;
    private String link;

    public NotificationDto() {
    }

    public NotificationDto(String id, String category, String urgency, String title, String message, String entityType, String entityId, String timestamp, boolean read, String recipientRole, String link) {
        this.id = id;
        this.category = category;
        this.urgency = urgency;
        this.title = title;
        this.message = message;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = timestamp;
        this.read = read;
        this.recipientRole = recipientRole;
        this.link = link;
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
        return this.read;
    }

    public void setRead(boolean read) {
        this.read = read;
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
        private boolean read;
        private String recipientRole;
        private String link;

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

        public Builder read(boolean read) {
            this.read = read;
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

        public NotificationDto build() {
            return new NotificationDto(this.id, this.category, this.urgency, this.title, this.message, this.entityType, this.entityId, this.timestamp, this.read, this.recipientRole, this.link);
        }
    }

    public static NotificationDto fromEntity(Notification entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .urgency(entity.getUrgency())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .timestamp(entity.getTimestamp())
                .read(entity.isRead())
                .recipientRole(entity.getRecipientRole())
                .link(entity.getLink())
                .build();
    }
}
