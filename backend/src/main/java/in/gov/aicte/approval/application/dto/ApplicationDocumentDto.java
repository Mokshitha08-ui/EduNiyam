package in.gov.aicte.approval.application.dto;

import in.gov.aicte.approval.application.entity.ApplicationDocument;
import java.time.LocalDate;

public class ApplicationDocumentDto {

    private String id;
    private String title;
    private String type;
    private String size;
    private String status;
    private LocalDate uploadDate;
    private String fileUrl;

    public ApplicationDocumentDto() {
    }

    public ApplicationDocumentDto(String id, String title, String type, String size, String status, LocalDate uploadDate, String fileUrl) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.size = size;
        this.status = status;
        this.uploadDate = uploadDate;
        this.fileUrl = fileUrl;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String type;
        private String size;
        private String status;
        private LocalDate uploadDate;
        private String fileUrl;

        public Builder() {}

        public Builder id(String id) {
            this.id = id;
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

        public ApplicationDocumentDto build() {
            return new ApplicationDocumentDto(this.id, this.title, this.type, this.size, this.status, this.uploadDate, this.fileUrl);
        }
    }

    public static ApplicationDocumentDto fromEntity(ApplicationDocument entity) {
        return ApplicationDocumentDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .type(entity.getType())
                .size(entity.getSize())
                .status(entity.getStatus())
                .uploadDate(entity.getUploadDate())
                .fileUrl(entity.getFileUrl())
                .build();
    }
}
