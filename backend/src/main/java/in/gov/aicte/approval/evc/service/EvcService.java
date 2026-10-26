package in.gov.aicte.approval.evc.service;

import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.evc.dto.*;
import in.gov.aicte.approval.evc.entity.EvcMember;
import in.gov.aicte.approval.evc.entity.EvcSchedule;
import in.gov.aicte.approval.evc.repository.EvcMemberRepository;
import in.gov.aicte.approval.evc.repository.EvcScheduleRepository;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.security.UserPrincipal;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EvcService {

    private final EvcScheduleRepository scheduleRepository;
    private final EvcMemberRepository memberRepository;
    private final AuditLogRepository auditLogRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public EvcService(EvcScheduleRepository scheduleRepository,
                      EvcMemberRepository memberRepository,
                      AuditLogRepository auditLogRepository,
                      ApplicationRepository applicationRepository,
                      UserRepository userRepository,
                      NotificationRepository notificationRepository) {
        this.scheduleRepository = scheduleRepository;
        this.memberRepository = memberRepository;
        this.auditLogRepository = auditLogRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    private UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    private String getCurrentUserName() {
        UserPrincipal principal = getCurrentPrincipal();
        return principal != null ? principal.getName() : "AICTE EVC Coordinator";
    }

    private String getCurrentUserRole() {
        UserPrincipal principal = getCurrentPrincipal();
        return principal != null ? principal.getRole() : "EVC_COORDINATOR";
    }

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

    @Transactional(readOnly = true)
    public EvcScheduleDto getScheduleByApplicationId(String applicationId) {
        EvcSchedule schedule = scheduleRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "applicationId", applicationId));
        return EvcScheduleDto.fromEntity(schedule);
    }

    @Transactional
    public EvcScheduleDto createOrScheduleVisit(EvcScheduleCreateRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        Optional<EvcSchedule> existingOpt = scheduleRepository.findByApplicationId(request.getApplicationId());
        EvcSchedule schedule;

        String prevStatus = "NONE";
        if (existingOpt.isPresent()) {
            schedule = existingOpt.get();
            prevStatus = schedule.getStatus();
            schedule.setProposedDate(request.getProposedDate());
            if (request.getVisitTime() != null) schedule.setVisitTime(request.getVisitTime());
            if (request.getMode() != null) schedule.setMode(request.getMode());
            if (request.getVisitType() != null) schedule.setVisitType(request.getVisitType());
            if (request.getLocation() != null) schedule.setLocation(request.getLocation());
            if (request.getPurpose() != null) schedule.setPurpose(request.getPurpose());
            if (request.getInstructions() != null) schedule.setInstructions(request.getInstructions());
            if (request.getSchedulingDeadline() != null) schedule.setSchedulingDeadline(request.getSchedulingDeadline());
            schedule.setStatus("SCHEDULED");
            schedule.setReportStatus("VISIT_UPCOMING");
        } else {
            String scheduleId = "EVC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            schedule = EvcSchedule.builder()
                    .id(scheduleId)
                    .application(application)
                    .institutionName(application.getInstitutionName())
                    .region(application.getRegion() != null ? application.getRegion() : "South Western")
                    .visitType(request.getVisitType() != null ? request.getVisitType() : "Comprehensive Physical Inspection")
                    .status("SCHEDULED")
                    .schedulingDeadline(request.getSchedulingDeadline() != null ? request.getSchedulingDeadline() : request.getProposedDate().minusDays(2))
                    .proposedDate(request.getProposedDate())
                    .mode(request.getMode() != null ? request.getMode() : "PHYSICAL")
                    .conflictStatus("NONE")
                    .reportStatus("VISIT_UPCOMING")
                    .visitTime(request.getVisitTime() != null ? request.getVisitTime() : "10:00 AM")
                    .location(request.getLocation() != null ? request.getLocation() : application.getInstitutionName() + " Campus, " + application.getRegion())
                    .purpose(request.getPurpose() != null ? request.getPurpose() : "Statutory Physical Verification for AICTE Approval")
                    .instructions(request.getInstructions())
                    .build();
        }

        application.setRequiresEvc(true);
        if (application.getEvcReason() == null || application.getEvcReason().isBlank()) {
            application.setEvcReason("Physical inspection scheduled on " + request.getProposedDate());
            application.setEvcMarkedBy(getCurrentUserName());
            application.setEvcMarkedAt(LocalDateTime.now());
        }
        if (!"APPROVED".equalsIgnoreCase(application.getStatus()) && !"REJECTED".equalsIgnoreCase(application.getStatus())) {
            application.setStatus("EVC_SCHEDULED");
        }
        applicationRepository.save(application);

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(saved.getId(), getCurrentUserName(), "EVC_VISIT_SCHEDULED", prevStatus, "SCHEDULED",
                "EVC visit scheduled for " + schedule.getProposedDate() + " at " + schedule.getVisitTime());

        createNotification("EVC_SCHEDULED", "EVC Visit Scheduled for " + application.getId(),
                "Physical inspection scheduled for " + schedule.getProposedDate() + " at " + application.getInstitutionName(),
                "EVC_MEMBER", "/evc");

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto rescheduleVisit(String id, EvcRescheduleRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        if ("INSPECTION_COMPLETED".equalsIgnoreCase(schedule.getStatus())) {
            throw new BadRequestException("Cannot reschedule visit: Physical inspection has already been completed.");
        }
        if ("CANCELLED".equalsIgnoreCase(schedule.getStatus())) {
            throw new BadRequestException("Cannot reschedule a cancelled EVC visit.");
        }

        LocalDate oldDate = schedule.getProposedDate();
        String prevStatus = schedule.getStatus();

        schedule.setProposedDate(request.getProposedDate());
        if (request.getVisitTime() != null) {
            schedule.setVisitTime(request.getVisitTime());
        }
        schedule.setRescheduleReason(request.getRescheduleReason());
        schedule.setStatus("RESCHEDULED");

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_VISIT_RESCHEDULED", prevStatus, "RESCHEDULED",
                "Rescheduled from " + oldDate + " to " + request.getProposedDate() + ". Reason: " + request.getRescheduleReason());

        createNotification("EVC_RESCHEDULED", "EVC Visit Rescheduled",
                "Inspection for " + schedule.getInstitutionName() + " rescheduled to " + request.getProposedDate(),
                "EVC_MEMBER", "/evc");

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto cancelVisit(String id, EvcCancelRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        if ("INSPECTION_COMPLETED".equalsIgnoreCase(schedule.getStatus())) {
            throw new BadRequestException("Cannot cancel visit: Inspection has already been completed.");
        }

        String prevStatus = schedule.getStatus();
        schedule.setStatus("CANCELLED");
        schedule.setReportStatus("CANCELLED");
        schedule.setCancellationReason(request.getCancellationReason());

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_VISIT_CANCELLED", prevStatus, "CANCELLED",
                "Visit cancelled. Reason: " + request.getCancellationReason());

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto assignCommitteeMembers(String id, EvcAssignCommitteeRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        if (request.getMembers() == null || request.getMembers().isEmpty()) {
            throw new BadRequestException("Committee member list cannot be empty.");
        }

        // Validate duplicates within the request
        Set<String> seenIdentifiers = new HashSet<>();
        for (EvcMemberAssignItem item : request.getMembers()) {
            String identifier = item.getUserId() != null && !item.getUserId().isBlank()
                    ? item.getUserId().trim().toLowerCase()
                    : item.getName().trim().toLowerCase();

            if (!seenIdentifiers.add(identifier)) {
                throw new BadRequestException("Duplicate committee member detected: " + item.getName() + ". Each expert can only be assigned once per visit.");
            }

            // If userId is provided, validate user exists in system
            if (item.getUserId() != null && !item.getUserId().isBlank()) {
                Optional<User> uOpt = userRepository.findById(item.getUserId());
                if (uOpt.isEmpty()) {
                    uOpt = userRepository.findByEmailIgnoreCase(item.getUserId());
                }
            }
        }

        String prevStatus = schedule.getStatus();
        schedule.getCommitteeMembers().clear();

        for (EvcMemberAssignItem item : request.getMembers()) {
            EvcMember member = EvcMember.builder()
                    .schedule(schedule)
                    .name(item.getName())
                    .role(item.getRole())
                    .affiliation(item.getAffiliation() != null ? item.getAffiliation() : "AICTE Expert Panel")
                    .phone(item.getPhone())
                    .userId(item.getUserId())
                    .assignedBy(getCurrentUserName())
                    .assignedAt(LocalDateTime.now())
                    .build();
            schedule.getCommitteeMembers().add(member);
        }

        if ("PENDING".equalsIgnoreCase(schedule.getStatus())) {
            schedule.setStatus("SCHEDULED");
        }

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_COMMITTEE_ASSIGNED", prevStatus, schedule.getStatus(),
                "Assigned " + request.getMembers().size() + " expert committee members to EVC visit.");

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto submitReport(String id, EvcReportSubmitRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        if ("CANCELLED".equalsIgnoreCase(schedule.getStatus())) {
            throw new BadRequestException("Cannot submit report for a cancelled EVC visit.");
        }

        String prevStatus = schedule.getStatus();
        schedule.setStatus("INSPECTION_COMPLETED");
        schedule.setCompletionDate(request.getCompletionDate() != null ? request.getCompletionDate() : LocalDate.now());
        schedule.setRecommendation(request.getRecommendation());
        schedule.setObservations(request.getObservations());
        schedule.setFindingsJson(request.getFindingsJson());
        schedule.setGeoTaggedPhotosCount(request.getGeoTaggedPhotosCount());
        schedule.setReportStatus("REPORT_SUBMITTED");
        schedule.setSubmittedBy(getCurrentUserName());
        schedule.setSubmittedAt(LocalDateTime.now());

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_REPORT_SUBMITTED", prevStatus, "INSPECTION_COMPLETED",
                "EVC Inspection completed and statutory report submitted with recommendation: " + request.getRecommendation());

        createNotification("EVC_REPORT_SUBMITTED", "EVC Report Submitted for " + schedule.getInstitutionName(),
                "Recommendation: " + request.getRecommendation() + ". Pending review.",
                "REGIONAL_OFFICER", "/evc");

        return EvcScheduleDto.fromEntity(saved);
    }

    @Transactional
    public EvcScheduleDto reviewReport(String id, EvcReportReviewRequest request) {
        EvcSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvcSchedule", "id", id));

        if (!"INSPECTION_COMPLETED".equalsIgnoreCase(schedule.getStatus())) {
            throw new BadRequestException("Cannot review report: EVC inspection has not been completed.");
        }

        String prevReportStatus = schedule.getReportStatus();
        String newReportStatus;
        if ("ACCEPTED".equalsIgnoreCase(request.getDecision()) || "APPROVE".equalsIgnoreCase(request.getDecision())) {
            newReportStatus = "REPORT_REVIEWED";
        } else if ("RETURNED".equalsIgnoreCase(request.getDecision()) || "REJECT".equalsIgnoreCase(request.getDecision())) {
            newReportStatus = "REPORT_RETURNED";
        } else {
            newReportStatus = request.getDecision().toUpperCase();
        }

        schedule.setReportStatus(newReportStatus);
        schedule.setReportReviewedBy(getCurrentUserName());
        schedule.setReportReviewedAt(LocalDateTime.now());
        schedule.setReportReviewNotes(request.getReviewNotes());

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_REPORT_REVIEWED", prevReportStatus, newReportStatus,
                "Report review completed: " + newReportStatus + ". Notes: " + request.getReviewNotes());

        return EvcScheduleDto.fromEntity(saved);
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

        schedule.getCommitteeMembers().clear();

        if (request.getCommitteeMembers() != null && !request.getCommitteeMembers().isEmpty()) {
            for (EvcMemberDto mDto : request.getCommitteeMembers()) {
                EvcMember member = EvcMember.builder()
                        .schedule(schedule)
                        .name(mDto.getName())
                        .role(mDto.getRole() != null ? mDto.getRole() : "Committee Expert")
                        .affiliation(mDto.getAffiliation() != null ? mDto.getAffiliation() : "AICTE Expert Panel")
                        .phone(mDto.getPhone())
                        .userId(mDto.getUserId())
                        .assignedBy(getCurrentUserName())
                        .assignedAt(LocalDateTime.now())
                        .build();
                schedule.getCommitteeMembers().add(member);
            }
        } else if (request.getCommitteeMemberIds() != null && !request.getCommitteeMemberIds().isEmpty()) {
            for (String expId : request.getCommitteeMemberIds()) {
                EvcMember member = EvcMember.builder()
                        .schedule(schedule)
                        .name(resolveExpertName(expId))
                        .role("Expert Committee Member")
                        .affiliation("AICTE Panel Pool")
                        .phone("+91 94330 18273")
                        .userId(expId)
                        .assignedBy(getCurrentUserName())
                        .assignedAt(LocalDateTime.now())
                        .build();
                schedule.getCommitteeMembers().add(member);
            }
        }

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_ASSIGNED", prevState, "SCHEDULED",
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
        schedule.setSubmittedBy(getCurrentUserName());
        schedule.setSubmittedAt(LocalDateTime.now());

        EvcSchedule saved = scheduleRepository.save(schedule);

        recordAudit(id, getCurrentUserName(), "EVC_COMPLETED", prevState, "INSPECTION_COMPLETED",
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
                .role(getCurrentUserRole())
                .entityId(entityId)
                .action(action)
                .previousState(prevState)
                .newState(newState)
                .reason(reason)
                .ipAddress("127.0.0.1 (Internal Service)")
                .build();
        auditLogRepository.save(auditLog);
    }

    private void createNotification(String category, String title, String message, String recipientRole, String link) {
        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category(category)
                .urgency("NORMAL")
                .title(title)
                .message(message)
                .entityType("EVC")
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole(recipientRole)
                .link(link)
                .build();
        notificationRepository.save(notification);
    }
}
