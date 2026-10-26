package in.gov.aicte.approval.workflow.repository;

import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, String> {
    Optional<WorkflowDefinition> findByCode(String code);
    boolean existsByCode(String code);
    List<WorkflowDefinition> findByStatus(String status);
}
