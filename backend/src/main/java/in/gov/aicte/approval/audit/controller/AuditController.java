package in.gov.aicte.approval.audit.controller;

import in.gov.aicte.approval.audit.dto.AuditLogDto;
import in.gov.aicte.approval.audit.service.AuditService;
import in.gov.aicte.approval.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/audit")
@Tag(name = "Audit Trail", description = "Immutable regulatory event stream and system audit logs")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }


    @GetMapping
    @Operation(summary = "Get immutable system audit trail records")
    public ResponseEntity<PageResponse<AuditLogDto>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<AuditLogDto> logs = auditService.getAllLogs();
        return ResponseEntity.ok(PageResponse.of(logs, logs.size(), page, size));
    }
}
