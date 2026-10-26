package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.Observation;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ObservationDto {

    private String id;
    private LocalDate date;
    private String officer;
    private String stage;
    private String status;
    private String remarks;
    private String clauses;
    private String responseNotes;
    private LocalDateTime resolvedAt;
    private String type = "DEFICIENCY";
    private String severity = "MAJOR";
    private String correctiveAction;
    private LocalDate deadline;
    private String verificationNotes;
    private String verifiedBy;

    public ObservationDto() {
    }

    public ObservationDto(String id, LocalDate date, String officer, String stage, String status, String remarks, String clauses, String responseNotes, LocalDateTime resolvedAt) {
        this.id = id;
        this.date = date;
        this.officer = officer;
        this.stage = stage;
        this.status = status;
        this.remarks = remarks;
        this.clauses = clauses;
        this.responseNotes = responseNotes;
        this.resolvedAt = resolvedAt;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return this.severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getCorrectiveAction() {
        return this.correctiveAction;
    }

    public void setCorrectiveAction(String correctiveAction) {
        this.correctiveAction = correctiveAction;
    }

    public LocalDate getDeadline() {
        return this.deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getVerificationNotes() {
        return this.verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public String getVerifiedBy() {
        return this.verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return this.date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getOfficer() {
        return this.officer;
    }

    public void setOfficer(String officer) {
        this.officer = officer;
    }

    public String getStage() {
        return this.stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return this.remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getClauses() {
        return this.clauses;
    }

    public void setClauses(String clauses) {
        this.clauses = clauses;
    }

    public String getResponseNotes() {
        return this.responseNotes;
    }

    public void setResponseNotes(String responseNotes) {
        this.responseNotes = responseNotes;
    }

    public LocalDateTime getResolvedAt() {
        return this.resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private LocalDate date;
        private String officer;
        private String stage;
        private String status;
        private String remarks;
        private String clauses;
        private String responseNotes;
        private LocalDateTime resolvedAt;
        private String type = "DEFICIENCY";
        private String severity = "MAJOR";
        private String correctiveAction;
        private LocalDate deadline;
        private String verificationNotes;
        private String verifiedBy;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public Builder officer(String officer) {
            this.officer = officer;
            return this;
        }

        public Builder stage(String stage) {
            this.stage = stage;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder remarks(String remarks) {
            this.remarks = remarks;
            return this;
        }

        public Builder clauses(String clauses) {
            this.clauses = clauses;
            return this;
        }

        public Builder responseNotes(String responseNotes) {
            this.responseNotes = responseNotes;
            return this;
        }

        public Builder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder severity(String severity) {
            this.severity = severity;
            return this;
        }

        public Builder correctiveAction(String correctiveAction) {
            this.correctiveAction = correctiveAction;
            return this;
        }

        public Builder deadline(LocalDate deadline) {
            this.deadline = deadline;
            return this;
        }

        public Builder verificationNotes(String verificationNotes) {
            this.verificationNotes = verificationNotes;
            return this;
        }

        public Builder verifiedBy(String verifiedBy) {
            this.verifiedBy = verifiedBy;
            return this;
        }

        public ObservationDto build() {
            ObservationDto dto = new ObservationDto(this.id, this.date, this.officer, this.stage, this.status, this.remarks, this.clauses, this.responseNotes, this.resolvedAt);
            dto.setType(this.type);
            dto.setSeverity(this.severity);
            dto.setCorrectiveAction(this.correctiveAction);
            dto.setDeadline(this.deadline);
            dto.setVerificationNotes(this.verificationNotes);
            dto.setVerifiedBy(this.verifiedBy);
            return dto;
        }
    }

    public static ObservationDto fromEntity(Observation entity) {
        return ObservationDto.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .officer(entity.getOfficer())
                .stage(entity.getStage())
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .clauses(entity.getClauses())
                .responseNotes(entity.getResponseNotes())
                .resolvedAt(entity.getResolvedAt())
                .type(entity.getType())
                .severity(entity.getSeverity())
                .correctiveAction(entity.getCorrectiveAction())
                .deadline(entity.getDeadline())
                .verificationNotes(entity.getVerificationNotes())
                .verifiedBy(entity.getVerifiedBy())
                .build();
    }
}
