package in.gov.aicte.approval.application;

import in.gov.aicte.approval.application.dto.ApplicationDto;
import in.gov.aicte.approval.application.dto.StageAdvanceRequest;
import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.entity.ApplicationStageHistory;
import in.gov.aicte.approval.application.repository.*;
import in.gov.aicte.approval.application.service.ApplicationService;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStageHistoryRepository stageHistoryRepository;

    @Mock
    private ObservationRepository observationRepository;

    @Mock
    private ApplicationDocumentRepository documentRepository;

    @Mock
    private RequestedIntakeRepository intakeRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private Application sampleApp;

    @BeforeEach
    void setUp() {
        sampleApp = Application.builder()
                .id("AICTE-2026-TEST-001")
                .institutionName("Test Engineering College")
                .institutionCode("1-99999999")
                .applicationType("New Technical Institution")
                .region("Northern")
                .state("Delhi NCR")
                .workflowId("WF-FULL")
                .currentStage("SCRUTINY")
                .status("IN_REVIEW")
                .priority("HIGH")
                .assignedOfficer("Dr. Suresh Kumar Nair")
                .submissionDate(LocalDate.now())
                .stageStartDate(LocalDate.now())
                .nextDeadline(LocalDate.now().plusDays(10))
                .deficiencyCount(0)
                .build();
    }

    @Test
    void testGetApplicationById_Success() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        ApplicationDto result = applicationService.getApplicationById("AICTE-2026-TEST-001");

        assertNotNull(result);
        assertEquals("AICTE-2026-TEST-001", result.getId());
        assertEquals("Test Engineering College", result.getInstitutionName());
        verify(applicationRepository, times(1)).findById("AICTE-2026-TEST-001");
    }

    @Test
    void testAdvanceStage_Success() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        StageAdvanceRequest request = StageAdvanceRequest.builder()
                .targetStage("EVC")
                .remarks("Cleared Scrutiny, proceeding to EVC physical visit")
                .build();

        ApplicationDto result = applicationService.advanceStage("AICTE-2026-TEST-001", request);

        assertNotNull(result);
        assertEquals("EVC", sampleApp.getCurrentStage());
        assertEquals("EVC_SCHEDULED", sampleApp.getStatus());
        verify(stageHistoryRepository, times(1)).save(any(ApplicationStageHistory.class));
        verify(auditLogRepository, times(1)).save(any());
    }
}
