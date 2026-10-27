package in.gov.aicte.approval.notification.dto;

import in.gov.aicte.approval.notification.entity.Escalation;
import java.time.LocalDateTime;

public class EscalationDto {

    private String id;
    private String entityId;
    private String applicationId;
    private String institutionName;
    private String level;
    private String levelTitle;
    private String recipient;
    private String reason;
    private String triggeredAt;
    private String status;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
    private String resolutionNotes;

    public EscalationDto() {
    }

    public EscalationDto(String id, String entityId, String institutionName, String level, String levelTitle,
                         String recipient, String reason, String triggeredAt, String status, String acknowledgedBy) {
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

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
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

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String entityId;
        private String applicationId;
        private String institutionName;
        private String level;
        private String levelTitle;
        private String recipient;
        private String reason;
        private String triggeredAt;
        private String status;
        private String acknowledgedBy;
        private LocalDateTime acknowledgedAt;
        private LocalDateTime resolvedAt;
        private String resolvedBy;
        private String resolutionNotes;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public Builder applicationId(String applicationId) {
            this.applicationId = applicationId;
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

        public Builder acknowledgedAt(LocalDateTime acknowledgedAt) {
            this.acknowledgedAt = acknowledgedAt;
            return this;
        }

        public Builder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public Builder resolvedBy(String resolvedBy) {
            this.resolvedBy = resolvedBy;
            return this;
        }

        public Builder resolutionNotes(String resolutionNotes) {
            this.resolutionNotes = resolutionNotes;
            return this;
        }

        public EscalationDto build() {
            EscalationDto dto = new EscalationDto(this.id, this.entityId, this.institutionName, this.level, this.levelTitle, this.recipient, this.reason, this.triggeredAt, this.status, this.acknowledgedBy);
            dto.setApplicationId(this.applicationId);
            dto.setAcknowledgedAt(this.acknowledgedAt);
            dto.setResolvedAt(this.resolvedAt);
            dto.setResolvedBy(this.resolvedBy);
            dto.setResolutionNotes(this.resolutionNotes);
            return dto;
        }
    }

    public static EscalationDto fromEntity(Escalation entity) {
        return EscalationDto.builder()
                .id(entity.getId())
                .entityId(entity.getEntityId())
                .applicationId(entity.getApplicationId())
                .institutionName(entity.getInstitutionName())
                .level(entity.getLevel())
                .levelTitle(entity.getLevelTitle())
                .recipient(entity.getRecipient())
                .reason(entity.getReason())
                .triggeredAt(entity.getTriggeredAt())
                .status(entity.getStatus())
                .acknowledgedBy(entity.getAcknowledgedBy())
                .acknowledgedAt(entity.getAcknowledgedAt())
                .resolvedAt(entity.getResolvedAt())
                .resolvedBy(entity.getResolvedBy())
                .resolutionNotes(entity.getResolutionNotes())
                .build();
    }
}
