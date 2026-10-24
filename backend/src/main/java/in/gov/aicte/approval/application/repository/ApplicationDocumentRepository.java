package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, String> {
    List<ApplicationDocument> findByApplicationId(String applicationId);
}
