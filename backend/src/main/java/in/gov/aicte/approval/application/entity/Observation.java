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
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Observation() {
    }

    public Observation(String id, Application application, LocalDate date, String officer, String stage, String status, String remarks, String clauses, LocalDateTime createdAt) {
        this.id = id;
        this.application = application;
        this.date = date;
        this.officer = officer;
        this.stage = stage;
        this.status = status;
        this.remarks = remarks;
        this.clauses = clauses;
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
        private Application application;
        private LocalDate date;
        private String officer;
        private String stage;
        private String status;
        private String remarks;
        private String clauses;
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

        public Builder clauses(String clauses) {
            this.clauses = clauses;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Observation build() {
            return new Observation(this.id, this.application, this.date, this.officer, this.stage, this.status, this.remarks, this.clauses, this.createdAt);
        }
    }

}
