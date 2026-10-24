package in.gov.aicte.approval.evc.repository;

import in.gov.aicte.approval.evc.entity.EvcSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvcScheduleRepository extends JpaRepository<EvcSchedule, String> {
    Optional<EvcSchedule> findByApplicationId(String applicationId);
    List<EvcSchedule> findByRegion(String region);
    List<EvcSchedule> findByStatus(String status);
}
