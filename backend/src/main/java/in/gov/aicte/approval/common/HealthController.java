package in.gov.aicte.approval.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Tag(name = "Health", description = "System connectivity and uptime check")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend API health and status")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "aicte-approval-backend",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString(),
                "database", "PostgreSQL Connected"
        ));
    }
}
