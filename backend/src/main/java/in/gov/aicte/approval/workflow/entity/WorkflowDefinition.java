package in.gov.aicte.approval.workflow.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "staff_workflow_definitions")
public class WorkflowDefinition {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version", length = 32)
    private String version;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "is_default")
    private boolean isDefault = false;

    @Column(name = "rules_json", columnDefinition = "TEXT")
    private String rulesJson;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("stageOrder ASC")
    private List<WorkflowStage> stages = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public WorkflowDefinition() {
    }

    public WorkflowDefinition(String id, String name, String code, String description, String version,
                              LocalDate effectiveDate, boolean isDefault, String rulesJson,
                              List<WorkflowStage> stages, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.version = version;
        this.effectiveDate = effectiveDate;
        this.isDefault = isDefault;
        this.rulesJson = rulesJson;
        this.stages = stages != null ? stages : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return this.code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVersion() {
        return this.version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public LocalDate getEffectiveDate() {
        return this.effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public boolean isDefault() {
        return this.isDefault;
    }

    public boolean getIsDefault() {
        return this.isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public void setIsDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getRulesJson() {
        return this.rulesJson;
    }

    public void setRulesJson(String rulesJson) {
        this.rulesJson = rulesJson;
    }

    public List<WorkflowStage> getStages() {
        return this.stages;
    }

    public void setStages(List<WorkflowStage> stages) {
        this.stages = stages;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String code;
        private String description;
        private String version;
        private LocalDate effectiveDate;
        private boolean isDefault = false;
        private String rulesJson;
        private List<WorkflowStage> stages = new ArrayList<>();
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder code(String code) {
            this.code = code;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder version(String version) {
            this.version = version;
            return this;
        }

        public Builder effectiveDate(LocalDate effectiveDate) {
            this.effectiveDate = effectiveDate;
            return this;
        }

        public Builder isDefault(boolean isDefault) {
            this.isDefault = isDefault;
            return this;
        }

        public Builder rulesJson(String rulesJson) {
            this.rulesJson = rulesJson;
            return this;
        }

        public Builder stages(List<WorkflowStage> stages) {
            this.stages = stages;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public WorkflowDefinition build() {
            return new WorkflowDefinition(id, name, code, description, version, effectiveDate, isDefault, rulesJson, stages, createdAt);
        }
    }
}
