package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.RequestedIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestedIntakeRepository extends JpaRepository<RequestedIntake, Long> {
    List<RequestedIntake> findByApplicationId(String applicationId);
}
