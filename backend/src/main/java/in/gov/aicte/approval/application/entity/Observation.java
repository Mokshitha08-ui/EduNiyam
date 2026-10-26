package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "staff_deficiencies")
public class Observation {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    @Column(name = "observation_date")
    private LocalDate date;
    @Column(name = "officer", length = 128)
    private String officer;
    @Column(name = "stage", length = 64)
    private String stage;
    @Column(name = "status", length = 64)
    private String status;
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    @Column(name = "clauses", columnDefinition = "TEXT")
    private String clauses;
    @Column(name = "response_notes", columnDefinition = "TEXT")
    private String responseNotes;
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    @Column(name = "type", length = 32)
    private String type = "DEFICIENCY";
    @Column(name = "severity", length = 32)
    private String severity = "MAJOR";
    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;
    @Column(name = "deadline")
    private LocalDate deadline;
    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;
    @Column(name = "verified_by", length = 128)
    private String verifiedBy;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Observation() {
    }

    public Observation(String id, Application application, LocalDate date, String officer, String stage, String status, String remarks, String clauses, LocalDateTime createdAt) {
        this(id, application, date, officer, stage, status, remarks, clauses, null, null, createdAt);
    }

    public Observation(String id, Application application, LocalDate date, String officer, String stage, String status, String remarks, String clauses, String responseNotes, LocalDateTime resolvedAt, LocalDateTime createdAt) {
        this.id = id;
        this.application = application;
        this.date = date;
        this.officer = officer;
        this.stage = stage;
        this.status = status;
        this.remarks = remarks;
        this.clauses = clauses;
        this.responseNotes = responseNotes;
        this.resolvedAt = resolvedAt;
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Application getApplication() {
        return this.application;
    }

    public void setApplication(Application application) {
        this.application = application;
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

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private Application application;
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
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder application(Application application) {
            this.application = application;
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

        public Builder deficiencyText(String deficiencyText) {
            this.remarks = deficiencyText;
            return this;
        }

        public Builder clauses(String clauses) {
            this.clauses = clauses;
            return this;
        }

        public Builder clause(String clause) {
            this.clauses = clause;
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

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Observation build() {
            Observation obs = new Observation(this.id, this.application, this.date, this.officer, this.stage, this.status, this.remarks, this.clauses, this.responseNotes, this.resolvedAt, this.createdAt);
            obs.setType(this.type);
            obs.setSeverity(this.severity);
            obs.setCorrectiveAction(this.correctiveAction);
            obs.setDeadline(this.deadline);
            obs.setVerificationNotes(this.verificationNotes);
            obs.setVerifiedBy(this.verifiedBy);
            return obs;
        }
    }

}
