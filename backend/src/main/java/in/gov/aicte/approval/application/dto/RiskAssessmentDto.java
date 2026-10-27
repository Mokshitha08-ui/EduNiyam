package in.gov.aicte.approval.application.dto;

import java.util.List;

public class RiskAssessmentDto {

    private String applicationId;
    private int score;
    private String level; // LOW, MEDIUM, HIGH, RESOLVED
    private List<String> factors;
    private String recommendedAction;
    private int daysRemaining;
    private boolean isOverdue;

    public RiskAssessmentDto() {
    }

    public RiskAssessmentDto(String applicationId, int score, String level, List<String> factors,
                             String recommendedAction, int daysRemaining, boolean isOverdue) {
        this.applicationId = applicationId;
        this.score = score;
        this.level = level;
        this.factors = factors;
        this.recommendedAction = recommendedAction;
        this.daysRemaining = daysRemaining;
        this.isOverdue = isOverdue;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public List<String> getFactors() {
        return factors;
    }

    public void setFactors(List<String> factors) {
        this.factors = factors;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public int getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(int daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }
}
