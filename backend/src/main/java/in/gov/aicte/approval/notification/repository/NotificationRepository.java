package in.gov.aicte.approval.notification.repository;

import in.gov.aicte.approval.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    boolean existsByEntityIdAndCategoryAndIsReadFalse(String entityId, String category);
    boolean existsByEntityIdAndCategoryAndCreatedAtAfter(String entityId, String category, LocalDateTime after);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true")
    void markAllAsRead();

    // College Rep isolation: only notifications targeted to their institution, email, or user ID
    @Query("SELECT n FROM Notification n WHERE (n.recipientRole = 'COLLEGE_REP' OR n.recipientRole = 'ALL') " +
           "AND (n.institutionCode = :institutionCode OR n.recipientEmail = :email OR n.recipientId = :userId) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findForCollegeRep(@Param("institutionCode") String institutionCode,
                                         @Param("email") String email,
                                         @Param("userId") String userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.recipientRole = 'COLLEGE_REP' OR n.recipientRole = 'ALL') " +
           "AND (n.institutionCode = :institutionCode OR n.recipientEmail = :email OR n.recipientId = :userId)")
    void markAllAsReadForCollegeRep(@Param("institutionCode") String institutionCode,
                                    @Param("email") String email,
                                    @Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND (n.recipientRole = 'COLLEGE_REP' OR n.recipientRole = 'ALL') " +
           "AND (n.institutionCode = :institutionCode OR n.recipientEmail = :email OR n.recipientId = :userId)")
    long countUnreadForCollegeRep(@Param("institutionCode") String institutionCode,
                                  @Param("email") String email,
                                  @Param("userId") String userId);

    // AICTE Officer isolation: officer-specific or role-targeted alerts, excluding college-only notifications
    @Query("SELECT n FROM Notification n WHERE ((n.recipientRole = :role OR n.recipientRole = 'ALL') " +
           "OR n.recipientEmail = :email OR n.recipientId = :userId) " +
           "AND n.recipientRole != 'COLLEGE_REP' " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findForOfficer(@Param("role") String role,
                                      @Param("email") String email,
                                      @Param("userId") String userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE ((n.recipientRole = :role OR n.recipientRole = 'ALL') " +
           "OR n.recipientEmail = :email OR n.recipientId = :userId) AND n.recipientRole != 'COLLEGE_REP'")
    void markAllAsReadForOfficer(@Param("role") String role,
                                 @Param("email") String email,
                                 @Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND ((n.recipientRole = :role OR n.recipientRole = 'ALL') " +
           "OR n.recipientEmail = :email OR n.recipientId = :userId) AND n.recipientRole != 'COLLEGE_REP'")
    long countUnreadForOfficer(@Param("role") String role,
                               @Param("email") String email,
                               @Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    long countUnreadForAdmin();
}
