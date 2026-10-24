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
                       int geoTaggedPhotosCount, List<EvcMember> committeeMembers,
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
                    reportStatus, observations, geoTaggedPhotosCount, committeeMembers, createdAt, updatedAt);
        }
    }
}
