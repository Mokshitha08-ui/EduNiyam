package in.gov.aicte.approval.workflow.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "staff_workflow_stages")
public class WorkflowStage {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private WorkflowDefinition workflow;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "stage_order", nullable = false)
    private int stageOrder;
    @Column(name = "target_days", nullable = false)
    private int targetDays;
    @Column(name = "role_allowed", nullable = false, length = 64)
    private String roleAllowed;

    public WorkflowStage() {
    }

    public WorkflowStage(String id, WorkflowDefinition workflow, String name, String code, int stageOrder, int targetDays, String roleAllowed) {
        this.id = id;
        this.workflow = workflow;
        this.name = name;
        this.code = code;
        this.stageOrder = stageOrder;
        this.targetDays = targetDays;
        this.roleAllowed = roleAllowed;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public WorkflowDefinition getWorkflow() {
        return this.workflow;
    }

    public void setWorkflow(WorkflowDefinition workflow) {
        this.workflow = workflow;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private WorkflowDefinition workflow;
        private String name;
        private String code;
        private int stageOrder;
        private int targetDays;
        private String roleAllowed;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder workflow(WorkflowDefinition workflow) {
            this.workflow = workflow;
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

        public WorkflowStage build() {
            return new WorkflowStage(this.id, this.workflow, this.name, this.code, this.stageOrder, this.targetDays, this.roleAllowed);
        }
    }

}
