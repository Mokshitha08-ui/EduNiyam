package in.gov.aicte.approval.evc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EvcReportSubmitRequest {

    @NotNull(message = "Actual visit completion date is required")
    private LocalDate completionDate;

    @NotBlank(message = "Recommendation is required")
    private String recommendation;

    private String observations;
    private String findingsJson;
    private int geoTaggedPhotosCount;

    public EvcReportSubmitRequest() {
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public String getFindingsJson() {
        return findingsJson;
    }

    public void setFindingsJson(String findingsJson) {
        this.findingsJson = findingsJson;
    }

    public int getGeoTaggedPhotosCount() {
        return geoTaggedPhotosCount;
    }

    public void setGeoTaggedPhotosCount(int geoTaggedPhotosCount) {
        this.geoTaggedPhotosCount = geoTaggedPhotosCount;
    }
}
