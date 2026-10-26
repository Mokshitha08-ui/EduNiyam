package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.Review;
import java.time.LocalDateTime;

public class ReviewDto {

    private String id;
    private String applicationId;
    private String stage;
    private Integer reviewRound;
    private String reviewerId;
    private String reviewerName;
    private String reviewerRole;
    private String decision;
    private String remarks;
    private String checklistResultsJson;
    private Boolean isDraft;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewDto() {
    }

    public ReviewDto(String id, String applicationId, String stage, Integer reviewRound,
                     String reviewerId, String reviewerName, String reviewerRole,
                     String decision, String remarks, String checklistResultsJson,
                     Boolean isDraft, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.stage = stage;
        this.reviewRound = reviewRound;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerRole = reviewerRole;
        this.decision = decision;
        this.remarks = remarks;
        this.checklistResultsJson = checklistResultsJson;
        this.isDraft = isDraft;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getApplicationId() {
        return this.applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
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

    public static ReviewDto fromEntity(Review entity) {
        return new ReviewDto(
                entity.getId(),
                entity.getApplication() != null ? entity.getApplication().getId() : null,
                entity.getStage(),
                entity.getReviewRound(),
                entity.getReviewerId(),
                entity.getReviewerName(),
                entity.getReviewerRole(),
                entity.getDecision(),
                entity.getRemarks(),
                entity.getChecklistResultsJson(),
                entity.getIsDraft(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
