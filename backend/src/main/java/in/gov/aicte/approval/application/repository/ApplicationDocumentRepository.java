package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, String>, JpaSpecificationExecutor<ApplicationDocument> {
    List<ApplicationDocument> findByApplicationId(String applicationId);
    List<ApplicationDocument> findByComplianceId(String complianceId);
    List<ApplicationDocument> findByInstitutionCode(String institutionCode);
    List<ApplicationDocument> findByExpiryDateIsNotNullAndExpiryDateBefore(LocalDate date);
    List<ApplicationDocument> findByExpiryDateIsNotNullAndExpiryDateBetween(LocalDate start, LocalDate end);
}
