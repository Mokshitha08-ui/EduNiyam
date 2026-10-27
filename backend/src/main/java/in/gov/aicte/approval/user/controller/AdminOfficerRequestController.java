package in.gov.aicte.approval.user.controller;

import in.gov.aicte.approval.auth.AuthService;
import in.gov.aicte.approval.auth.dto.OfficerAccessRequestDto;
import in.gov.aicte.approval.auth.dto.OfficerRequestActionRequest;
import in.gov.aicte.approval.institution.dto.InstitutionVerificationDto;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
@Tag(name = "Administrator - Requests & Verification", description = "Endpoints for reviewing, approving, and rejecting AICTE Officer access requests and Institutional registrations")
public class AdminOfficerRequestController {

    private final AuthService authService;

    public AdminOfficerRequestController(AuthService authService) {
        this.authService = authService;
    }

    private void verifyAdminRole(UserPrincipal principal) {
        if (principal == null || (!"ADMIN".equalsIgnoreCase(principal.getRole()) && !"SYSTEM_ADMIN".equalsIgnoreCase(principal.getRole()))) {
            throw new AccessDeniedException("Access denied: Only an authorized AICTE System Administrator can perform administrative actions.");
        }
    }

    @GetMapping("/officer-requests")
    @Operation(summary = "List all officer access requests with optional status filter")
    public ResponseEntity<List<OfficerAccessRequestDto>> getOfficerRequests(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.getOfficerAccessRequests(status));
    }

    @PostMapping("/officer-requests/{id}/approve")
    @Operation(summary = "Approve officer access request and provision active account")
    public ResponseEntity<OfficerAccessRequestDto> approveRequest(
            @PathVariable String id,
            @RequestBody(required = false) OfficerRequestActionRequest action,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.approveOfficerRequest(id, action, principal.getName()));
    }

    @PostMapping("/officer-requests/{id}/reject")
    @Operation(summary = "Reject officer access request with reason")
    public ResponseEntity<OfficerAccessRequestDto> rejectRequest(
            @PathVariable String id,
            @RequestBody(required = false) OfficerRequestActionRequest action,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.rejectOfficerRequest(id, action, principal.getName()));
    }

    @GetMapping("/institutions")
    @Operation(summary = "List all registered institutions with optional verification status filter")
    public ResponseEntity<List<InstitutionVerificationDto>> getInstitutions(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.getInstitutions(status));
    }

    @PostMapping("/institutions/{code}/verify")
    @Operation(summary = "Verify institution registration and activate associated representative accounts")
    public ResponseEntity<InstitutionVerificationDto> verifyInstitution(
            @PathVariable String code,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.verifyInstitution(code, principal.getName()));
    }

    @PostMapping("/institutions/{code}/reject")
    @Operation(summary = "Reject institution registration with reason")
    public ResponseEntity<InstitutionVerificationDto> rejectInstitution(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(authService.rejectInstitution(code, reason, principal.getName()));
    }
}
