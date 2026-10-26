package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "staff_applications")
public class Application {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;

    @Column(name = "institution_code", nullable = false, length = 64)
    private String institutionCode;

    @Column(name = "application_type", nullable = false, length = 128)
    private String applicationType;

    @Column(name = "programme", length = 255)
    private String programme;

    @Column(name = "region", nullable = false, length = 128)
    private String region;

    @Column(name = "state", nullable = false, length = 128)
    private String state;

    @Column(name = "workflow_id", length = 64)
    private String workflowId;

    @Column(name = "current_stage", nullable = false, length = 64)
    private String currentStage;

    @Column(name = "status", nullable = false, length = 64)
    private String status;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority = "NORMAL";

    @Column(name = "assigned_officer", length = 128)
    private String assignedOfficer;

    @Column(name = "officer_role", length = 64)
    private String officerRole;

    @Column(name = "assigned_officer_id", length = 64)
    private String assignedOfficerId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "assignment_reason", columnDefinition = "TEXT")
    private String assignmentReason;

    @Version
    @Column(name = "version")
    private Long version = 0L;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "stage_start_date")
    private LocalDate stageStartDate;

    @Column(name = "next_deadline")
    private LocalDate nextDeadline;

    @Column(name = "deficiency_count")
    private int deficiencyCount = 0;

    @Column(name = "missing_doc_count")
    private int missingDocCount = 0;

    @Column(name = "deficiency_reason", columnDefinition = "TEXT")
    private String deficiencyReason;

    @Column(name = "requires_evc")
    private Boolean requiresEvc = false;

    @Column(name = "evc_reason")
    private String evcReason;

    @Column(name = "evc_marked_by", length = 128)
    private String evcMarkedBy;

    @Column(name = "evc_marked_at")
    private LocalDateTime evcMarkedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Observation> observations = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<ApplicationStageHistory> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RequestedIntake> requestedIntake = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Application() {
    }

    public Application(String id, String institutionName, String institutionCode, String applicationType,
                       String programme, String region, String state, String workflowId, String currentStage,
                       String status, String priority, String assignedOfficer, String officerRole,
                       LocalDate submissionDate, LocalDate stageStartDate, LocalDate nextDeadline,
                       int deficiencyCount, int missingDocCount, String deficiencyReason,
                       List<Observation> observations, List<ApplicationDocument> documents,
                       List<ApplicationStageHistory> timeline, List<RequestedIntake> requestedIntake,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.institutionName = institutionName;
        this.institutionCode = institutionCode;
        this.applicationType = applicationType;
        this.programme = programme;
        this.region = region;
        this.state = state;
        this.workflowId = workflowId;
        this.currentStage = currentStage;
        this.status = status;
        this.priority = priority != null ? priority : "NORMAL";
        this.assignedOfficer = assignedOfficer;
        this.officerRole = officerRole;
        this.submissionDate = submissionDate;
        this.stageStartDate = stageStartDate;
        this.nextDeadline = nextDeadline;
        this.deficiencyCount = deficiencyCount;
        this.missingDocCount = missingDocCount;
        this.deficiencyReason = deficiencyReason;
        this.observations = observations != null ? observations : new ArrayList<>();
        this.documents = documents != null ? documents : new ArrayList<>();
        this.timeline = timeline != null ? timeline : new ArrayList<>();
        this.requestedIntake = requestedIntake != null ? requestedIntake : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInstitutionName() {
        return this.institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return this.institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getApplicationType() {
        return this.applicationType;
    }

    public void setApplicationType(String applicationType) {
        this.applicationType = applicationType;
    }

    public String getProgramme() {
        return this.programme;
    }

    public void setProgramme(String programme) {
        this.programme = programme;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getState() {
        return this.state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getWorkflowId() {
        return this.workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getCurrentStage() {
        return this.currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return this.priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAssignedOfficer() {
        return this.assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public String getOfficerRole() {
        return this.officerRole;
    }

    public void setOfficerRole(String officerRole) {
        this.officerRole = officerRole;
    }

    public String getAssignedOfficerId() {
        return this.assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public LocalDateTime getAssignedAt() {
        return this.assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignmentReason() {
        return this.assignmentReason;
    }

    public void setAssignmentReason(String assignmentReason) {
        this.assignmentReason = assignmentReason;
    }

    public Long getVersion() {
        return this.version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDate getSubmissionDate() {
        return this.submissionDate;
    }

    public void setSubmissionDate(LocalDate submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDate getStageStartDate() {
        return this.stageStartDate;
    }

    public void setStageStartDate(LocalDate stageStartDate) {
        this.stageStartDate = stageStartDate;
    }

    public LocalDate getNextDeadline() {
        return this.nextDeadline;
    }

    public void setNextDeadline(LocalDate nextDeadline) {
        this.nextDeadline = nextDeadline;
    }

    public int getDeficiencyCount() {
        return this.deficiencyCount;
    }

    public void setDeficiencyCount(int deficiencyCount) {
        this.deficiencyCount = deficiencyCount;
    }

    public int getMissingDocCount() {
        return this.missingDocCount;
    }

    public void setMissingDocCount(int missingDocCount) {
        this.missingDocCount = missingDocCount;
    }

    public String getDeficiencyReason() {
        return this.deficiencyReason;
    }

    public void setDeficiencyReason(String deficiencyReason) {
        this.deficiencyReason = deficiencyReason;
    }

    public List<Observation> getObservations() {
        return this.observations;
    }

    public void setObservations(List<Observation> observations) {
        this.observations = observations;
    }

    public List<ApplicationDocument> getDocuments() {
        return this.documents;
    }

    public void setDocuments(List<ApplicationDocument> documents) {
        this.documents = documents;
    }

    public List<ApplicationStageHistory> getTimeline() {
        return this.timeline;
    }

    public void setTimeline(List<ApplicationStageHistory> timeline) {
        this.timeline = timeline;
    }

    public List<RequestedIntake> getRequestedIntake() {
        return this.requestedIntake;
    }

    public void setRequestedIntake(List<RequestedIntake> requestedIntake) {
        this.requestedIntake = requestedIntake;
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

    public Boolean getRequiresEvc() {
        return this.requiresEvc != null && this.requiresEvc;
    }

    public void setRequiresEvc(Boolean requiresEvc) {
        this.requiresEvc = requiresEvc;
    }

    public String getEvcReason() {
        return this.evcReason;
    }

    public void setEvcReason(String evcReason) {
        this.evcReason = evcReason;
    }

    public String getEvcMarkedBy() {
        return this.evcMarkedBy;
    }

    public void setEvcMarkedBy(String evcMarkedBy) {
        this.evcMarkedBy = evcMarkedBy;
    }

    public LocalDateTime getEvcMarkedAt() {
        return this.evcMarkedAt;
    }

    public void setEvcMarkedAt(LocalDateTime evcMarkedAt) {
        this.evcMarkedAt = evcMarkedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String institutionName;
        private String institutionCode;
        private String applicationType;
        private String programme;
        private String region;
        private String state;
        private String workflowId;
        private String currentStage;
        private String status;
        private String priority = "NORMAL";
        private String assignedOfficer;
        private String officerRole;
        private String assignedOfficerId;
        private LocalDateTime assignedAt;
        private String assignmentReason;
        private Long version = 0L;
        private Boolean requiresEvc = false;
        private String evcReason;
        private String evcMarkedBy;
        private LocalDateTime evcMarkedAt;
        private LocalDate submissionDate;
        private LocalDate stageStartDate;
        private LocalDate nextDeadline;
        private int deficiencyCount = 0;
        private int missingDocCount = 0;
        private String deficiencyReason;
        private List<Observation> observations = new ArrayList<>();
        private List<ApplicationDocument> documents = new ArrayList<>();
        private List<ApplicationStageHistory> timeline = new ArrayList<>();
        private List<RequestedIntake> requestedIntake = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder institutionName(String institutionName) {
            this.institutionName = institutionName;
            return this;
        }

        public Builder institutionCode(String institutionCode) {
            this.institutionCode = institutionCode;
            return this;
        }

        public Builder applicationType(String applicationType) {
            this.applicationType = applicationType;
            return this;
        }

        public Builder programme(String programme) {
            this.programme = programme;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder state(String state) {
            this.state = state;
            return this;
        }

        public Builder workflowId(String workflowId) {
            this.workflowId = workflowId;
            return this;
        }

        public Builder currentStage(String currentStage) {
            this.currentStage = currentStage;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public Builder assignedOfficer(String assignedOfficer) {
            this.assignedOfficer = assignedOfficer;
            return this;
        }

        public Builder officerRole(String officerRole) {
            this.officerRole = officerRole;
            return this;
        }

        public Builder assignedOfficerId(String assignedOfficerId) {
            this.assignedOfficerId = assignedOfficerId;
            return this;
        }

        public Builder assignedAt(LocalDateTime assignedAt) {
            this.assignedAt = assignedAt;
            return this;
        }

        public Builder assignmentReason(String assignmentReason) {
            this.assignmentReason = assignmentReason;
            return this;
        }

        public Builder version(Long version) {
            this.version = version;
            return this;
        }

        public Builder submissionDate(LocalDate submissionDate) {
            this.submissionDate = submissionDate;
            return this;
        }

        public Builder stageStartDate(LocalDate stageStartDate) {
            this.stageStartDate = stageStartDate;
            return this;
        }

        public Builder nextDeadline(LocalDate nextDeadline) {
            this.nextDeadline = nextDeadline;
            return this;
        }

        public Builder deficiencyCount(int deficiencyCount) {
            this.deficiencyCount = deficiencyCount;
            return this;
        }

        public Builder missingDocCount(int missingDocCount) {
            this.missingDocCount = missingDocCount;
            return this;
        }

        public Builder deficiencyReason(String deficiencyReason) {
            this.deficiencyReason = deficiencyReason;
            return this;
        }

        public Builder observations(List<Observation> observations) {
            this.observations = observations;
            return this;
        }

        public Builder documents(List<ApplicationDocument> documents) {
            this.documents = documents;
            return this;
        }

        public Builder timeline(List<ApplicationStageHistory> timeline) {
            this.timeline = timeline;
            return this;
        }

        public Builder requestedIntake(List<RequestedIntake> requestedIntake) {
            this.requestedIntake = requestedIntake;
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

        public Builder requiresEvc(Boolean requiresEvc) {
            this.requiresEvc = requiresEvc;
            return this;
        }

        public Builder evcReason(String evcReason) {
            this.evcReason = evcReason;
            return this;
        }

        public Builder evcMarkedBy(String evcMarkedBy) {
            this.evcMarkedBy = evcMarkedBy;
            return this;
        }

        public Builder evcMarkedAt(LocalDateTime evcMarkedAt) {
            this.evcMarkedAt = evcMarkedAt;
            return this;
        }

        public Application build() {
            Application app = new Application(id, institutionName, institutionCode, applicationType,
                    programme, region, state, workflowId, currentStage, status, priority,
                    assignedOfficer, officerRole, submissionDate, stageStartDate, nextDeadline,
                    deficiencyCount, missingDocCount, deficiencyReason, observations, documents,
                    timeline, requestedIntake, createdAt, updatedAt);
            app.setAssignedOfficerId(this.assignedOfficerId);
            app.setAssignedAt(this.assignedAt);
            app.setAssignmentReason(this.assignmentReason);
            app.setVersion(this.version != null ? this.version : 0L);
            app.setRequiresEvc(this.requiresEvc);
            app.setEvcReason(this.evcReason);
            app.setEvcMarkedBy(this.evcMarkedBy);
            app.setEvcMarkedAt(this.evcMarkedAt);
            return app;
        }
    }
}
