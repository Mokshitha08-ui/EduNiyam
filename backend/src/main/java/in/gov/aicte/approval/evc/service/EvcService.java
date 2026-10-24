package in.gov.aicte.approval.evc.service;

import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.evc.dto.EvcAssignRequest;
import in.gov.aicte.approval.evc.dto.EvcCompleteRequest;
import in.gov.aicte.approval.evc.dto.EvcMemberDto;
import in.gov.aicte.approval.evc.dto.EvcScheduleDto;
import in.gov.aicte.approval.evc.entity.EvcMember;
import in.gov.aicte.approval.evc.entity.EvcSchedule;
import in.gov.aicte.approval.evc.repository.EvcMemberRepository;
import in.gov.aicte.approval.evc.repository.EvcScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EvcService {

    private final EvcScheduleRepository scheduleRepository;
    private final EvcMemberRepository memberRepository;
    private final AuditLogRepository auditLogRepository;

    public EvcService(EvcScheduleRepository scheduleRepository, EvcMemberRepository memberRepository, AuditLogRepository auditLogRepository) {
        this.scheduleRepository = scheduleRepository;
        this.memberRepository = memberRepository;
        this.auditLogRepository = auditLogRepository;
    }


    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    @Transactional(readOnly = true)
    public List<EvcScheduleDto> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(EvcScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvcScheduleDto getScheduleById(String id) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));
        return EvcScheduleDto.fromEntity(schedule);
    }

    @Transactional
    public EvcScheduleDto assignCommittee(String id, EvcAssignRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        String prevState = schedule.getStatus();
        schedule.setProposedDate(request.getProposedDate() != null ? request.getProposedDate() : LocalDate.now().plusDays(7));
        schedule.setMode(request.getMode() != null ? request.getMode() : "PHYSICAL");
        schedule.setStatus("SCHEDULED");
        schedule.setReportStatus("VISIT_UPCOMING");

        // Clear existing members and reassign
        schedule.getCommitteeMembers().clear();

        if (request.getCommitteeMembers() != null && !request.getCommitteeMembers().isEmpty()) {
            for (EvcMemberDto mDto : request.getCommitteeMembers()) {
                EvcMember member = EvcMember.builder()
                        .schedule(schedule)
                        .name(mDto.getName())
                        .role(mDto.getRole() != null ? mDto.getRole() : "Committee Expert")
                        .affiliation(mDto.getAffiliation() != null ? mDto.getAffiliation() : "AICTE Expert Panel")
                        .phone(mDto.getPhone())
                        .build();
                schedule.getCommitteeMembers().add(member);
            }
        } else if (request.getCommitteeMemberIds() != null && !request.getCommitteeMemberIds().isEmpty()) {
            // Default experts for prototype
            for (String expId : request.getCommitteeMemberIds()) {
                EvcMember member = EvcMember.builder()
                        .schedule(schedule)
                        .name(resolveExpertName(expId))
                        .role("Expert Committee Member")
                        .affiliation("AICTE Panel Pool")
                        .phone("+91 94330 18273")
                        .build();
                schedule.getCommitteeMembers().add(member);
            }
        }

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, "EVC Coordinator", "EVC_ASSIGNED", prevState, "SCHEDULED",
                "EVC inspection assigned for date: " + schedule.getProposedDate());

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto completeInspection(String id, EvcCompleteRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        String prevState = schedule.getStatus();
        schedule.setStatus("INSPECTION_COMPLETED");
        schedule.setCompletionDate(request.getCompletionDate() != null ? request.getCompletionDate() : LocalDate.now());
        schedule.setObservations(request.getObservations());
        schedule.setGeoTaggedPhotosCount(request.getGeoTaggedPhotosCount());
        schedule.setReportStatus(request.getReportStatus() != null ? request.getReportStatus() : "REPORT_SUBMITTED");

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, "EVC Committee Chairman", "EVC_COMPLETED", prevState, "INSPECTION_COMPLETED",
                "Inspection completed: " + request.getObservations());

        return EvcScheduleDto.fromEntity(saved);
    }

    private String resolveExpertName(String expId) {
        if ("EXP-01".equalsIgnoreCase(expId)) return "Prof. (Dr.) Ananya Sen";
        if ("EXP-02".equalsIgnoreCase(expId)) return "Dr. Kailash Purohit";
        if ("EXP-03".equalsIgnoreCase(expId)) return "Dr. G. Venkat Rao";
        if ("EXP-04".equalsIgnoreCase(expId)) return "Dr. V. K. Aggarwal";
        return "AICTE Nominee (" + expId + ")";
    }

    private void recordAudit(String entityId, String user, String action, String prevState, String newState, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .userName(user)
                .role("EVC_COORDINATOR")
                .entityId(entityId)
                .action(action)
                .previousState(prevState)
                .newState(newState)
                .reason(reason)
                .ipAddress("127.0.0.1 (Internal Service)")
                .build();
        auditLogRepository.save(auditLog);
    }
}
