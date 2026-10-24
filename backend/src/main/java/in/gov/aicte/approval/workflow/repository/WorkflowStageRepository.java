package in.gov.aicte.approval.workflow.repository;

import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, String> {
    List<WorkflowStage> findByWorkflowIdOrderByStageOrderAsc(String workflowId);
}
