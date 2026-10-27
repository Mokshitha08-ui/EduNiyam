package in.gov.aicte.approval.compliance;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.dto.ApplicationDocumentDto;
import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.compliance.dto.*;
import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import in.gov.aicte.approval.compliance.service.ComplianceService;
import in.gov.aicte.approval.compliance.service.DocumentService;
import in.gov.aicte.approval.compliance.service.DocumentVerificationService;
import in.gov.aicte.approval.compliance.service.SafeStorageUtil;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplianceAndDocumentVerificationTest {

    @Mock
    private ComplianceItemRepository complianceRepository;
    @Mock
    private ApplicationDocumentRepository documentRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private EscalationRepository escalationRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @TempDir
    Path tempUploadDir;

    private ObjectMapper objectMapper;
    private DocumentVerificationService verificationService;
    private ComplianceService complianceService;
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        verificationService = new DocumentVerificationService(objectMapper);
        ReflectionTestUtils.setField(verificationService, "ocrProvider", "local-pdf-text");
        ReflectionTestUtils.setField(verificationService, "aiProvider", "none");
        ReflectionTestUtils.setField(verificationService, "aiApiKey", "");

        complianceService = new ComplianceService(
                complianceRepository,
                documentRepository,
                institutionRepository,
                notificationRepository,
                escalationRepository,
                auditLogRepository,
                verificationService,
                objectMapper
        );
        ReflectionTestUtils.setField(complianceService, "defaultReminderDays", 30);
        ReflectionTestUtils.setField(complianceService, "uploadDir", tempUploadDir.toString());

        documentService = new DocumentService(
                documentRepository,
                applicationRepository,
                institutionRepository,
                auditLogRepository,
                notificationRepository,
                verificationService,
                objectMapper
        );
        ReflectionTestUtils.setField(documentService, "uploadDir", tempUploadDir.toString());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(String userId, String email, String name, String role, String institutionCode) {
        UserPrincipal principal = new UserPrincipal(
                userId, name, email, "hashed", role, "Compliance Cell", "South-Central", institutionCode,
                institutionCode != null ? "RV College of Engineering" : null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @Test
    void testCreateComplianceObligationAndPreventDuplicate() {
        mockSecurityContext("USR-005", "Vikram.joshi@aicte.gov.in", "Dr. Vikram Joshi", "COMPLIANCE_REVIEWER", null);

        ComplianceCreateRequest req = new ComplianceCreateRequest();
        req.setInstitutionCode("INST-101");
        req.setInstitutionName("RV College of Engineering");
        req.setRegion("South-Western");
        req.setRequirementType("FIRE_SAFETY");
        req.setDocumentName("Fire Safety Certificate 2026-27");
        req.setDueDate(LocalDate.now().plusDays(10));

        when(complianceRepository.existsByInstitutionCodeIgnoreCaseAndRequirementTypeIgnoreCaseAndDocumentNameIgnoreCase(
                eq("INST-101"), eq("FIRE_SAFETY"), eq("Fire Safety Certificate 2026-27")))
                .thenReturn(false);
        when(complianceRepository.save(any(ComplianceItem.class))).thenAnswer(inv -> inv.getArgument(0));

        ComplianceItemDto created = complianceService.createCompliance(req);
        assertNotNull(created.getId());
        assertEquals("PENDING_SUBMISSION", created.getVerificationStatus());
        assertEquals("DUE_SOON", created.getDeadlineStatus());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));

        // Duplicate obligation check
        when(complianceRepository.existsByInstitutionCodeIgnoreCaseAndRequirementTypeIgnoreCaseAndDocumentNameIgnoreCase(
                eq("INST-101"), eq("FIRE_SAFETY"), eq("Fire Safety Certificate 2026-27")))
                .thenReturn(true);
        assertThrows(BadRequestException.class, () -> complianceService.createCompliance(req));
    }

    @Test
    void testUploadComplianceDocumentVersioningAndOcrAnalysis() throws Exception {
        mockSecurityContext("USR-006", "registrar@rvce.edu.in", "Prof. K.N. Subramanya", "COLLEGE_REP", "INST-101");

        ComplianceItem existing = ComplianceItem.builder()
                .id("CMP-901")
                .institutionCode("INST-101")
                .institutionName("RV College of Engineering")
                .region("South-Western")
                .requirementType("FIRE_SAFETY")
                .documentName("Old_Fire_Safety.pdf")
                .version("1.0")
                .verificationStatus("VERIFIED")
                .status("VERIFIED")
                .verifiedBy("Dr. Vikram Joshi")
                .submissionDate(LocalDate.now().minusMonths(6))
                .build();

        when(complianceRepository.findById("CMP-901")).thenReturn(Optional.of(existing));
        when(complianceRepository.save(any(ComplianceItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.findByComplianceId("CMP-901")).thenReturn(Collections.emptyList());

        String pdfContent = "%PDF-1.4\n" +
                "(Institution Name: RV College of Engineering) Tj\n" +
                "(AICTE Code: INST-101) Tj\n" +
                "(Certificate No: FSC-2026-8891) Tj\n" +
                "(Issue Date: 2026-01-15) Tj\n" +
                "(Valid Until: " + LocalDate.now().plusMonths(10) + ") Tj\n" +
                "%%EOF";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "Fire_Safety_Renewed_2026.pdf",
                "application/pdf",
                pdfContent.getBytes(StandardCharsets.UTF_8)
        );

        ComplianceItemDto updated = complianceService.uploadDocument(
                "CMP-901",
                file,
                "We hereby declare our Fire Safety compliance is renewed and valid.",
                LocalDate.of(2026, 1, 15),
                LocalDate.now().plusMonths(10),
                "Renewed certificate uploaded"
        );

        // Versioning incremented & re-review enforced
        assertEquals("1.1", updated.getVersion());
        assertEquals("PENDING_VERIFICATION", updated.getVerificationStatus());
        assertNull(updated.getVerifiedBy());
        assertEquals("VALID", updated.getValidityStatus());
        assertNotNull(updated.getVersionHistoryJson());
        assertTrue(updated.getVersionHistoryJson().contains("Old_Fire_Safety.pdf"));

        // OCR extraction verified without fabrication
        assertEquals("EXTRACTED", updated.getOcrStatus());
        JsonNode ocrNode = objectMapper.readTree(updated.getOcrExtractedJson());
        assertTrue(ocrNode.get("readableTextFound").asBoolean());
        assertEquals("INST-101", ocrNode.get("extractedFields").get("institutionCode").asText());

        // AI advisory status verified as honest
        JsonNode aiNode = objectMapper.readTree(updated.getAiAdvisoryJson());
        assertEquals("PROVIDER_NOT_CONFIGURED", aiNode.get("aiService").get("status").asText());
        assertTrue(aiNode.get("aiService").get("confidenceScore").isNull());
        assertTrue(aiNode.get("advisoryOnly").asBoolean());
        assertTrue(aiNode.get("authoritativeHumanReviewRequired").asBoolean());
    }

    @Test
    void testVerifyComplianceMandatoryRemarksOnRejectionAndCorrection() {
        mockSecurityContext("USR-005", "Vikram.joshi@aicte.gov.in", "Dr. Vikram Joshi", "COMPLIANCE_REVIEWER", null);

        ComplianceItem item = ComplianceItem.builder()
                .id("CMP-902")
                .institutionCode("INST-101")
                .institutionName("RV College of Engineering")
                .documentName("Anti-Ragging Affidavit.pdf")
                .verificationStatus("PENDING_VERIFICATION")
                .status("PENDING_VERIFICATION")
                .build();

        when(complianceRepository.findById("CMP-902")).thenReturn(Optional.of(item));
        when(complianceRepository.save(any(ComplianceItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.findByComplianceId("CMP-902")).thenReturn(Collections.emptyList());

        // Rejecting without reason must fail
        VerifyComplianceRequest rejectWithoutReason = new VerifyComplianceRequest();
        rejectWithoutReason.setStatus("NON_COMPLIANT");
        rejectWithoutReason.setReason("   ");
        assertThrows(BadRequestException.class, () -> complianceService.verifyCompliance("CMP-902", rejectWithoutReason));

        // Correction required with valid remarks succeeds
        VerifyComplianceRequest correctionReq = new VerifyComplianceRequest();
        correctionReq.setStatus("CORRECTION_REQUIRED");
        correctionReq.setReason("Signature of Principal and Notary stamp missing on page 2.");
        ComplianceItemDto result = complianceService.verifyCompliance("CMP-902", correctionReq);
        assertEquals("CORRECTION_REQUIRED", result.getVerificationStatus());
        assertEquals("Dr. Vikram Joshi", result.getVerifiedBy());
        assertEquals("Signature of Principal and Notary stamp missing on page 2.", result.getNotes());
    }

    @Test
    void testInstitutionalIsolationBlocksCrossInstitutionAccess() {
        mockSecurityContext("USR-006", "registrar@rvce.edu.in", "Prof. K.N. Subramanya", "COLLEGE_REP", "INST-101");

        ComplianceItem otherInstItem = ComplianceItem.builder()
                .id("CMP-OTHER")
                .institutionCode("INST-202")
                .institutionName("Other Engineering College")
                .documentName("NBA Certificate.pdf")
                .verificationStatus("VERIFIED")
                .build();

        when(complianceRepository.findById("CMP-OTHER")).thenReturn(Optional.of(otherInstItem));

        assertThrows(AccessDeniedException.class, () -> complianceService.getComplianceById("CMP-OTHER"));
        assertThrows(AccessDeniedException.class, () -> complianceService.downloadComplianceFile("CMP-OTHER"));
    }

    @Test
    void testFileValidationAndPathTraversalProtection() {
        assertThrows(BadRequestException.class, () -> SafeStorageUtil.sanitizeFilename("../../etc/passwd"));
        assertThrows(BadRequestException.class, () -> SafeStorageUtil.readStoredBytes(tempUploadDir.toString(), "../secret.txt"));

        mockSecurityContext("USR-006", "registrar@rvce.edu.in", "Prof. K.N. Subramanya", "COLLEGE_REP", "INST-101");
        ComplianceItem item = ComplianceItem.builder()
                .id("CMP-903")
                .institutionCode("INST-101")
                .institutionName("RV College of Engineering")
                .documentName("Test.pdf")
                .build();
        when(complianceRepository.findById("CMP-903")).thenReturn(Optional.of(item));

        MockMultipartFile exeFile = new MockMultipartFile("file", "malware.exe", "application/octet-stream", new byte[]{1, 2, 3});
        assertThrows(BadRequestException.class,
                () -> complianceService.uploadDocument("CMP-903", exeFile, null, null, null, null));
    }

    @Test
    void testOcrFailureCasesAndDeterministicMismatchChecks() throws Exception {
        // 1. Password protected PDF
        byte[] encryptedPdf = "%PDF-1.4 /Encrypt << /Filter /Standard >> %%EOF".getBytes(StandardCharsets.UTF_8);
        DocumentVerificationService.AnalysisResult encRes = verificationService.analyzeDocument(
                encryptedPdf, "Encrypted.pdf", "PDF", "FIRE_SAFETY", "RV College", "INST-101", null, null);
        assertEquals("PASSWORD_PROTECTED", encRes.getOcrStatus());

        // 2. Scanned image without OCR engine
        byte[] pngHeader = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        DocumentVerificationService.AnalysisResult imgRes = verificationService.analyzeDocument(
                pngHeader, "Scan.png", "IMAGE", "FIRE_SAFETY", "RV College", "INST-101",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 1, 1)); // invalid date range
        assertEquals("SCANNED_IMAGE_NO_OCR_ENGINE", imgRes.getOcrStatus());
        JsonNode aiAdvisory = objectMapper.readTree(imgRes.getAiAdvisoryJson());
        assertTrue(aiAdvisory.get("deterministicChecks").isArray());
        assertTrue(aiAdvisory.toString().contains("INVALID_DATE_RANGE"));
    }

    @Test
    void testRemindersTriggerDeduplicationAndStatistics() {
        ComplianceItem expiringAndOverdue = ComplianceItem.builder()
                .id("CMP-EXP-1")
                .institutionCode("INST-101")
                .institutionName("RV College of Engineering")
                .documentName("Structural Stability Certificate.pdf")
                .verificationStatus("PENDING_SUBMISSION")
                .dueDate(LocalDate.now().minusDays(5))
                .expiryDate(LocalDate.now().plusDays(10))
                .build();

        ComplianceItem compliantItem = ComplianceItem.builder()
                .id("CMP-OK-2")
                .institutionCode("INST-101")
                .institutionName("RV College of Engineering")
                .documentName("Anti-Ragging Undertaking.pdf")
                .verificationStatus("VERIFIED")
                .dueDate(LocalDate.now().plusDays(30))
                .expiryDate(LocalDate.now().plusDays(180))
                .build();

        when(complianceRepository.findAll()).thenReturn(List.of(expiringAndOverdue, compliantItem));
        when(documentRepository.findAll()).thenReturn(Collections.emptyList());

        // Statistics verification
        ComplianceStatisticsDto stats = complianceService.getStatistics(null, null);
        assertEquals(2L, stats.getTotalObligations());
        assertEquals(1L, stats.getCompliantCount());
        assertEquals(1L, stats.getPendingSubmissionCount());
        assertEquals(1L, stats.getOverdueCount());
        assertEquals(1L, stats.getExpiringSoonCount());
        assertEquals(50.0, stats.getCompletionPercentage());

        // First trigger creates notifications & escalations
        when(notificationRepository.existsByEntityIdAndCategoryAndIsReadFalse(anyString(), anyString())).thenReturn(false);
        when(escalationRepository.existsByEntityIdAndStatus(anyString(), eq("ACTIVE"))).thenReturn(false);
        Map<String, Object> firstRun = complianceService.triggerRenewalAndDeadlineReminders(30);
        assertEquals(2, firstRun.get("remindersCreated"));
        assertEquals(1, firstRun.get("escalationsCreated"));
        assertEquals(0, firstRun.get("duplicatesSkipped"));

        // Second trigger deduplicates
        when(notificationRepository.existsByEntityIdAndCategoryAndIsReadFalse(anyString(), anyString())).thenReturn(true);
        when(escalationRepository.existsByEntityIdAndStatus(anyString(), eq("ACTIVE"))).thenReturn(true);
        Map<String, Object> secondRun = complianceService.triggerRenewalAndDeadlineReminders(30);
        assertEquals(0, secondRun.get("remindersCreated"));
        assertEquals(0, secondRun.get("escalationsCreated"));
        assertEquals(2, secondRun.get("duplicatesSkipped"));
    }
}
