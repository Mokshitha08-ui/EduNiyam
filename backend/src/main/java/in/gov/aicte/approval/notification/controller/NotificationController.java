package in.gov.aicte.approval.notification.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.notification.dto.NotificationDto;
import in.gov.aicte.approval.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "AICTE Officer and Institutional Alert Notifications endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    @GetMapping
    @Operation(summary = "Get all notifications list")
    public ResponseEntity<PageResponse<NotificationDto>> getAllNotifications() {
        List<NotificationDto> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(PageResponse.of(notifications, notifications.size(), 0, Math.max(notifications.size(), 1)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark specific notification as read")
    public ResponseEntity<NotificationDto> markRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }
}
