package in.gov.aicte.approval.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.dto.*;
import in.gov.aicte.approval.application.entity.*;
import in.gov.aicte.approval.application.repository.*;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import in.gov.aicte.approval.workflow.repository.WorkflowDefinitionRepository;
import in.gov.aicte.approval.workflow.service.WorkflowService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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
    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowService workflowService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ReviewRepository reviewRepository;
    private final in.gov.aicte.approval.evc.repository.EvcScheduleRepository evcScheduleRepository;

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationStageHistoryRepository stageHistoryRepository,
            ObservationRepository observationRepository,
            ApplicationDocumentRepository documentRepository,
            RequestedIntakeRepository intakeRepository,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository,
            WorkflowDefinitionRepository workflowRepository,
            WorkflowService workflowService,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            ReviewRepository reviewRepository,
            in.gov.aicte.approval.evc.repository.EvcScheduleRepository evcScheduleRepository) {
        this.applicationRepository = applicationRepository;
        this.stageHistoryRepository = stageHistoryRepository;
        this.observationRepository = observationRepository;
        this.documentRepository = documentRepository;
        this.intakeRepository = intakeRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.workflowRepository = workflowRepository;
        this.workflowService = workflowService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.reviewRepository = reviewRepository;
        this.evcScheduleRepository = evcScheduleRepository;
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

            // Institutional isolation: If logged-in user is a College Representative, filter strictly to their institution code
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
                if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                    predicates.add(cb.equal(root.get("institutionCode"), principal.getInstitutionCode()));
                } else if (!"ADMIN".equalsIgnoreCase(principal.getRole()) && !"SYSTEM_ADMIN".equalsIgnoreCase(principal.getRole())) {
                    // Officers should only see submitted applications (exclude unsubmitted DRAFTs) unless specifically filtering for DRAFT
                    if (status == null || status.isBlank()) {
                        predicates.add(cb.notEqual(root.get("status"), "DRAFT"));
                    }
                }
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

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(application.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to view applications belonging to other institutions.");
                }
            }
        }

        return ApplicationDto.fromEntity(application);
    }

    private String generateUniqueAppId() {
        for (int i = 0; i < 20; i++) {
            String candidate = String.format("AICTE-APP-2026-%06d", new Random().nextInt(1000000));
            if (!applicationRepository.existsById(candidate)) {
                return candidate;
            }
        }
        return "AICTE-APP-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional
    public ApplicationDto createApplication(ApplicationDto dto) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "System";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                if (principal.getInstitutionCode() != null && !principal.getInstitutionCode().isBlank()) {
                    dto.setInstitutionCode(principal.getInstitutionCode());
                }
                if (principal.getInstitutionName() != null && !principal.getInstitutionName().isBlank()) {
                    dto.setInstitutionName(principal.getInstitutionName());
                }
                if (principal.getRegion() != null && !principal.getRegion().isBlank()) {
                    dto.setRegion(principal.getRegion());
                }
            }
        }

        if (dto.getInstitutionName() == null || dto.getInstitutionName().isBlank()) {
            throw new BadRequestException("Institution Name is required");
        }
        if (dto.getInstitutionCode() == null || dto.getInstitutionCode().isBlank()) {
            throw new BadRequestException("Institution Code / Permanent ID is required");
        }
        if (dto.getApplicationType() == null || dto.getApplicationType().isBlank()) {
            throw new BadRequestException("Application Type is required");
        }

        boolean isDraft = "DRAFT".equalsIgnoreCase(dto.getStatus());

        // Prevent duplicate active submission if creating a SUBMITTED application directly
        if (!isDraft) {
            List<String> activeStatuses = List.of("SUBMITTED", "IN_REVIEW", "DEFICIENCY_NOTIFIED", "RESUBMITTED", "EVC_SCHEDULED");
            if (applicationRepository.existsByInstitutionCodeAndApplicationTypeAndStatusIn(dto.getInstitutionCode(), dto.getApplicationType(), activeStatuses)) {
                throw new BadRequestException("An active application for " + dto.getApplicationType() + " is already in progress for institution " + dto.getInstitutionCode() + ". Duplicate submissions are prohibited.");
            }
        }

        String id = (dto.getId() != null && !dto.getId().isBlank() && !dto.getId().startsWith("TEMP-") && !dto.getId().startsWith("DRAFT-"))
                ? dto.getId()
                : generateUniqueAppId();

        String status = isDraft ? "DRAFT" : "SUBMITTED";
        String currentStage = isDraft ? "DRAFT" : "SUBMISSION";

        // Auto-resolve workflow if not explicitly provided
        String wfId = dto.getWorkflowId();
        if (wfId == null || wfId.isBlank()) {
            wfId = workflowService.resolveWorkflowIdForApplicationType(dto.getApplicationType());
        }

        // Calculate deadline dynamically based on workflow stage
        int stageDays = isDraft ? 30 : 14;
        Optional<WorkflowDefinition> wfOpt = workflowRepository.findById(wfId);
        if (wfOpt.isPresent() && wfOpt.get().getStages() != null) {
            for (WorkflowStage s : wfOpt.get().getStages()) {
                if (s.getCode().equalsIgnoreCase(currentStage)) {
                    stageDays = s.getTargetDays();
                    break;
                }
            }
        }

        LocalDate subDate = isDraft ? null : (dto.getSubmissionDate() != null ? dto.getSubmissionDate() : LocalDate.now());
        LocalDate deadline = LocalDate.now().plusDays(stageDays);

        Application application = Application.builder()
                .id(id)
                .institutionName(dto.getInstitutionName().trim())
                .institutionCode(dto.getInstitutionCode().trim())
                .applicationType(dto.getApplicationType().trim())
                .programme(dto.getProgramme() != null ? dto.getProgramme().trim() : "Engineering & Technology")
                .region(dto.getRegion() != null ? dto.getRegion().trim() : "Northern")
                .state(dto.getState() != null ? dto.getState().trim() : "Delhi NCR")
                .workflowId(wfId)
                .currentStage(currentStage)
                .status(status)
                .priority(dto.getPriority() != null ? dto.getPriority() : "NORMAL")
                .assignedOfficer(dto.getAssignedOfficer() != null ? dto.getAssignedOfficer() : "Unassigned (Regional Queue)")
                .officerRole(dto.getOfficerRole() != null ? dto.getOfficerRole() : "Regional Officer")
                .submissionDate(subDate)
                .stageStartDate(LocalDate.now())
                .nextDeadline(deadline)
                .deficiencyCount(0)
                .missingDocCount(0)
                .detailsJson(dto.getDetailsJson())
                .build();

        Application savedApp = applicationRepository.save(application);

        // Persist requested intakes if present
        if (dto.getRequestedIntake() != null && !dto.getRequestedIntake().isEmpty()) {
            for (RequestedIntakeDto intakeDto : dto.getRequestedIntake()) {
                if (intakeDto.getCourse() != null && !intakeDto.getCourse().isBlank()) {
                    RequestedIntake intake = new RequestedIntake();
                    intake.setApplication(savedApp);
                    intake.setCourse(intakeDto.getCourse().trim());
                    intake.setCurrentIntake(intakeDto.getCurrentIntake());
                    intake.setProposedIntake(intakeDto.getProposedIntake());
                    intakeRepository.save(intake);
                }
            }
        }

        // Add stage history
        String stageNote = isDraft ? "Application draft initiated and saved" : "Application submitted online via portal";
        ApplicationStageHistory initialHistory = ApplicationStageHistory.builder()
                .application(savedApp)
                .stage(isDraft ? "Draft Preparation" : "Application Submission")
                .status("COMPLETED")
                .date(LocalDate.now())
                .note(stageNote)
                .build();
        stageHistoryRepository.save(initialHistory);

        // Audit log
        String auditAction = isDraft ? "APPLICATION_DRAFT_CREATED" : "APPLICATION_SUBMITTED";
        recordAudit(savedApp.getId(), currentUserName, auditAction, "NONE", status, stageNote);

        if (!isDraft) {
            Notification notification = Notification.builder()
                    .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .category("APPLICATION_SUBMITTED")
                    .urgency("NORMAL")
                    .title("New Application Submitted: " + savedApp.getId())
                    .message(savedApp.getInstitutionName() + " submitted an application for " + savedApp.getApplicationType())
                    .entityType("APPLICATION")
                    .entityId(savedApp.getId())
                    .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                    .isRead(false)
                    .recipientRole("REGIONAL_OFFICER")
                    .link("/applications/" + savedApp.getId())
                    .build();
            notificationRepository.save(notification);
        }

        return getApplicationById(savedApp.getId());
    }

    @Transactional
    public ApplicationDto updateApplicationDraft(String id, ApplicationDto dto) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "System";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(app.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to modify applications belonging to other institutions.");
                }
            }
        }

        if (!"DRAFT".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Cannot edit application in " + app.getStatus() + " status. Only DRAFT applications can be modified.");
        }

        if (dto.getApplicationType() != null && !dto.getApplicationType().isBlank()) {
            app.setApplicationType(dto.getApplicationType().trim());
        }
        if (dto.getProgramme() != null && !dto.getProgramme().isBlank()) {
            app.setProgramme(dto.getProgramme().trim());
        }
        if (dto.getPriority() != null && !dto.getPriority().isBlank()) {
            app.setPriority(dto.getPriority().trim());
        }
        if (dto.getWorkflowId() != null && !dto.getWorkflowId().isBlank()) {
            app.setWorkflowId(dto.getWorkflowId().trim());
        }
        if (dto.getRegion() != null && !dto.getRegion().isBlank()) {
            app.setRegion(dto.getRegion().trim());
        }
        if (dto.getState() != null && !dto.getState().isBlank()) {
            app.setState(dto.getState().trim());
        }
        if (dto.getDetailsJson() != null) {
            app.setDetailsJson(dto.getDetailsJson());
        }

        // Update requested intakes if provided
        if (dto.getRequestedIntake() != null) {
            intakeRepository.deleteByApplicationId(app.getId());
            for (RequestedIntakeDto intakeDto : dto.getRequestedIntake()) {
                if (intakeDto.getCourse() != null && !intakeDto.getCourse().isBlank()) {
                    RequestedIntake intake = new RequestedIntake();
                    intake.setApplication(app);
                    intake.setCourse(intakeDto.getCourse().trim());
                    intake.setCurrentIntake(intakeDto.getCurrentIntake());
                    intake.setProposedIntake(intakeDto.getProposedIntake());
                    intakeRepository.save(intake);
                }
            }
        }

        applicationRepository.save(app);

        recordAudit(id, currentUserName, "APPLICATION_DRAFT_UPDATED", "DRAFT", "DRAFT", "Application draft details updated");

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto submitApplication(String id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "College Representative";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(app.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to submit applications belonging to other institutions.");
                }
            }
        }

        if (!"DRAFT".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Application is already in status " + app.getStatus() + ". Only DRAFT applications can be submitted.");
        }

        // Validate mandatory requirements for submission
        if (app.getInstitutionName() == null || app.getInstitutionName().isBlank()) {
            throw new BadRequestException("Institution Name is required before submission.");
        }
        if (app.getInstitutionCode() == null || app.getInstitutionCode().isBlank()) {
            throw new BadRequestException("Institution Code is required before submission.");
        }
        if (app.getApplicationType() == null || app.getApplicationType().isBlank()) {
            throw new BadRequestException("Application Type is required before submission.");
        }
        if (app.getProgramme() == null || app.getProgramme().isBlank()) {
            throw new BadRequestException("Academic Programme is required before submission.");
        }

        // Check for duplicate active application
        List<String> activeStatuses = List.of("SUBMITTED", "IN_REVIEW", "DEFICIENCY_NOTIFIED", "RESUBMITTED", "EVC_SCHEDULED");
        if (applicationRepository.existsByInstitutionCodeAndApplicationTypeAndStatusIn(app.getInstitutionCode(), app.getApplicationType(), activeStatuses)) {
            throw new BadRequestException("An active application for " + app.getApplicationType() + " is already in progress for this institution. Duplicate submissions are prohibited.");
        }

        // Validate mandatory documents before submission
        validateMandatoryDocuments(app);

        // Resolve workflow if needed
        String wfId = app.getWorkflowId();
        if (wfId == null || wfId.isBlank()) {
            wfId = workflowService.resolveWorkflowIdForApplicationType(app.getApplicationType());
            app.setWorkflowId(wfId);
        }

        String nextStageCode = "SCRUTINY";
        int targetDays = 7;
        Optional<WorkflowDefinition> wfOpt = workflowRepository.findById(wfId);
        if (wfOpt.isPresent() && wfOpt.get().getStages() != null) {
            List<WorkflowStage> stages = wfOpt.get().getStages();
            if (stages.size() > 1) {
                WorkflowStage secondStage = stages.get(1);
                nextStageCode = secondStage.getCode();
                targetDays = secondStage.getTargetDays();
            } else if (!stages.isEmpty()) {
                nextStageCode = stages.get(0).getCode();
                targetDays = stages.get(0).getTargetDays();
            }
        }

        app.setStatus("IN_REVIEW");
        app.setCurrentStage(nextStageCode);
        app.setSubmissionDate(LocalDate.now());
        app.setStageStartDate(LocalDate.now());
        app.setNextDeadline(LocalDate.now().plusDays(targetDays));

        applicationRepository.save(app);

        ApplicationStageHistory submissionHistory = ApplicationStageHistory.builder()
                .application(app)
                .stage("Application Submission")
                .status("COMPLETED")
                .date(LocalDate.now())
                .note("Application formally verified and submitted by institution")
                .build();
        stageHistoryRepository.save(submissionHistory);

        recordAudit(id, currentUserName, "APPLICATION_SUBMITTED", "DRAFT", "IN_REVIEW",
                "Application formally submitted and routed to " + nextStageCode);

        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("APPLICATION_SUBMITTED")
                .urgency("NORMAL")
                .title("New Application Submitted: " + app.getId())
                .message(app.getInstitutionName() + " submitted an application for " + app.getApplicationType())
                .entityType("APPLICATION")
                .entityId(app.getId())
                .institutionCode(app.getInstitutionCode())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole("REGIONAL_OFFICER")
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(notification);

        Notification collegeNotif = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("APPLICATION_SUBMITTED")
                .urgency("NORMAL")
                .title("Application Lodged: " + app.getId())
                .message("Your application for " + app.getApplicationType() + " (AY 2026-27) was submitted successfully.")
                .entityType("APPLICATION")
                .entityId(app.getId())
                .institutionCode(app.getInstitutionCode())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole("COLLEGE_REP")
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(collegeNotif);

        return getApplicationById(id);
    }

    public List<String> getMandatoryDocumentCodesForType(String appType) {
        if (appType == null) return List.of();
        String lower = appType.toLowerCase();
        if (lower.contains("extension") || lower.contains("eoa")) {
            return List.of("DOC-EOA-PREV", "DOC-EOA-SAFETY", "DOC-EOA-FIN");
        }
        if (lower.contains("increase in approved") || (lower.contains("increase") && !lower.contains("new course"))) {
            return List.of("DOC-INCR-RES", "DOC-INCR-FLOOR", "DOC-INCR-FACULTY", "DOC-INCR-ENROLL");
        }
        if (lower.contains("new course") || lower.contains("programme")) {
            return List.of("DOC-NEWCRS-UNIV", "DOC-NEWCRS-DPR", "DOC-NEWCRS-LAB");
        }
        if (lower.contains("new technical") || lower.contains("new institution")) {
            return List.of("DOC-NEWINST-TRUST", "DOC-NEWINST-LAND", "DOC-NEWINST-PLAN", "DOC-NEWINST-FDR");
        }
        if (lower.contains("closure") || lower.contains("discontinuation")) {
            return List.of("DOC-CLOSE-RES", "DOC-CLOSE-NOC", "DOC-CLOSE-STUDENT");
        }
        if (lower.contains("site") || lower.contains("infrastructure")) {
            return List.of("DOC-SITE-MASTER", "DOC-SITE-CLU", "DOC-SITE-SAFETY");
        }
        if (lower.contains("co-ed") || lower.contains("coed")) {
            return List.of("DOC-COED-RES", "DOC-COED-UNIV", "DOC-COED-INSPECT");
        }
        return List.of("DOC-INCR-RES");
    }

    public void validateMandatoryDocuments(Application app) {
        List<String> requiredCodes = getMandatoryDocumentCodesForType(app.getApplicationType());
        if (requiredCodes.isEmpty()) return;

        List<ApplicationDocument> uploadedDocs = documentRepository.findByApplicationId(app.getId());
        List<String> missing = new ArrayList<>();
        for (String reqCode : requiredCodes) {
            boolean found = uploadedDocs.stream().anyMatch(d -> {
                if (d.getDocumentCode() != null && d.getDocumentCode().equalsIgnoreCase(reqCode)) return true;
                if (d.getTitle() != null && d.getTitle().toUpperCase().contains(reqCode.toUpperCase())) return true;
                return false;
            });
            if (!found) {
                missing.add(reqCode);
            }
        }

        if (!missing.isEmpty()) {
            throw new BadRequestException("Submission blocked: Mandatory statutory document(s) missing: ["
                    + String.join(", ", missing) + "]. All required documents must be uploaded before application submission.");
        }
    }

    @Transactional
    public void deleteDraft(String id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "College Representative";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(app.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to delete applications belonging to other institutions.");
                }
            }
        }

        if (!"DRAFT".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Only DRAFT applications can be deleted/discarded. Applications in " + app.getStatus() + " cannot be deleted.");
        }

        recordAudit(id, currentUserName, "APPLICATION_DRAFT_DELETED", "DRAFT", "DELETED", "Application draft discarded by institution");
        applicationRepository.delete(app);
    }

    @Transactional
    public ApplicationDto advanceStage(String id, StageAdvanceRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        // 1. Terminal state check: cannot advance from terminal states
        List<String> terminalStatuses = List.of("APPROVED", "REJECTED", "WITHDRAWN");
        if (terminalStatuses.contains(app.getStatus().toUpperCase())) {
            throw new BadRequestException("Application " + id + " is in terminal state '" + app.getStatus() + "'. No further stage transitions are permitted.");
        }

        if ("DRAFT".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Draft applications must be formally submitted before advancing stages.");
        }

        if ("DEFICIENCY_NOTIFIED".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Application has pending regulatory deficiencies. Rectification must be resubmitted by the institution before proceeding.");
        }

        // 2. Security / Role check
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Regional Officer";
        String currentUserRole = "REGIONAL_OFFICER";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            currentUserRole = principal.getRole();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Access denied: Technical institutions cannot advance or approve application stages.");
            }
        }

        // 3. Workflow & Stage Validation
        String wfId = app.getWorkflowId();
        if (wfId == null || wfId.isBlank()) {
            wfId = "WF-FULL";
        }
        WorkflowDefinition workflow = workflowRepository.findById(wfId)
                .orElseGet(() -> workflowRepository.findById("WF-FULL").orElse(null));

        List<WorkflowStage> stages = (workflow != null && workflow.getStages() != null)
                ? workflow.getStages()
                : Collections.emptyList();

        String previousStage = app.getCurrentStage();
        WorkflowStage currentStageObj = stages.stream()
                .filter(s -> s.getCode().equalsIgnoreCase(previousStage))
                .findFirst()
                .orElse(null);

        WorkflowStage targetStageObj = null;
        if (request.getTargetStage() != null && !request.getTargetStage().isBlank()) {
            String requestedCode = request.getTargetStage().trim().toUpperCase();
            targetStageObj = stages.stream()
                    .filter(s -> s.getCode().equalsIgnoreCase(requestedCode))
                    .findFirst()
                    .orElse(null);

            if (targetStageObj == null) {
                // If stage not found in defined workflow, check if requested is FINAL_APPROVAL
                if ("FINAL_APPROVAL".equalsIgnoreCase(requestedCode) || "APPROVED".equalsIgnoreCase(requestedCode)) {
                    // Allowed if at least in review
                } else {
                    throw new BadRequestException("Invalid target stage '" + requestedCode + "' for workflow pathway " + (workflow != null ? workflow.getName() : wfId));
                }
            } else if (currentStageObj != null) {
                // Prevent going backwards or same stage
                if (targetStageObj.getStageOrder() <= currentStageObj.getStageOrder()) {
                    throw new BadRequestException("Invalid transition: Cannot move backward or repeat current stage '" + previousStage + "'");
                }
                // Prevent skipping mandatory intermediate stages
                int curOrder = currentStageObj.getStageOrder();
                int tgtOrder = targetStageObj.getStageOrder();
                for (WorkflowStage intermediate : stages) {
                    if (intermediate.getStageOrder() > curOrder && intermediate.getStageOrder() < tgtOrder) {
                        if (intermediate.isMandatory()) {
                            throw new BadRequestException("Cannot advance to " + targetStageObj.getName() + ": Mandatory statutory stage '" + intermediate.getName() + "' cannot be skipped.");
                        }
                    }
                }
            }
        } else {
            // Auto advance to next stage in order
            if (currentStageObj != null) {
                int nextOrder = currentStageObj.getStageOrder() + 1;
                targetStageObj = stages.stream()
                        .filter(s -> s.getStageOrder() == nextOrder)
                        .findFirst()
                        .orElse(null);
            }
            if (targetStageObj == null) {
                throw new BadRequestException("Application is already at the final stage of workflow pathway.");
            }
        }

        String targetStageCode = targetStageObj != null ? targetStageObj.getCode() : (request.getTargetStage() != null ? request.getTargetStage().trim().toUpperCase() : "FINAL_APPROVAL");
        String targetStageName = targetStageObj != null ? targetStageObj.getName() : targetStageCode;

        // 4. Role Authorization for stage transition
        boolean isAuthorized = "ADMIN".equalsIgnoreCase(currentUserRole) || "SYSTEM_ADMIN".equalsIgnoreCase(currentUserRole);
        if (!isAuthorized) {
            boolean matchesCurrent = currentStageObj != null && currentStageObj.getRoleAllowed() != null &&
                    currentUserRole.equalsIgnoreCase(currentStageObj.getRoleAllowed().trim());
            boolean matchesTarget = targetStageObj != null && targetStageObj.getRoleAllowed() != null &&
                    currentUserRole.equalsIgnoreCase(targetStageObj.getRoleAllowed().trim());
            if (matchesCurrent || matchesTarget) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            String expectedRoles = (currentStageObj != null ? currentStageObj.getRoleAllowed() : "") +
                    (targetStageObj != null ? " / " + targetStageObj.getRoleAllowed() : "");
            throw new BadRequestException("Role mismatch: Stage transition requires " + expectedRoles +
                    " authority, but caller has role " + currentUserRole);
        }

        // 4a. Deficiency Gate: Block if open/unresolved deficiencies remain when advancing past SCRUTINY or to final approval
        if ("FINAL_APPROVAL".equalsIgnoreCase(targetStageCode) || "APPROVED".equalsIgnoreCase(targetStageCode)
                || (!"SCRUTINY".equalsIgnoreCase(targetStageCode) && "SCRUTINY".equalsIgnoreCase(previousStage))) {
            List<Observation> observations = app.getObservations();
            if (observations != null && !observations.isEmpty()) {
                boolean hasOpenDeficiencies = observations.stream().anyMatch(obs -> {
                    String st = obs.getStatus() != null ? obs.getStatus().toUpperCase() : "";
                    return "OPEN".equals(st) || "DEFICIENT".equals(st) || "REOPENED".equals(st);
                });
                if (hasOpenDeficiencies) {
                    throw new BadRequestException("Cannot advance stage: Unresolved regulatory deficiencies remain pending rectification/verification.");
                }
            }
        }

        // 4b. EVC Gate: If application requires EVC or moving past EVC stage, ensure inspection is completed and report submitted
        boolean movingPastEvc = "EVC".equalsIgnoreCase(previousStage) && !"EVC".equalsIgnoreCase(targetStageCode);
        boolean reachingFinalWithEvc = ("FINAL_APPROVAL".equalsIgnoreCase(targetStageCode) || "APPROVED".equalsIgnoreCase(targetStageCode))
                && (Boolean.TRUE.equals(app.getRequiresEvc()) || "WF-FULL".equalsIgnoreCase(wfId) || "WF-SCRUTINY-EVC".equalsIgnoreCase(wfId));

        if (movingPastEvc || reachingFinalWithEvc) {
            Optional<in.gov.aicte.approval.evc.entity.EvcSchedule> evcOpt = evcScheduleRepository.findByApplicationId(app.getId());
            if (evcOpt.isEmpty() || !"INSPECTION_COMPLETED".equalsIgnoreCase(evcOpt.get().getStatus())
                    || evcOpt.get().getReportStatus() == null
                    || (!"REPORT_SUBMITTED".equalsIgnoreCase(evcOpt.get().getReportStatus())
                        && !"REPORT_REVIEWED".equalsIgnoreCase(evcOpt.get().getReportStatus())
                        && !"REPORT_ACCEPTED".equalsIgnoreCase(evcOpt.get().getReportStatus()))) {
                throw new BadRequestException("Cannot advance past EVC stage: Physical inspection has not been completed or report is pending submission.");
            }
        }

        // 4c. Final Decision Authority Gate: Only ADMIN or SYSTEM_ADMIN can grant final approval or rejection
        if ("FINAL_APPROVAL".equalsIgnoreCase(targetStageCode) || "APPROVED".equalsIgnoreCase(targetStageCode)) {
            if (!"ADMIN".equalsIgnoreCase(currentUserRole) && !"SYSTEM_ADMIN".equalsIgnoreCase(currentUserRole)) {
                throw new BadRequestException("Final approval or rejection authority is strictly reserved for Council Admins. Officers may only submit recommendations.");
            }
        }

        // 5. Compute SLA deadline dynamically
        int targetDays = targetStageObj != null && targetStageObj.getTargetDays() > 0 ? targetStageObj.getTargetDays() : 10;
        app.setCurrentStage(targetStageCode);
        app.setStageStartDate(LocalDate.now());
        app.setNextDeadline(LocalDate.now().plusDays(targetDays));

        // 6. Update Status
        if ("FINAL_APPROVAL".equalsIgnoreCase(targetStageCode)) {
            String remarks = request.getRemarks() != null ? request.getRemarks().toLowerCase() : "";
            if (remarks.contains("reject") || remarks.contains("declined") || remarks.contains("disapproved")) {
                app.setStatus("REJECTED");
            } else {
                app.setStatus("APPROVED");
            }
        } else if ("EVC".equalsIgnoreCase(targetStageCode)) {
            app.setStatus("EVC_SCHEDULED");
        } else {
            app.setStatus("IN_REVIEW");
        }

        Application saved = applicationRepository.save(app);

        // 7. Record Stage History
        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .application(saved)
                .stage(targetStageName)
                .status("IN_PROGRESS")
                .date(LocalDate.now())
                .note(request.getRemarks() != null ? request.getRemarks() : "Advanced to " + targetStageName + " by " + currentUserName)
                .build();
        stageHistoryRepository.save(history);

        // 8. Record Audit Log
        recordAudit(id, currentUserName, "STAGE_ADVANCED", previousStage, targetStageCode, request.getRemarks());

        // 9. Notify next responsible role
        String nextRecipientRole = targetStageObj != null && targetStageObj.getRoleAllowed() != null
                ? targetStageObj.getRoleAllowed()
                : "REGIONAL_OFFICER";

        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("STAGE_CHANGED")
                .urgency("NORMAL")
                .title("Application Stage Updated: " + saved.getId())
                .message("Application moved to " + targetStageName + ". Current Status: " + saved.getStatus())
                .entityType("APPLICATION")
                .entityId(saved.getId())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole(nextRecipientRole)
                .link("/applications/" + saved.getId())
                .build();
        notificationRepository.save(notification);

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto returnDeficiency(String id, DeficiencyRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        // Terminal / Draft check
        List<String> invalidStatuses = List.of("DRAFT", "APPROVED", "REJECTED", "WITHDRAWN");
        if (invalidStatuses.contains(app.getStatus().toUpperCase())) {
            throw new BadRequestException("Cannot issue deficiency notice for application in status '" + app.getStatus() + "'.");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new BadRequestException("A clear deficiency explanation and statutory reasoning is required.");
        }

        // Security check
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Regional Officer";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Security violation: Technical institutions cannot issue deficiency notices to their own application.");
            }
        }

        // Determine resolution days from workflow definition rules
        int resolutionDays = 7;
        String wfId = app.getWorkflowId() != null ? app.getWorkflowId() : "WF-FULL";
        Optional<WorkflowDefinition> wfOpt = workflowRepository.findById(wfId);
        if (wfOpt.isPresent() && wfOpt.get().getRulesJson() != null) {
            try {
                Map<String, Object> rules = objectMapper.readValue(wfOpt.get().getRulesJson(), new TypeReference<Map<String, Object>>() {});
                if (rules.containsKey("deficiencyResolutionDays")) {
                    resolutionDays = ((Number) rules.get("deficiencyResolutionDays")).intValue();
                }
            } catch (Exception ignored) {}
        }

        String previousState = app.getStatus();
        app.setStatus("DEFICIENCY_NOTIFIED");
        app.setDeficiencyCount(app.getDeficiencyCount() + 1);
        app.setDeficiencyReason(request.getReason().trim());
        app.setNextDeadline(LocalDate.now().plusDays(resolutionDays));
        applicationRepository.save(app);

        Observation obs = Observation.builder()
                .id("OBS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .application(app)
                .date(LocalDate.now())
                .officer(app.getAssignedOfficer() != null ? app.getAssignedOfficer() : currentUserName)
                .stage(app.getCurrentStage())
                .status("DEFICIENT")
                .remarks(request.getReason().trim())
                .clauses(request.getClauses() != null ? String.join(", ", request.getClauses()) : null)
                .build();
        observationRepository.save(obs);

        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .application(app)
                .stage(app.getCurrentStage() + " (Deficiency Issued)")
                .status("DEFICIENT")
                .date(LocalDate.now())
                .note("Deficiency letter issued: " + request.getReason().trim() + ". Resolution deadline: " + resolutionDays + " days.")
                .build();
        stageHistoryRepository.save(history);

        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("DEFICIENCY_RETURNED")
                .urgency("HIGH")
                .title("Regulatory Scrutiny Deficiency Issued: " + app.getId())
                .message("Deficiencies identified: " + request.getReason().trim() + ". Institution response required within " + resolutionDays + " days.")
                .entityType("APPLICATION")
                .entityId(app.getId())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole("COLLEGE_REP")
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(notification);

        recordAudit(id, currentUserName, "RETURN_FOR_DEFICIENCY", previousState, "DEFICIENCY_NOTIFIED", request.getReason());

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto resubmit(String id, ResubmitRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        // 1. Must be in DEFICIENCY_NOTIFIED status
        if (!"DEFICIENCY_NOTIFIED".equalsIgnoreCase(app.getStatus())) {
            throw new BadRequestException("Application " + id + " is in status '" + app.getStatus() + "'. Resubmission is only allowed when status is DEFICIENCY_NOTIFIED.");
        }

        // 2. Security: caller must belong to the institution or be Admin
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "College Representative";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(app.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You cannot submit compliance responses for other institutions.");
                }
            }
        }

        // 3. Mandatory response validation
        if (request.getResponseNotes() == null || request.getResponseNotes().isBlank()) {
            throw new BadRequestException("Compliance response notes describing rectifications and supporting evidence are mandatory.");
        }

        // 4. Mark active deficiencies as RESPONDED (not auto-resolved, must be verified by officer)
        List<Observation> observations = app.getObservations();
        if (observations != null) {
            for (Observation obs : observations) {
                if ("DEFICIENT".equalsIgnoreCase(obs.getStatus()) || "OPEN".equalsIgnoreCase(obs.getStatus()) || "REOPENED".equalsIgnoreCase(obs.getStatus())) {
                    obs.setStatus("RESPONDED");
                    obs.setResponseNotes(request.getResponseNotes().trim());
                    observationRepository.save(obs);
                }
            }
        }

        // 5. Look up scrutiny target days to reset deadline
        int scrutinyDays = 7;
        String wfId = app.getWorkflowId() != null ? app.getWorkflowId() : "WF-FULL";
        Optional<WorkflowDefinition> wfOpt = workflowRepository.findById(wfId);
        if (wfOpt.isPresent() && wfOpt.get().getStages() != null) {
            for (WorkflowStage stg : wfOpt.get().getStages()) {
                if (stg.getCode().equalsIgnoreCase(app.getCurrentStage())) {
                    scrutinyDays = stg.getTargetDays();
                    break;
                }
            }
        }

        String previousState = app.getStatus();
        app.setStatus("IN_REVIEW");
        app.setNextDeadline(LocalDate.now().plusDays(scrutinyDays));
        applicationRepository.save(app);

        // 6. Record stage history
        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .application(app)
                .stage(app.getCurrentStage() + " (Clarification Resubmitted)")
                .status("IN_PROGRESS")
                .date(LocalDate.now())
                .note("Institution resubmitted compliance response: " + request.getResponseNotes().trim())
                .build();
        stageHistoryRepository.save(history);

        // 7. Audit log
        recordAudit(id, currentUserName, "APPLICATION_RESUBMITTED", previousState, "IN_REVIEW", request.getResponseNotes());

        // 8. Notify assigned officer
        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("COMPLIANCE_RECEIVED")
                .urgency("NORMAL")
                .title("Institution Resubmitted Compliance: " + app.getId())
                .message(app.getInstitutionName() + " has resubmitted compliance response for " + app.getCurrentStage() + ". Ready for re-scrutiny.")
                .entityType("APPLICATION")
                .entityId(app.getId())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole(app.getOfficerRole() != null ? app.getOfficerRole() : "REGIONAL_OFFICER")
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(notification);

        return getApplicationById(id);
    }

    @Transactional
    public ApplicationDto assignOfficer(String id, AssignOfficerRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        // Terminal check
        List<String> terminalStatuses = List.of("APPROVED", "REJECTED", "WITHDRAWN");
        if (terminalStatuses.contains(app.getStatus().toUpperCase())) {
            throw new BadRequestException("Cannot reassign officers for applications in terminal status " + app.getStatus());
        }

        // Validate officer exists & is eligible
        User officer = null;
        if (request.getOfficerId() != null && !request.getOfficerId().isBlank()) {
            officer = userRepository.findByIdAndStatus(request.getOfficerId().trim(), "ACTIVE")
                    .orElse(null);
        }
        if (officer == null && request.getOfficerName() != null && !request.getOfficerName().isBlank()) {
            String name = request.getOfficerName().trim().toLowerCase();
            officer = userRepository.findAll().stream()
                    .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()) && (u.getName().toLowerCase().contains(name) || u.getEmail().toLowerCase().contains(name)))
                    .findFirst()
                    .orElse(null);
        }

        if (officer == null) {
            if (request.getOfficerName() == null || request.getOfficerName().isBlank()) {
                throw new BadRequestException("Officer identifier or valid name is required.");
            }
            throw new BadRequestException("Officer '" + request.getOfficerName() + "' was not found or is currently inactive.");
        }

        // Verify officer role is an evaluating staff role, not COLLEGE_REP
        if ("COLLEGE_REP".equalsIgnoreCase(officer.getRole())) {
            throw new BadRequestException("Ineligible assignment: College representatives cannot be assigned as evaluating officers.");
        }

        // Prevent duplicate assignment side effects if already assigned to the same officer
        if (officer.getId().equals(app.getAssignedOfficerId())) {
            return getApplicationById(id);
        }

        String prevOfficer = app.getAssignedOfficer();
        String reason = request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim()
                : "Assigned by Bureau Administration";

        app.setAssignedOfficer(officer.getName());
        app.setAssignedOfficerId(officer.getId());
        app.setOfficerRole(officer.getRole());
        app.setAssignedAt(LocalDateTime.now());
        app.setAssignmentReason(reason);

        applicationRepository.save(app);

        recordAudit(id, "Admin / Bureau Head", "OFFICER_ASSIGNED", prevOfficer, officer.getName(),
                "Assigned to " + officer.getName() + " (" + officer.getRole() + "). Reason: " + reason);

        // Notify assigned officer
        Notification notification = Notification.builder()
                .id("NOTIF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .category("APPLICATION_ASSIGNED")
                .urgency("HIGH")
                .title("New Application Assigned: " + app.getId())
                .message("You have been assigned as the reviewing officer for " + app.getInstitutionName() + " (" + app.getApplicationType() + "). Reason: " + reason)
                .entityType("APPLICATION")
                .entityId(app.getId())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole(officer.getRole())
                .link("/applications/" + app.getId())
                .build();
        notificationRepository.save(notification);

        return getApplicationById(id);
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

    @Transactional(readOnly = true)
    public List<TimelineDto> getStageHistory(String id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        validateAccess(app);
        return stageHistoryRepository.findByApplicationIdOrderByIdAsc(id).stream()
                .map(TimelineDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ObservationDto> getDeficiencies(String id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        validateAccess(app);
        return observationRepository.findByApplicationIdOrderByDateDesc(id).stream()
                .map(ObservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviews(String id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        validateAccess(app);
        return reviewRepository.findByApplicationIdOrderByCreatedAtDesc(id).stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto submitReview(String id, ReviewCreateRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Scrutiny Officer";
        String currentUserRole = "REGIONAL_OFFICER";
        String currentUserId = "OFFICER";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            currentUserRole = principal.getRole();
            currentUserId = principal.getId() != null ? principal.getId() : principal.getUsername();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Access denied: Technical institutions cannot submit scrutiny reviews.");
            }
        }

        String reviewStage = request.getStage() != null && !request.getStage().isBlank()
                ? request.getStage()
                : app.getCurrentStage();

        List<Review> existingReviews = reviewRepository.findByApplicationIdOrderByCreatedAtDesc(id);
        int round = existingReviews.stream()
                .filter(r -> r.getStage() != null && r.getStage().equalsIgnoreCase(reviewStage))
                .mapToInt(r -> r.getRound() != null ? r.getRound() : 1)
                .max()
                .orElse(0) + 1;

        String checklistJson = null;
        if (request.getChecklistResults() != null) {
            try {
                checklistJson = objectMapper.writeValueAsString(request.getChecklistResults());
            } catch (Exception e) {
                checklistJson = "[]";
            }
        }

        String reviewId = "REV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Review review = Review.builder()
                .id(reviewId)
                .application(app)
                .stage(reviewStage)
                .round(round)
                .reviewerId(currentUserId)
                .reviewerName(currentUserName)
                .reviewerRole(currentUserRole)
                .decision(request.getDecision())
                .remarks(request.getRemarks())
                .checklistResultsJson(checklistJson)
                .isDraft(request.isDraft())
                .build();

        Review saved = reviewRepository.save(review);

        if (!request.isDraft()) {
            recordAudit(id, currentUserName, "STAGE_REVIEW_SUBMITTED", app.getStatus(), app.getStatus(),
                    "Review completed for stage " + reviewStage + " (Round " + round + ") with decision: " + request.getDecision());

            if ("DEFICIENCIES_NOTED".equalsIgnoreCase(request.getDecision())) {
                app.setStatus("DEFICIENCY_NOTIFIED");
                applicationRepository.save(app);
            }
        }

        return ReviewDto.fromEntity(saved);
    }

    @Transactional
    public ApplicationDto markEvcRequired(String id, EvcMarkRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Scrutiny Officer";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Access denied: Technical institutions cannot mark applications for EVC.");
            }
        }

        app.setRequiresEvc(true);
        app.setEvcReason(request.getReason());
        app.setEvcMarkedBy(currentUserName);
        app.setEvcMarkedAt(LocalDateTime.now());

        Application saved = applicationRepository.save(app);

        recordAudit(id, currentUserName, "APPLICATION_MARKED_FOR_EVC", app.getStatus(), app.getStatus(),
                "Marked for mandatory EVC physical inspection. Reason: " + request.getReason());

        return ApplicationDto.fromEntity(saved);
    }

    @Transactional
    public ObservationDto createObservation(String id, ObservationCreateRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Scrutiny Officer";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Access denied: Technical institutions cannot record regulatory deficiencies against themselves.");
            }
        }

        String obsId = "OBS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Observation obs = Observation.builder()
                .id(obsId)
                .application(app)
                .clause(request.getClause() != null ? request.getClause() : "Statutory Scrutiny Checklist")
                .deficiencyText(request.getDescription())
                .type(request.getType() != null ? request.getType() : "DEFICIENCY")
                .severity(request.getSeverity() != null ? request.getSeverity() : "CRITICAL")
                .correctiveAction(request.getCorrectiveAction())
                .deadline(request.getDeadline() != null ? request.getDeadline() : LocalDate.now().plusDays(7))
                .status("OPEN")
                .date(LocalDate.now())
                .build();

        Observation saved = observationRepository.save(obs);

        if ("DEFICIENCY".equalsIgnoreCase(obs.getType())) {
            app.setStatus("DEFICIENCY_NOTIFIED");
            applicationRepository.save(app);
        }

        recordAudit(id, currentUserName, "OBSERVATION_RECORDED", "OPEN", "OPEN",
                obs.getType() + " recorded: " + request.getDescription());

        return ObservationDto.fromEntity(saved);
    }

    @Transactional
    public ObservationDto verifyObservation(String id, String obsId, ObservationVerifyRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = "Scrutiny Reviewer";
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            currentUserName = principal.getName();
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                throw new BadRequestException("Access denied: Technical institutions cannot verify or close regulatory deficiencies.");
            }
        }

        Observation obs = observationRepository.findById(obsId)
                .orElseThrow(() -> new ResourceNotFoundException("Observation", "id", obsId));

        if (obs.getApplication() == null || !obs.getApplication().getId().equals(id)) {
            throw new BadRequestException("Observation " + obsId + " does not belong to application " + id);
        }

        String prevStatus = obs.getStatus();
        String newStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : "RESOLVED";

        obs.setStatus(newStatus);
        obs.setVerificationNotes(request.getVerificationNotes());
        obs.setVerifiedBy(currentUserName);

        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            obs.setResolvedAt(LocalDateTime.now());
            // Check if all deficiencies for this application are now resolved
            List<Observation> allObs = observationRepository.findByApplicationIdOrderByDateDesc(id);
            boolean hasRemainingDeficiencies = allObs.stream().anyMatch(o ->
                !o.getId().equals(obsId) && ("OPEN".equalsIgnoreCase(o.getStatus()) || "DEFICIENT".equalsIgnoreCase(o.getStatus()) || "REOPENED".equalsIgnoreCase(o.getStatus()))
            );
            if (!hasRemainingDeficiencies) {
                app.setStatus("IN_REVIEW");
                applicationRepository.save(app);
            }
        } else if ("REOPENED".equalsIgnoreCase(newStatus)) {
            app.setStatus("DEFICIENCY_NOTIFIED");
            applicationRepository.save(app);
        }

        Observation saved = observationRepository.save(obs);

        recordAudit(id, currentUserName, "DEFICIENCY_VERIFIED", prevStatus, newStatus,
                "Deficiency verification updated to " + newStatus + ". Notes: " + request.getVerificationNotes());

        return ObservationDto.fromEntity(saved);
    }

    private void validateAccess(Application application) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof in.gov.aicte.approval.security.UserPrincipal principal) {
            if ("COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                if (!principal.getInstitutionCode().equalsIgnoreCase(application.getInstitutionCode())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to view applications belonging to other institutions.");
                }
            }
        }
    }

    public List<ApplicationDto> getRiskPrioritizedQueue() {
        return applicationRepository.findAll().stream()
                .map(ApplicationDto::fromEntity)
                .filter(dto -> !"RESOLVED".equalsIgnoreCase(dto.getRiskLevel()))
                .sorted((a, b) -> Integer.compare(
                        b.getRiskScore() != null ? b.getRiskScore() : 0,
                        a.getRiskScore() != null ? a.getRiskScore() : 0))
                .collect(Collectors.toList());
    }
}
