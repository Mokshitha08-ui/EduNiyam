package in.gov.aicte.approval.auth;

import in.gov.aicte.approval.application.repository.ApplicationDocumentRepository;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.auth.dto.InstitutionLoginRequest;
import in.gov.aicte.approval.auth.dto.InstitutionRegisterRequest;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.security.JwtTokenProvider;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.OfficerAccessRequestRepository;
import in.gov.aicte.approval.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthValidationTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private OfficerAccessRequestRepository officerAccessRequestRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private ApplicationDocumentRepository applicationDocumentRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                tokenProvider,
                userRepository,
                institutionRepository,
                officerAccessRequestRepository,
                passwordEncoder,
                auditLogRepository,
                applicationDocumentRepository
        );
    }

    @Test
    @DisplayName("Institutional Sign Up rejects null or blank College ID")
    void registerInstitution_shouldRejectMissingCollegeId() {
        InstitutionRegisterRequest request = new InstitutionRegisterRequest();
        request.setInstitutionName("Test Engineering College");
        request.setInstitutionCode("   "); // blank
        request.setEmail("test@college.edu.in");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");
        request.setState("Karnataka");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.registerInstitution(request)
        );
        assertTrue(ex.getMessage().contains("College ID / Institution Code is required"), "Actual: " + ex.getMessage());
    }

    @Test
    @DisplayName("Institutional Sign Up rejects duplicate College ID")
    void registerInstitution_shouldRejectDuplicateCollegeId() {
        InstitutionRegisterRequest request = new InstitutionRegisterRequest();
        request.setInstitutionName("Existing College");
        request.setInstitutionCode("1-34981275");
        request.setEmail("new@college.edu.in");
        request.setPassword("Password@123");
        request.setConfirmPassword("Password@123");
        request.setState("Karnataka");

        when(userRepository.existsByEmailIgnoreCase("new@college.edu.in")).thenReturn(false);
        when(institutionRepository.existsByCode("1-34981275")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.registerInstitution(request)
        );
        assertTrue(ex.getMessage().contains("College ID / Institution Code is already registered"), "Actual: " + ex.getMessage());
    }

    @Test
    @DisplayName("Institutional Sign In rejects null or blank College ID")
    void loginInstitution_shouldRejectMissingCollegeId() {
        InstitutionLoginRequest request = new InstitutionLoginRequest();
        request.setEmail("college@demo.edu.in");
        request.setPassword("College@123");
        request.setInstitutionCode(""); // blank

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.loginInstitution(request)
        );
        assertTrue(ex.getMessage().contains("College ID / Institution Code is required"));
    }

    @Test
    @DisplayName("Institutional Sign In rejects mismatched College ID")
    void loginInstitution_shouldRejectMismatchedCollegeId() {
        InstitutionLoginRequest request = new InstitutionLoginRequest();
        request.setEmail("college@demo.edu.in");
        request.setPassword("College@123");
        request.setInstitutionCode("1-99999999");

        User existingUser = User.builder()
                .email("college@demo.edu.in")
                .institutionCode("1-34981275")
                .role("COLLEGE_REP")
                .status("ACTIVE")
                .build();

        when(userRepository.findByEmailIgnoreCase("college@demo.edu.in")).thenReturn(Optional.of(existingUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.loginInstitution(request)
        );
        assertTrue(ex.getMessage().contains("College ID / Institution Code does not match"));
    }
}
