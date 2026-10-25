package in.gov.aicte.approval.auth;

import in.gov.aicte.approval.auth.dto.*;
import in.gov.aicte.approval.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for AICTE Official and Institutional authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/staff/login")
    @Operation(summary = "Authenticate AICTE Officer with designation role validation")
    public ResponseEntity<AuthResponse> loginStaff(@Valid @RequestBody StaffLoginRequest request) {
        return ResponseEntity.ok(authService.loginStaff(request));
    }

    @PostMapping("/staff/access-requests")
    @Operation(summary = "Submit new AICTE Officer access request")
    public ResponseEntity<OfficerAccessRequestDto> createOfficerAccessRequest(@Valid @RequestBody OfficerAccessRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createOfficerAccessRequest(request));
    }

    @PostMapping("/institution/login")
    @Operation(summary = "Authenticate institutional representative by College ID, Email, and Password")
    public ResponseEntity<AuthResponse> loginInstitution(@Valid @RequestBody InstitutionLoginRequest request) {
        return ResponseEntity.ok(authService.loginInstitution(request));
    }

    @PostMapping("/institutions/register")
    @Operation(summary = "Register new technical institution and representative account")
    public ResponseEntity<InstitutionRegisterResponse> registerInstitution(@Valid @RequestBody InstitutionRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerInstitution(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear user authentication session")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Session cleared successfully", "LOGGED_OUT"));
    }
}
