package in.gov.aicte.approval.application.controller;

import in.gov.aicte.approval.application.dto.*;
import in.gov.aicte.approval.application.service.ApplicationService;
import in.gov.aicte.approval.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Create a new institutional approval application or draft")
    public ResponseEntity<ApplicationDto> createApplication(@RequestBody ApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Update an existing draft approval application")
    public ResponseEntity<ApplicationDto> updateDraft(
            @PathVariable String id,
            @RequestBody ApplicationDto dto) {
        return ResponseEntity.ok(applicationService.updateApplicationDraft(id, dto));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Formally submit an existing draft application")
    public ResponseEntity<ApplicationDto> submitApplication(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Delete / discard an unsubmitted draft application")
    public ResponseEntity<Void> deleteDraft(@PathVariable String id) {
        applicationService.deleteDraft(id);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{id}/advance-stage", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'EVC_MEMBER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Advance application to next workflow scrutiny/inspection stage")
    public ResponseEntity<ApplicationDto> advanceStage(
            @PathVariable String id,
            @RequestBody StageAdvanceRequest request) {
        return ResponseEntity.ok(applicationService.advanceStage(id, request));
    }

    @RequestMapping(value = {"/{id}/deficiency", "/{id}/return-deficiency"}, method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Return application to college with deficiency notice")
    public ResponseEntity<ApplicationDto> returnDeficiency(
            @PathVariable String id,
            @RequestBody DeficiencyRequest request) {
        return ResponseEntity.ok(applicationService.returnDeficiency(id, request));
    }

    @RequestMapping(value = "/{id}/resubmit", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('COLLEGE_REP', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Resubmit compliance rectifications by college representative")
    public ResponseEntity<ApplicationDto> resubmit(
            @PathVariable String id,
            @RequestBody ResubmitRequest request) {
        return ResponseEntity.ok(applicationService.resubmit(id, request));
    }

    @RequestMapping(value = "/{id}/assign-officer", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Assign scrutiny/bureau officer to application")
    public ResponseEntity<ApplicationDto> assignOfficer(
            @PathVariable String id,
            @RequestBody AssignOfficerRequest request) {
        return ResponseEntity.ok(applicationService.assignOfficer(id, request));
    }

    @GetMapping("/{id}/stage-history")
    @Operation(summary = "Get application stage and status history")
    public ResponseEntity<List<TimelineDto>> getStageHistory(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getStageHistory(id));
    }

    @GetMapping("/{id}/deficiencies")
    @Operation(summary = "Get application deficiency observations")
    public ResponseEntity<List<ObservationDto>> getDeficiencies(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getDeficiencies(id));
    }

    @PostMapping("/{id}/mark-evc")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Mark application as requiring mandatory physical EVC inspection")
    public ResponseEntity<ApplicationDto> markEvcRequired(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody EvcMarkRequest request) {
        return ResponseEntity.ok(applicationService.markEvcRequired(id, request));
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'COMPLIANCE_REVIEWER', 'EVC_MEMBER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Submit stage review checklist evaluation and decision")
    public ResponseEntity<ReviewDto> submitReview(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(applicationService.submitReview(id, request));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get all chronological review history for an application")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getReviews(id));
    }

    @PostMapping("/{id}/observations")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'COMPLIANCE_REVIEWER', 'EVC_MEMBER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Record structured deficiency or observation against application")
    public ResponseEntity<ObservationDto> createObservation(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody ObservationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createObservation(id, request));
    }

    @RequestMapping(value = "/{id}/observations/{obsId}/verify", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'COMPLIANCE_REVIEWER', 'EVC_MEMBER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Verify, resolve, or reopen an institutional deficiency")
    public ResponseEntity<ObservationDto> verifyObservation(
            @PathVariable String id,
            @PathVariable String obsId,
            @jakarta.validation.Valid @RequestBody ObservationVerifyRequest request) {
        return ResponseEntity.ok(applicationService.verifyObservation(id, obsId, request));
    }
}
