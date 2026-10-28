package in.gov.aicte.approval.compliance.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.dto.ApplicationDocumentDto;
import in.gov.aicte.approval.application.entity.Application;
import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.security.UserPrincipal;
import in.gov.aicte.approval.compliance.dto.VerifyComplianceRequest;
import in.gov.aicte.approval.compliance.dto.DocumentFieldsUpdateRequest;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg");

    private final ApplicationDocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final DocumentVerificationService verificationService;
    private final ObjectMapper objectMapper;

    @Value("${app.storage.upload-dir:./uploads/aicte-documents}")
    private String uploadDir;

    public DocumentService(
            ApplicationDocumentRepository documentRepository,
            ApplicationRepository applicationRepository,
            InstitutionRepository institutionRepository,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository,
            DocumentVerificationService verificationService,
            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.applicationRepository = applicationRepository;
        this.institutionRepository = institutionRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.verificationService = verificationService;
        this.objectMapper = objectMapper;
    }

    private UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    private String resolveDocumentInstitutionCode(ApplicationDocument doc) {
        if (doc.getInstitutionCode() != null && !doc.getInstitutionCode().isBlank()) {
            return doc.getInstitutionCode();
        }
        if (doc.getApplication() != null && doc.getApplication().getInstitutionCode() != null) {
            return doc.getApplication().getInstitutionCode();
        }
        return null;
    }

    private void verifyInstitutionAccess(String institutionCode) {
        UserPrincipal principal = getCurrentPrincipal();
        if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
            String userInst = principal.getInstitutionCode();
            if (userInst == null || institutionCode == null || !userInst.equalsIgnoreCase(institutionCode)) {
                throw new AccessDeniedException("College Representative may only access documents belonging to their own institution.");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ApplicationDocumentDto> listDocuments(
            String applicationId,
            String complianceId,
            String institutionCode,
            String status,
            String validityStatus) {

        List<ApplicationDocument> all = documentRepository.findAll();
        UserPrincipal principal = getCurrentPrincipal();

        return all.stream()
                .filter(doc -> {
                    String docInstCode = resolveDocumentInstitutionCode(doc);
                    if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
                        String userInst = principal.getInstitutionCode();
                        if (userInst == null || docInstCode == null || !userInst.equalsIgnoreCase(docInstCode)) {
                            return false;
                        }
                    }
                    if (applicationId != null && !applicationId.isBlank()) {
                        String appId = doc.getApplication() != null ? doc.getApplication().getId() : null;
                        if (appId == null || !applicationId.trim().equalsIgnoreCase(appId)) {
                            return false;
                        }
                    }
                    if (complianceId != null && !complianceId.isBlank()) {
                        if (doc.getComplianceId() == null || !complianceId.trim().equalsIgnoreCase(doc.getComplianceId())) {
                            return false;
                        }
                    }
                    if (institutionCode != null && !institutionCode.isBlank() && !"ALL".equalsIgnoreCase(institutionCode.trim())) {
                        if (docInstCode == null || !institutionCode.trim().equalsIgnoreCase(docInstCode)) {
                            return false;
                        }
                    }
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
                        if (doc.getStatus() == null || !status.trim().equalsIgnoreCase(doc.getStatus())) {
                            return false;
                        }
                    }
                    if (validityStatus != null && !validityStatus.isBlank() && !"ALL".equalsIgnoreCase(validityStatus.trim())) {
                        ApplicationDocumentDto dto = ApplicationDocumentDto.fromEntity(doc);
                        if (!validityStatus.trim().equalsIgnoreCase(dto.getValidityStatus())) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(ApplicationDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDocumentDto getDocumentById(String id) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));
        verifyInstitutionAccess(resolveDocumentInstitutionCode(doc));
        return ApplicationDocumentDto.fromEntity(doc);
    }

    @Transactional
    public ApplicationDocumentDto uploadOrReplaceDocument(
            MultipartFile file,
            String documentId,
            String applicationId,
            String complianceId,
            String institutionCode,
            String institutionName,
            String title,
            LocalDate issueDate,
            LocalDate expiryDate) {
        return uploadOrReplaceDocument(file, documentId, null, applicationId, complianceId, institutionCode, institutionName, title, issueDate, expiryDate);
    }

    @Transactional
    public ApplicationDocumentDto uploadOrReplaceDocument(
            MultipartFile file,
            String documentId,
            String documentCode,
            String applicationId,
            String complianceId,
            String institutionCode,
            String institutionName,
            String title,
            LocalDate issueDate,
            LocalDate expiryDate) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded document file cannot be empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Document file size exceeds maximum limit of 10 MB.");
        }

        String safeFileName = SafeStorageUtil.sanitizeFilename(file.getOriginalFilename());
        String ext = SafeStorageUtil.getExtension(safeFileName);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Unsupported file type '." + ext + "'. Allowed types: PDF, PNG, JPG, JPEG.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded file stream.");
        }

        UserPrincipal principal = getCurrentPrincipal();
        String actor = principal != null ? principal.getName() : "Authorized User";
        String actorRole = principal != null ? principal.getRole() : "COLLEGE_REP";

        Application linkedApp = null;
        if (applicationId != null && !applicationId.isBlank()) {
            linkedApp = applicationRepository.findById(applicationId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));
        }

        String resolvedInstCode = institutionCode != null && !institutionCode.isBlank()
                ? institutionCode.trim()
                : (linkedApp != null ? linkedApp.getInstitutionCode()
                : (principal != null ? principal.getInstitutionCode() : null));

        if (resolvedInstCode == null || resolvedInstCode.isBlank()) {
            throw new BadRequestException("Institution code or valid applicationId is required to associate the document.");
        }
        verifyInstitutionAccess(resolvedInstCode);

        String resolvedInstName = institutionName;
        if ((resolvedInstName == null || resolvedInstName.isBlank()) && linkedApp != null) {
            resolvedInstName = linkedApp.getInstitutionName();
        }
        if (resolvedInstName == null || resolvedInstName.isBlank()) {
            Optional<Institution> instOpt = institutionRepository.findByCode(resolvedInstCode);
            resolvedInstName = instOpt.map(Institution::getName).orElse(resolvedInstCode);
        }

        ApplicationDocument doc = null;
        boolean isReplacement = false;
        if (documentId != null && !documentId.isBlank()) {
            doc = documentRepository.findById(documentId.trim()).orElse(null);
            if (doc != null) {
                verifyInstitutionAccess(resolveDocumentInstitutionCode(doc));
                isReplacement = true;
            }
        }

        if (doc == null) {
            String newId = (documentId != null && !documentId.isBlank())
                    ? documentId.trim()
                    : "DOC-" + (10000 + new Random().nextInt(89999));
            doc = ApplicationDocument.builder()
                    .id(newId)
                    .version("1.0")
                    .build();
        } else {
            appendVersionHistory(doc, actor);
            doc.setVersion(incrementVersion(doc.getVersion()));
        }

        String storageKey = SafeStorageUtil.storeBytes(uploadDir, "documents", doc.getId(), safeFileName, bytes);
        String resolvedTitle = (title != null && !title.isBlank()) ? title.trim() : safeFileName;
        String docType = "pdf".equalsIgnoreCase(ext) ? "PDF" : "IMAGE";

        doc.setApplication(linkedApp);
        if (complianceId != null && !complianceId.isBlank()) {
            doc.setComplianceId(complianceId.trim());
        }
        if (documentCode != null && !documentCode.isBlank()) {
            doc.setDocumentCode(documentCode.trim());
        }
        doc.setInstitutionCode(resolvedInstCode);
        doc.setInstitutionName(resolvedInstName);
        doc.setTitle(resolvedTitle);
        doc.setType(docType);
        doc.setSize(formatBytes(file.getSize()));
        doc.setStorageKey(storageKey);
        doc.setFileUrl("/api/v1/documents/" + doc.getId() + "/download");
        doc.setUploadedBy(actor);
        doc.setUploadDate(LocalDate.now());
        if (issueDate != null) doc.setIssueDate(issueDate);
        if (expiryDate != null) doc.setExpiryDate(expiryDate);

        // Uploading a new version or new document requires human review
        doc.setStatus("PENDING_VERIFICATION");
        doc.setVerifiedBy(null);
        doc.setVerifiedAt(null);

        DocumentVerificationService.AnalysisResult analysis = verificationService.analyzeDocument(
                bytes,
                safeFileName,
                docType,
                resolvedTitle,
                resolvedInstName,
                resolvedInstCode,
                doc.getIssueDate(),
                doc.getExpiryDate()
        );
        doc.setOcrStatus(analysis.getOcrStatus());
        doc.setOcrExtractedJson(analysis.getOcrExtractedJson());
        doc.setAiAdvisoryJson(analysis.getAiAdvisoryJson());

        ApplicationDocument saved = documentRepository.save(doc);

        if (linkedApp != null) {
            Notification reviewNotif = Notification.builder()
                    .id("NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .category("DOCUMENT_UPLOADED")
                    .urgency("NORMAL")
                    .title("Application Document Uploaded: " + resolvedTitle)
                    .message("Institution " + resolvedInstName + " (" + resolvedInstCode + ") uploaded document '" + resolvedTitle
                            + "' for application " + linkedApp.getId() + ".")
                    .entityType("APPLICATION")
                    .entityId(linkedApp.getId())
                    .institutionCode(resolvedInstCode)
                    .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                    .isRead(false)
                    .recipientRole("REGIONAL_OFFICER")
                    .actionRequired(true)
                    .link("/applications/" + linkedApp.getId())
                    .build();
            notificationRepository.save(reviewNotif);
        }

        recordAudit(saved.getId(), actor, actorRole,
                isReplacement ? "DOCUMENT_VERSION_REPLACED" : "DOCUMENT_UPLOADED",
                isReplacement ? "REPLACED" : "NONE",
                "PENDING_VERIFICATION",
                (isReplacement ? "Replaced with v" + saved.getVersion() : "Uploaded v" + saved.getVersion())
                        + " document: " + resolvedTitle + " (OCR: " + analysis.getOcrStatus() + ")");

        return ApplicationDocumentDto.fromEntity(saved);
    }

    @Transactional
    public ApplicationDocumentDto verifyDocument(String id, VerifyComplianceRequest request) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));

        String rawDecision = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus().trim().toUpperCase()
                : "VERIFIED";

        boolean requiresRemarks = "REJECTED".equals(rawDecision)
                || "NON_COMPLIANT".equals(rawDecision)
                || "CORRECTION_REQUIRED".equals(rawDecision)
                || "ACTION_REQUIRED".equals(rawDecision);

        if (requiresRemarks && (request.getReason() == null || request.getReason().isBlank())) {
            throw new BadRequestException("Reviewer remarks / justification are mandatory when rejecting a document or requesting corrections.");
        }

        UserPrincipal principal = getCurrentPrincipal();
        String reviewerName = principal != null ? principal.getName() : "Compliance Reviewer";
        String reviewerRole = principal != null ? principal.getRole() : "COMPLIANCE_REVIEWER";

        String prevState = doc.getStatus();
        doc.setStatus(rawDecision);
        doc.setVerifiedBy(reviewerName);
        doc.setVerifiedAt(LocalDateTime.now());
        if (request.getReason() != null && !request.getReason().isBlank()) {
            doc.setVerificationRemarks(request.getReason().trim());
        }

        // Apply any manual field corrections supplied by reviewer
        if (request.getCorrectedInstitutionName() != null || request.getCorrectedInstitutionCode() != null
                || request.getCorrectedIssueDate() != null || request.getCorrectedExpiryDate() != null
                || request.getCorrectedDocumentNumber() != null) {
            applyOcrCorrections(doc, request.getCorrectedInstitutionName(), request.getCorrectedInstitutionCode(),
                    request.getCorrectedDocumentNumber(), request.getCorrectedIssueDate(), request.getCorrectedExpiryDate(), reviewerName);
            if (request.getCorrectedInstitutionName() != null && !request.getCorrectedInstitutionName().isBlank()) {
                doc.setInstitutionName(request.getCorrectedInstitutionName().trim());
            }
            if (request.getCorrectedInstitutionCode() != null && !request.getCorrectedInstitutionCode().isBlank()) {
                doc.setInstitutionCode(request.getCorrectedInstitutionCode().trim());
            }
            if (request.getCorrectedIssueDate() != null) {
                doc.setIssueDate(request.getCorrectedIssueDate());
            }
            if (request.getCorrectedExpiryDate() != null) {
                doc.setExpiryDate(request.getCorrectedExpiryDate());
            }
        }

        ApplicationDocument saved = documentRepository.save(doc);

        String instCode = resolveDocumentInstitutionCode(saved);
        recordAudit(saved.getId(), reviewerName, reviewerRole, "DOCUMENT_MANUALLY_VERIFIED",
                prevState, rawDecision,
                request.getReason() != null ? request.getReason() : "Document verified by " + reviewerName);

        Notification notif = Notification.builder()
                .id("NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .category("DOCUMENT_VERIFICATION")
                .urgency(requiresRemarks ? "HIGH" : "NORMAL")
                .title("Document Decision (" + rawDecision + "): " + saved.getTitle())
                .message("Document '" + saved.getTitle() + "' was marked " + rawDecision + " by " + reviewerName
                        + ". Remarks: " + (request.getReason() != null ? request.getReason() : "Verified"))
                .entityType("DOCUMENT")
                .entityId(saved.getId())
                .institutionCode(instCode)
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole("COLLEGE_REP")
                .actionRequired(requiresRemarks)
                .link(saved.getApplication() != null ? "/applications/" + saved.getApplication().getId() : "/compliance")
                .build();
        notificationRepository.save(notif);

        return ApplicationDocumentDto.fromEntity(saved);
    }

    @Transactional
    public ApplicationDocumentDto updateExtractedFields(String id, DocumentFieldsUpdateRequest request) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));
        String instCode = resolveDocumentInstitutionCode(doc);
        verifyInstitutionAccess(instCode);

        UserPrincipal principal = getCurrentPrincipal();
        String reviewerName = principal != null ? principal.getName() : "Compliance Officer";
        String reviewerRole = principal != null ? principal.getRole() : "COMPLIANCE_REVIEWER";

        if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Access denied: Only authorised AICTE scrutiny officers can correct extracted fields.");
        }

        StringBuilder changes = new StringBuilder();
        if (request.getInstitutionName() != null && !request.getInstitutionName().isBlank()) {
            doc.setInstitutionName(request.getInstitutionName().trim());
            changes.append("InstitutionName='").append(request.getInstitutionName().trim()).append("'; ");
        }
        if (request.getInstitutionCode() != null && !request.getInstitutionCode().isBlank()) {
            doc.setInstitutionCode(request.getInstitutionCode().trim());
            changes.append("InstitutionCode='").append(request.getInstitutionCode().trim()).append("'; ");
        }
        if (request.getIssueDate() != null) {
            doc.setIssueDate(request.getIssueDate());
            changes.append("IssueDate='").append(request.getIssueDate()).append("'; ");
        }
        if (request.getExpiryDate() != null) {
            doc.setExpiryDate(request.getExpiryDate());
            changes.append("ExpiryDate='").append(request.getExpiryDate()).append("'; ");
        }

        applyOcrCorrections(doc, request.getInstitutionName(), request.getInstitutionCode(),
                request.getDocumentNumber(), request.getIssueDate(), request.getExpiryDate(), reviewerName);

        // Re-evaluate deterministic analysis with corrected metadata
        byte[] bytes = SafeStorageUtil.readStoredBytes(uploadDir, doc.getStorageKey());
        if (bytes != null && bytes.length > 0) {
            DocumentVerificationService.AnalysisResult analysis = verificationService.analyzeDocument(
                    bytes,
                    doc.getTitle(),
                    doc.getType(),
                    doc.getTitle(),
                    doc.getInstitutionName(),
                    doc.getInstitutionCode(),
                    doc.getIssueDate(),
                    doc.getExpiryDate()
            );
            doc.setAiAdvisoryJson(analysis.getAiAdvisoryJson());
        }

        ApplicationDocument saved = documentRepository.save(doc);

        recordAudit(saved.getId(), reviewerName, reviewerRole, "DOCUMENT_FIELDS_CORRECTED",
                "ORIGINAL_OCR", "MANUALLY_CORRECTED",
                "Extracted fields manually corrected by " + reviewerName + ": " + changes + (request.getRemarks() != null ? " Remarks: " + request.getRemarks() : ""));

        return ApplicationDocumentDto.fromEntity(saved);
    }

    @SuppressWarnings("unchecked")
    private void applyOcrCorrections(ApplicationDocument doc, String instName, String instCode, String docNo,
                                     LocalDate issueDate, LocalDate expiryDate, String reviewerName) {
        try {
            Map<String, Object> ocrMap = doc.getOcrExtractedJson() != null
                    ? objectMapper.readValue(doc.getOcrExtractedJson(), new TypeReference<Map<String, Object>>() {})
                    : new LinkedHashMap<>();
            Map<String, Object> fields = (Map<String, Object>) ocrMap.computeIfAbsent("extractedFields", k -> new LinkedHashMap<String, Object>());
            if (instName != null && !instName.isBlank()) fields.put("institutionName", instName.trim());
            if (instCode != null && !instCode.isBlank()) fields.put("institutionCode", instCode.trim());
            if (docNo != null && !docNo.isBlank()) fields.put("documentNumber", docNo.trim());
            if (issueDate != null) fields.put("issueDate", issueDate.toString());
            if (expiryDate != null) fields.put("expiryDate", expiryDate.toString());

            ocrMap.put("manuallyCorrected", true);
            ocrMap.put("correctedBy", reviewerName);
            ocrMap.put("correctedAt", LocalDateTime.now().toString());
            doc.setOcrExtractedJson(objectMapper.writeValueAsString(ocrMap));
        } catch (Exception ignored) {
        }
    }

    @Transactional
    public void deleteDocument(String id) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));
        String instCode = resolveDocumentInstitutionCode(doc);
        verifyInstitutionAccess(instCode);

        UserPrincipal principal = getCurrentPrincipal();
        if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
            if (doc.getApplication() != null && !"DRAFT".equalsIgnoreCase(doc.getApplication().getStatus())) {
                throw new BadRequestException("Cannot delete documents for application in status " + doc.getApplication().getStatus() + ". Only DRAFT documents can be removed.");
            }
        }

        recordAudit(doc.getId(), principal != null ? principal.getName() : "System",
                principal != null ? principal.getRole() : "COLLEGE_REP",
                "DOCUMENT_DELETED", doc.getStatus(), "DELETED",
                "Document '" + doc.getTitle() + "' removed.");

        documentRepository.delete(doc);
    }

    @Transactional
    public ApplicationDocumentDto analyzeDocument(String id) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));
        String instCode = resolveDocumentInstitutionCode(doc);
        verifyInstitutionAccess(instCode);

        byte[] bytes = SafeStorageUtil.readStoredBytes(uploadDir, doc.getStorageKey());
        DocumentVerificationService.AnalysisResult analysis = verificationService.analyzeDocument(
                bytes,
                doc.getTitle(),
                doc.getType(),
                doc.getTitle(),
                doc.getInstitutionName(),
                instCode,
                doc.getIssueDate(),
                doc.getExpiryDate()
        );
        doc.setOcrStatus(analysis.getOcrStatus());
        doc.setOcrExtractedJson(analysis.getOcrExtractedJson());
        doc.setAiAdvisoryJson(analysis.getAiAdvisoryJson());

        ApplicationDocument saved = documentRepository.save(doc);
        return ApplicationDocumentDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public byte[] downloadDocument(String id) {
        ApplicationDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", id));
        String instCode = resolveDocumentInstitutionCode(doc);
        verifyInstitutionAccess(instCode);

        byte[] stored = SafeStorageUtil.readStoredBytes(uploadDir, doc.getStorageKey());
        if (stored != null && stored.length > 0) {
            return stored;
        }
        return SafeStorageUtil.generateStatutoryPdfSummary(
                doc.getId(),
                doc.getTitle(),
                doc.getInstitutionName() != null ? doc.getInstitutionName() : (doc.getApplication() != null ? doc.getApplication().getInstitutionName() : "N/A"),
                instCode,
                doc.getType(),
                doc.getVersion(),
                doc.getStatus(),
                doc.getIssueDate(),
                doc.getExpiryDate(),
                doc.getVerificationRemarks()
        );
    }

    private void appendVersionHistory(ApplicationDocument doc, String replacedBy) {
        try {
            List<Map<String, Object>> history = new ArrayList<>();
            if (doc.getVersionHistoryJson() != null && !doc.getVersionHistoryJson().isBlank()) {
                history = objectMapper.readValue(doc.getVersionHistoryJson(), new TypeReference<List<Map<String, Object>>>() {});
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("version", doc.getVersion() != null ? doc.getVersion() : "1.0");
            entry.put("title", doc.getTitle());
            entry.put("size", doc.getSize());
            entry.put("uploadDate", doc.getUploadDate() != null ? doc.getUploadDate().toString() : null);
            entry.put("uploadedBy", doc.getUploadedBy());
            entry.put("status", doc.getStatus());
            entry.put("verifiedBy", doc.getVerifiedBy());
            entry.put("verificationRemarks", doc.getVerificationRemarks());
            entry.put("archivedAt", LocalDateTime.now().toString());
            entry.put("replacedBy", replacedBy);
            history.add(entry);
            doc.setVersionHistoryJson(objectMapper.writeValueAsString(history));
        } catch (Exception ignored) {
        }
    }

    private String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isBlank()) {
            return "1.0";
        }
        try {
            String numeric = currentVersion.replaceAll("[^0-9.]", "");
            if (numeric.isEmpty()) return "1.1";
            double v = Double.parseDouble(numeric);
            return String.format(Locale.US, "%.1f", v + 0.1);
        } catch (NumberFormatException e) {
            return "1.1";
        }
    }

    private String formatBytes(long bytes) {
        if (bytes >= 1024 * 1024) {
            return String.format(Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0));
        }
        return Math.max(1, bytes / 1024) + " KB";
    }

    private void recordAudit(String entityId, String user, String role, String action, String prevState, String newState, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .userName(user != null ? user : "Authorized User")
                .role(role != null ? role : "COMPLIANCE_REVIEWER")
                .entityId(entityId)
                .action(action)
                .previousState(prevState)
                .newState(newState)
                .reason(reason)
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(auditLog);
    }
}
