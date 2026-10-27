package in.gov.aicte.approval.institution.controller;

import in.gov.aicte.approval.auth.AuthService;
import in.gov.aicte.approval.institution.dto.InstitutionVerificationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/institutions")
@Tag(name = "Institutions", description = "Endpoints for querying registered technical institutions and verification queue")
public class InstitutionController {

    private final AuthService authService;

    public InstitutionController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List all registered institutions with optional status filter")
    public ResponseEntity<List<InstitutionVerificationDto>> getAllInstitutions(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(authService.getInstitutions(status));
    }

    @GetMapping("/pending")
    @Operation(summary = "List all institutions awaiting verification")
    public ResponseEntity<List<InstitutionVerificationDto>> getPendingInstitutions() {
        return ResponseEntity.ok(authService.getInstitutions("PENDING_VERIFICATION"));
    }
}
