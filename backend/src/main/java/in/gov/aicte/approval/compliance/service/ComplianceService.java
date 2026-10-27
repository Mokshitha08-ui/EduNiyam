package in.gov.aicte.approval.compliance.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.entity.ApplicationDocument;
import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.compliance.dto.*;
import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplianceService {

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L; // 10 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg");
    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    private final ComplianceItemRepository complianceRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final InstitutionRepository institutionRepository;
    private final NotificationRepository notificationRepository;
    private final EscalationRepository escalationRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentVerificationService verificationService;
    private final ObjectMapper objectMapper;

    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.compliance.reminder-days:30}")
    private int defaultReminderDays;

    public ComplianceService(
            ComplianceItemRepository complianceRepository,
            ApplicationDocumentRepository documentRepository,
            InstitutionRepository institutionRepository,
            NotificationRepository notificationRepository,
            EscalationRepository escalationRepository,
            AuditLogRepository auditLogRepository,
            DocumentVerificationService verificationService,
            ObjectMapper objectMapper) {
        this.complianceRepository = complianceRepository;
        this.documentRepository = documentRepository;
        this.institutionRepository = institutionRepository;
        this.notificationRepository = notificationRepository;
        this.escalationRepository = escalationRepository;
        this.auditLogRepository = auditLogRepository;
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

    private void verifyInstitutionAccess(String itemInstitutionCode) {
        UserPrincipal principal = getCurrentPrincipal();
        if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole())) {
            if (principal.getInstitutionCode() == null || !principal.getInstitutionCode().equalsIgnoreCase(itemInstitutionCode)) {
                throw new AccessDeniedException("Access denied: You cannot access or modify compliance records belonging to another institution.");
            }
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplianceItemDto> getAllCompliance(
            int page, int size, String status, String region, String type,
            String institutionCode, String reviewer, String search,
            LocalDate dueDateFrom, LocalDate dueDateTo) {

        Specification<ComplianceItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            UserPrincipal principal = getCurrentPrincipal();
            if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                predicates.add(cb.equal(root.get("institutionCode"), principal.getInstitutionCode()));
            } else if (institutionCode != null && !institutionCode.isBlank()) {
                predicates.add(cb.equal(root.get("institutionCode"), institutionCode.trim()));
            }

            if (region != null && !region.isBlank() && !"ALL".equalsIgnoreCase(region.trim())) {
                predicates.add(cb.equal(root.get("region"), region.trim()));
            }
            if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type.trim())) {
                predicates.add(cb.equal(root.get("requirementType"), type.trim()));
            }
            if (reviewer != null && !reviewer.isBlank() && !"ALL".equalsIgnoreCase(reviewer.trim())) {
                predicates.add(cb.like(cb.lower(root.get("assignedReviewer")), "%" + reviewer.trim().toLowerCase() + "%"));
            }
            if (search != null && !search.isBlank()) {
                String pat = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("institutionName")), pat),
                        cb.like(cb.lower(root.get("documentName")), pat),
                        cb.like(cb.lower(root.get("id")), pat),
                        cb.like(cb.lower(root.get("requirementType")), pat)
                ));
            }
            if (dueDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom));
            }
            if (dueDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<ComplianceItemDto> allMatching = complianceRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "dueDate"))
                .stream()
                .map(ComplianceItemDto::fromEntity)
                .filter(dto -> matchesStatusFilter(dto, status))
                .collect(Collectors.toList());

        int total = allMatching.size();
        int fromIdx = Math.min(page * size, total);
        int toIdx = Math.min(fromIdx + size, total);
        List<ComplianceItemDto> pageContent = allMatching.subList(fromIdx, toIdx);

        return PageResponse.of(pageContent, total, page, Math.max(size, 1));
    }

    private boolean matchesStatusFilter(ComplianceItemDto dto, String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter.trim())) {
            return true;
        }
        String f = statusFilter.trim().toUpperCase();
        return switch (f) {
            case "OVERDUE" -> "OVERDUE".equalsIgnoreCase(dto.getDeadlineStatus()) || "OVERDUE".equalsIgnoreCase(dto.getStatus());
            case "EXPIRING_SOON" -> "EXPIRING_SOON".equalsIgnoreCase(dto.getValidityStatus()) || "EXPIRING_SOON".equalsIgnoreCase(dto.getStatus());
            case "EXPIRED" -> "EXPIRED".equalsIgnoreCase(dto.getValidityStatus());
            case "VERIFIED", "COMPLIANT" -> "VERIFIED".equalsIgnoreCase(dto.getVerificationStatus()) || "COMPLIANT".equalsIgnoreCase(dto.getVerificationStatus());
            case "PENDING_VERIFICATION", "PENDING_REVIEW" -> "PENDING_VERIFICATION".equalsIgnoreCase(dto.getVerificationStatus()) || "PENDING_REVIEW".equalsIgnoreCase(dto.getVerificationStatus());
            case "PENDING_SUBMISSION" -> "PENDING_SUBMISSION".equalsIgnoreCase(dto.getVerificationStatus());
            case "CORRECTION_REQUIRED", "ACTION_REQUIRED" -> "CORRECTION_REQUIRED".equalsIgnoreCase(dto.getVerificationStatus()) || "ACTION_REQUIRED".equalsIgnoreCase(dto.getVerificationStatus());
            case "NON_COMPLIANT", "REJECTED" -> "NON_COMPLIANT".equalsIgnoreCase(dto.getVerificationStatus()) || "REJECTED".equalsIgnoreCase(dto.getVerificationStatus());
            case "UPCOMING" -> "UPCOMING".equalsIgnoreCase(dto.getDeadlineStatus()) || "DUE_SOON".equalsIgnoreCase(dto.getDeadlineStatus());
            default -> f.equalsIgnoreCase(dto.getStatus()) || f.equalsIgnoreCase(dto.getVerificationStatus());
        };
    }

    @Transactional(readOnly = true)
    public ComplianceItemDto getComplianceById(String id) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));
        verifyInstitutionAccess(item.getInstitutionCode());
        return ComplianceItemDto.fromEntity(item);
    }

    @Transactional
    public ComplianceItemDto createCompliance(ComplianceCreateRequest req) {
        if (req.getInstitutionCode() == null || req.getInstitutionCode().isBlank()) {
            throw new BadRequestException("Institution code is required.");
        }
        if (req.getRequirementType() == null || req.getRequirementType().isBlank()) {
            throw new BadRequestException("Requirement type is required.");
        }
        if (req.getDocumentName() == null || req.getDocumentName().isBlank()) {
            throw new BadRequestException("Obligation / Document name is required.");
        }
        if (req.getDueDate() == null) {
            throw new BadRequestException("Due date is required for compliance obligations.");
        }

        String instCode = req.getInstitutionCode().trim();
        String reqType = req.getRequirementType().trim();
        String docName = req.getDocumentName().trim();

        if (complianceRepository.existsByInstitutionCodeIgnoreCaseAndRequirementTypeIgnoreCaseAndDocumentNameIgnoreCase(instCode, reqType, docName)) {
            throw new BadRequestException("A compliance obligation with the same institution, requirement type, and document name already exists.");
        }

        String instName = req.getInstitutionName();
        String region = req.getRegion();
        Optional<Institution> instOpt = institutionRepository.findByCode(instCode);
        if (instOpt.isPresent()) {
            if (instName == null || instName.isBlank()) instName = instOpt.get().getName();
            if (region == null || region.isBlank()) region = instOpt.get().getRegion();
        }
        if (instName == null || instName.isBlank()) instName = "Institution " + instCode;
        if (region == null || region.isBlank()) region = "National HQ";

        String id = "CMP-2026-" + (1000 + new Random().nextInt(9000));
        while (complianceRepository.existsById(id)) {
            id = "CMP-2026-" + (1000 + new Random().nextInt(9000));
        }

        UserPrincipal principal = getCurrentPrincipal();
        String actor = principal != null ? principal.getName() : "Compliance Administrator";
        String actorRole = principal != null ? principal.getRole() : "ADMIN";

        ComplianceItem item = ComplianceItem.builder()
                .id(id)
                .institutionCode(instCode)
                .institutionName(instName)
                .region(region)
                .applicationId(req.getApplicationId())
                .requirementType(reqType)
                .documentName(docName)
                .description(req.getDescription())
                .applicableClause(req.getApplicableClause())
                .documentType("PDF")
                .dueDate(req.getDueDate())
                .issueDate(req.getIssueDate())
                .expiryDate(req.getExpiryDate())
                .status("PENDING_SUBMISSION")
                .verificationStatus("PENDING_SUBMISSION")
                .assignedReviewer(req.getAssignedReviewer() != null && !req.getAssignedReviewer().isBlank() ? req.getAssignedReviewer().trim() : actor)
                .version("1.0")
                .notes(req.getNotes())
                .ocrStatus("NOT_RUN")
                .build();

        ComplianceItem saved = complianceRepository.save(item);

        recordAudit(id, actor, actorRole, "COMPLIANCE_OBLIGATION_CREATED", "NONE", "PENDING_SUBMISSION",
                "Created compliance obligation: " + docName + " for " + instName + " (" + instCode + ")");

        createNotification(
                "COMPLIANCE_OBLIGATION",
                "HIGH",
                "New Statutory Undertaking Assigned: " + docName,
                "Institution " + instName + " (" + instCode + ") must submit evidence for '" + docName + "' by " + req.getDueDate() + ".",
                "COMPLIANCE",
                id,
                "COLLEGE_REP",
                "/compliance"
        );

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto updateCompliance(String id, ComplianceCreateRequest req) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        if (req.getRequirementType() != null && !req.getRequirementType().isBlank()) {
            item.setRequirementType(req.getRequirementType().trim());
        }
        if (req.getDocumentName() != null && !req.getDocumentName().isBlank()) {
            item.setDocumentName(req.getDocumentName().trim());
        }
        if (req.getDescription() != null) {
            item.setDescription(req.getDescription().trim());
        }
        if (req.getApplicableClause() != null) {
            item.setApplicableClause(req.getApplicableClause().trim());
        }
        if (req.getDueDate() != null) {
            item.setDueDate(req.getDueDate());
        }
        if (req.getIssueDate() != null) {
            item.setIssueDate(req.getIssueDate());
        }
        if (req.getExpiryDate() != null) {
            item.setExpiryDate(req.getExpiryDate());
        }
        if (req.getAssignedReviewer() != null && !req.getAssignedReviewer().isBlank()) {
            item.setAssignedReviewer(req.getAssignedReviewer().trim());
        }
        if (req.getNotes() != null) {
            item.setNotes(req.getNotes().trim());
        }

        ComplianceItem saved = complianceRepository.save(item);
        UserPrincipal principal = getCurrentPrincipal();
        recordAudit(id, principal != null ? principal.getName() : "Compliance Officer",
                principal != null ? principal.getRole() : "COMPLIANCE_REVIEWER",
                "COMPLIANCE_OBLIGATION_UPDATED", item.getVerificationStatus(), item.getVerificationStatus(),
                "Updated obligation metadata for " + item.getDocumentName());

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto submitEvidence(String id, ComplianceEvidenceSubmitRequest req) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        verifyInstitutionAccess(item.getInstitutionCode());

        if ((req.getDeclarationText() == null || req.getDeclarationText().isBlank())
                && (req.getDocumentName() == null || req.getDocumentName().isBlank())) {
            throw new BadRequestException("Declaration statement or supporting evidence document name is required.");
        }

        UserPrincipal principal = getCurrentPrincipal();
        String actor = principal != null ? principal.getName() : "College Representative";
        String actorRole = principal != null ? principal.getRole() : "COLLEGE_REP";
        String prevState = item.getVerificationStatus();

        appendVersionHistory(item, actor);
        String nextVersion = incrementVersion(item.getVersion());
        item.setVersion(nextVersion);

        if (req.getDeclarationText() != null && !req.getDeclarationText().isBlank()) {
            item.setDeclarationText(req.getDeclarationText().trim());
        }
        if (req.getDocumentName() != null && !req.getDocumentName().isBlank()) {
            item.setDocumentName(SafeStorageUtil.sanitizeFilename(req.getDocumentName().trim()));
        }
        if (req.getDocumentType() != null && !req.getDocumentType().isBlank()) {
            item.setDocumentType(req.getDocumentType().trim().toUpperCase());
        }
        if (req.getFileSize() != null && !req.getFileSize().isBlank()) {
            item.setFileSize(req.getFileSize().trim());
        }
        if (req.getIssueDate() != null) {
            item.setIssueDate(req.getIssueDate());
        }
        if (req.getExpiryDate() != null) {
            item.setExpiryDate(req.getExpiryDate());
        }
        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            item.setNotes(req.getNotes().trim());
        }

        byte[] contentBytes = null;
        if (req.getTextContent() != null && !req.getTextContent().isBlank()) {
            contentBytes = req.getTextContent().getBytes(StandardCharsets.UTF_8);
            String storageKey = SafeStorageUtil.storeBytes(uploadDir, "compliance", id, item.getDocumentName(), contentBytes);
            item.setStorageKey(storageKey);
            item.setFileSize(Math.max(1, contentBytes.length / 1024) + " KB");
        }

        item.setSubmissionDate(LocalDate.now());
        item.setSubmittedBy(actor);
        item.setVerificationStatus("PENDING_VERIFICATION");
        item.setStatus("PENDING_VERIFICATION");
        item.setVerifiedBy(null);
        item.setVerifiedAt(null);
        item.setFileUrl("/api/v1/compliance/" + id + "/download");

        DocumentVerificationService.AnalysisResult analysis = verificationService.analyzeDocument(
                contentBytes,
                item.getDocumentName(),
                item.getDocumentType(),
                item.getRequirementType(),
                item.getInstitutionName(),
                item.getInstitutionCode(),
                item.getIssueDate(),
                item.getExpiryDate()
        );
        item.setOcrStatus(analysis.getOcrStatus());
        item.setOcrExtractedJson(analysis.getOcrExtractedJson());
        item.setAiAdvisoryJson(analysis.getAiAdvisoryJson());

        ComplianceItem saved = complianceRepository.save(item);
        syncComplianceDocumentEntity(saved);

        recordAudit(id, actor, actorRole, "COMPLIANCE_EVIDENCE_SUBMITTED", prevState, "PENDING_VERIFICATION",
                "Submitted declaration & evidence v" + nextVersion + " for " + saved.getDocumentName());

        createNotification(
                "COMPLIANCE_SUBMISSION",
                "NORMAL",
                "Compliance Evidence Submitted: " + saved.getDocumentName(),
                saved.getInstitutionName() + " submitted v" + nextVersion + " compliance evidence for review.",
                "COMPLIANCE",
                id,
                "COMPLIANCE_REVIEWER",
                "/compliance"
        );

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto uploadDocument(
            String id,
            MultipartFile file,
            String declarationText,
            LocalDate issueDate,
            LocalDate expiryDate,
            String notes) {

        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        verifyInstitutionAccess(item.getInstitutionCode());

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds maximum limit of 10 MB.");
        }

        String safeFileName = SafeStorageUtil.sanitizeFilename(file.getOriginalFilename());
        String ext = SafeStorageUtil.getExtension(safeFileName);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Unsupported file type '." + ext + "'. Only PDF, PNG, JPG, or JPEG files are allowed.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded file stream.");
        }

        UserPrincipal principal = getCurrentPrincipal();
        String actor = principal != null ? principal.getName() : "College Representative";
        String actorRole = principal != null ? principal.getRole() : "COLLEGE_REP";
        String prevState = item.getVerificationStatus();

        appendVersionHistory(item, actor);
        String nextVersion = incrementVersion(item.getVersion());

        String storageKey = SafeStorageUtil.storeBytes(uploadDir, "compliance", id, safeFileName, bytes);

        item.setVersion(nextVersion);
        item.setDocumentName(safeFileName);
        item.setDocumentType("pdf".equalsIgnoreCase(ext) ? "PDF" : "IMAGE");
        item.setFileSize(formatBytes(file.getSize()));
        item.setStorageKey(storageKey);
        item.setFileUrl("/api/v1/compliance/" + id + "/download");
        item.setSubmissionDate(LocalDate.now());
        item.setSubmittedBy(actor);
        if (declarationText != null && !declarationText.isBlank()) {
            item.setDeclarationText(declarationText.trim());
        }
        if (issueDate != null) {
            item.setIssueDate(issueDate);
        }
        if (expiryDate != null) {
            item.setExpiryDate(expiryDate);
        }
        if (notes != null && !notes.isBlank()) {
            item.setNotes(notes.trim());
        }

        // Uploading a new version requires re-review
        item.setVerificationStatus("PENDING_VERIFICATION");
        item.setStatus("PENDING_VERIFICATION");
        item.setVerifiedBy(null);
        item.setVerifiedAt(null);

        DocumentVerificationService.AnalysisResult analysis = verificationService.analyzeDocument(
                bytes,
                safeFileName,
                item.getDocumentType(),
                item.getRequirementType(),
                item.getInstitutionName(),
                item.getInstitutionCode(),
                item.getIssueDate(),
                item.getExpiryDate()
        );
        item.setOcrStatus(analysis.getOcrStatus());
        item.setOcrExtractedJson(analysis.getOcrExtractedJson());
        item.setAiAdvisoryJson(analysis.getAiAdvisoryJson());

        ComplianceItem saved = complianceRepository.save(item);
        syncComplianceDocumentEntity(saved);

        recordAudit(id, actor, actorRole, "DOCUMENT_UPLOADED", prevState, "PENDING_VERIFICATION",
                "Uploaded compliance document v" + nextVersion + ": " + safeFileName + " (OCR: " + analysis.getOcrStatus() + ")");

        createNotification(
                "COMPLIANCE_SUBMISSION",
                "NORMAL",
                "Compliance Document Uploaded: " + safeFileName,
                saved.getInstitutionName() + " uploaded v" + nextVersion + " for " + saved.getRequirementType() + ".",
                "COMPLIANCE",
                id,
                "COMPLIANCE_REVIEWER",
                "/compliance"
        );

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto verifyCompliance(String id, VerifyComplianceRequest request) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        String rawDecision = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus().trim().toUpperCase()
                : "VERIFIED";

        boolean requiresReason = "ACTION_REQUIRED".equals(rawDecision)
                || "CORRECTION_REQUIRED".equals(rawDecision)
                || "REJECTED".equals(rawDecision)
                || "NON_COMPLIANT".equals(rawDecision);

        if (requiresReason && (request.getReason() == null || request.getReason().isBlank())) {
            throw new BadRequestException("Reviewer justification / remarks are mandatory when rejecting a submission or requesting corrections.");
        }

        UserPrincipal principal = getCurrentPrincipal();
        String reviewerName = principal != null ? principal.getName()
                : (item.getAssignedReviewer() != null ? item.getAssignedReviewer() : "Compliance Reviewer");
        String reviewerRole = principal != null ? principal.getRole() : "COMPLIANCE_REVIEWER";

        String prevState = item.getVerificationStatus();
        item.setVerificationStatus(rawDecision);
        item.setStatus(rawDecision);
        item.setVerifiedBy(reviewerName);
        item.setVerifiedAt(LocalDateTime.now());
        if (request.getReason() != null && !request.getReason().isBlank()) {
            item.setNotes(request.getReason().trim());
        }

        ComplianceItem saved = complianceRepository.save(item);
        syncComplianceDocumentEntity(saved);

        recordAudit(id, reviewerName, reviewerRole, "COMPLIANCE_VERIFIED", prevState, rawDecision,
                request.getReason() != null ? request.getReason() : "Verified by " + reviewerName);

        createNotification(
                "VERIFICATION_UPDATE",
                requiresReason ? "HIGH" : "NORMAL",
                "Compliance Decision (" + rawDecision + "): " + saved.getDocumentName(),
                "Your compliance submission '" + saved.getDocumentName() + "' (" + saved.getInstitutionCode() + ") was marked " + rawDecision + " by " + reviewerName + ". Remarks: " + (request.getReason() != null ? request.getReason() : "Approved"),
                "COMPLIANCE",
                id,
                "COLLEGE_REP",
                "/compliance"
        );

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto analyzeComplianceItem(String id) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));
        verifyInstitutionAccess(item.getInstitutionCode());

        byte[] bytes = SafeStorageUtil.readStoredBytes(uploadDir, item.getStorageKey());
        DocumentVerificationService.AnalysisResult res = verificationService.analyzeDocument(
                bytes,
                item.getDocumentName(),
                item.getDocumentType(),
                item.getRequirementType(),
                item.getInstitutionName(),
                item.getInstitutionCode(),
                item.getIssueDate(),
                item.getExpiryDate()
        );
        item.setOcrStatus(res.getOcrStatus());
        item.setOcrExtractedJson(res.getOcrExtractedJson());
        item.setAiAdvisoryJson(res.getAiAdvisoryJson());

        ComplianceItem saved = complianceRepository.save(item);
        UserPrincipal principal = getCurrentPrincipal();
        recordAudit(id, principal != null ? principal.getName() : "System",
                principal != null ? principal.getRole() : "COMPLIANCE_REVIEWER",
                "COMPLIANCE_OCR_AI_ANALYZED", item.getVerificationStatus(), item.getVerificationStatus(),
                "Executed OCR & deterministic verification analysis (status: " + res.getOcrStatus() + ")");

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public byte[] downloadComplianceFile(String id) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));
        verifyInstitutionAccess(item.getInstitutionCode());

        byte[] stored = SafeStorageUtil.readStoredBytes(uploadDir, item.getStorageKey());
        if (stored != null && stored.length > 0) {
            return stored;
        }
        return SafeStorageUtil.generateStatutoryPdfSummary(
                item.getId(),
                item.getDocumentName(),
                item.getInstitutionName(),
                item.getInstitutionCode(),
                item.getRequirementType(),
                item.getVersion(),
                item.getVerificationStatus(),
                item.getIssueDate(),
                item.getExpiryDate(),
                item.getNotes()
        );
    }

    @Transactional(readOnly = true)
    public ComplianceStatisticsDto getStatistics(String region, String institutionCode) {
        List<ComplianceItem> all = complianceRepository.findAll();
        UserPrincipal principal = getCurrentPrincipal();

        List<ComplianceItem> scoped = all.stream().filter(item -> {
            if (principal != null && "COLLEGE_REP".equalsIgnoreCase(principal.getRole()) && principal.getInstitutionCode() != null) {
                return principal.getInstitutionCode().equalsIgnoreCase(item.getInstitutionCode());
            }
            if (institutionCode != null && !institutionCode.isBlank() && !"ALL".equalsIgnoreCase(institutionCode.trim())) {
                if (!institutionCode.trim().equalsIgnoreCase(item.getInstitutionCode())) return false;
            }
            if (region != null && !region.isBlank() && !"ALL".equalsIgnoreCase(region.trim())) {
                if (!region.trim().equalsIgnoreCase(item.getRegion())) return false;
            }
            return true;
        }).collect(Collectors.toList());

        long total = scoped.size();
        long compliant = 0;
        long nonCompliant = 0;
        long correctionRequired = 0;
        long pendingReview = 0;
        long pendingSubmission = 0;
        long overdue = 0;
        long expiringSoon = 0;
        long expired = 0;

        LocalDate today = LocalDate.now();
        for (ComplianceItem item : scoped) {
            String vs = item.getVerificationStatus() != null ? item.getVerificationStatus().toUpperCase() : "";
            boolean isCompliant = "VERIFIED".equals(vs) || "COMPLIANT".equals(vs);
            if (isCompliant) {
                compliant++;
            } else if ("NON_COMPLIANT".equals(vs) || "REJECTED".equals(vs)) {
                nonCompliant++;
            } else if ("CORRECTION_REQUIRED".equals(vs) || "ACTION_REQUIRED".equals(vs)) {
                correctionRequired++;
            } else if ("PENDING_VERIFICATION".equals(vs) || "PENDING_REVIEW".equals(vs)) {
                pendingReview++;
            } else {
                pendingSubmission++;
            }

            if (!isCompliant && item.getDueDate() != null && item.getDueDate().isBefore(today)) {
                overdue++;
            }
            if (item.getExpiryDate() != null) {
                if (item.getExpiryDate().isBefore(today)) {
                    expired++;
                } else if (!item.getExpiryDate().isAfter(today.plusDays(30))) {
                    expiringSoon++;
                }
            }
        }

        double pct = total > 0 ? Math.round((compliant * 1000.0) / total) / 10.0 : 0.0;

        ComplianceStatisticsDto stats = new ComplianceStatisticsDto();
        stats.setTotalObligations(total);
        stats.setCompliantCount(compliant);
        stats.setNonCompliantCount(nonCompliant);
        stats.setCorrectionRequiredCount(correctionRequired);
        stats.setPendingReviewCount(pendingReview);
        stats.setPendingSubmissionCount(pendingSubmission);
        stats.setOverdueCount(overdue);
        stats.setExpiringSoonCount(expiringSoon);
        stats.setExpiredCount(expired);
        stats.setCompletionPercentage(pct);
        stats.setDenominatorDescription("Total active compliance obligations in scope (" + total + "); completion percentage = (compliantCount / totalObligations) * 100");
        return stats;
    }

    @Transactional
    public Map<String, Object> triggerRenewalAndDeadlineReminders(Integer thresholdDaysOverride) {
        int threshold = (thresholdDaysOverride != null && thresholdDaysOverride > 0) ? thresholdDaysOverride : defaultReminderDays;
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(threshold);

        int remindersCreated = 0;
        int escalationsCreated = 0;
        int duplicatesSkipped = 0;

        List<ComplianceItem> items = complianceRepository.findAll();
        for (ComplianceItem item : items) {
            boolean isCompliant = "VERIFIED".equalsIgnoreCase(item.getVerificationStatus())
                    || "COMPLIANT".equalsIgnoreCase(item.getVerificationStatus());

            // 1. Check document expiry reminder
            if (item.getExpiryDate() != null && !item.getExpiryDate().isAfter(cutoff)) {
                String cat = item.getExpiryDate().isBefore(today) ? "DOCUMENT_EXPIRED" : "RENEWAL_REMINDER";
                if (notificationRepository.existsByEntityIdAndCategoryAndIsReadFalse(item.getId(), cat)) {
                    duplicatesSkipped++;
                } else {
                    String title = item.getExpiryDate().isBefore(today)
                            ? "EXPIRED Document Notice: " + item.getDocumentName()
                            : "Renewal Reminder (" + threshold + "d window): " + item.getDocumentName();
                    String msg = item.getInstitutionName() + " (" + item.getInstitutionCode() + ") document '"
                            + item.getDocumentName() + "' has expiry date " + item.getExpiryDate() + ". Please upload renewed certificate.";
                    createNotification(cat, "HIGH", title, msg, "COMPLIANCE", item.getId(), "COLLEGE_REP", "/compliance");
                    item.setLastReminderSentAt(LocalDateTime.now());
                    complianceRepository.save(item);
                    remindersCreated++;
                }
            }

            // 2. Check overdue undertaking deadline & escalation
            if (!isCompliant && item.getDueDate() != null && item.getDueDate().isBefore(today)) {
                String cat = "OVERDUE_COMPLIANCE";
                if (notificationRepository.existsByEntityIdAndCategoryAndIsReadFalse(item.getId(), cat)) {
                    duplicatesSkipped++;
                } else {
                    createNotification(
                            cat,
                            "CRITICAL",
                            "Overdue Undertaking Alert: " + item.getDocumentName(),
                            item.getInstitutionName() + " (" + item.getInstitutionCode() + ") has missed the submission deadline (" + item.getDueDate() + ") for " + item.getDocumentName() + ".",
                            "COMPLIANCE",
                            item.getId(),
                            "COMPLIANCE_REVIEWER",
                            "/compliance"
                    );
                    remindersCreated++;
                }

                if (!escalationRepository.existsByEntityIdAndStatus(item.getId(), "ACTIVE")) {
                    Escalation esc = Escalation.builder()
                            .id("ESC-CMP-" + (1000 + new Random().nextInt(9000)))
                            .entityId(item.getId())
                            .institutionName(item.getInstitutionName())
                            .level("LEVEL_1")
                            .levelTitle("Regional Compliance Cell Escalation")
                            .recipient(item.getAssignedReviewer() != null ? item.getAssignedReviewer() : "Compliance Reviewer")
                            .reason("Statutory undertaking '" + item.getDocumentName() + "' overdue since " + item.getDueDate())
                            .triggeredAt(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                            .status("ACTIVE")
                            .build();
                    escalationRepository.save(esc);
                    escalationsCreated++;
                }
            }
        }

        // Also check ApplicationDocument expiry dates
        List<ApplicationDocument> docs = documentRepository.findAll();
        for (ApplicationDocument doc : docs) {
            if (doc.getExpiryDate() != null && !doc.getExpiryDate().isAfter(cutoff)) {
                String cat = doc.getExpiryDate().isBefore(today) ? "DOCUMENT_EXPIRED" : "RENEWAL_REMINDER";
                if (notificationRepository.existsByEntityIdAndCategoryAndIsReadFalse(doc.getId(), cat)) {
                    duplicatesSkipped++;
                } else {
                    createNotification(
                            cat,
                            "HIGH",
                            "Document Validity Reminder: " + doc.getTitle(),
                            "Document '" + doc.getTitle() + "' (" + (doc.getInstitutionName() != null ? doc.getInstitutionName() : doc.getId()) + ") expires on " + doc.getExpiryDate() + ".",
                            "DOCUMENT",
                            doc.getId(),
                            "COLLEGE_REP",
                            "/compliance"
                    );
                    doc.setLastReminderSentAt(LocalDateTime.now());
                    documentRepository.save(doc);
                    remindersCreated++;
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("thresholdDays", threshold);
        result.put("remindersCreated", remindersCreated);
        result.put("escalationsCreated", escalationsCreated);
        result.put("duplicatesSkipped", duplicatesSkipped);
        result.put("executedAt", LocalDateTime.now().toString());
        return result;
    }

    private void appendVersionHistory(ComplianceItem item, String replacedBy) {
        if (item.getSubmissionDate() == null && item.getStorageKey() == null && !"VERIFIED".equalsIgnoreCase(item.getVerificationStatus())) {
            return;
        }
        try {
            List<Map<String, Object>> history = new ArrayList<>();
            if (item.getVersionHistoryJson() != null && !item.getVersionHistoryJson().isBlank()) {
                history = objectMapper.readValue(item.getVersionHistoryJson(), new TypeReference<List<Map<String, Object>>>() {});
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("version", item.getVersion() != null ? item.getVersion() : "1.0");
            entry.put("documentName", item.getDocumentName());
            entry.put("fileSize", item.getFileSize());
            entry.put("submissionDate", item.getSubmissionDate() != null ? item.getSubmissionDate().toString() : null);
            entry.put("submittedBy", item.getSubmittedBy());
            entry.put("verificationStatus", item.getVerificationStatus());
            entry.put("verifiedBy", item.getVerifiedBy());
            entry.put("notes", item.getNotes());
            entry.put("archivedAt", LocalDateTime.now().toString());
            entry.put("replacedBy", replacedBy);
            history.add(entry);
            item.setVersionHistoryJson(objectMapper.writeValueAsString(history));
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

    private void syncComplianceDocumentEntity(ComplianceItem item) {
        List<ApplicationDocument> existing = documentRepository.findByComplianceId(item.getId());
        ApplicationDocument doc = existing.isEmpty() ? new ApplicationDocument() : existing.get(0);
        if (doc.getId() == null) {
            doc.setId("DOC-" + item.getId());
        }
        doc.setComplianceId(item.getId());
        doc.setInstitutionCode(item.getInstitutionCode());
        doc.setInstitutionName(item.getInstitutionName());
        doc.setTitle(item.getDocumentName());
        doc.setType(item.getDocumentType() != null ? item.getDocumentType() : "PDF");
        doc.setSize(item.getFileSize() != null ? item.getFileSize() : "1.0 MB");
        doc.setStatus(item.getVerificationStatus());
        doc.setVersion(item.getVersion());
        doc.setVersionHistoryJson(item.getVersionHistoryJson());
        doc.setUploadedBy(item.getSubmittedBy());
        doc.setUploadDate(item.getSubmissionDate() != null ? item.getSubmissionDate() : LocalDate.now());
        doc.setIssueDate(item.getIssueDate());
        doc.setExpiryDate(item.getExpiryDate());
        doc.setVerifiedBy(item.getVerifiedBy());
        doc.setVerifiedAt(item.getVerifiedAt());
        doc.setVerificationRemarks(item.getNotes());
        doc.setStorageKey(item.getStorageKey());
        doc.setFileUrl("/api/v1/documents/" + doc.getId() + "/download");
        doc.setOcrStatus(item.getOcrStatus());
        doc.setOcrExtractedJson(item.getOcrExtractedJson());
        doc.setAiAdvisoryJson(item.getAiAdvisoryJson());
        documentRepository.save(doc);
    }

    private String formatBytes(long bytes) {
        if (bytes >= 1024 * 1024) {
            return String.format(Locale.US, "%.1f MB", bytes / (1024.0 * 1024.0));
        }
        return Math.max(1, bytes / 1024) + " KB";
    }

    private void createNotification(String category, String urgency, String title, String message,
                                    String entityType, String entityId, String recipientRole, String link) {
        Notification notif = Notification.builder()
                .id("NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .category(category)
                .urgency(urgency)
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .isRead(false)
                .recipientRole(recipientRole)
                .link(link)
                .build();
        notificationRepository.save(notif);
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
