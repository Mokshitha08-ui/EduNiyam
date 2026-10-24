package in.gov.aicte.approval.evc.repository;

import in.gov.aicte.approval.evc.entity.EvcMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvcMemberRepository extends JpaRepository<EvcMember, Long> {
    List<EvcMember> findByScheduleId(String scheduleId);
}
