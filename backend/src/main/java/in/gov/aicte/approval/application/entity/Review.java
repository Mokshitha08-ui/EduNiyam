package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_reviews")
public class Review {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "stage", nullable = false, length = 64)
    private String stage;

    @Column(name = "review_round")
    private Integer reviewRound = 1;

    @Column(name = "reviewer_id", length = 64)
    private String reviewerId;

    @Column(name = "reviewer_name", nullable = false, length = 128)
    private String reviewerName;

    @Column(name = "reviewer_role", nullable = false, length = 64)
    private String reviewerRole;

    @Column(name = "decision", nullable = false, length = 64)
    private String decision;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "checklist_results_json", columnDefinition = "TEXT")
    private String checklistResultsJson;

    @Column(name = "is_draft")
    private Boolean isDraft = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Review() {
    }

    public Review(String id, Application application, String stage, Integer reviewRound,
                  String reviewerId, String reviewerName, String reviewerRole,
                  String decision, String remarks, String checklistResultsJson,
                  Boolean isDraft, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.application = application;
        this.stage = stage;
        this.reviewRound = reviewRound != null ? reviewRound : 1;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerRole = reviewerRole;
        this.decision = decision;
        this.remarks = remarks;
        this.checklistResultsJson = checklistResultsJson;
        this.isDraft = isDraft != null ? isDraft : false;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getStage() {
        return this.stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Integer getReviewRound() {
        return this.reviewRound;
    }

    public Integer getRound() {
        return this.reviewRound;
    }

    public void setReviewRound(Integer reviewRound) {
        this.reviewRound = reviewRound;
    }

    public void setRound(Integer round) {
        this.reviewRound = round;
    }

    public String getReviewerId() {
        return this.reviewerId;
    }

    public void setReviewerId(String reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return this.reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getReviewerRole() {
        return this.reviewerRole;
    }

    public void setReviewerRole(String reviewerRole) {
        this.reviewerRole = reviewerRole;
    }

    public String getDecision() {
        return this.decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getRemarks() {
        return this.remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getChecklistResultsJson() {
        return this.checklistResultsJson;
    }

    public void setChecklistResultsJson(String checklistResultsJson) {
        this.checklistResultsJson = checklistResultsJson;
    }

    public Boolean getIsDraft() {
        return this.isDraft != null && this.isDraft;
    }

    public void setIsDraft(Boolean isDraft) {
        this.isDraft = isDraft;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private Application application;
        private String stage;
        private Integer reviewRound = 1;
        private String reviewerId;
        private String reviewerName;
        private String reviewerRole;
        private String decision;
        private String remarks;
        private String checklistResultsJson;
        private Boolean isDraft = false;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder application(Application application) {
            this.application = application;
            return this;
        }

        public Builder stage(String stage) {
            this.stage = stage;
            return this;
        }

        public Builder reviewRound(Integer reviewRound) {
            this.reviewRound = reviewRound;
            return this;
        }

        public Builder round(Integer round) {
            this.reviewRound = round;
            return this;
        }

        public Builder reviewerId(String reviewerId) {
            this.reviewerId = reviewerId;
            return this;
        }

        public Builder reviewerName(String reviewerName) {
            this.reviewerName = reviewerName;
            return this;
        }

        public Builder reviewerRole(String reviewerRole) {
            this.reviewerRole = reviewerRole;
            return this;
        }

        public Builder decision(String decision) {
            this.decision = decision;
            return this;
        }

        public Builder remarks(String remarks) {
            this.remarks = remarks;
            return this;
        }

        public Builder checklistResultsJson(String checklistResultsJson) {
            this.checklistResultsJson = checklistResultsJson;
            return this;
        }

        public Builder isDraft(Boolean isDraft) {
            this.isDraft = isDraft;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Review build() {
            return new Review(this.id, this.application, this.stage, this.reviewRound,
                    this.reviewerId, this.reviewerName, this.reviewerRole,
                    this.decision, this.remarks, this.checklistResultsJson,
                    this.isDraft, this.createdAt, this.updatedAt);
        }
    }
}
