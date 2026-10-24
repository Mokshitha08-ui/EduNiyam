package in.gov.aicte.approval.compliance.service;

import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.compliance.dto.ComplianceItemDto;
import in.gov.aicte.approval.compliance.dto.VerifyComplianceRequest;
import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplianceService {

    private final ComplianceItemRepository complianceRepository;
    private final AuditLogRepository auditLogRepository;

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public ComplianceService(ComplianceItemRepository complianceRepository, AuditLogRepository auditLogRepository) {
        this.complianceRepository = complianceRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplianceItemDto> getAllCompliance(int page, int size, String status, String region, String type) {
        Specification<ComplianceItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }
            if (region != null && !region.isBlank()) {
                predicates.add(cb.equal(root.get("region"), region.trim()));
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("requirementType"), type.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueDate"));
        Page<ComplianceItem> compPage = complianceRepository.findAll(spec, pageRequest);

        List<ComplianceItemDto> dtos = compPage.getContent().stream()
                .map(ComplianceItemDto::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.of(dtos, compPage.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public ComplianceItemDto getComplianceById(String id) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));
        return ComplianceItemDto.fromEntity(item);
    }

    @Transactional
    public ComplianceItemDto verifyCompliance(String id, VerifyComplianceRequest request) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        String prevState = item.getVerificationStatus();
        item.setVerificationStatus(request.getStatus() != null ? request.getStatus() : "VERIFIED");
        item.setStatus(request.getStatus() != null ? request.getStatus() : "VERIFIED");
        item.setNotes(request.getReason() != null ? request.getReason() : item.getNotes());

        ComplianceItem saved = complianceRepository.save(item);

        recordAudit(id, item.getAssignedReviewer() != null ? item.getAssignedReviewer() : "Compliance Officer",
                "COMPLIANCE_VERIFIED", prevState, item.getVerificationStatus(), request.getReason());

        return ComplianceItemDto.fromEntity(saved);
    }

    @Transactional
    public ComplianceItemDto uploadDocument(String id, MultipartFile file) {
        ComplianceItem item = complianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceItem", "id", id));

        item.setSubmissionDate(LocalDate.now());
        item.setVerificationStatus("PENDING_VERIFICATION");
        item.setStatus("PENDING_VERIFICATION");
        item.setFileSize((file.getSize() / 1024) + " KB");
        item.setDocumentName(file.getOriginalFilename());

        ComplianceItem saved = complianceRepository.save(item);

        recordAudit(id, "College Representative", "DOCUMENT_UPLOADED", "PENDING_SUBMISSION",
                "PENDING_VERIFICATION", "Uploaded: " + file.getOriginalFilename());

        return ComplianceItemDto.fromEntity(saved);
    }

    private void recordAudit(String entityId, String user, String action, String prevState, String newState, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .userName(user)
                .role("COMPLIANCE_REVIEWER")
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
