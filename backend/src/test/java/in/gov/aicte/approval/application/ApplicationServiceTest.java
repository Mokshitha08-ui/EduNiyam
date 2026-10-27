package in.gov.aicte.approval.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.dto.ApplicationDto;
import in.gov.aicte.approval.application.dto.AssignOfficerRequest;
import in.gov.aicte.approval.application.dto.RequestedIntakeDto;
import in.gov.aicte.approval.application.dto.StageAdvanceRequest;
import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.application.entity.ApplicationStageHistory;
import in.gov.aicte.approval.application.repository.*;
import in.gov.aicte.approval.application.service.ApplicationService;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import in.gov.aicte.approval.workflow.repository.WorkflowDefinitionRepository;
import in.gov.aicte.approval.workflow.service.WorkflowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
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

    @Mock
    private WorkflowDefinitionRepository workflowRepository;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ApplicationService applicationService;

    private Application sampleApp;
    private Application draftApp;
    private WorkflowDefinition sampleWorkflow;

    @BeforeEach
    void setUp() {
        sampleWorkflow = WorkflowDefinition.builder()
                .id("WF-FULL")
                .name("Scrutiny + EVC + SAC/SHC (Comprehensive Pathway)")
                .code("SCRUTINY_EVC_SAC_SHC")
                .version("2026.2.1")
                .isDefault(true)
                .status("ACTIVE")
                .build();

        List<WorkflowStage> stages = List.of(
                WorkflowStage.builder().id("STG-01").workflow(sampleWorkflow).name("Application Submission").code("SUBMISSION").stageOrder(1).targetDays(3).roleAllowed("COLLEGE_REP").isMandatory(true).build(),
                WorkflowStage.builder().id("STG-02").workflow(sampleWorkflow).name("Document Scrutiny").code("SCRUTINY").stageOrder(2).targetDays(7).roleAllowed("REGIONAL_OFFICER").isMandatory(true).build(),
                WorkflowStage.builder().id("STG-03").workflow(sampleWorkflow).name("EVC Physical Inspection").code("EVC").stageOrder(3).targetDays(10).roleAllowed("EVC_MEMBER").isMandatory(true).build(),
                WorkflowStage.builder().id("STG-04").workflow(sampleWorkflow).name("SAC / SHC Hearing Committee").code("SAC_SHC").stageOrder(4).targetDays(5).roleAllowed("BUREAU_OFFICER").isMandatory(true).build(),
                WorkflowStage.builder().id("STG-05").workflow(sampleWorkflow).name("Executive Council Final Decision").code("FINAL_APPROVAL").stageOrder(5).targetDays(5).roleAllowed("ADMIN").isMandatory(true).build()
        );
        sampleWorkflow.setStages(stages);

        when(workflowRepository.findById("WF-FULL")).thenReturn(Optional.of(sampleWorkflow));
        when(workflowService.resolveWorkflowIdForApplicationType(any())).thenReturn("WF-FULL");

        sampleApp = Application.builder()
                .id("AICTE-2026-TEST-001")
                .institutionName("Test Engineering College")
                .institutionCode("1-99999999")
                .applicationType("New Technical Institution")
                .programme("Engineering & Technology")
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

        draftApp = Application.builder()
                .id("AICTE-APP-2026-000100")
                .institutionName("Test Engineering College")
                .institutionCode("1-99999999")
                .applicationType("Extension of Approval (EoA)")
                .programme("Engineering & Technology")
                .region("Northern")
                .state("Delhi NCR")
                .workflowId("WF-FULL")
                .currentStage("DRAFT")
                .status("DRAFT")
                .priority("NORMAL")
                .stageStartDate(LocalDate.now())
                .nextDeadline(LocalDate.now().plusDays(30))
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

    @Test
    void testAdvanceStage_SkippingMandatoryStageRejected() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        // Attempting to jump from SCRUTINY to FINAL_APPROVAL skipping mandatory EVC and SAC_SHC
        StageAdvanceRequest request = StageAdvanceRequest.builder()
                .targetStage("FINAL_APPROVAL")
                .remarks("Attempting to bypass EVC inspection")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.advanceStage("AICTE-2026-TEST-001", request);
        });

        assertTrue(ex.getMessage().contains("Mandatory statutory stage 'EVC Physical Inspection' cannot be skipped"));
    }

    @Test
    void testAdvanceStage_TerminalStatusRejected() {
        sampleApp.setStatus("APPROVED");
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        StageAdvanceRequest request = StageAdvanceRequest.builder()
                .targetStage("EVC")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.advanceStage("AICTE-2026-TEST-001", request);
        });

        assertTrue(ex.getMessage().contains("terminal state 'APPROVED'"));
    }

    @Test
    void testCreateDraftApplication_Success() {
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));
        when(applicationRepository.findById(anyString())).thenReturn(Optional.of(draftApp));

        ApplicationDto dto = ApplicationDto.builder()
                .institutionName("Test Engineering College")
                .institutionCode("1-99999999")
                .applicationType("Extension of Approval (EoA)")
                .status("DRAFT")
                .requestedIntake(List.of(
                        RequestedIntakeDto.builder().course("Computer Science").currentIntake(60).proposedIntake(120).build()
                ))
                .build();

        ApplicationDto result = applicationService.createApplication(dto);

        assertNotNull(result);
        assertEquals("DRAFT", result.getStatus());
        verify(applicationRepository, times(1)).save(any(Application.class));
        verify(intakeRepository, times(1)).save(any());
        verify(stageHistoryRepository, times(1)).save(any());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testCreateApplication_DuplicateActivePrevented() {
        when(applicationRepository.existsByInstitutionCodeAndApplicationTypeAndStatusIn(anyString(), anyString(), anyCollection()))
                .thenReturn(true);

        ApplicationDto dto = ApplicationDto.builder()
                .institutionName("Test Engineering College")
                .institutionCode("1-99999999")
                .applicationType("New Technical Institution")
                .status("SUBMITTED")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.createApplication(dto);
        });

        assertTrue(ex.getMessage().contains("already in progress"));
    }

    @Test
    void testUpdateDraftApplication_Success() {
        when(applicationRepository.findById("AICTE-APP-2026-000100")).thenReturn(Optional.of(draftApp));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationDto updateDto = ApplicationDto.builder()
                .programme("Engineering & Technology - Post Graduate")
                .priority("HIGH")
                .build();

        ApplicationDto result = applicationService.updateApplicationDraft("AICTE-APP-2026-000100", updateDto);

        assertNotNull(result);
        assertEquals("Engineering & Technology - Post Graduate", draftApp.getProgramme());
        assertEquals("HIGH", draftApp.getPriority());
        verify(applicationRepository, times(1)).save(draftApp);
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testUpdateDraftApplication_CannotEditSubmitted() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        ApplicationDto updateDto = ApplicationDto.builder()
                .programme("Engineering & Technology - PG")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.updateApplicationDraft("AICTE-2026-TEST-001", updateDto);
        });

        assertTrue(ex.getMessage().contains("Only DRAFT applications can be modified"));
    }

    @Test
    void testSubmitApplication_Success() {
        when(applicationRepository.findById("AICTE-APP-2026-000100")).thenReturn(Optional.of(draftApp));
        when(applicationRepository.existsByInstitutionCodeAndApplicationTypeAndStatusIn(anyString(), anyString(), anyCollection()))
                .thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationDocument doc1 = ApplicationDocument.builder().id("DOC-1").documentCode("DOC-EOA-PREV").title("Previous EoA").build();
        ApplicationDocument doc2 = ApplicationDocument.builder().id("DOC-2").documentCode("DOC-EOA-SAFETY").title("Fire Safety").build();
        ApplicationDocument doc3 = ApplicationDocument.builder().id("DOC-3").documentCode("DOC-EOA-FIN").title("Financial Statement").build();
        when(documentRepository.findByApplicationId(anyString())).thenReturn(List.of(doc1, doc2, doc3));

        ApplicationDto result = applicationService.submitApplication("AICTE-APP-2026-000100");

        assertNotNull(result);
        assertEquals("IN_REVIEW", draftApp.getStatus());
        assertEquals("SCRUTINY", draftApp.getCurrentStage());
        assertNotNull(draftApp.getSubmissionDate());
        verify(stageHistoryRepository, times(1)).save(any(ApplicationStageHistory.class));
        verify(auditLogRepository, times(1)).save(any());
        verify(notificationRepository, atLeastOnce()).save(any());
    }

    @Test
    void testSubmitApplication_MissingMandatoryDocuments_ThrowsBadRequest() {
        when(applicationRepository.findById("AICTE-APP-2026-000100")).thenReturn(Optional.of(draftApp));
        when(applicationRepository.existsByInstitutionCodeAndApplicationTypeAndStatusIn(anyString(), anyString(), anyCollection()))
                .thenReturn(false);
        when(documentRepository.findByApplicationId(anyString())).thenReturn(List.of());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication("AICTE-APP-2026-000100");
        });

        assertTrue(ex.getMessage().contains("Mandatory statutory document(s) missing"));
    }

    @Test
    void testSubmitApplication_AlreadySubmittedRejected() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication("AICTE-2026-TEST-001");
        });

        assertTrue(ex.getMessage().contains("Only DRAFT applications can be submitted"));
    }

    @Test
    void testAssignOfficer_Success() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        User officer = User.builder()
                .id("USR-002")
                .name("Dr. Suresh Kumar Nair")
                .role("REGIONAL_OFFICER")
                .status("ACTIVE")
                .region("Northern")
                .build();

        when(userRepository.findByIdAndStatus("USR-002", "ACTIVE")).thenReturn(Optional.of(officer));

        AssignOfficerRequest req = AssignOfficerRequest.builder()
                .officerId("USR-002")
                .officerName("Dr. Suresh Kumar Nair")
                .reason("Regional scrutiny allocation")
                .build();

        ApplicationDto result = applicationService.assignOfficer("AICTE-2026-TEST-001", req);

        assertNotNull(result);
        assertEquals("Dr. Suresh Kumar Nair", sampleApp.getAssignedOfficer());
        assertEquals("USR-002", sampleApp.getAssignedOfficerId());
        verify(auditLogRepository, times(1)).save(any());
        verify(notificationRepository, times(1)).save(any());
    }

    @Test
    void testAssignOfficer_CollegeRepRejected() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        User collegeUser = User.builder()
                .id("USR-006")
                .name("Dr. College Rep")
                .role("COLLEGE_REP")
                .status("ACTIVE")
                .build();

        when(userRepository.findByIdAndStatus("USR-006", "ACTIVE")).thenReturn(Optional.of(collegeUser));

        AssignOfficerRequest req = AssignOfficerRequest.builder()
                .officerId("USR-006")
                .officerName("Dr. College Rep")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.assignOfficer("AICTE-2026-TEST-001", req);
        });

        assertTrue(ex.getMessage().contains("College representatives cannot be assigned"));
    }

    @Test
    void testDeleteDraft_Success() {
        when(applicationRepository.findById("AICTE-APP-2026-000100")).thenReturn(Optional.of(draftApp));

        applicationService.deleteDraft("AICTE-APP-2026-000100");

        verify(applicationRepository, times(1)).delete(draftApp);
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testDeleteDraft_CannotDeleteSubmitted() {
        when(applicationRepository.findById("AICTE-2026-TEST-001")).thenReturn(Optional.of(sampleApp));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            applicationService.deleteDraft("AICTE-2026-TEST-001");
        });

        assertTrue(ex.getMessage().contains("Only DRAFT applications can be deleted"));
    }
}
