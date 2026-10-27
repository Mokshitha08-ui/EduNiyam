package in.gov.aicte.approval.audit.service;

import in.gov.aicte.approval.audit.dto.AuditLogDto;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AuditLogDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getLogsByEntityId(String entityId) {
        return auditLogRepository.findByEntityIdOrderByCreatedAtDesc(entityId).stream()
                .map(AuditLogDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AuditLog logEvent(String userName, String role, String entityId, String action,
                             String previousState, String newState, String reason, String ipAddress) {
        String id = "AUD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String ts = FORMATTER.format(LocalDateTime.now());

        AuditLog log = AuditLog.builder()
                .id(id)
                .timestamp(ts)
                .userName(userName != null && !userName.isBlank() ? userName : "Authorized Official")
                .role(role != null && !role.isBlank() ? role : "SYSTEM")
                .entityId(entityId != null ? entityId : "SYSTEM")
                .action(action != null ? action : "STATE_TRANSITION")
                .previousState(previousState != null ? previousState : "N/A")
                .newState(newState != null ? newState : "N/A")
                .reason(reason != null ? reason : "Routine administrative workflow transition")
                .ipAddress(ipAddress != null && !ipAddress.isBlank() ? ipAddress : "10.200.4.88")
                .build();

        return auditLogRepository.save(log);
    }
}
