package in.gov.aicte.approval.institution.repository;

import in.gov.aicte.approval.institution.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {
    Optional<Institution> findByCode(String code);
    boolean existsByCode(String code);
    List<Institution> findAllByOrderByCreatedAtDesc();
    List<Institution> findAllByStatusOrderByCreatedAtDesc(String status);
}
