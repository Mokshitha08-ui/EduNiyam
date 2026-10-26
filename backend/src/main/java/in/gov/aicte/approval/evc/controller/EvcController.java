package in.gov.aicte.approval.evc.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.evc.dto.*;
import in.gov.aicte.approval.evc.service.EvcService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evc")
@Tag(name = "EVC", description = "Expert Visit Committee (EVC) Physical Inspection Scheduling, Committee Assignment, and Reporting")
public class EvcController {

    private final EvcService evcService;

    public EvcController(EvcService evcService) {
        this.evcService = evcService;
    }

    @GetMapping("/schedules")
    @Operation(summary = "Get all EVC inspection schedules")
    public ResponseEntity<PageResponse<EvcScheduleDto>> getAllSchedules() {
        List<EvcScheduleDto> schedules = evcService.getAllSchedules();
        return ResponseEntity.ok(PageResponse.of(schedules, schedules.size(), 0, Math.max(schedules.size(), 1)));
    }

    @GetMapping("/schedules/{id}")
    @Operation(summary = "Get EVC inspection schedule details by ID")
    public ResponseEntity<EvcScheduleDto> getScheduleById(@PathVariable String id) {
        return ResponseEntity.ok(evcService.getScheduleById(id));
    }

    @GetMapping("/schedules/application/{applicationId}")
    @Operation(summary = "Get EVC inspection schedule by Application ID")
    public ResponseEntity<EvcScheduleDto> getScheduleByApplicationId(@PathVariable String applicationId) {
        return ResponseEntity.ok(evcService.getScheduleByApplicationId(applicationId));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Create or schedule a physical EVC inspection visit")
    public ResponseEntity<EvcScheduleDto> scheduleVisit(@Valid @RequestBody EvcScheduleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evcService.createOrScheduleVisit(request));
    }

    @RequestMapping(value = "/schedules/{id}/reschedule", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Reschedule an EVC visit with statutory justification")
    public ResponseEntity<EvcScheduleDto> rescheduleVisit(
            @PathVariable String id,
            @Valid @RequestBody EvcRescheduleRequest request) {
        return ResponseEntity.ok(evcService.rescheduleVisit(id, request));
    }

    @RequestMapping(value = "/schedules/{id}/cancel", method = {RequestMethod.POST, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Cancel an EVC visit with reason")
    public ResponseEntity<EvcScheduleDto> cancelVisit(
            @PathVariable String id,
            @Valid @RequestBody EvcCancelRequest request) {
        return ResponseEntity.ok(evcService.cancelVisit(id, request));
    }

    @PostMapping("/schedules/{id}/assign-committee")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Assign expert committee members to EVC schedule")
    public ResponseEntity<EvcScheduleDto> assignCommitteeMembers(
            @PathVariable String id,
            @Valid @RequestBody EvcAssignCommitteeRequest request) {
        return ResponseEntity.ok(evcService.assignCommitteeMembers(id, request));
    }

    @PostMapping("/schedules/{id}/assign")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Assign expert committee and inspection date (legacy compatibility)")
    public ResponseEntity<EvcScheduleDto> assignCommittee(
            @PathVariable String id,
            @RequestBody EvcAssignRequest request) {
        return ResponseEntity.ok(evcService.assignCommittee(id, request));
    }

    @PostMapping("/schedules/{id}/report")
    @PreAuthorize("hasAnyRole('EVC_MEMBER', 'REGIONAL_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Submit EVC visit findings, photos, and recommendation report")
    public ResponseEntity<EvcScheduleDto> submitReport(
            @PathVariable String id,
            @Valid @RequestBody EvcReportSubmitRequest request) {
        return ResponseEntity.ok(evcService.submitReport(id, request));
    }

    @PostMapping("/schedules/{id}/review-report")
    @PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Review submitted EVC report (Accept or Return for revision)")
    public ResponseEntity<EvcScheduleDto> reviewReport(
            @PathVariable String id,
            @Valid @RequestBody EvcReportReviewRequest request) {
        return ResponseEntity.ok(evcService.reviewReport(id, request));
    }

    @PostMapping("/schedules/{id}/complete")
    @PreAuthorize("hasAnyRole('EVC_MEMBER', 'REGIONAL_OFFICER', 'SYSTEM_ADMIN', 'ADMIN')")
    @Operation(summary = "Record completion of EVC physical inspection (legacy compatibility)")
    public ResponseEntity<EvcScheduleDto> completeInspection(
            @PathVariable String id,
            @RequestBody EvcCompleteRequest request) {
        return ResponseEntity.ok(evcService.completeInspection(id, request));
    }
}
