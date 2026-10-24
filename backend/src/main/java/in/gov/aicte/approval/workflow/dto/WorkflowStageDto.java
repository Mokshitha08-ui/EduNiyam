package in.gov.aicte.approval.workflow.dto;

import in.gov.aicte.approval.workflow.entity.WorkflowStage;

public class WorkflowStageDto {

    private String id;
    private String name;
    private String code;
    private int targetDays;
    private String roleAllowed;

    public WorkflowStageDto() {
    }

    public WorkflowStageDto(String id, String name, String code, int targetDays, String roleAllowed) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.targetDays = targetDays;
        this.roleAllowed = roleAllowed;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String code;
        private int targetDays;
        private String roleAllowed;

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

        public Builder targetDays(int targetDays) {
            this.targetDays = targetDays;
            return this;
        }

        public Builder roleAllowed(String roleAllowed) {
            this.roleAllowed = roleAllowed;
            return this;
        }

        public WorkflowStageDto build() {
            return new WorkflowStageDto(this.id, this.name, this.code, this.targetDays, this.roleAllowed);
        }
    }

    public static WorkflowStageDto fromEntity(WorkflowStage entity) {
        return WorkflowStageDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .targetDays(entity.getTargetDays())
                .roleAllowed(entity.getRoleAllowed())
                .build();
    }
}
