package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.Application;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ApplicationDto {

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
    private String priority;
    private String assignedOfficer;
    private String officerRole;
    private String assignedOfficerId;
    private java.time.LocalDateTime assignedAt;
    private String assignmentReason;
    private Long version;
    private Boolean requiresEvc = false;
    private String evcReason;
    private String evcMarkedBy;
    private java.time.LocalDateTime evcMarkedAt;
    private LocalDate submissionDate;
    private LocalDate stageStartDate;
    private LocalDate nextDeadline;
    private int deficiencyCount;
    private int missingDocCount;
    private String deficiencyReason;
    private List<ObservationDto> observations;
    private List<ApplicationDocumentDto> documents;
    private List<TimelineDto> timeline;
    private List<RequestedIntakeDto> requestedIntake;
    private Integer riskScore;
    private String riskLevel;
    private List<String> riskFactors;
    private String recommendedAction;
    private String detailsJson;

    public ApplicationDto() {
    }

    public ApplicationDto(String id, String institutionName, String institutionCode, String applicationType, String programme, String region, String state, String workflowId, String currentStage, String status, String priority, String assignedOfficer, String officerRole, LocalDate submissionDate, LocalDate stageStartDate, LocalDate nextDeadline, int deficiencyCount, int missingDocCount, String deficiencyReason, List<ObservationDto> observations, List<ApplicationDocumentDto> documents, List<TimelineDto> timeline, List<RequestedIntakeDto> requestedIntake) {
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
        this.priority = priority;
        this.assignedOfficer = assignedOfficer;
        this.officerRole = officerRole;
        this.submissionDate = submissionDate;
        this.stageStartDate = stageStartDate;
        this.nextDeadline = nextDeadline;
        this.deficiencyCount = deficiencyCount;
        this.missingDocCount = missingDocCount;
        this.deficiencyReason = deficiencyReason;
        this.observations = observations;
        this.documents = documents;
        this.timeline = timeline;
        this.requestedIntake = requestedIntake;
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

    public java.time.LocalDateTime getAssignedAt() {
        return this.assignedAt;
    }

    public void setAssignedAt(java.time.LocalDateTime assignedAt) {
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

    public List<ObservationDto> getObservations() {
        return this.observations;
    }

    public void setObservations(List<ObservationDto> observations) {
        this.observations = observations;
    }

    public List<ApplicationDocumentDto> getDocuments() {
        return this.documents;
    }

    public void setDocuments(List<ApplicationDocumentDto> documents) {
        this.documents = documents;
    }

    public List<TimelineDto> getTimeline() {
        return this.timeline;
    }

    public void setTimeline(List<TimelineDto> timeline) {
        this.timeline = timeline;
    }

    public List<RequestedIntakeDto> getRequestedIntake() {
        return this.requestedIntake;
    }

    public void setRequestedIntake(List<RequestedIntakeDto> requestedIntake) {
        this.requestedIntake = requestedIntake;
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

    public java.time.LocalDateTime getEvcMarkedAt() {
        return this.evcMarkedAt;
    }

    public void setEvcMarkedAt(java.time.LocalDateTime evcMarkedAt) {
        this.evcMarkedAt = evcMarkedAt;
    }

    public Integer getRiskScore() {
        return this.riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return this.riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getRiskFactors() {
        return this.riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public String getRecommendedAction() {
        return this.recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getDetailsJson() {
        return this.detailsJson;
    }

    public void setDetailsJson(String detailsJson) {
        this.detailsJson = detailsJson;
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
        private String priority;
        private String assignedOfficer;
        private String officerRole;
        private String assignedOfficerId;
        private java.time.LocalDateTime assignedAt;
        private String assignmentReason;
        private Long version;
        private Boolean requiresEvc = false;
        private String evcReason;
        private String evcMarkedBy;
        private java.time.LocalDateTime evcMarkedAt;
        private LocalDate submissionDate;
        private LocalDate stageStartDate;
        private LocalDate nextDeadline;
        private int deficiencyCount;
        private int missingDocCount;
        private String deficiencyReason;
        private List<ObservationDto> observations;
        private List<ApplicationDocumentDto> documents;
        private List<TimelineDto> timeline;
        private List<RequestedIntakeDto> requestedIntake;
        private Integer riskScore;
        private String riskLevel;
        private List<String> riskFactors;
        private String recommendedAction;
    private String detailsJson;

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

        public Builder assignedAt(java.time.LocalDateTime assignedAt) {
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

        public Builder observations(List<ObservationDto> observations) {
            this.observations = observations;
            return this;
        }

        public Builder documents(List<ApplicationDocumentDto> documents) {
            this.documents = documents;
            return this;
        }

        public Builder timeline(List<TimelineDto> timeline) {
            this.timeline = timeline;
            return this;
        }

        public Builder requestedIntake(List<RequestedIntakeDto> requestedIntake) {
            this.requestedIntake = requestedIntake;
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

        public Builder evcMarkedAt(java.time.LocalDateTime evcMarkedAt) {
            this.evcMarkedAt = evcMarkedAt;
            return this;
        }

        public Builder riskScore(Integer riskScore) {
            this.riskScore = riskScore;
            return this;
        }

        public Builder riskLevel(String riskLevel) {
            this.riskLevel = riskLevel;
            return this;
        }

        public Builder riskFactors(List<String> riskFactors) {
            this.riskFactors = riskFactors;
            return this;
        }

        public Builder recommendedAction(String recommendedAction) {
            this.recommendedAction = recommendedAction;
            return this;
        }

        public Builder detailsJson(String detailsJson) {
            this.detailsJson = detailsJson;
            return this;
        }

        public ApplicationDto build() {
            ApplicationDto dto = new ApplicationDto(this.id, this.institutionName, this.institutionCode, this.applicationType, this.programme, this.region, this.state, this.workflowId, this.currentStage, this.status, this.priority, this.assignedOfficer, this.officerRole, this.submissionDate, this.stageStartDate, this.nextDeadline, this.deficiencyCount, this.missingDocCount, this.deficiencyReason, this.observations, this.documents, this.timeline, this.requestedIntake);
            dto.setAssignedOfficerId(this.assignedOfficerId);
            dto.setAssignedAt(this.assignedAt);
            dto.setAssignmentReason(this.assignmentReason);
            dto.setVersion(this.version);
            dto.setRequiresEvc(this.requiresEvc);
            dto.setEvcReason(this.evcReason);
            dto.setEvcMarkedBy(this.evcMarkedBy);
            dto.setEvcMarkedAt(this.evcMarkedAt);
            dto.setRiskScore(this.riskScore);
            dto.setRiskLevel(this.riskLevel);
            dto.setRiskFactors(this.riskFactors);
            dto.setRecommendedAction(this.recommendedAction);
            dto.setDetailsJson(this.detailsJson);
            return dto;
        }
    }

    public static ApplicationDto fromEntity(Application entity) {
        List<ObservationDto> obs = entity.getObservations() != null
                ? entity.getObservations().stream().map(ObservationDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        List<ApplicationDocumentDto> docs = entity.getDocuments() != null
                ? entity.getDocuments().stream().map(ApplicationDocumentDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        List<TimelineDto> tl = entity.getTimeline() != null
                ? entity.getTimeline().stream().map(TimelineDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        List<RequestedIntakeDto> intakes = entity.getRequestedIntake() != null
                ? entity.getRequestedIntake().stream().map(RequestedIntakeDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        // Calculate explainable risk score & factors deterministically (Features 70-76)
        int score = 0;
        List<String> factors = new java.util.ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate deadline = entity.getNextDeadline();
        int daysRemaining = 15;
        boolean isOverdue = false;

        String appStatus = entity.getStatus() != null ? entity.getStatus() : "PENDING";
        if ("APPROVED".equalsIgnoreCase(appStatus) || "REJECTED".equalsIgnoreCase(appStatus)) {
            score = 0;
            factors.add("Application workflow finalized (" + appStatus + ")");
        } else {
            if (deadline != null) {
                long diff = java.time.temporal.ChronoUnit.DAYS.between(today, deadline);
                daysRemaining = (int) diff;
                if (diff < 0) {
                    isOverdue = true;
                    score += 50;
                    factors.add("Target statutory deadline breached by " + Math.abs(diff) + " day(s)");
                } else if (diff <= 3) {
                    score += 35;
                    factors.add("Critical statutory deadline: only " + diff + " day(s) remaining");
                } else if (diff <= 7) {
                    score += 20;
                    factors.add("Approaching statutory deadline within " + diff + " day(s)");
                }
            }
            if (entity.getSubmissionDate() != null) {
                long daysElapsed = Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(entity.getSubmissionDate(), today));
                int percent = (int) ((daysElapsed * 100) / 30);
                if (percent >= 100) {
                    score += 25;
                    factors.add("SLA timeline fully consumed (" + daysElapsed + "/30 days)");
                } else if (percent >= 70) {
                    score += 15;
                    factors.add("Elevated timeline consumption (" + percent + "% of standard 30-day SLA)");
                }
            }
            if (entity.getDeficiencyCount() >= 2) {
                score += 25;
                factors.add("Multiple deficiency return cycles (" + entity.getDeficiencyCount() + " cycles recorded)");
            } else if (entity.getDeficiencyCount() == 1) {
                score += 10;
                factors.add("1 previous deficiency return cycle issued to institution");
            }
            if (entity.getMissingDocCount() > 0) {
                score += Math.min(20, entity.getMissingDocCount() * 10);
                factors.add(entity.getMissingDocCount() + " mandatory compliance document(s) pending");
            }
        }

        String riskLevel = "LOW";
        if ("APPROVED".equalsIgnoreCase(appStatus) || "REJECTED".equalsIgnoreCase(appStatus)) {
            riskLevel = "RESOLVED";
        } else if (score >= 45) {
            riskLevel = "HIGH";
        } else if (score >= 25) {
            riskLevel = "MEDIUM";
        }

        if (factors.isEmpty()) {
            factors.add("On-track within standard processing timeline");
        }

        String recommendedAction;
        if (isOverdue) {
            recommendedAction = "Immediate officer intervention required; prioritize scrutiny or convene review panel.";
        } else if (entity.getDeficiencyCount() >= 1) {
            recommendedAction = "Follow up with institution representative to resolve pending deficiencies.";
        } else if (daysRemaining <= 3) {
            recommendedAction = "Expedite scrutiny and document verification before statutory deadline expiration.";
        } else if (entity.getMissingDocCount() > 0) {
            recommendedAction = "Prompt applicant institution to upload missing mandatory attachments.";
        } else {
            recommendedAction = "Maintain standard monitoring timeline.";
        }

        return ApplicationDto.builder()
                .id(entity.getId())
                .institutionName(entity.getInstitutionName())
                .institutionCode(entity.getInstitutionCode())
                .applicationType(entity.getApplicationType())
                .programme(entity.getProgramme())
                .region(entity.getRegion())
                .state(entity.getState())
                .workflowId(entity.getWorkflowId())
                .currentStage(entity.getCurrentStage())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .assignedOfficer(entity.getAssignedOfficer())
                .officerRole(entity.getOfficerRole())
                .assignedOfficerId(entity.getAssignedOfficerId())
                .assignedAt(entity.getAssignedAt())
                .assignmentReason(entity.getAssignmentReason())
                .version(entity.getVersion())
                .requiresEvc(entity.getRequiresEvc())
                .evcReason(entity.getEvcReason())
                .evcMarkedBy(entity.getEvcMarkedBy())
                .evcMarkedAt(entity.getEvcMarkedAt())
                .submissionDate(entity.getSubmissionDate())
                .stageStartDate(entity.getStageStartDate())
                .nextDeadline(entity.getNextDeadline())
                .deficiencyCount(entity.getDeficiencyCount())
                .missingDocCount(entity.getMissingDocCount())
                .deficiencyReason(entity.getDeficiencyReason())
                .observations(obs)
                .documents(docs)
                .timeline(tl)
                .requestedIntake(intakes)
                .riskScore(score)
                .riskLevel(riskLevel)
                .riskFactors(factors)
                .recommendedAction(recommendedAction)
                .detailsJson(entity.getDetailsJson())
                .build();
    }
}
