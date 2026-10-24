package in.gov.aicte.approval.notification.service;

import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.notification.dto.EscalationDto;
import in.gov.aicte.approval.notification.dto.NotificationDto;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EscalationRepository escalationRepository;

    public NotificationService(NotificationRepository notificationRepository, EscalationRepository escalationRepository) {
        this.notificationRepository = notificationRepository;
        this.escalationRepository = escalationRepository;
    }


    @Transactional(readOnly = true)
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markRead(String id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notif.setRead(true);
        return NotificationDto.fromEntity(notificationRepository.save(notif));
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.markAllAsRead();
    }

    @Transactional(readOnly = true)
    public List<EscalationDto> getAllEscalations() {
        return escalationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(EscalationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EscalationDto acknowledgeEscalation(String id, String acknowledgedBy) {
        Escalation esc = escalationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escalation", "id", id));
        esc.setStatus("ACKNOWLEDGED");
        esc.setAcknowledgedBy(acknowledgedBy != null ? acknowledgedBy : "Responsible Officer");
        return EscalationDto.fromEntity(escalationRepository.save(esc));
    }
}
