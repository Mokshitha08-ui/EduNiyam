package in.gov.aicte.approval.user.service;

import in.gov.aicte.approval.auth.dto.UserDto;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
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
        String id = userDto.getId() != null ? userDto.getId() : "USR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        User user = User.builder()
                .id(id)
                .name(userDto.getName())
                .email(userDto.getEmail())
                .passwordHash(passwordEncoder.encode("demoPassword123"))
                .role(userDto.getRole() != null ? userDto.getRole() : "REGIONAL_OFFICER")
                .department(userDto.getDepartment())
                .region(userDto.getRegion())
                .institutionCode(userDto.getInstitutionCode())
                .institutionName(userDto.getInstitution())
                .avatarUrl(userDto.getAvatar())
                .phone(userDto.getPhone())
                .status("ACTIVE")
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
