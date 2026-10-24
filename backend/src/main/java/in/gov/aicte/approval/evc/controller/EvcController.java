package in.gov.aicte.approval.evc.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.evc.dto.EvcAssignRequest;
import in.gov.aicte.approval.evc.dto.EvcCompleteRequest;
import in.gov.aicte.approval.evc.dto.EvcScheduleDto;
import in.gov.aicte.approval.evc.service.EvcService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evc")
@Tag(name = "EVC", description = "Expert Visit Committee (EVC) Physical Inspection Scheduling and Reporting")
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

    @PostMapping("/schedules/{id}/assign")
    @Operation(summary = "Assign expert committee and inspection date")
    public ResponseEntity<EvcScheduleDto> assignCommittee(
            @PathVariable String id,
            @RequestBody EvcAssignRequest request) {
        return ResponseEntity.ok(evcService.assignCommittee(id, request));
    }

    @PostMapping("/schedules/{id}/complete")
    @Operation(summary = "Record completion of EVC physical inspection")
    public ResponseEntity<EvcScheduleDto> completeInspection(
            @PathVariable String id,
            @RequestBody EvcCompleteRequest request) {
        return ResponseEntity.ok(evcService.completeInspection(id, request));
    }
}
