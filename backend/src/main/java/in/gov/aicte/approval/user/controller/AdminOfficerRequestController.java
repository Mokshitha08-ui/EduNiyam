package in.gov.aicte.approval.user.controller;

import in.gov.aicte.approval.auth.AuthService;
import in.gov.aicte.approval.auth.dto.OfficerAccessRequestDto;
import in.gov.aicte.approval.auth.dto.OfficerRequestActionRequest;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/officer-requests")
@Tag(name = "Administrator - Officer Requests", description = "Endpoints for reviewing, approving, and rejecting AICTE Officer access requests")
public class AdminOfficerRequestController {

    private final AuthService authService;

    public AdminOfficerRequestController(AuthService authService) {
        this.authService = authService;
    }

    private void verifyAdminRole(UserPrincipal principal) {
        if (principal == null || (!"ADMIN".equalsIgnoreCase(principal.getRole()) && !"SYSTEM_ADMIN".equalsIgnoreCase(principal.getRole()))) {
            throw new BadRequestException("Access denied: Only an authorized AICTE System Administrator can review and manage officer access requests.");
        }
    }

    @GetMapping
    @Operation(summary = "List all officer access requests with optional status filter")
    public ResponseEntity<List<OfficerAccessRequestDto>> getOfficerRequests(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.getOfficerAccessRequests(status));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve officer access request and provision active account")
    public ResponseEntity<OfficerAccessRequestDto> approveRequest(
            @PathVariable String id,
            @RequestBody(required = false) OfficerRequestActionRequest action,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.approveOfficerRequest(id, action, principal.getName()));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject officer access request with reason")
    public ResponseEntity<OfficerAccessRequestDto> rejectRequest(
            @PathVariable String id,
            @RequestBody(required = false) OfficerRequestActionRequest action,
            @AuthenticationPrincipal UserPrincipal principal) {
        verifyAdminRole(principal);
        return ResponseEntity.ok(authService.rejectOfficerRequest(id, action, principal.getName()));
    }
}
