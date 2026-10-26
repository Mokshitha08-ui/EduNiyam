package in.gov.aicte.approval.workflow.dto;

import in.gov.aicte.approval.workflow.entity.WorkflowStage;

public class WorkflowStageDto {

    private String id;
    private String name;
    private String code;
    private int stageOrder;
    private int targetDays;
    private String roleAllowed;
    private boolean isMandatory = true;
    private String stageType = "SCRUTINY";
    private String permittedNextStages;
    private String checklistJson;

    public WorkflowStageDto() {
    }

    public WorkflowStageDto(String id, String name, String code, int stageOrder, int targetDays, String roleAllowed, boolean isMandatory, String stageType, String permittedNextStages, String checklistJson) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.stageOrder = stageOrder;
        this.targetDays = targetDays;
        this.roleAllowed = roleAllowed;
        this.isMandatory = isMandatory;
        this.stageType = stageType != null ? stageType : "SCRUTINY";
        this.permittedNextStages = permittedNextStages;
        this.checklistJson = checklistJson;
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

    public int getStageOrder() {
        return this.stageOrder;
    }

    public void setStageOrder(int stageOrder) {
        this.stageOrder = stageOrder;
    }

    public int getTargetDays() {
        return this.targetDays;
    }

    public void setTargetDays(int targetDays) {
        this.targetDays = targetDays;
    }

    public String getRoleAllowed() {
        return this.roleAllowed;
    }

    public void setRoleAllowed(String roleAllowed) {
        this.roleAllowed = roleAllowed;
    }

    public boolean isMandatory() {
        return this.isMandatory;
    }

    public boolean getIsMandatory() {
        return this.isMandatory;
    }

    public void setMandatory(boolean isMandatory) {
        this.isMandatory = isMandatory;
    }

    public void setIsMandatory(boolean isMandatory) {
        this.isMandatory = isMandatory;
    }

    public String getStageType() {
        return this.stageType;
    }

    public void setStageType(String stageType) {
        this.stageType = stageType;
    }

    public String getPermittedNextStages() {
        return this.permittedNextStages;
    }

    public void setPermittedNextStages(String permittedNextStages) {
        this.permittedNextStages = permittedNextStages;
    }

    public String getChecklistJson() {
        return this.checklistJson;
    }

    public void setChecklistJson(String checklistJson) {
        this.checklistJson = checklistJson;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String code;
        private int stageOrder;
        private int targetDays;
        private String roleAllowed;
        private boolean isMandatory = true;
        private String stageType = "SCRUTINY";
        private String permittedNextStages;
        private String checklistJson;

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

        public Builder stageOrder(int stageOrder) {
            this.stageOrder = stageOrder;
            return this;
        }

        public Builder targetDays(int targetDays) {
            this.targetDays = targetDays;
            return this;
        }

        public Builder roleAllowed(String roleAllowed) {
            this.roleAllowed = roleAllowed;
            return this;
        }

        public Builder isMandatory(boolean isMandatory) {
            this.isMandatory = isMandatory;
            return this;
        }

        public Builder stageType(String stageType) {
            this.stageType = stageType;
            return this;
        }

        public Builder permittedNextStages(String permittedNextStages) {
            this.permittedNextStages = permittedNextStages;
            return this;
        }

        public Builder checklistJson(String checklistJson) {
            this.checklistJson = checklistJson;
            return this;
        }

        public WorkflowStageDto build() {
            return new WorkflowStageDto(this.id, this.name, this.code, this.stageOrder, this.targetDays, this.roleAllowed, this.isMandatory, this.stageType, this.permittedNextStages, this.checklistJson);
        }
    }

    public static WorkflowStageDto fromEntity(WorkflowStage entity) {
        return WorkflowStageDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .stageOrder(entity.getStageOrder())
                .targetDays(entity.getTargetDays())
                .roleAllowed(entity.getRoleAllowed())
                .isMandatory(entity.isMandatory())
                .stageType(entity.getStageType())
                .permittedNextStages(entity.getPermittedNextStages())
                .checklistJson(entity.getChecklistJson())
                .build();
    }
}
