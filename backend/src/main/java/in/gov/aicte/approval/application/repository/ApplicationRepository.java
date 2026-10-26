package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String>, JpaSpecificationExecutor<Application> {
    boolean existsByInstitutionCodeAndApplicationTypeAndStatusIn(String institutionCode, String applicationType, Collection<String> statuses);
    Optional<Application> findFirstByInstitutionCodeAndApplicationTypeAndStatusIn(String institutionCode, String applicationType, Collection<String> statuses);
    List<Application> findByInstitutionCode(String institutionCode);
    boolean existsByWorkflowId(String workflowId);
    long countByWorkflowId(String workflowId);
}
