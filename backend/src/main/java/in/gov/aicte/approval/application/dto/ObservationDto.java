package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.Observation;
import java.time.LocalDate;

public class ObservationDto {

    private String id;
    private LocalDate date;
    private String officer;
    private String stage;
    private String status;
    private String remarks;
    private String clauses;

    public ObservationDto() {
    }

    public ObservationDto(String id, LocalDate date, String officer, String stage, String status, String remarks, String clauses) {
        this.id = id;
        this.date = date;
        this.officer = officer;
        this.stage = stage;
        this.status = status;
        this.remarks = remarks;
        this.clauses = clauses;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private LocalDate date;
        private String officer;
        private String stage;
        private String status;
        private String remarks;
        private String clauses;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
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

        public ObservationDto build() {
            return new ObservationDto(this.id, this.date, this.officer, this.stage, this.status, this.remarks, this.clauses);
        }
    }

    public static ObservationDto fromEntity(Observation entity) {
        return ObservationDto.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .officer(entity.getOfficer())
                .stage(entity.getStage())
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .clauses(entity.getClauses())
                .build();
    }
}
