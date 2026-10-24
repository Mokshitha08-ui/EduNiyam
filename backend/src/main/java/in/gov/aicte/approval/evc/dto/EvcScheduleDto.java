package in.gov.aicte.approval.evc.dto;

import in.gov.aicte.approval.evc.entity.EvcSchedule;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class EvcScheduleDto {

    private String id;
    private String applicationId;
    private String institutionName;
    private String region;
    private String visitType;
    private String status;
    private LocalDate schedulingDeadline;
    private LocalDate proposedDate;
    private List<EvcMemberDto> committeeMembers;
    private String mode;
    private String conflictStatus;
    private LocalDate completionDate;
    private String reportStatus;
    private String observations;
    private int geoTaggedPhotosCount;

    public EvcScheduleDto() {
    }

    public EvcScheduleDto(String id, String applicationId, String institutionName, String region, String visitType, String status, LocalDate schedulingDeadline, LocalDate proposedDate, List<EvcMemberDto> committeeMembers, String mode, String conflictStatus, LocalDate completionDate, String reportStatus, String observations, int geoTaggedPhotosCount) {
        this.id = id;
        this.applicationId = applicationId;
        this.institutionName = institutionName;
        this.region = region;
        this.visitType = visitType;
        this.status = status;
        this.schedulingDeadline = schedulingDeadline;
        this.proposedDate = proposedDate;
        this.committeeMembers = committeeMembers;
        this.mode = mode;
        this.conflictStatus = conflictStatus;
        this.completionDate = completionDate;
        this.reportStatus = reportStatus;
        this.observations = observations;
        this.geoTaggedPhotosCount = geoTaggedPhotosCount;
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

    public List<EvcMemberDto> getCommitteeMembers() {
        return this.committeeMembers;
    }

    public void setCommitteeMembers(List<EvcMemberDto> committeeMembers) {
        this.committeeMembers = committeeMembers;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String applicationId;
        private String institutionName;
        private String region;
        private String visitType;
        private String status;
        private LocalDate schedulingDeadline;
        private LocalDate proposedDate;
        private List<EvcMemberDto> committeeMembers;
        private String mode;
        private String conflictStatus;
        private LocalDate completionDate;
        private String reportStatus;
        private String observations;
        private int geoTaggedPhotosCount;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder applicationId(String applicationId) {
            this.applicationId = applicationId;
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

        public Builder committeeMembers(List<EvcMemberDto> committeeMembers) {
            this.committeeMembers = committeeMembers;
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

        public EvcScheduleDto build() {
            return new EvcScheduleDto(this.id, this.applicationId, this.institutionName, this.region, this.visitType, this.status, this.schedulingDeadline, this.proposedDate, this.committeeMembers, this.mode, this.conflictStatus, this.completionDate, this.reportStatus, this.observations, this.geoTaggedPhotosCount);
        }
    }

    public static EvcScheduleDto fromEntity(EvcSchedule entity) {
        List<EvcMemberDto> members = entity.getCommitteeMembers() != null
                ? entity.getCommitteeMembers().stream().map(EvcMemberDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return EvcScheduleDto.builder()
                .id(entity.getId())
                .applicationId(entity.getApplication() != null ? entity.getApplication().getId() : null)
                .institutionName(entity.getInstitutionName())
                .region(entity.getRegion())
                .visitType(entity.getVisitType())
                .status(entity.getStatus())
                .schedulingDeadline(entity.getSchedulingDeadline())
                .proposedDate(entity.getProposedDate())
                .committeeMembers(members)
                .mode(entity.getMode())
                .conflictStatus(entity.getConflictStatus())
                .completionDate(entity.getCompletionDate())
                .reportStatus(entity.getReportStatus())
                .observations(entity.getObservations())
                .geoTaggedPhotosCount(entity.getGeoTaggedPhotosCount())
                .build();
    }
}
