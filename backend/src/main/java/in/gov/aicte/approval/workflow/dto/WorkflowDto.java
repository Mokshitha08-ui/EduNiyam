package in.gov.aicte.approval.workflow.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class WorkflowDto {

    private String id;
    private String name;
    private String code;
    private String description;
    private String version;
    private LocalDate effectiveDate;
    private boolean isDefault;
    private String status;
    private String applicableApplicationTypes;
    private List<WorkflowStageDto> stages;
    private Map<String, Object> rules;

    public WorkflowDto() {
    }

    public WorkflowDto(String id, String name, String code, String description, String version, LocalDate effectiveDate, boolean isDefault, String status, String applicableApplicationTypes, List<WorkflowStageDto> stages, Map<String, Object> rules) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.version = version;
        this.effectiveDate = effectiveDate;
        this.isDefault = isDefault;
        this.status = status;
        this.applicableApplicationTypes = applicableApplicationTypes;
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

    public LocalDate getEffectiveDate() {
        return this.effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public boolean getIsDefault() {
        return this.isDefault;
    }

    public void setIsDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApplicableApplicationTypes() {
        return this.applicableApplicationTypes;
    }

    public void setApplicableApplicationTypes(String applicableApplicationTypes) {
        this.applicableApplicationTypes = applicableApplicationTypes;
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
        private boolean isDefault;
        private String status = "ACTIVE";
        private String applicableApplicationTypes;
        private List<WorkflowStageDto> stages;
        private Map<String, Object> rules;

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

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder applicableApplicationTypes(String applicableApplicationTypes) {
            this.applicableApplicationTypes = applicableApplicationTypes;
            return this;
        }

        public Builder stages(List<WorkflowStageDto> stages) {
            this.stages = stages;
            return this;
        }

        public Builder rules(Map<String, Object> rules) {
            this.rules = rules;
            return this;
        }

        public WorkflowDto build() {
            return new WorkflowDto(this.id, this.name, this.code, this.description, this.version, this.effectiveDate, this.isDefault, this.status, this.applicableApplicationTypes, this.stages, this.rules);
        }
    }

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static WorkflowDto fromEntity(WorkflowDefinition entity) {
        Map<String, Object> rulesMap = Collections.emptyMap();
        if (entity.getRulesJson() != null && !entity.getRulesJson().isBlank()) {
            try {
                rulesMap = OBJECT_MAPPER.readValue(entity.getRulesJson(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {
            }
        }

        List<WorkflowStageDto> stageDtos = entity.getStages() != null
                ? entity.getStages().stream().map(WorkflowStageDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return WorkflowDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .version(entity.getVersion())
                .effectiveDate(entity.getEffectiveDate())
                .isDefault(entity.isDefault())
                .status(entity.getStatus())
                .applicableApplicationTypes(entity.getApplicableApplicationTypes())
                .stages(stageDtos)
                .rules(rulesMap)
                .build();
    }
}
