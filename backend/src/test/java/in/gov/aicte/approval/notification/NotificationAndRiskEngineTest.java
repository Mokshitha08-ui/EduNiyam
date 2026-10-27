package in.gov.aicte.approval.notification;

import in.gov.aicte.approval.application.dto.RiskAssessmentDto;
import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.application.service.RiskScoringService;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.audit.service.AuditService;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import in.gov.aicte.approval.notification.dto.EscalationDto;
import in.gov.aicte.approval.notification.dto.NotificationDto;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationAndRiskEngineTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private EscalationRepository escalationRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ApplicationDocumentRepository documentRepository;
    @Mock
    private ComplianceItemRepository complianceItemRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    private AuditService auditService;
    private NotificationService notificationService;
    private RiskScoringService riskScoringService;

    @BeforeEach
    void setUp() {
        auditService = new AuditService(auditLogRepository);
        notificationService = new NotificationService(
                notificationRepository,
                escalationRepository,
                applicationRepository,
                documentRepository,
                complianceItemRepository,
                auditService
        );
        riskScoringService = new RiskScoringService();
    }

    @Test
    @DisplayName("Feature 52: Acknowledge notification updates status, timestamp, and creates audit entry")
    void testAcknowledgeNotification() {
        Notification notif = Notification.builder()
                .id("NOTIF-TEST-1")
                .category("DEADLINE_APPROACHING")
                .urgency("HIGH")
                .title("Deadline Approaching")
                .message("Only 2 days remaining")
                .recipientRole("REGIONAL_OFFICER")
                .entityId("AICTE-2026-TEST")
                .timestamp("2026-10-26 10:00 AM")
                .build();

        when(notificationRepository.findById("NOTIF-TEST-1")).thenReturn(Optional.of(notif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        NotificationDto result = notificationService.acknowledgeNotification("NOTIF-TEST-1", "Dr. Suresh Nair");

        assertTrue(result.isAcknowledged());
        assertTrue(result.isRead());
        assertEquals("Dr. Suresh Nair", result.getAcknowledgedBy());
        assertNotNull(result.getAcknowledgedAt());

        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Feature 53: Mark related notification action completed")
    void testCompleteNotificationAction() {
        Notification notif = Notification.builder()
                .id("NOTIF-TEST-2")
                .category("APPLICATION_OVERDUE")
                .urgency("CRITICAL")
                .title("SLA Breached")
                .message("Overdue review")
                .recipientRole("REGIONAL_OFFICER")
                .actionRequired(true)
                .timestamp("2026-10-26 10:00 AM")
                .build();

        when(notificationRepository.findById("NOTIF-TEST-2")).thenReturn(Optional.of(notif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationDto result = notificationService.completeNotificationAction("NOTIF-TEST-2", "Dr. Rajesh Sharma");

        assertTrue(result.isActionCompleted());
        assertTrue(result.isAcknowledged());
        assertEquals("Dr. Rajesh Sharma", result.getActionCompletedBy());
        assertNotNull(result.getActionCompletedAt());
    }

    @Test
    @DisplayName("Feature 54: Trigger escalation prevents duplicate active escalation for same entity and level")
    void testTriggerEscalationDeduplication() {
        when(escalationRepository.existsByEntityIdAndLevelAndStatus("AICTE-2026-TEST", "LEVEL_1", "ACTIVE"))
                .thenReturn(true);

        EscalationDto result = notificationService.triggerEscalation(
                "AICTE-2026-TEST", "Test Institute", "LEVEL_1", "Alert", "Dr. Nair", "SLA delay", "AICTE-2026-TEST");

        assertNull(result, "Duplicate active escalation must not be created");
        verify(escalationRepository, never()).save(any(Escalation.class));
    }

    @Test
    @DisplayName("Features 70-73: Explainable risk scoring evaluates overdue application as HIGH risk")
    void testRiskScoringOverdueApplication() {
        Application overdueApp = Application.builder()
                .id("APP-RISK-HIGH")
                .institutionName("Engineering College")
                .institutionCode("1-999999")
                .currentStage("SCRUTINY")
                .status("IN_REVIEW")
                .submissionDate(LocalDate.now().minusDays(35))
                .nextDeadline(LocalDate.now().minusDays(5)) // overdue by 5 days
                .deficiencyCount(2)
                .missingDocCount(1)
                .build();

        RiskAssessmentDto assessment = riskScoringService.evaluateRisk(overdueApp);

        assertEquals("HIGH", assessment.getLevel());
        assertTrue(assessment.getScore() >= 50);
        assertTrue(assessment.isOverdue());
        assertTrue(assessment.getFactors().stream().anyMatch(f -> f.contains("breached by 5 day(s)")));
        assertTrue(assessment.getFactors().stream().anyMatch(f -> f.contains("Multiple deficiency return cycles")));
        assertTrue(assessment.getRecommendedAction().contains("Immediate officer intervention required"));
    }

    @Test
    @DisplayName("Features 70-73: Finalized application receives RESOLVED risk score of 0")
    void testRiskScoringApprovedApplication() {
        Application approvedApp = Application.builder()
                .id("APP-RISK-APPROVED")
                .institutionName("Polytechnic College")
                .institutionCode("1-888888")
                .currentStage("APPROVED")
                .status("APPROVED")
                .submissionDate(LocalDate.now().minusDays(20))
                .nextDeadline(LocalDate.now().plusDays(10))
                .build();

        RiskAssessmentDto assessment = riskScoringService.evaluateRisk(approvedApp);

        assertEquals("RESOLVED", assessment.getLevel());
        assertEquals(0, assessment.getScore());
        assertFalse(assessment.isOverdue());
    }
}
