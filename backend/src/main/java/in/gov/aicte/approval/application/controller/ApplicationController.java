package in.gov.aicte.approval.application.controller;

import in.gov.aicte.approval.application.dto.*;
import in.gov.aicte.approval.application.service.ApplicationService;
import in.gov.aicte.approval.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
@Tag(name = "Applications", description = "AICTE Institutional Approval Application lifecycle management endpoints")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }


    @GetMapping
    @Operation(summary = "Get applications list with pagination, search and filters")
    public ResponseEntity<PageResponse<ApplicationDto>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(applicationService.getAllApplications(page, size, search, region, stage, status, priority));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed application profile by ID")
    public ResponseEntity<ApplicationDto> getApplicationById(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    @Operation(summary = "Submit a new institutional approval application")
    public ResponseEntity<ApplicationDto> createApplication(@RequestBody ApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(dto));
    }

    @PostMapping("/{id}/advance-stage")
    @Operation(summary = "Advance application to next workflow scrutiny/inspection stage")
    public ResponseEntity<ApplicationDto> advanceStage(
            @PathVariable String id,
            @RequestBody StageAdvanceRequest request) {
        return ResponseEntity.ok(applicationService.advanceStage(id, request));
    }

    @PostMapping("/{id}/deficiency")
    @Operation(summary = "Return application to college with deficiency notice")
    public ResponseEntity<ApplicationDto> returnDeficiency(
            @PathVariable String id,
            @RequestBody DeficiencyRequest request) {
        return ResponseEntity.ok(applicationService.returnDeficiency(id, request));
    }

    @PostMapping("/{id}/resubmit")
    @Operation(summary = "Resubmit compliance rectifications by college representative")
    public ResponseEntity<ApplicationDto> resubmit(
            @PathVariable String id,
            @RequestBody ResubmitRequest request) {
        return ResponseEntity.ok(applicationService.resubmit(id, request));
    }

    @PatchMapping("/{id}/assign-officer")
    @Operation(summary = "Assign scrutiny/bureau officer to application")
    public ResponseEntity<ApplicationDto> assignOfficer(
            @PathVariable String id,
            @RequestBody AssignOfficerRequest request) {
        return ResponseEntity.ok(applicationService.assignOfficer(id, request));
    }
}
