package in.gov.aicte.approval.notification.service;

import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.audit.service.AuditService;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import in.gov.aicte.approval.notification.dto.EscalationDto;
import in.gov.aicte.approval.notification.dto.NotificationDto;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EscalationRepository escalationRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final ComplianceItemRepository complianceItemRepository;
    private final AuditService auditService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public NotificationService(NotificationRepository notificationRepository,
                               EscalationRepository escalationRepository,
                               ApplicationRepository applicationRepository,
                               ApplicationDocumentRepository documentRepository,
                               ComplianceItemRepository complianceItemRepository,
                               AuditService auditService) {
        this.notificationRepository = notificationRepository;
        this.escalationRepository = escalationRepository;
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.complianceItemRepository = complianceItemRepository;
        this.auditService = auditService;
    }

    public void verifyNotificationAccess(Notification notif, UserPrincipal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required to access notifications.");
        }
        String userRole = principal.getRole();
        if ("ADMIN".equalsIgnoreCase(userRole) || "SYSTEM_ADMIN".equalsIgnoreCase(userRole)) {
            return;
        }

        if ("COLLEGE_REP".equalsIgnoreCase(userRole)) {
            String userInst = principal.getInstitutionCode();
            boolean matchInst = userInst != null && userInst.equalsIgnoreCase(notif.getInstitutionCode());
            boolean matchEmail = principal.getEmail() != null && principal.getEmail().equalsIgnoreCase(notif.getRecipientEmail());
            boolean matchId = principal.getId() != null && principal.getId().equalsIgnoreCase(notif.getRecipientId());
            boolean isCollegeRole = "COLLEGE_REP".equalsIgnoreCase(notif.getRecipientRole()) || "ALL".equalsIgnoreCase(notif.getRecipientRole());

            if (!isCollegeRole || (!matchInst && !matchEmail && !matchId)) {
                throw new AccessDeniedException("Access denied: You do not have permission to access or modify notifications belonging to another institution or role.");
            }
        } else {
            // Officer role
            if ("COLLEGE_REP".equalsIgnoreCase(notif.getRecipientRole())) {
                throw new AccessDeniedException("Access denied: Officer cannot access college-only notification.");
            }
            boolean matchRole = userRole.equalsIgnoreCase(notif.getRecipientRole()) || "ALL".equalsIgnoreCase(notif.getRecipientRole());
            boolean matchEmail = principal.getEmail() != null && principal.getEmail().equalsIgnoreCase(notif.getRecipientEmail());
            boolean matchId = principal.getId() != null && principal.getId().equalsIgnoreCase(notif.getRecipientId());
            if (!matchRole && !matchEmail && !matchId) {
                throw new AccessDeniedException("Access denied: Notification is assigned to role [" + notif.getRecipientRole() + "] rather than [" + userRole + "].");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getScopedNotifications(UserPrincipal principal, String roleFilter) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required to access notifications.");
        }
        String userRole = principal.getRole();
        List<Notification> list;

        if ("ADMIN".equalsIgnoreCase(userRole) || "SYSTEM_ADMIN".equalsIgnoreCase(userRole)) {
            if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter)) {
                list = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(roleFilter);
            } else {
                list = notificationRepository.findAllByOrderByCreatedAtDesc();
            }
        } else if ("COLLEGE_REP".equalsIgnoreCase(userRole)) {
            list = notificationRepository.findForCollegeRep(
                    principal.getInstitutionCode() != null ? principal.getInstitutionCode() : "",
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        } else {
            list = notificationRepository.findForOfficer(
                    userRole,
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        }

        return list.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getScopedUnreadCount(UserPrincipal principal) {
        if (principal == null) return 0L;
        String userRole = principal.getRole();
        if ("ADMIN".equalsIgnoreCase(userRole) || "SYSTEM_ADMIN".equalsIgnoreCase(userRole)) {
            return notificationRepository.countUnreadForAdmin();
        } else if ("COLLEGE_REP".equalsIgnoreCase(userRole)) {
            return notificationRepository.countUnreadForCollegeRep(
                    principal.getInstitutionCode() != null ? principal.getInstitutionCode() : "",
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        } else {
            return notificationRepository.countUnreadForOfficer(
                    userRole,
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsByRole(String role) {
        return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markRead(String id) {
        return markRead(id, null);
    }

    @Transactional
    public NotificationDto markRead(String id, UserPrincipal principal) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (principal != null) {
            verifyNotificationAccess(notif, principal);
        }
        notif.setRead(true);
        Notification saved = notificationRepository.save(notif);
        return NotificationDto.fromEntity(saved);
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.markAllAsRead();
    }

    @Transactional
    public void markAllRead(UserPrincipal principal) {
        if (principal == null) {
            notificationRepository.markAllAsRead();
            return;
        }
        String userRole = principal.getRole();
        if ("ADMIN".equalsIgnoreCase(userRole) || "SYSTEM_ADMIN".equalsIgnoreCase(userRole)) {
            notificationRepository.markAllAsRead();
        } else if ("COLLEGE_REP".equalsIgnoreCase(userRole)) {
            notificationRepository.markAllAsReadForCollegeRep(
                    principal.getInstitutionCode() != null ? principal.getInstitutionCode() : "",
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        } else {
            notificationRepository.markAllAsReadForOfficer(
                    userRole,
                    principal.getEmail() != null ? principal.getEmail() : "",
                    principal.getId() != null ? principal.getId() : ""
            );
        }
    }

    // Feature 52: Acknowledgement Tracking
    @Transactional
    public NotificationDto acknowledgeNotification(String id, String acknowledgedBy) {
        return acknowledgeNotification(id, acknowledgedBy, null);
    }

    @Transactional
    public NotificationDto acknowledgeNotification(String id, String acknowledgedBy, UserPrincipal principal) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (principal != null) {
            verifyNotificationAccess(notif, principal);
        }
        notif.setAcknowledged(true);
        notif.setAcknowledgedAt(LocalDateTime.now());
        notif.setAcknowledgedBy(acknowledgedBy != null ? acknowledgedBy : (principal != null ? principal.getName() : "Authorized Official"));
        notif.setRead(true);

        Notification saved = notificationRepository.save(notif);

        auditService.logEvent(
                acknowledgedBy != null ? acknowledgedBy : (principal != null ? principal.getName() : "Authorized Official"),
                notif.getRecipientRole(),
                notif.getEntityId() != null ? notif.getEntityId() : notif.getId(),
                "NOTIFICATION_ACKNOWLEDGED",
                "PENDING_ACK",
                "ACKNOWLEDGED",
                "Notification [" + notif.getTitle() + "] acknowledged",
                "10.200.4.88"
        );

        return NotificationDto.fromEntity(saved);
    }

    // Feature 53: Action Completion Tracking
    @Transactional
    public NotificationDto completeNotificationAction(String id, String completedBy) {
        return completeNotificationAction(id, completedBy, null);
    }

    @Transactional
    public NotificationDto completeNotificationAction(String id, String completedBy, UserPrincipal principal) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (principal != null) {
            verifyNotificationAccess(notif, principal);
        }
        notif.setActionCompleted(true);
        notif.setActionCompletedAt(LocalDateTime.now());
        notif.setActionCompletedBy(completedBy != null ? completedBy : (principal != null ? principal.getName() : "Authorized Official"));
        notif.setAcknowledged(true);
        notif.setRead(true);

        Notification saved = notificationRepository.save(notif);

        auditService.logEvent(
                completedBy != null ? completedBy : (principal != null ? principal.getName() : "Authorized Official"),
                notif.getRecipientRole(),
                notif.getEntityId() != null ? notif.getEntityId() : notif.getId(),
                "NOTIFICATION_ACTION_COMPLETED",
                "ACTION_REQUIRED",
                "ACTION_COMPLETED",
                "Task associated with notification [" + notif.getTitle() + "] marked complete",
                "10.200.4.88"
        );

        return NotificationDto.fromEntity(saved);
    }

    // Feature 48: Application Status Change Notification
    @Transactional
    public void notifyApplicationStatusChange(Application app, String prevStatus, String newStatus, String actorName) {
        String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String ts = FORMATTER.format(LocalDateTime.now());

        Notification notif = Notification.builder()
                .id(id)
                .category("APPLICATION_STATUS")
                .urgency("NORMAL")
                .title("Status Update: " + app.getId() + " is now " + newStatus)
                .message("Application for " + app.getInstitutionName() + " has transitioned from " + prevStatus + " to " + newStatus + " by " + (actorName != null ? actorName : "AICTE Authority") + ".")
                .entityType("APPLICATION")
                .entityId(app.getId())
                .institutionCode(app.getInstitutionCode())
                .timestamp(ts)
                .recipientRole("COLLEGE_REP")
                .link("/applications")
                .build();

        notificationRepository.save(notif);

        // Also notify Regional Officer
        String officerNotifId = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Notification officerNotif = Notification.builder()
                .id(officerNotifId)
                .category("APPLICATION_STATUS")
                .urgency("NORMAL")
                .title("Workflow Transition: " + app.getId())
                .message("Application " + app.getId() + " (" + app.getInstitutionName() + ") moved to " + newStatus + ".")
                .entityType("APPLICATION")
                .entityId(app.getId())
                .institutionCode(app.getInstitutionCode())
                .timestamp(ts)
                .recipientRole("REGIONAL_OFFICER")
                .link("/applications")
                .build();

        notificationRepository.save(officerNotif);
    }

    // Feature 49: Upcoming Deadline and Overdue Reminders (Idempotent)
    @Transactional
    public int generateUpcomingDeadlineReminders() {
        int generatedCount = 0;
        LocalDate today = LocalDate.now();
        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);

        List<Application> activeApps = applicationRepository.findAll().stream()
                .filter(a -> !"APPROVED".equalsIgnoreCase(a.getStatus()) && !"REJECTED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getNextDeadline() != null)
                .collect(Collectors.toList());

        for (Application app : activeApps) {
            LocalDate deadline = app.getNextDeadline();
            long daysRemaining = ChronoUnit.DAYS.between(today, deadline);

            if (daysRemaining < 0) {
                // Overdue
                boolean alreadyNotified = notificationRepository.existsByEntityIdAndCategoryAndCreatedAtAfter(
                        app.getId(), "APPLICATION_OVERDUE", oneDayAgo);
                if (!alreadyNotified) {
                    String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    Notification notif = Notification.builder()
                            .id(id)
                            .category("APPLICATION_OVERDUE")
                            .urgency("CRITICAL")
                            .title("Statutory SLA Breached - " + app.getId())
                            .message("Application for " + app.getInstitutionName() + " is overdue by " + Math.abs(daysRemaining) + " day(s). Immediate scrutiny action required.")
                            .entityType("APPLICATION")
                            .entityId(app.getId())
                            .timestamp(FORMATTER.format(LocalDateTime.now()))
                            .recipientRole("REGIONAL_OFFICER")
                            .actionRequired(true)
                            .dueDate(deadline.atStartOfDay())
                            .link("/applications")
                            .build();

                    notificationRepository.save(notif);
                    generatedCount++;

                    // Trigger Escalation if overdue by more than 3 days
                    if (Math.abs(daysRemaining) >= 3) {
                        triggerEscalation(
                                app.getId(),
                                app.getInstitutionName(),
                                "LEVEL_2",
                                "Bureau Head Escalation",
                                "Dr. Rajesh Sharma (Approval Bureau Head)",
                                "Target application deadline breached by " + Math.abs(daysRemaining) + " days without completion.",
                                app.getId()
                        );
                    }
                }
            } else if (daysRemaining <= 3) {
                // Upcoming critical deadline
                boolean alreadyNotified = notificationRepository.existsByEntityIdAndCategoryAndCreatedAtAfter(
                        app.getId(), "DEADLINE_APPROACHING", oneDayAgo);
                if (!alreadyNotified) {
                    String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    Notification notif = Notification.builder()
                            .id(id)
                            .category("DEADLINE_APPROACHING")
                            .urgency("HIGH")
                            .title("Urgent: Statutory Deadline in " + daysRemaining + " day(s) - " + app.getId())
                            .message("Application for " + app.getInstitutionName() + " reaches target deadline on " + deadline + ". Expedite scrutiny.")
                            .entityType("APPLICATION")
                            .entityId(app.getId())
                            .timestamp(FORMATTER.format(LocalDateTime.now()))
                            .recipientRole("REGIONAL_OFFICER")
                            .actionRequired(true)
                            .dueDate(deadline.atStartOfDay())
                            .link("/applications")
                            .build();

                    notificationRepository.save(notif);
                    generatedCount++;
                }
            }
        }

        return generatedCount;
    }

    // Feature 50: Document Expiry and Compliance Alerts (Idempotent)
    @Transactional
    public int generateDocumentExpiryAlerts() {
        int count = 0;
        LocalDate today = LocalDate.now();
        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);

        // 1. Check expiring / expired compliance items
        List<ComplianceItem> expiringItems = complianceItemRepository.findByExpiryDateBetween(today, today.plusDays(30));
        for (ComplianceItem item : expiringItems) {
            boolean alreadyNotified = notificationRepository.existsByEntityIdAndCategoryAndCreatedAtAfter(
                    item.getId(), "LEASE_EXPIRY", oneDayAgo);
            if (!alreadyNotified) {
                long days = ChronoUnit.DAYS.between(today, item.getExpiryDate());
                String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Notification notif = Notification.builder()
                        .id(id)
                        .category("LEASE_EXPIRY")
                        .urgency(days <= 7 ? "CRITICAL" : "HIGH")
                        .title("Document Expiry Notice: " + item.getDocumentName())
                        .message("Statutory document [" + item.getDocumentName() + "] for " + item.getInstitutionName() + " expires in " + days + " day(s). Renewal certificate required.")
                        .entityType("COMPLIANCE_ITEM")
                        .entityId(item.getId())
                        .timestamp(FORMATTER.format(LocalDateTime.now()))
                        .recipientRole("COMPLIANCE_REVIEWER")
                        .actionRequired(true)
                        .dueDate(item.getExpiryDate() != null ? item.getExpiryDate().atStartOfDay() : null)
                        .link("/compliance")
                        .build();

                notificationRepository.save(notif);
                count++;
            }
        }

        // 2. Check overdue compliance items
        List<ComplianceItem> overdueItems = complianceItemRepository.findByDueDateBefore(today).stream()
                .filter(i -> !"VERIFIED".equalsIgnoreCase(i.getVerificationStatus()) && !"COMPLIANT".equalsIgnoreCase(i.getVerificationStatus()))
                .collect(Collectors.toList());

        for (ComplianceItem item : overdueItems) {
            boolean alreadyNotified = notificationRepository.existsByEntityIdAndCategoryAndCreatedAtAfter(
                    item.getId(), "COMPLIANCE_OVERDUE", oneDayAgo);
            if (!alreadyNotified) {
                String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Notification notif = Notification.builder()
                        .id(id)
                        .category("COMPLIANCE_OVERDUE")
                        .urgency("CRITICAL")
                        .title("Overdue Compliance Submission: " + item.getRequirementType())
                        .message("Mandatory compliance requirement [" + item.getRequirementType() + "] for " + item.getInstitutionName() + " is overdue.")
                        .entityType("COMPLIANCE_ITEM")
                        .entityId(item.getId())
                        .timestamp(FORMATTER.format(LocalDateTime.now()))
                        .recipientRole("COMPLIANCE_REVIEWER")
                        .actionRequired(true)
                        .link("/compliance")
                        .build();

                notificationRepository.save(notif);
                count++;
            }
        }

        return count;
    }

    // Feature 51: EVC Schedule Notifications
    @Transactional
    public void notifyEvcScheduled(String applicationId, String institutionName, String visitDate, String committeeHead) {
        String id = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String instCode = null;
        if (applicationId != null && !applicationId.isBlank()) {
            instCode = applicationRepository.findById(applicationId).map(Application::getInstitutionCode).orElse(null);
        }
        Notification notif = Notification.builder()
                .id(id)
                .category("EVC_SCHEDULED")
                .urgency("HIGH")
                .title("EVC Inspection Visit Scheduled: " + applicationId)
                .message("Expert Visit Committee inspection for " + institutionName + " has been scheduled for " + visitDate + " led by " + committeeHead + ".")
                .entityType("EVC")
                .entityId(applicationId)
                .institutionCode(instCode)
                .timestamp(FORMATTER.format(LocalDateTime.now()))
                .recipientRole("COLLEGE_REP")
                .link("/evc")
                .build();

        notificationRepository.save(notif);
    }

    // Feature 54: Escalation
    @Transactional(readOnly = true)
    public List<EscalationDto> getAllEscalations() {
        return escalationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(EscalationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EscalationDto acknowledgeEscalation(String id, String acknowledgedBy) {
        Escalation esc = escalationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escalation", "id", id));
        esc.setStatus("ACKNOWLEDGED");
        esc.setAcknowledgedBy(acknowledgedBy != null ? acknowledgedBy : "Responsible Officer");
        esc.setAcknowledgedAt(LocalDateTime.now());

        Escalation saved = escalationRepository.save(esc);

        auditService.logEvent(
                acknowledgedBy,
                "REGIONAL_OFFICER",
                esc.getEntityId(),
                "ESCALATION_ACKNOWLEDGED",
                "ACTIVE",
                "ACKNOWLEDGED",
                "Escalation [" + esc.getId() + "] acknowledged",
                "10.200.4.88"
        );

        return EscalationDto.fromEntity(saved);
    }

    @Transactional
    public EscalationDto triggerEscalation(String entityId, String institutionName, String level,
                                          String levelTitle, String recipient, String reason, String applicationId) {
        // Prevent duplicate active escalations for the same entity and level (Feature 54)
        if (escalationRepository.existsByEntityIdAndLevelAndStatus(entityId, level, "ACTIVE")) {
            return null;
        }

        String id = "ESC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String ts = FORMATTER.format(LocalDateTime.now());

        Escalation escalation = Escalation.builder()
                .id(id)
                .entityId(entityId)
                .applicationId(applicationId)
                .institutionName(institutionName != null ? institutionName : "Technical Institution")
                .level(level != null ? level : "LEVEL_1")
                .levelTitle(levelTitle != null ? levelTitle : "Regional Officer Alert")
                .recipient(recipient != null ? recipient : "Dr. Suresh Kumar Nair (Regional Officer)")
                .reason(reason != null ? reason : "SLA statutory processing time breached.")
                .triggeredAt(ts)
                .status("ACTIVE")
                .build();

        Escalation saved = escalationRepository.save(escalation);

        auditService.logEvent(
                "System Auto-Engine",
                "SYSTEM",
                entityId,
                "ESCALATION_TRIGGERED",
                "STANDARD",
                level,
                reason,
                "10.200.4.1 (Internal Worker)"
        );

        return EscalationDto.fromEntity(saved);
    }
}
