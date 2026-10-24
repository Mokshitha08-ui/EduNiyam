package in.gov.aicte.approval.compliance.repository;

import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplianceItemRepository extends JpaRepository<ComplianceItem, String>, JpaSpecificationExecutor<ComplianceItem> {
    List<ComplianceItem> findByExpiryDateBetween(LocalDate start, LocalDate end);
}
