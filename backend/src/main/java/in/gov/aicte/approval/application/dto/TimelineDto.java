package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.ApplicationStageHistory;
import java.time.LocalDate;

public class TimelineDto {

    private String stage;
    private String status;
    private LocalDate date;
    private String note;

    public TimelineDto() {
    }

    public TimelineDto(String stage, String status, LocalDate date, String note) {
        this.stage = stage;
        this.status = status;
        this.date = date;
        this.note = note;
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

    public LocalDate getDate() {
        return this.date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNote() {
        return this.note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String stage;
        private String status;
        private LocalDate date;
        private String note;

        public Builder() {}

        public Builder stage(String stage) {
            this.stage = stage;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public TimelineDto build() {
            return new TimelineDto(this.stage, this.status, this.date, this.note);
        }
    }

    public static TimelineDto fromEntity(ApplicationStageHistory entity) {
        return TimelineDto.builder()
                .stage(entity.getStage())
                .status(entity.getStatus())
                .date(entity.getDate())
                .note(entity.getNote())
                .build();
    }
}
