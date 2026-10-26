package in.gov.aicte.approval.user.repository;

import in.gov.aicte.approval.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRoleInAndStatus(Collection<String> roles, String status);
    Optional<User> findByIdAndStatus(String id, String status);
    List<User> findByInstitutionCode(String institutionCode);
}
