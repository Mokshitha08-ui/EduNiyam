package in.gov.aicte.approval.compliance.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.compliance.dto.ComplianceCreateRequest;
import in.gov.aicte.approval.compliance.dto.ComplianceEvidenceSubmitRequest;
import in.gov.aicte.approval.compliance.dto.ComplianceItemDto;
import in.gov.aicte.approval.compliance.dto.ComplianceStatisticsDto;
import in.gov.aicte.approval.compliance.dto.VerifyComplianceRequest;
import in.gov.aicte.approval.compliance.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/compliance")
@Tag(name = "Compliance", description = "AICTE Statutory Undertakings and Mandatory Document Compliance Management")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping
    @Operation(summary = "Get list of compliance requirements and undertakings with filtering and deadline status")
    public ResponseEntity<PageResponse<ComplianceItemDto>> getAllCompliance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String institutionCode,
            @RequestParam(required = false) String reviewer,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo) {
        return ResponseEntity.ok(complianceService.getAllCompliance(
                page, size, status, region, type, institutionCode, reviewer, search, dueDateFrom, dueDateTo));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get database-backed compliance statistics and completion percentage")
    public ResponseEntity<ComplianceStatisticsDto> getStatistics(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String institutionCode) {
        return ResponseEntity.ok(complianceService.getStatistics(region, institutionCode));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get compliance item details by ID")
    public ResponseEntity<ComplianceItemDto> getComplianceById(@PathVariable String id) {
        return ResponseEntity.ok(complianceService.getComplianceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Create a new statutory compliance obligation or undertaking")
    public ResponseEntity<ComplianceItemDto> createCompliance(@RequestBody ComplianceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complianceService.createCompliance(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Update an existing statutory compliance obligation")
    public ResponseEntity<ComplianceItemDto> updateCompliance(
            @PathVariable String id,
            @RequestBody ComplianceCreateRequest request) {
        return ResponseEntity.ok(complianceService.updateCompliance(id, request));
    }

    @PostMapping("/{id}/submit-evidence")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Submit compliance declaration and supporting evidence metadata/text")
    public ResponseEntity<ComplianceItemDto> submitEvidence(
            @PathVariable String id,
            @RequestBody ComplianceEvidenceSubmitRequest request) {
        return ResponseEntity.ok(complianceService.submitEvidence(id, request));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Upload compliance certificate or affidavit document with OCR and validity tracking")
    public ResponseEntity<ComplianceItemDto> uploadDocument(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "fileName", required = false) String fallbackFileName,
            @RequestParam(value = "declarationText", required = false) String declarationText,
            @RequestParam(value = "issueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(value = "notes", required = false) String notes) {
        if (file != null && !file.isEmpty()) {
            return ResponseEntity.ok(complianceService.uploadDocument(id, file, declarationText, issueDate, expiryDate, notes));
        }
        // Fallback if client sent form fields without multipart binary stream
        ComplianceEvidenceSubmitRequest fallbackReq = new ComplianceEvidenceSubmitRequest();
        fallbackReq.setDocumentName(fallbackFileName);
        fallbackReq.setDeclarationText(declarationText != null ? declarationText : "Submitted via form upload");
        fallbackReq.setIssueDate(issueDate);
        fallbackReq.setExpiryDate(expiryDate);
        fallbackReq.setNotes(notes);
        return ResponseEntity.ok(complianceService.submitEvidence(id, fallbackReq));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Verify, request correction, or mark non-compliant for a compliance undertaking")
    public ResponseEntity<ComplianceItemDto> verifyCompliance(
            @PathVariable String id,
            @RequestBody VerifyComplianceRequest request) {
        return ResponseEntity.ok(complianceService.verifyCompliance(id, request));
    }

    @PostMapping("/{id}/analyze")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Trigger or retry OCR extraction and deterministic/AI advisory checks on a compliance document")
    public ResponseEntity<ComplianceItemDto> analyzeComplianceItem(@PathVariable String id) {
        return ResponseEntity.ok(complianceService.analyzeComplianceItem(id));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download compliance document file with institutional access verification")
    public ResponseEntity<byte[]> downloadComplianceDocument(@PathVariable String id) {
        ComplianceItemDto item = complianceService.getComplianceById(id);
        byte[] content = complianceService.downloadComplianceFile(id);
        String filename = item.getDocumentName() != null ? item.getDocumentName() : (id + ".pdf");
        if (!filename.toLowerCase().endsWith(".pdf") && !filename.toLowerCase().endsWith(".png") && !filename.toLowerCase().endsWith(".jpg")) {
            filename = filename.replaceAll("[^a-zA-Z0-9._\\-]", "_") + ".pdf";
        }
        MediaType mediaType = filename.toLowerCase().endsWith(".png") ? MediaType.IMAGE_PNG
                : (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) ? MediaType.IMAGE_JPEG
                : MediaType.APPLICATION_PDF;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }

    @PostMapping("/reminders/trigger")
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Trigger document renewal and overdue compliance deadline reminders with deduplication")
    public ResponseEntity<Map<String, Object>> triggerReminders(
            @RequestParam(required = false) Integer thresholdDays) {
        return ResponseEntity.ok(complianceService.triggerRenewalAndDeadlineReminders(thresholdDays));
    }
}
