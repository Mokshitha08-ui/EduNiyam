package in.gov.aicte.approval.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled background tasks for statutory reminders and expiry monitoring (Features 49, 50).
 * Runs hourly; idempotent checks prevent repeated duplicate alerts.
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private final NotificationService notificationService;

    public NotificationScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Run every 2 hours
    @Scheduled(fixedRate = 7200000, initialDelay = 60000)
    public void runPeriodicStatutoryAlertScans() {
        try {
            int deadlineReminders = notificationService.generateUpcomingDeadlineReminders();
            int docAlerts = notificationService.generateDocumentExpiryAlerts();
            if (deadlineReminders > 0 || docAlerts > 0) {
                log.info("Scheduled statutory reminder scan completed: {} deadline alerts, {} doc expiry alerts generated.",
                        deadlineReminders, docAlerts);
            }
        } catch (Exception e) {
            log.warn("Scheduled notification scan encountered an issue: {}", e.getMessage());
        }
    }
}
