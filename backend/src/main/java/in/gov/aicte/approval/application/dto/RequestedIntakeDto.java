package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.RequestedIntake;

public class RequestedIntakeDto {

    private String course;
    private int currentIntake;
    private int proposedIntake;

    public RequestedIntakeDto() {
    }

    public RequestedIntakeDto(String course, int currentIntake, int proposedIntake) {
        this.course = course;
        this.currentIntake = currentIntake;
        this.proposedIntake = proposedIntake;
    }

    public String getCourse() {
        return this.course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public int getCurrentIntake() {
        return this.currentIntake;
    }

    public void setCurrentIntake(int currentIntake) {
        this.currentIntake = currentIntake;
    }

    public int getProposedIntake() {
        return this.proposedIntake;
    }

    public void setProposedIntake(int proposedIntake) {
        this.proposedIntake = proposedIntake;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String course;
        private int currentIntake;
        private int proposedIntake;

        public Builder() {}

        public Builder course(String course) {
            this.course = course;
            return this;
        }

        public Builder currentIntake(int currentIntake) {
            this.currentIntake = currentIntake;
            return this;
        }

        public Builder proposedIntake(int proposedIntake) {
            this.proposedIntake = proposedIntake;
            return this;
        }

        public RequestedIntakeDto build() {
            return new RequestedIntakeDto(this.course, this.currentIntake, this.proposedIntake);
        }
    }

    public static RequestedIntakeDto fromEntity(RequestedIntake entity) {
        return RequestedIntakeDto.builder()
                .course(entity.getCourse())
                .currentIntake(entity.getCurrentIntake())
                .proposedIntake(entity.getProposedIntake())
                .build();
    }
}
