package in.gov.aicte.approval.notification.controller;

import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.notification.dto.NotificationDto;
import in.gov.aicte.approval.notification.service.NotificationService;
import in.gov.aicte.approval.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "AICTE Officer and Institutional Alert Notifications endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private UserPrincipal getPrincipal(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    @GetMapping
    @Operation(summary = "Get scoped notifications for current authenticated user")
    public ResponseEntity<PageResponse<NotificationDto>> getAllNotifications(
            @RequestParam(required = false) String role,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        List<NotificationDto> notifications;
        if (principal != null) {
            notifications = notificationService.getScopedNotifications(principal, role);
        } else if (role != null && !role.isBlank()) {
            notifications = notificationService.getNotificationsByRole(role);
        } else {
            notifications = notificationService.getAllNotifications();
        }
        return ResponseEntity.ok(PageResponse.of(notifications, notifications.size(), 0, Math.max(notifications.size(), 1)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count for current authenticated user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        long count = notificationService.getScopedUnreadCount(principal);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark specific notification as read with ownership validation")
    public ResponseEntity<NotificationDto> markRead(@PathVariable String id, Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        return ResponseEntity.ok(notificationService.markRead(id, principal));
    }

    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Mark notification as acknowledged with user accountability")
    public ResponseEntity<NotificationDto> acknowledgeNotification(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        String actor = payload != null && payload.get("acknowledgedBy") != null
                ? payload.get("acknowledgedBy")
                : (principal != null ? principal.getName() : "Authorized Officer");
        return ResponseEntity.ok(notificationService.acknowledgeNotification(id, actor, principal));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Mark related task as completed with ownership check")
    public ResponseEntity<NotificationDto> completeNotificationAction(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        String actor = payload != null && payload.get("completedBy") != null
                ? payload.get("completedBy")
                : (principal != null ? principal.getName() : "Authorized Officer");
        return ResponseEntity.ok(notificationService.completeNotificationAction(id, actor, principal));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all scoped notifications as read")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        notificationService.markAllRead(principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/trigger-reminders")
    @Operation(summary = "Trigger idempotent background deadline and document expiry reminder scan")
    public ResponseEntity<Map<String, Object>> triggerReminders() {
        int deadlineReminders = notificationService.generateUpcomingDeadlineReminders();
        int docAlerts = notificationService.generateDocumentExpiryAlerts();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "deadlineRemindersGenerated", deadlineReminders,
                "documentExpiryAlertsGenerated", docAlerts
        ));
    }
}
