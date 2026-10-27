package in.gov.aicte.approval.notification.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.notification.dto.EscalationDto;
import in.gov.aicte.approval.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/escalations")
@Tag(name = "Escalations", description = "SLA Breach and Multi-level Escalation Handling endpoints")
public class EscalationController {

    private final NotificationService notificationService;

    public EscalationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get list of active SLA escalations")
    public ResponseEntity<PageResponse<EscalationDto>> getAllEscalations() {
        List<EscalationDto> escalations = notificationService.getAllEscalations();
        return ResponseEntity.ok(PageResponse.of(escalations, escalations.size(), 0, Math.max(escalations.size(), 1)));
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an escalated compliance or scrutiny violation")
    public ResponseEntity<EscalationDto> acknowledgeEscalation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication auth) {
        String officer = payload != null && payload.get("acknowledgedBy") != null
                ? payload.get("acknowledgedBy")
                : (auth != null ? auth.getName() : "Responsible Officer");
        return ResponseEntity.ok(notificationService.acknowledgeEscalation(id, officer));
    }

    @PostMapping("/trigger")
    @Operation(summary = "Manually trigger or test an escalation")
    public ResponseEntity<EscalationDto> triggerEscalation(
            @RequestBody Map<String, String> payload) {
        String entityId = payload.get("entityId");
        String instName = payload.get("institutionName");
        String level = payload.getOrDefault("level", "LEVEL_1");
        String levelTitle = payload.getOrDefault("levelTitle", "Regional Officer Alert");
        String recipient = payload.getOrDefault("recipient", "Dr. Suresh Kumar Nair");
        String reason = payload.getOrDefault("reason", "Statutory SLA timeframe exceeded");
        String appId = payload.getOrDefault("applicationId", entityId);

        EscalationDto created = notificationService.triggerEscalation(entityId, instName, level, levelTitle, recipient, reason, appId);
        return ResponseEntity.ok(created);
    }
}
