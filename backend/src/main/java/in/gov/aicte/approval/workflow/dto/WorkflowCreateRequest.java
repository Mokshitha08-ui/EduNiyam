package in.gov.aicte.approval.workflow.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class WorkflowCreateRequest {

    private String id;
    private String name;
    private String code;
    private String description;
    private String version;
    private String applicableApplicationTypes;
    private LocalDate effectiveDate;
    private Boolean isDefault;
    private String status;
    private List<WorkflowStageDto> stages;
    private Map<String, Object> rules;

    public WorkflowCreateRequest() {
    }

    public WorkflowCreateRequest(String id, String name, String code, String description, String version, String applicableApplicationTypes, LocalDate effectiveDate, Boolean isDefault, String status, List<WorkflowStageDto> stages, Map<String, Object> rules) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.version = version;
        this.applicableApplicationTypes = applicableApplicationTypes;
        this.effectiveDate = effectiveDate;
        this.isDefault = isDefault;
        this.status = status;
        this.stages = stages;
        this.rules = rules;
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

    public String getApplicableApplicationTypes() {
        return this.applicableApplicationTypes;
    }

    public void setApplicableApplicationTypes(String applicableApplicationTypes) {
        this.applicableApplicationTypes = applicableApplicationTypes;
    }

    public LocalDate getEffectiveDate() {
        return this.effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public Boolean getIsDefault() {
        return this.isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<WorkflowStageDto> getStages() {
        return this.stages;
    }

    public void setStages(List<WorkflowStageDto> stages) {
        this.stages = stages;
    }

    public Map<String, Object> getRules() {
        return this.rules;
    }

    public void setRules(Map<String, Object> rules) {
        this.rules = rules;
    }
}
