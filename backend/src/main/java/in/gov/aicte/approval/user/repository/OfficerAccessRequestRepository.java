package in.gov.aicte.approval.user.repository;

import in.gov.aicte.approval.user.entity.OfficerAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerAccessRequestRepository extends JpaRepository<OfficerAccessRequest, String> {
    Optional<OfficerAccessRequest> findByEmailIgnoreCase(String email);
    Optional<OfficerAccessRequest> findByEmployeeId(String employeeId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmployeeId(String employeeId);
    List<OfficerAccessRequest> findAllByOrderByCreatedAtDesc();
    List<OfficerAccessRequest> findAllByStatusOrderByCreatedAtDesc(String status);
}
