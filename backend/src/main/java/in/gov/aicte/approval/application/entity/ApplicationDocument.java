package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "staff_documents")
public class ApplicationDocument {

    @Id
    @Column(name = "id", length = 64)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    @Column(name = "doc_type", length = 32)
    private String type = "PDF";
    @Column(name = "size", length = 32)
    private String size;
    @Column(name = "status", length = 64)
    private String status = "VERIFIED";
    @Column(name = "upload_date")
    private LocalDate uploadDate;
    @Column(name = "file_url", length = 512)
    private String fileUrl;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ApplicationDocument() {
    }

    public ApplicationDocument(String id, Application application, String title, String type, String size, String status, LocalDate uploadDate, String fileUrl, LocalDateTime createdAt) {
        this.id = id;
        this.application = application;
        this.title = title;
        this.type = type;
        this.size = size;
        this.status = status;
        this.uploadDate = uploadDate;
        this.fileUrl = fileUrl;
        this.createdAt = createdAt;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Application getApplication() {
        return this.application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSize() {
        return this.size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getUploadDate() {
        return this.uploadDate;
    }

    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private Application application;
        private String title;
        private String type = "PDF";
        private String size;
        private String status = "VERIFIED";
        private LocalDate uploadDate;
        private String fileUrl;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder application(Application application) {
            this.application = application;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder size(String size) {
            this.size = size;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder uploadDate(LocalDate uploadDate) {
            this.uploadDate = uploadDate;
            return this;
        }

        public Builder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ApplicationDocument build() {
            return new ApplicationDocument(this.id, this.application, this.title, this.type, this.size, this.status, this.uploadDate, this.fileUrl, this.createdAt);
        }
    }

}
