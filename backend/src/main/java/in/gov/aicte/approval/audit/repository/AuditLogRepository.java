package in.gov.aicte.approval.audit.repository;

import in.gov.aicte.approval.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    Page<AuditLog> findByEntityId(String entityId, Pageable pageable);
}
