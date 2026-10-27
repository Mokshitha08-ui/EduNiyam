package in.gov.aicte.approval.application.service;

import in.gov.aicte.approval.application.dto.RiskAssessmentDto;
import in.gov.aicte.approval.application.entity.Application;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Transparent, deterministic rule-based delay-risk calculation engine (Features 70-76).
 * Computes risk scores and explainable contributing factor breakdown from real workflow metrics.
 */
@Service
public class RiskScoringService {

    // Documented thresholds and SLA parameters
    public static final int THRESHOLD_HIGH = 45;
    public static final int THRESHOLD_MEDIUM = 25;
    public static final int STANDARD_SLA_DAYS = 30;

    public RiskAssessmentDto evaluateRisk(Application app) {
        if (app == null) {
            return new RiskAssessmentDto("N/A", 0, "LOW",
                    List.of("Standard regulatory parameters"),
                    "Standard processing", 30, false);
        }

        String status = app.getStatus() != null ? app.getStatus() : "PENDING";
        if ("APPROVED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status)) {
            return new RiskAssessmentDto(app.getId(), 0, "RESOLVED",
                    List.of("Application workflow finalized with decision: " + status),
                    "No pending administrative action required", 0, false);
        }

        int score = 0;
        List<String> factors = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate deadline = app.getNextDeadline();

        int daysRemaining = 15;
        boolean isOverdue = false;

        // 1. Overdue or upcoming statutory deadline evaluation
        if (deadline != null) {
            long diff = ChronoUnit.DAYS.between(today, deadline);
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

        // 2. Timeline consumption vs standard cycle SLA
        LocalDate submissionDate = app.getSubmissionDate();
        if (submissionDate != null) {
            long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(submissionDate, today));
            int percent = (int) ((daysElapsed * 100) / STANDARD_SLA_DAYS);
            if (percent >= 100) {
                score += 25;
                factors.add("SLA timeline fully consumed (" + daysElapsed + "/" + STANDARD_SLA_DAYS + " days)");
            } else if (percent >= 70) {
                score += 15;
                factors.add("Elevated timeline consumption (" + percent + "% of standard " + STANDARD_SLA_DAYS + "-day SLA)");
            }
        }

        // 3. Prior deficiency return cycles
        int deficiencyCount = app.getDeficiencyCount();
        if (deficiencyCount >= 2) {
            score += 25;
            factors.add("Multiple deficiency return cycles (" + deficiencyCount + " cycles recorded)");
        } else if (deficiencyCount == 1) {
            score += 10;
            factors.add("1 previous deficiency return cycle issued to institution");
        }

        // 4. Missing mandatory documents
        int missingDocCount = app.getMissingDocCount();
        if (missingDocCount > 0) {
            score += Math.min(20, missingDocCount * 10);
            factors.add(missingDocCount + " mandatory compliance document(s) pending");
        }

        // 5. Categorize score into documented levels
        String level = "LOW";
        if (score >= THRESHOLD_HIGH) {
            level = "HIGH";
        } else if (score >= THRESHOLD_MEDIUM) {
            level = "MEDIUM";
        }

        if (factors.isEmpty()) {
            factors.add("On-track within standard processing timeline");
        }

        // 6. Actionable advisory recommendations (Feature 73)
        String recommendation;
        if (isOverdue) {
            recommendation = "Immediate officer intervention required; prioritize scrutiny or convene review panel.";
        } else if (deficiencyCount >= 1) {
            recommendation = "Follow up with institution representative to resolve pending deficiencies.";
        } else if (daysRemaining <= 3) {
            recommendation = "Expedite scrutiny and document verification before statutory deadline expiration.";
        } else if (missingDocCount > 0) {
            recommendation = "Prompt applicant institution to upload missing mandatory attachments.";
        } else {
            recommendation = "Maintain standard monitoring timeline.";
        }

        return new RiskAssessmentDto(app.getId(), score, level, factors, recommendation, daysRemaining, isOverdue);
    }
}
