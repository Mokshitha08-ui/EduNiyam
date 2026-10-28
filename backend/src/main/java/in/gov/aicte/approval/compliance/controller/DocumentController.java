package in.gov.aicte.approval.compliance.controller;

import in.gov.aicte.approval.application.dto.ApplicationDocumentDto;
import in.gov.aicte.approval.compliance.dto.VerifyComplianceRequest;
import in.gov.aicte.approval.compliance.dto.DocumentFieldsUpdateRequest;
import in.gov.aicte.approval.compliance.service.DocumentService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@Tag(name = "Document Management", description = "Institutional Document Upload, Versioning, Validity Tracking, Manual Verification, and OCR/AI Advisory")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @Operation(summary = "List uploaded documents with optional filters and institutional isolation")
    public ResponseEntity<List<ApplicationDocumentDto>> listDocuments(
            @RequestParam(required = false) String applicationId,
            @RequestParam(required = false) String complianceId,
            @RequestParam(required = false) String institutionCode,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String validityStatus) {
        return ResponseEntity.ok(documentService.listDocuments(
                applicationId, complianceId, institutionCode, status, validityStatus));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata, version history, and verification details by ID")
    public ResponseEntity<ApplicationDocumentDto> getDocumentById(@PathVariable String id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Upload or replace an institutional/application document with version tracking and OCR extraction")
    public ResponseEntity<ApplicationDocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String documentId,
            @RequestParam(required = false) String documentCode,
            @RequestParam(required = false) String applicationId,
            @RequestParam(required = false) String complianceId,
            @RequestParam(required = false) String institutionCode,
            @RequestParam(required = false) String institutionName,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.uploadOrReplaceDocument(
                file, documentId, documentCode, applicationId, complianceId, institutionCode, institutionName, title, issueDate, expiryDate));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Remove or delete an uploaded document")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(Map.of("success", true, "deletedId", id));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Manually verify, request correction, or reject a document")
    public ResponseEntity<ApplicationDocumentDto> verifyDocument(
            @PathVariable String id,
            @RequestBody VerifyComplianceRequest request) {
        return ResponseEntity.ok(documentService.verifyDocument(id, request));
    }

    @PatchMapping("/{id}/fields")
    @PreAuthorize("hasAnyRole('COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Manually correct extracted OCR fields on a document")
    public ResponseEntity<ApplicationDocumentDto> updateExtractedFields(
            @PathVariable String id,
            @RequestBody DocumentFieldsUpdateRequest request) {
        return ResponseEntity.ok(documentService.updateExtractedFields(id, request));
    }

    @PostMapping("/{id}/analyze")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'COMPLIANCE_REVIEWER', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Trigger or retry OCR extraction and deterministic/AI advisory analysis on a document")
    public ResponseEntity<ApplicationDocumentDto> analyzeDocument(@PathVariable String id) {
        return ResponseEntity.ok(documentService.analyzeDocument(id));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download document file with institutional access verification")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String id) {
        ApplicationDocumentDto dto = documentService.getDocumentById(id);
        byte[] content = documentService.downloadDocument(id);
        String filename = dto.getTitle() != null ? dto.getTitle().replaceAll("[^a-zA-Z0-9._\\-]", "_") : id;
        if (!filename.toLowerCase().endsWith(".pdf") && !filename.toLowerCase().endsWith(".png") && !filename.toLowerCase().endsWith(".jpg")) {
            filename = filename + ".pdf";
        }
        MediaType mediaType = filename.toLowerCase().endsWith(".png") ? MediaType.IMAGE_PNG
                : (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) ? MediaType.IMAGE_JPEG
                : MediaType.APPLICATION_PDF;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }
}
