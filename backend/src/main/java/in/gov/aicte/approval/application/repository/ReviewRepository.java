package in.gov.aicte.approval.application.repository;

import in.gov.aicte.approval.application.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByApplicationIdOrderByCreatedAtDesc(String applicationId);
    List<Review> findByApplicationIdAndStageOrderByCreatedAtDesc(String applicationId, String stage);
}
