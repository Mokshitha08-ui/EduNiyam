package in.gov.aicte.approval.workflow.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.workflow.dto.WorkflowDto;
import in.gov.aicte.approval.workflow.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workflows")
@Tag(name = "Workflows", description = "AICTE Approval pathways and configurable workflow stage definitions")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }


    @GetMapping
    @Operation(summary = "Get all configured workflow approval pathways")
    public ResponseEntity<PageResponse<WorkflowDto>> getAllWorkflows() {
        List<WorkflowDto> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(PageResponse.of(workflows, workflows.size(), 0, Math.max(workflows.size(), 1)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workflow pathway details by ID")
    public ResponseEntity<WorkflowDto> getWorkflowById(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getWorkflowById(id));
    }

    @PutMapping("/{id}/config")
    @Operation(summary = "Update SLA and pathway configuration for a workflow")
    public ResponseEntity<WorkflowDto> updateConfig(@PathVariable String id, @RequestBody Map<String, Object> config) {
        return ResponseEntity.ok(workflowService.updateConfig(id, config));
    }
}
