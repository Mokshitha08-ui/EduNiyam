package in.gov.aicte.approval.auth;

import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.auth.dto.*;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.security.JwtTokenProvider;
import in.gov.aicte.approval.security.UserPrincipal;
import in.gov.aicte.approval.user.entity.OfficerAccessRequest;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.OfficerAccessRequestRepository;
import in.gov.aicte.approval.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final OfficerAccessRequestRepository officerAccessRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       InstitutionRepository institutionRepository,
                       OfficerAccessRequestRepository officerAccessRequestRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.officerAccessRequestRepository = officerAccessRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        user.setLastLogin(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a")));
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(86400)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse loginStaff(StaffLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Check if user is in pending or rejected officer access requests
        officerAccessRequestRepository.findByEmailIgnoreCase(email).ifPresent(req -> {
            if ("PENDING_APPROVAL".equalsIgnoreCase(req.getStatus())) {
                throw new BadRequestException("Officer Access Request is currently PENDING_APPROVAL. An authorized administrator must review and approve your request before access is granted.");
            }
            if ("REJECTED".equalsIgnoreCase(req.getStatus())) {
                String reason = req.getRejectionReason() != null ? req.getRejectionReason() : "Incomplete or unverifiable credentials";
                throw new BadRequestException("Your Officer Access Request was REJECTED by System Administration. Reason: " + reason);
            }
        });

        // 2. Lookup user in staff_users
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid credentials or unregistered official email address."));

        // 3. Reject college accounts trying to sign in through officer desk
        if ("COLLEGE_REP".equalsIgnoreCase(user.getRole())) {
            throw new BadRequestException("Access restricted: This account belongs to a College Representative. Please use the Institutional Sign In tab.");
        }

        // 4. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid official email address or password.");
        }

        // 5. Verify Designation / Role Match
        if (request.getRequestedRole() != null && !request.getRequestedRole().isBlank()) {
            String reqRole = request.getRequestedRole().trim();
            String actualRole = user.getRole();
            boolean match = reqRole.equalsIgnoreCase(actualRole) ||
                    (reqRole.equalsIgnoreCase("SYSTEM_ADMIN") && actualRole.equalsIgnoreCase("ADMIN")) ||
                    (reqRole.equalsIgnoreCase("ADMIN") && actualRole.equalsIgnoreCase("SYSTEM_ADMIN"));

            if (!match) {
                throw new BadRequestException("Role mismatch: Your official account is assigned the role " + actualRole + ", but you are attempting to sign in under " + reqRole + ". Please select the correct designation.");
            }
        }

        // 6. Check user status
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Official account status is " + user.getStatus() + ". Please contact the AICTE System Administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        user.setLastLogin(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a")));
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(86400)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public OfficerAccessRequestDto createOfficerAccessRequest(OfficerAccessRequestDto dto) {
        String email = dto.getEmail().trim().toLowerCase();
        String empId = dto.getEmployeeId().trim();

        if (userRepository.existsByEmailIgnoreCase(email) || officerAccessRequestRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Official email address is already registered: " + dto.getEmail());
        }

        if (officerAccessRequestRepository.existsByEmployeeId(empId)) {
            throw new BadRequestException("Employee ID is already registered: " + empId);
        }

        String role = dto.getRequestedRole().trim().toUpperCase();
        if ("ADMIN".equals(role) || "SYSTEM_ADMIN".equals(role)) {
            throw new BadRequestException("System Administrator role cannot be requested publicly. Please contact AICTE HQ Nodal Officer.");
        }

        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match.");
        }

        String requestId = "REQ-" + (10000 + new Random().nextInt(90000));
        OfficerAccessRequest request = OfficerAccessRequest.builder()
                .id(requestId)
                .fullName(dto.getFullName().trim())
                .email(email)
                .employeeId(empId)
                .designation(dto.getDesignation().trim())
                .requestedRole(role)
                .department(dto.getDepartment().trim())
                .region(dto.getRegion() != null ? dto.getRegion().trim() : "All Regions (National HQ)")
                .contactNumber(dto.getContactNumber().trim())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .status("PENDING_APPROVAL")
                .build();

        officerAccessRequestRepository.save(request);

        // Audit Log
        AuditLog log = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(dto.getFullName().trim())
                .role(role)
                .entityId(requestId)
                .action("OFFICER_ACCESS_REQUEST_SUBMITTED")
                .previousState("NONE")
                .newState("PENDING_APPROVAL")
                .reason("New officer access request submitted for " + dto.getDesignation() + " (" + role + ")")
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(log);

        return OfficerAccessRequestDto.fromEntity(request);
    }

    @Transactional(readOnly = true)
    public List<OfficerAccessRequestDto> getOfficerAccessRequests(String status) {
        List<OfficerAccessRequest> requests;
        if (status != null && !status.isBlank()) {
            requests = officerAccessRequestRepository.findAllByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else {
            requests = officerAccessRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return requests.stream().map(OfficerAccessRequestDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public OfficerAccessRequestDto approveOfficerRequest(String requestId, OfficerRequestActionRequest action, String adminUsername) {
        OfficerAccessRequest request = officerAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OfficerAccessRequest", "id", requestId));

        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This request has already been approved.");
        }

        String assignedRole = (action != null && action.getAssignedRole() != null && !action.getAssignedRole().isBlank())
                ? action.getAssignedRole().trim().toUpperCase()
                : request.getRequestedRole();

        request.setStatus("APPROVED");
        request.setReviewedBy(adminUsername);
        officerAccessRequestRepository.save(request);

        // Create or update User in staff_users
        String userId = "USR-OFF-" + (1000 + new Random().nextInt(9000));
        User user = User.builder()
                .id(userId)
                .name(request.getFullName())
                .email(request.getEmail())
                .employeeId(request.getEmployeeId())
                .passwordHash(request.getPasswordHash())
                .role(assignedRole)
                .department(request.getDepartment())
                .region(request.getRegion())
                .phone(request.getContactNumber())
                .status("ACTIVE")
                .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&fit=crop&q=80")
                .build();
        userRepository.save(user);

        // Audit Log
        AuditLog log = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(adminUsername)
                .role("ADMIN")
                .entityId(requestId)
                .action("OFFICER_REQUEST_APPROVED")
                .previousState("PENDING_APPROVAL")
                .newState("ACTIVE")
                .reason("Officer access approved by " + adminUsername + ". Assigned role: " + assignedRole)
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(log);

        return OfficerAccessRequestDto.fromEntity(request);
    }

    @Transactional
    public OfficerAccessRequestDto rejectOfficerRequest(String requestId, OfficerRequestActionRequest action, String adminUsername) {
        OfficerAccessRequest request = officerAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OfficerAccessRequest", "id", requestId));

        String reason = (action != null && action.getReason() != null) ? action.getReason().trim() : "Rejected by Administrator";
        request.setStatus("REJECTED");
        request.setReviewedBy(adminUsername);
        request.setRejectionReason(reason);
        officerAccessRequestRepository.save(request);

        // Audit Log
        AuditLog log = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(adminUsername)
                .role("ADMIN")
                .entityId(requestId)
                .action("OFFICER_REQUEST_REJECTED")
                .previousState("PENDING_APPROVAL")
                .newState("REJECTED")
                .reason("Officer access request rejected by " + adminUsername + ". Reason: " + reason)
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(log);

        return OfficerAccessRequestDto.fromEntity(request);
    }

    @Transactional
    public AuthResponse loginInstitution(InstitutionLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getInstitutionCode().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid credentials or unregistered institutional email address."));

        if (!"COLLEGE_REP".equalsIgnoreCase(user.getRole())) {
            throw new BadRequestException("Access restricted. This login form is exclusively for Technical Institutions.");
        }

        if (user.getInstitutionCode() == null || !user.getInstitutionCode().equalsIgnoreCase(code)) {
            throw new BadRequestException("Institution Code / College ID does not match the registered representative email.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid institutional credentials. Please check your College ID, email, and password.");
        }

        if ("PENDING_VERIFICATION".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your institution registration is currently PENDING_VERIFICATION by AICTE Regional Office. Dashboard access will be activated upon official verification.");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Institutional account is " + user.getStatus() + ". Please contact the AICTE Regional Bureau.");
        }

        institutionRepository.findByCode(user.getInstitutionCode()).ifPresent(inst -> {
            if ("PENDING_VERIFICATION".equalsIgnoreCase(inst.getStatus())) {
                throw new BadRequestException("Your institution is currently PENDING_VERIFICATION by AICTE. Please await administrative verification.");
            }
        });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        user.setLastLogin(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a")));
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(86400)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public InstitutionRegisterResponse registerInstitution(InstitutionRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match.");
        }

        if (request.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        boolean hasUpper = request.getPassword().chars().anyMatch(Character::isUpperCase);
        boolean hasLower = request.getPassword().chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = request.getPassword().chars().anyMatch(Character::isDigit);
        if (!hasUpper || !hasLower || !hasDigit) {
            throw new BadRequestException("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Official email address is already registered: " + request.getEmail());
        }

        String code = request.getInstitutionCode() != null ? request.getInstitutionCode().trim() : "";
        if (!code.isEmpty()) {
            if (institutionRepository.existsByCode(code)) {
                throw new BadRequestException("Institution Code / College ID is already registered: " + code);
            }
        } else {
            code = "1-" + (10000000 + new Random().nextInt(90000000));
        }

        String region = determineRegion(request.getState());

        Institution institution = Institution.builder()
                .code(code)
                .name(request.getInstitutionName().trim())
                .institutionType(request.getInstitutionType().trim())
                .region(region)
                .state(request.getState().trim())
                .district(request.getDistrict().trim())
                .address(request.getAddress().trim())
                .contactEmail(email)
                .contactPhone(request.getContactNumber().trim())
                .status("PENDING_VERIFICATION")
                .build();
        institutionRepository.save(institution);

        String userId = "USR-INST-" + (10000 + new Random().nextInt(90000));
        User user = User.builder()
                .id(userId)
                .name(request.getRepresentativeName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("COLLEGE_REP")
                .department(request.getDesignation().trim())
                .region(region)
                .institutionCode(code)
                .institutionName(request.getInstitutionName().trim())
                .phone(request.getContactNumber().trim())
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop&q=80")
                .status("PENDING_VERIFICATION")
                .build();
        userRepository.save(user);

        // Audit Log
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(request.getRepresentativeName().trim())
                .role("COLLEGE_REP")
                .entityId(code)
                .action("INSTITUTION_REGISTERED")
                .previousState("NONE")
                .newState("PENDING_VERIFICATION")
                .reason("New technical institution registration submitted via Institutional Portal: " + request.getInstitutionName())
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(auditLog);

        return InstitutionRegisterResponse.builder()
                .success(true)
                .message("Institutional registration submitted successfully. Your application is awaiting AICTE administrative verification. Credentials will be active once approved.")
                .institutionCode(code)
                .institutionName(request.getInstitutionName().trim())
                .status("PENDING_VERIFICATION")
                .registeredAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }

    private String determineRegion(String state) {
        if (state == null) return "Central";
        String s = state.toLowerCase();
        if (s.contains("karnataka") || s.contains("kerala") || s.contains("lakshadweep")) return "South-Western";
        if (s.contains("tamil") || s.contains("puducherry") || s.contains("pondicherry")) return "Southern";
        if (s.contains("telangana") || s.contains("andhra")) return "South-Central";
        if (s.contains("maharashtra") || s.contains("goa") || s.contains("gujarat") || s.contains("daman")) return "Western";
        if (s.contains("delhi") || s.contains("uttar pradesh") || s.contains("uttarakhand") || s.contains("haryana") || s.contains("punjab") || s.contains("himachal") || s.contains("jammu") || s.contains("chandigarh")) return "Northern";
        if (s.contains("bengal") || s.contains("odisha") || s.contains("bihar") || s.contains("jharkhand") || s.contains("assam") || s.contains("tripura") || s.contains("sikkim") || s.contains("manipur") || s.contains("meghalaya") || s.contains("mizoram") || s.contains("nagaland") || s.contains("arunachal")) return "Eastern";
        if (s.contains("madhya") || s.contains("chhattisgarh") || s.contains("rajasthan")) return "Central";
        return "Central";
    }

    @Transactional(readOnly = true)
    public List<Institution> getInstitutions(String status) {
        List<Institution> all = institutionRepository.findAll();
        if (status != null && !status.isBlank()) {
            String filter = status.trim().toUpperCase();
            return all.stream()
                    .filter(i -> filter.equalsIgnoreCase(i.getStatus()))
                    .collect(Collectors.toList());
        }
        return all;
    }

    @Transactional
    public Institution verifyInstitution(String code, String adminUsername) {
        Institution inst = institutionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "code", code));

        String prevState = inst.getStatus();
        inst.setStatus("VERIFIED");
        institutionRepository.save(inst);

        List<User> repUsers = userRepository.findByInstitutionCode(code);
        for (User rep : repUsers) {
            if ("PENDING_VERIFICATION".equalsIgnoreCase(rep.getStatus())) {
                rep.setStatus("ACTIVE");
                userRepository.save(rep);
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(adminUsername)
                .role("ADMIN")
                .entityId(code)
                .action("INSTITUTION_VERIFIED")
                .previousState(prevState)
                .newState("VERIFIED")
                .reason("Institution verified by " + adminUsername + "; associated representative accounts activated.")
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(auditLog);

        return inst;
    }

    @Transactional
    public Institution rejectInstitution(String code, String reason, String adminUsername) {
        Institution inst = institutionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "code", code));

        String prevState = inst.getStatus();
        inst.setStatus("REJECTED");
        institutionRepository.save(inst);

        List<User> repUsers = userRepository.findByInstitutionCode(code);
        for (User rep : repUsers) {
            if ("PENDING_VERIFICATION".equalsIgnoreCase(rep.getStatus())) {
                rep.setStatus("REJECTED");
                userRepository.save(rep);
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + (100000 + new Random().nextInt(900000)))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .userName(adminUsername)
                .role("ADMIN")
                .entityId(code)
                .action("INSTITUTION_REJECTED")
                .previousState(prevState)
                .newState("REJECTED")
                .reason("Institution registration rejected by " + adminUsername + ". Reason: " + (reason != null ? reason : "Not specified"))
                .ipAddress("127.0.0.1")
                .build();
        auditLogRepository.save(auditLog);

        return inst;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserDto.fromEntity(user);
    }
}
