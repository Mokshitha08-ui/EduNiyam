package in.gov.aicte.approval.report;

import in.gov.aicte.approval.application.dto.ApplicationDto;
import in.gov.aicte.approval.application.service.ApplicationService;
import in.gov.aicte.approval.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@Tag(name = "Reports", description = "AICTE Council compliance reports and export data generation")
public class ReportController {

    private final ApplicationService applicationService;

    public ReportController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }


    @GetMapping("/summary")
    @Operation(summary = "Generate annual approval and compliance executive summary report")
    public ResponseEntity<Map<String, Object>> getSummaryReport(
            @RequestParam(defaultValue = "2026-27") String academicYear) {
        PageResponse<ApplicationDto> apps = applicationService.getAllApplications(0, 1000, null, null, null, null, null);

        Map<String, Object> report = new HashMap<>();
        report.put("academicYear", academicYear);
        report.put("reportTitle", "Council Technical Institutions Approval & Compliance Summary");
        report.put("generatedAt", java.time.LocalDateTime.now().toString());
        report.put("totalRecords", apps.getTotalElements());
        report.put("records", apps.getContent());

        return ResponseEntity.ok(report);
    }
}
