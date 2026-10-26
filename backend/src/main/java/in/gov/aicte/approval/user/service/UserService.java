package in.gov.aicte.approval.user.service;

import in.gov.aicte.approval.auth.dto.UserDto;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       InstitutionRepository institutionRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(UserDto userDto) {
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new BadRequestException("Email address is required.");
        }
        String email = userDto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Official email address is already registered: " + email);
        }

        String id = userDto.getId() != null && !userDto.getId().isBlank()
                ? userDto.getId().trim()
                : "USR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String rawPassword = (userDto.getPassword() != null && !userDto.getPassword().isBlank())
                ? userDto.getPassword()
                : "demoPassword123";
        String role = userDto.getRole() != null && !userDto.getRole().isBlank()
                ? userDto.getRole().trim().toUpperCase()
                : "REGIONAL_OFFICER";
        if ("COLLEGE_REPRESENTATIVE".equalsIgnoreCase(role)) {
            role = "COLLEGE_REP";
        }

        String instCode = userDto.getInstitutionCode() != null && !userDto.getInstitutionCode().isBlank()
                ? userDto.getInstitutionCode().trim()
                : null;
        String instName = userDto.getInstitution();
        String status = (userDto.getStatus() != null && !userDto.getStatus().isBlank())
                ? userDto.getStatus().trim().toUpperCase()
                : "ACTIVE";

        if ("COLLEGE_REP".equalsIgnoreCase(role) && instCode != null) {
            Optional<Institution> instOpt = institutionRepository.findByCode(instCode);
            if (instOpt.isPresent()) {
                Institution inst = instOpt.get();
                if (instName == null || instName.isBlank()) {
                    instName = inst.getName();
                }
                if ("PENDING_VERIFICATION".equalsIgnoreCase(inst.getStatus())) {
                    status = "PENDING_VERIFICATION";
                }
            }
        }

        User user = User.builder()
                .id(id)
                .name(userDto.getName())
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .department(userDto.getDepartment())
                .region(userDto.getRegion())
                .institutionCode(instCode)
                .institutionName(instName)
                .avatarUrl(userDto.getAvatar())
                .phone(userDto.getPhone())
                .status(status)
                .build();

        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUserStatus(String id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setStatus(status);
        return UserDto.fromEntity(userRepository.save(user));
    }
}
