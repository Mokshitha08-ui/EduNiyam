package in.gov.aicte.approval.application.dto;

import java.time.LocalDate;
import java.util.List;

public class ObservationCreateRequest {

    private String type = "DEFICIENCY"; // DEFICIENCY or OBSERVATION
    private String severity = "MAJOR"; // CRITICAL, MAJOR, MINOR
    private String remarks; // Issue description
    private String correctiveAction;
    private List<String> clauses;
    private LocalDate deadline;
    private Integer deadlineDays;

    public ObservationCreateRequest() {
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return this.severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getRemarks() {
        return this.remarks;
    }

    public String getDescription() {
        return this.remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public void setDescription(String description) {
        this.remarks = description;
    }

    public String getCorrectiveAction() {
        return this.correctiveAction;
    }

    public void setCorrectiveAction(String correctiveAction) {
        this.correctiveAction = correctiveAction;
    }

    public List<String> getClauses() {
        return this.clauses;
    }

    public String getClause() {
        return this.clauses != null && !this.clauses.isEmpty() ? String.join(", ", this.clauses) : null;
    }

    public void setClauses(List<String> clauses) {
        this.clauses = clauses;
    }

    public void setClause(String clause) {
        if (clause != null) {
            this.clauses = List.of(clause);
        }
    }

    public LocalDate getDeadline() {
        return this.deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public Integer getDeadlineDays() {
        return this.deadlineDays;
    }

    public void setDeadlineDays(Integer deadlineDays) {
        this.deadlineDays = deadlineDays;
    }
}
