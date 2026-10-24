package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, String> {
    List<Observation> findByApplicationIdOrderByDateDesc(String applicationId);
}
