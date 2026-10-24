package in.gov.aicte.approval.compliance.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.compliance.dto.ComplianceItemDto;
import in.gov.aicte.approval.compliance.dto.VerifyComplianceRequest;
import in.gov.aicte.approval.compliance.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/compliance")
@Tag(name = "Compliance", description = "AICTE Statutory Undertakings and Mandatory Document Compliance Management")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }


    @GetMapping
    @Operation(summary = "Get list of compliance requirements and undertakings")
    public ResponseEntity<PageResponse<ComplianceItemDto>> getAllCompliance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(complianceService.getAllCompliance(page, size, status, region, type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get compliance item details by ID")
    public ResponseEntity<ComplianceItemDto> getComplianceById(@PathVariable String id) {
        return ResponseEntity.ok(complianceService.getComplianceById(id));
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify or flag compliance undertaking")
    public ResponseEntity<ComplianceItemDto> verifyCompliance(
            @PathVariable String id,
            @RequestBody VerifyComplianceRequest request) {
        return ResponseEntity.ok(complianceService.verifyCompliance(id, request));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload compliance certificate or affidavit document")
    public ResponseEntity<ComplianceItemDto> uploadDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(complianceService.uploadDocument(id, file));
    }
}
