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

        public ApplicationDto build() {
            return new ApplicationDto(this.id, this.institutionName, this.institutionCode, this.applicationType, this.programme, this.region, this.state, this.workflowId, this.currentStage, this.status, this.priority, this.assignedOfficer, this.officerRole, this.submissionDate, this.stageStartDate, this.nextDeadline, this.deficiencyCount, this.missingDocCount, this.deficiencyReason, this.observations, this.documents, this.timeline, this.requestedIntake);
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
                .build();
    }
}
