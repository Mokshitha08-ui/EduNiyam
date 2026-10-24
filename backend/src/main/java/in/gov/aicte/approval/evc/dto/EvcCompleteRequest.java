package in.gov.aicte.approval.evc.dto;

import java.time.LocalDate;

public class EvcCompleteRequest {

    private LocalDate completionDate;
    private String observations;
    private int geoTaggedPhotosCount;
    private String reportStatus;

    public EvcCompleteRequest() {
    }

    public EvcCompleteRequest(LocalDate completionDate, String observations, int geoTaggedPhotosCount, String reportStatus) {
        this.completionDate = completionDate;
        this.observations = observations;
        this.geoTaggedPhotosCount = geoTaggedPhotosCount;
        this.reportStatus = reportStatus;
    }

    public LocalDate getCompletionDate() {
        return this.completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
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

    public String getReportStatus() {
        return this.reportStatus;
    }

    public void setReportStatus(String reportStatus) {
        this.reportStatus = reportStatus;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private LocalDate completionDate;
        private String observations;
        private int geoTaggedPhotosCount;
        private String reportStatus;

        public Builder() {}

        public Builder completionDate(LocalDate completionDate) {
            this.completionDate = completionDate;
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

        public Builder reportStatus(String reportStatus) {
            this.reportStatus = reportStatus;
            return this;
        }

        public EvcCompleteRequest build() {
            return new EvcCompleteRequest(this.completionDate, this.observations, this.geoTaggedPhotosCount, this.reportStatus);
        }
    }

}
