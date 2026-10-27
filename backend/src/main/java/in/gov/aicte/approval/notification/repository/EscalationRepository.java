package in.gov.aicte.approval.notification.repository;

import in.gov.aicte.approval.notification.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, String> {
    List<Escalation> findAllByOrderByCreatedAtDesc();
    boolean existsByEntityIdAndStatus(String entityId, String status);
    boolean existsByEntityIdAndLevelAndStatus(String entityId, String level, String status);
}
