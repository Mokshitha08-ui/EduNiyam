package in.gov.aicte.approval.evc.entity;

import in.gov.aicte.approval.application.entity.Application;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "staff_evc_schedules")
public class EvcSchedule {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;

    @Column(name = "region", nullable = false, length = 128)
    private String region;

    @Column(name = "visit_type", length = 128)
    private String visitType;

    @Column(name = "status", nullable = false, length = 64)
    private String status;

    @Column(name = "scheduling_deadline")
    private LocalDate schedulingDeadline;

    @Column(name = "proposed_date")
    private LocalDate proposedDate;

    @Column(name = "mode", length = 32)
    private String mode = "PHYSICAL";

    @Column(name = "conflict_status", length = 32)
    private String conflictStatus = "NONE";

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "report_status", length = 64)
    private String reportStatus;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "geo_tagged_photos_count")
    private int geoTaggedPhotosCount = 0;

    @Column(name = "visit_time", length = 32)
    private String visitTime;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "purpose", length = 255)
    private String purpose;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "reschedule_reason", columnDefinition = "TEXT")
    private String rescheduleReason;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "recommendation", length = 64)
    private String recommendation;

    @Column(name = "findings_json", columnDefinition = "TEXT")
    private String findingsJson;

    @Column(name = "submitted_by", length = 64)
    private String submittedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "report_reviewed_by", length = 64)
    private String reportReviewedBy;

    @Column(name = "report_reviewed_at")
    private LocalDateTime reportReviewedAt;

    @Column(name = "report_review_notes", columnDefinition = "TEXT")
    private String reportReviewNotes;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<EvcMember> committeeMembers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public EvcSchedule() {
    }

    public EvcSchedule(String id, Application application, String institutionName, String region,
                       String visitType, String status, LocalDate schedulingDeadline,
                       LocalDate proposedDate, String mode, String conflictStatus,
                       LocalDate completionDate, String reportStatus, String observations,
                       int geoTaggedPhotosCount, String visitTime, String location, String purpose,
                       String instructions, String rescheduleReason, String cancellationReason,
                       String recommendation, String findingsJson, String submittedBy,
                       LocalDateTime submittedAt, String reportReviewedBy, LocalDateTime reportReviewedAt,
                       String reportReviewNotes, List<EvcMember> committeeMembers,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.application = application;
        this.institutionName = institutionName;
        this.region = region;
        this.visitType = visitType;
        this.status = status;
        this.schedulingDeadline = schedulingDeadline;
        this.proposedDate = proposedDate;
        this.mode = mode != null ? mode : "PHYSICAL";
        this.conflictStatus = conflictStatus != null ? conflictStatus : "NONE";
        this.completionDate = completionDate;
        this.reportStatus = reportStatus;
        this.observations = observations;
        this.geoTaggedPhotosCount = geoTaggedPhotosCount;
        this.visitTime = visitTime;
        this.location = location;
        this.purpose = purpose;
        this.instructions = instructions;
        this.rescheduleReason = rescheduleReason;
        this.cancellationReason = cancellationReason;
        this.recommendation = recommendation;
        this.findingsJson = findingsJson;
        this.submittedBy = submittedBy;
        this.submittedAt = submittedAt;
        this.reportReviewedBy = reportReviewedBy;
        this.reportReviewedAt = reportReviewedAt;
        this.reportReviewNotes = reportReviewNotes;
        this.committeeMembers = committeeMembers != null ? committeeMembers : new ArrayList<>();
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

    public String getInstitutionName() {
        return this.institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getVisitType() {
        return this.visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getSchedulingDeadline() {
        return this.schedulingDeadline;
    }

    public void setSchedulingDeadline(LocalDate schedulingDeadline) {
        this.schedulingDeadline = schedulingDeadline;
    }

    public LocalDate getProposedDate() {
        return this.proposedDate;
    }

    public void setProposedDate(LocalDate proposedDate) {
        this.proposedDate = proposedDate;
    }

    public String getMode() {
        return this.mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getConflictStatus() {
        return this.conflictStatus;
    }

    public void setConflictStatus(String conflictStatus) {
        this.conflictStatus = conflictStatus;
    }

    public LocalDate getCompletionDate() {
        return this.completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public String getReportStatus() {
        return this.reportStatus;
    }

    public void setReportStatus(String reportStatus) {
        this.reportStatus = reportStatus;
    }

    public String getObservations() {
        return this.observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public int getGeoTaggedPhotosCount() {
        return this.geoTaggedPhotosCount;
    }

    public void setGeoTaggedPhotosCount(int geoTaggedPhotosCount) {
        this.geoTaggedPhotosCount = geoTaggedPhotosCount;
    }

    public String getVisitTime() {
        return this.visitTime;
    }

    public void setVisitTime(String visitTime) {
        this.visitTime = visitTime;
    }

    public String getLocation() {
        return this.location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPurpose() {
        return this.purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getInstructions() {
        return this.instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getRescheduleReason() {
        return this.rescheduleReason;
    }

    public void setRescheduleReason(String rescheduleReason) {
        this.rescheduleReason = rescheduleReason;
    }

    public String getCancellationReason() {
        return this.cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getRecommendation() {
        return this.recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getFindingsJson() {
        return this.findingsJson;
    }

    public void setFindingsJson(String findingsJson) {
        this.findingsJson = findingsJson;
    }

    public String getSubmittedBy() {
        return this.submittedBy;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }

    public LocalDateTime getSubmittedAt() {
        return this.submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getReportReviewedBy() {
        return this.reportReviewedBy;
    }

    public void setReportReviewedBy(String reportReviewedBy) {
        this.reportReviewedBy = reportReviewedBy;
    }

    public LocalDateTime getReportReviewedAt() {
        return this.reportReviewedAt;
    }

    public void setReportReviewedAt(LocalDateTime reportReviewedAt) {
        this.reportReviewedAt = reportReviewedAt;
    }

    public String getReportReviewNotes() {
        return this.reportReviewNotes;
    }

    public void setReportReviewNotes(String reportReviewNotes) {
        this.reportReviewNotes = reportReviewNotes;
    }

    public List<EvcMember> getCommitteeMembers() {
        return this.committeeMembers;
    }

    public void setCommitteeMembers(List<EvcMember> committeeMembers) {
        this.committeeMembers = committeeMembers;
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
        private String institutionName;
        private String region;
        private String visitType;
        private String status;
        private LocalDate schedulingDeadline;
        private LocalDate proposedDate;
        private String mode = "PHYSICAL";
        private String conflictStatus = "NONE";
        private LocalDate completionDate;
        private String reportStatus;
        private String observations;
        private int geoTaggedPhotosCount = 0;
        private String visitTime;
        private String location;
        private String purpose;
        private String instructions;
        private String rescheduleReason;
        private String cancellationReason;
        private String recommendation;
        private String findingsJson;
        private String submittedBy;
        private LocalDateTime submittedAt;
        private String reportReviewedBy;
        private LocalDateTime reportReviewedAt;
        private String reportReviewNotes;
        private List<EvcMember> committeeMembers = new ArrayList<>();
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

        public Builder institutionName(String institutionName) {
            this.institutionName = institutionName;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder visitType(String visitType) {
            this.visitType = visitType;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder schedulingDeadline(LocalDate schedulingDeadline) {
            this.schedulingDeadline = schedulingDeadline;
            return this;
        }

        public Builder proposedDate(LocalDate proposedDate) {
            this.proposedDate = proposedDate;
            return this;
        }

        public Builder mode(String mode) {
            this.mode = mode;
            return this;
        }

        public Builder conflictStatus(String conflictStatus) {
            this.conflictStatus = conflictStatus;
            return this;
        }

        public Builder completionDate(LocalDate completionDate) {
            this.completionDate = completionDate;
            return this;
        }

        public Builder reportStatus(String reportStatus) {
            this.reportStatus = reportStatus;
            return this;
        }

        public Builder observations(String observations) {
            this.observations = observations;
            return this;
        }

        public Builder geoTaggedPhotosCount(int geoTaggedPhotosCount) {
            this.geoTaggedPhotosCount = geoTaggedPhotosCount;
            return this;
        }

        public Builder visitTime(String visitTime) {
            this.visitTime = visitTime;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder purpose(String purpose) {
            this.purpose = purpose;
            return this;
        }

        public Builder instructions(String instructions) {
            this.instructions = instructions;
            return this;
        }

        public Builder rescheduleReason(String rescheduleReason) {
            this.rescheduleReason = rescheduleReason;
            return this;
        }

        public Builder cancellationReason(String cancellationReason) {
            this.cancellationReason = cancellationReason;
            return this;
        }

        public Builder recommendation(String recommendation) {
            this.recommendation = recommendation;
            return this;
        }

        public Builder findingsJson(String findingsJson) {
            this.findingsJson = findingsJson;
            return this;
        }

        public Builder submittedBy(String submittedBy) {
            this.submittedBy = submittedBy;
            return this;
        }

        public Builder submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return this;
        }

        public Builder reportReviewedBy(String reportReviewedBy) {
            this.reportReviewedBy = reportReviewedBy;
            return this;
        }

        public Builder reportReviewedAt(LocalDateTime reportReviewedAt) {
            this.reportReviewedAt = reportReviewedAt;
            return this;
        }

        public Builder reportReviewNotes(String reportReviewNotes) {
            this.reportReviewNotes = reportReviewNotes;
            return this;
        }

        public Builder committeeMembers(List<EvcMember> committeeMembers) {
            this.committeeMembers = committeeMembers;
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

        public EvcSchedule build() {
            return new EvcSchedule(id, application, institutionName, region, visitType, status,
                    schedulingDeadline, proposedDate, mode, conflictStatus, completionDate,
                    reportStatus, observations, geoTaggedPhotosCount, visitTime, location, purpose,
                    instructions, rescheduleReason, cancellationReason, recommendation, findingsJson,
                    submittedBy, submittedAt, reportReviewedBy, reportReviewedAt, reportReviewNotes,
                    committeeMembers, createdAt, updatedAt);
        }
    }
}
