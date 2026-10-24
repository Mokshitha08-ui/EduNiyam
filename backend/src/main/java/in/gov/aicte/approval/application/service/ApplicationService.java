package in.gov.aicte.approval.application.service;

import in.gov.aicte.approval.application.dto.*;
import in.gov.aicte.approval.application.entity.*;
import in.gov.aicte.approval.application.repository.*;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStageHistoryRepository stageHistoryRepository;
    private final ObservationRepository observationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final RequestedIntakeRepository intakeRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationStageHistoryRepository stageHistoryRepository,
            ObservationRepository observationRepository,
            ApplicationDocumentRepository documentRepository,
            RequestedIntakeRepository intakeRepository,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.stageHistoryRepository = stageHistoryRepository;
        this.observationRepository = observationRepository;
        this.documentRepository = documentRepository;
        this.intakeRepository = intakeRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto> getAllApplications(
            int page, int size, String search, String region, String stage, String status, String priority) {

        Specification<Application> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("institutionName")), pattern),
                        cb.like(cb.lower(root.get("id")), pattern),
                        cb.like(cb.lower(root.get("institutionCode")), pattern)
                ));
            }
            if (region != null && !region.isBlank()) {
                predicates.add(cb.equal(root.get("region"), region.trim()));
            }
            if (stage != null && !stage.isBlank()) {
                predicates.add(cb.equal(root.get("currentStage"), stage.trim()));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            if (priority != null && !priority.isBlank()) {
                predicates.add(cb.equal(root.get("priority"), priority.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Application> appPage = applicationRepository.findAll(spec, pageRequest);

        List<ApplicationDto> dtos = appPage.getContent().stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.of(dtos, appPage.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getApplicationById(String id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        return ApplicationDto.fromEntity(application);
    }

    @Transactional
    public ApplicationDto createApplication(ApplicationDto dto) {
        String id = dto.getId() != null ? dto.getId() : "AICTE-2026-" + UUID.randomUUID().toString().substring(0, 7).toUpperCase();

        Application application = Application.builder()
                .id(id)
                .institutionName(dto.getInstitutionName())
                .institutionCode(dto.getInstitutionCode())
                .applicationType(dto.getApplicationType() != null ? dto.getApplicationType() : "Extension of Approval (EoA)")
                .programme(dto.getProgramme())
                .region(dto.getRegion() != null ? dto.getRegion() : "Northern")
                .state(dto.getState() != null ? dto.getState() : "Delhi NCR")
                .workflowId(dto.getWorkflowId() != null ? dto.getWorkflowId() : "WF-FULL")
                .currentStage("SUBMISSION")
                .status("SUBMITTED")
                .priority(dto.getPriority() != null ? dto.getPriority() : "NORMAL")
                .assignedOfficer(dto.getAssignedOfficer())
                .officerRole(dto.getOfficerRole())
                .submissionDate(dto.getSubmissionDate() != null ? dto.getSubmissionDate() : LocalDate.now())
                .stageStartDate(LocalDate.now())
                .nextDeadline(LocalDate.now().plusDays(14))
                .deficiencyCount(0)
                .missingDocCount(0)
                .build();

        Application savedApp = applicationRepository.save(application);

        ApplicationStageHistory initialHistory = ApplicationStageHistory.builder()
                .application(savedApp)
                .stage("Application Submission")
                .status("COMPLETED")
                .date(LocalDate.now())
                .note("Application submitted online via portal")
                .build();
        stageHistoryRepository.save(initialHistory);

        recordAudit(savedApp.getId(), "System", "APPLICATION_SUBMITTED", "DRAFT", "SUBMITTED", "Application submitted online");

        return getApplicationById(savedApp.getId());
    }

    @Transactional
    public ApplicationDto advanceStage(String id, StageAdvanceRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        String previousStage = app.getCurrentStage();
        String targetStage = request.getTargetStage() != null ? request.getTargetStage() : getNextStage(previousStage);

        app.setCurrentStage(targetStage);
        app.setStageStartDate(LocalDate.now());
        app.setNextDeadline(LocalDate.now().plusDays(10));

        if ("FINAL_APPROVAL".equalsIgnoreCase(targetStage)) {
            app.setStatus("APPROVED");
        } else if ("EVC".equalsIgnoreCase(targetStage)) {
            app.setStatus("EVC_SCHEDULED");
        } else {
            app.setStatus("IN_REVIEW");
        }

        applicationRepository.save(app);

        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .application(app)
                .stage(targetStage)
                .status("IN_PROGRESS")
                .date(LocalDate.now())
                .note(request.getRemarks() != null ? request.getRemarks() : "Advanced to " + targetStage)
                .build();
        stageHistoryRepository.save(history);

        recordAudit(id, app.getAssignedOfficer() != null ? app.getAssignedOfficer() : "Regional Scrutiny Officer",
                "STAGE_ADVANCED", previousStage, targetStage, request.getRemarks());

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto returnDeficiency(String id, DeficiencyRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        String previousState = app.getStatus();
        app.setStatus("DEFICIENCY_NOTIFIED");
        app.setDeficiencyCount(app.getDeficiencyCount() + 1);
        app.setDeficiencyReason(request.getReason());
        app.setNextDeadline(LocalDate.now().plusDays(7));
        applicationRepository.save(app);

        Observation obs = Observation.builder()
                .id("OBS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .application(app)
                .date(LocalDate.now())
                .officer(app.getAssignedOfficer() != null ? app.getAssignedOfficer() : "Regional Scrutiny Committee")
                .stage(app.getCurrentStage())
                .status("DEFICIENT")
                .remarks(request.getReason())
                .clauses(request.getClauses() != null ? String.join(", ", request.getClauses()) : null)
                .build();
        observationRepository.save(obs);

        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("DEFICIENCY_RETURNED")
                .urgency("HIGH")
                .title("Scrutiny Deficiency Issued - " + app.getId())
                .message(request.getReason())
                .entityType("APPLICATION")
                .entityId(app.getId())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole("COLLEGE_REP")
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(notification);

        recordAudit(id, app.getAssignedOfficer() != null ? app.getAssignedOfficer() : "Regional Officer",
                "RETURN_FOR_DEFICIENCY", previousState, "DEFICIENCY_NOTIFIED", request.getReason());

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto resubmit(String id, ResubmitRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        String previousState = app.getStatus();
        app.setStatus("IN_REVIEW");
        app.setNextDeadline(LocalDate.now().plusDays(7));
        applicationRepository.save(app);

        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .application(app)
                .stage(app.getCurrentStage())
                .status("IN_PROGRESS")
                .date(LocalDate.now())
                .note("Institution resubmitted compliance response: " + request.getResponseNotes())
                .build();
        stageHistoryRepository.save(history);

        recordAudit(id, "College Representative", "APPLICATION_RESUBMITTED", previousState, "IN_REVIEW", request.getResponseNotes());

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto assignOfficer(String id, AssignOfficerRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        app.setAssignedOfficer(request.getOfficerName());
        app.setOfficerRole(request.getOfficerRole());
        applicationRepository.save(app);

        recordAudit(id, "Admin / Bureau Head", "OFFICER_ASSIGNED", null, request.getOfficerName(),
                "Assigned to " + request.getOfficerName() + " (" + request.getOfficerRole() + ")");

        return getApplicationById(id);
    }

    private String getNextStage(String currentStage) {
        if ("SUBMISSION".equalsIgnoreCase(currentStage)) return "SCRUTINY";
        if ("SCRUTINY".equalsIgnoreCase(currentStage)) return "EVC";
        if ("EVC".equalsIgnoreCase(currentStage)) return "SAC_SHC";
        if ("SAC_SHC".equalsIgnoreCase(currentStage)) return "FINAL_APPROVAL";
        return "FINAL_APPROVAL";
    }

    private void recordAudit(String entityId, String user, String action, String prevState, String newState, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .userName(user != null ? user : "System Engine")
                .role("SYSTEM")
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
