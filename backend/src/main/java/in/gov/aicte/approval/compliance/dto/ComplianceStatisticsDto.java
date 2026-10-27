package in.gov.aicte.approval.compliance.dto;

public class ComplianceStatisticsDto {
    private long totalObligations;
    private long compliantCount;
    private long nonCompliantCount;
    private long correctionRequiredCount;
    private long pendingReviewCount;
    private long pendingSubmissionCount;
    private long overdueCount;
    private long expiringSoonCount;
    private long expiredCount;
    private double completionPercentage;
    private String denominatorDescription;

    public ComplianceStatisticsDto() {}

    public long getTotalObligations() { return totalObligations; }
    public void setTotalObligations(long totalObligations) { this.totalObligations = totalObligations; }

    public long getCompliantCount() { return compliantCount; }
    public void setCompliantCount(long compliantCount) { this.compliantCount = compliantCount; }

    public long getNonCompliantCount() { return nonCompliantCount; }
    public void setNonCompliantCount(long nonCompliantCount) { this.nonCompliantCount = nonCompliantCount; }

    public long getCorrectionRequiredCount() { return correctionRequiredCount; }
    public void setCorrectionRequiredCount(long correctionRequiredCount) { this.correctionRequiredCount = correctionRequiredCount; }

    public long getPendingReviewCount() { return pendingReviewCount; }
    public void setPendingReviewCount(long pendingReviewCount) { this.pendingReviewCount = pendingReviewCount; }

    public long getPendingSubmissionCount() { return pendingSubmissionCount; }
    public void setPendingSubmissionCount(long pendingSubmissionCount) { this.pendingSubmissionCount = pendingSubmissionCount; }

    public long getOverdueCount() { return overdueCount; }
    public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }

    public long getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(long expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public long getExpiredCount() { return expiredCount; }
    public void setExpiredCount(long expiredCount) { this.expiredCount = expiredCount; }

    public double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(double completionPercentage) { this.completionPercentage = completionPercentage; }

    public String getDenominatorDescription() { return denominatorDescription; }
    public void setDenominatorDescription(String denominatorDescription) { this.denominatorDescription = denominatorDescription; }
}
