package in.gov.aicte.approval.notification.dto;

import in.gov.aicte.approval.notification.entity.Notification;
import java.time.LocalDateTime;

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
    private String institutionCode;
    private String recipientId;
    private String recipientEmail;
    private boolean acknowledged;
    private LocalDateTime acknowledgedAt;
    private String acknowledgedBy;
    private boolean actionRequired;
    private boolean actionCompleted;
    private LocalDateTime actionCompletedAt;
    private String actionCompletedBy;
    private LocalDateTime dueDate;
    private String link;

    public NotificationDto() {
    }

    public NotificationDto(String id, String category, String urgency, String title, String message,
                           String entityType, String entityId, String timestamp, boolean read,
                           String recipientRole, String link) {
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

    public String getInstitutionCode() {
        return this.institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public boolean isAcknowledged() {
        return acknowledged;
    }

    public void setAcknowledged(boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public boolean isActionRequired() {
        return actionRequired;
    }

    public void setActionRequired(boolean actionRequired) {
        this.actionRequired = actionRequired;
    }

    public boolean isActionCompleted() {
        return actionCompleted;
    }

    public void setActionCompleted(boolean actionCompleted) {
        this.actionCompleted = actionCompleted;
    }

    public LocalDateTime getActionCompletedAt() {
        return actionCompletedAt;
    }

    public void setActionCompletedAt(LocalDateTime actionCompletedAt) {
        this.actionCompletedAt = actionCompletedAt;
    }

    public String getActionCompletedBy() {
        return actionCompletedBy;
    }

    public void setActionCompletedBy(String actionCompletedBy) {
        this.actionCompletedBy = actionCompletedBy;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
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
        private String institutionCode;
        private String recipientId;
        private String recipientEmail;
        private boolean acknowledged;
        private LocalDateTime acknowledgedAt;
        private String acknowledgedBy;
        private boolean actionRequired;
        private boolean actionCompleted;
        private LocalDateTime actionCompletedAt;
        private String actionCompletedBy;
        private LocalDateTime dueDate;
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

        public Builder institutionCode(String institutionCode) {
            this.institutionCode = institutionCode;
            return this;
        }

        public Builder recipientId(String recipientId) {
            this.recipientId = recipientId;
            return this;
        }

        public Builder recipientEmail(String recipientEmail) {
            this.recipientEmail = recipientEmail;
            return this;
        }

        public Builder acknowledged(boolean acknowledged) {
            this.acknowledged = acknowledged;
            return this;
        }

        public Builder acknowledgedAt(LocalDateTime acknowledgedAt) {
            this.acknowledgedAt = acknowledgedAt;
            return this;
        }

        public Builder acknowledgedBy(String acknowledgedBy) {
            this.acknowledgedBy = acknowledgedBy;
            return this;
        }

        public Builder actionRequired(boolean actionRequired) {
            this.actionRequired = actionRequired;
            return this;
        }

        public Builder actionCompleted(boolean actionCompleted) {
            this.actionCompleted = actionCompleted;
            return this;
        }

        public Builder actionCompletedAt(LocalDateTime actionCompletedAt) {
            this.actionCompletedAt = actionCompletedAt;
            return this;
        }

        public Builder actionCompletedBy(String actionCompletedBy) {
            this.actionCompletedBy = actionCompletedBy;
            return this;
        }

        public Builder dueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder link(String link) {
            this.link = link;
            return this;
        }

        public NotificationDto build() {
            NotificationDto dto = new NotificationDto(this.id, this.category, this.urgency, this.title, this.message, this.entityType, this.entityId, this.timestamp, this.read, this.recipientRole, this.link);
            dto.setInstitutionCode(this.institutionCode);
            dto.setRecipientId(this.recipientId);
            dto.setRecipientEmail(this.recipientEmail);
            dto.setAcknowledged(this.acknowledged);
            dto.setAcknowledgedAt(this.acknowledgedAt);
            dto.setAcknowledgedBy(this.acknowledgedBy);
            dto.setActionRequired(this.actionRequired);
            dto.setActionCompleted(this.actionCompleted);
            dto.setActionCompletedAt(this.actionCompletedAt);
            dto.setActionCompletedBy(this.actionCompletedBy);
            dto.setDueDate(this.dueDate);
            return dto;
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
                .institutionCode(entity.getInstitutionCode())
                .recipientId(entity.getRecipientId())
                .recipientEmail(entity.getRecipientEmail())
                .acknowledged(entity.isAcknowledged())
                .acknowledgedAt(entity.getAcknowledgedAt())
                .acknowledgedBy(entity.getAcknowledgedBy())
                .actionRequired(entity.isActionRequired())
                .actionCompleted(entity.isActionCompleted())
                .actionCompletedAt(entity.getActionCompletedAt())
                .actionCompletedBy(entity.getActionCompletedBy())
                .dueDate(entity.getDueDate())
                .link(entity.getLink())
                .build();
    }
}
