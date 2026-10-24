package in.gov.aicte.approval.institution.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "staff_institutions")
public class Institution {

    @Id
    @Column(name = "code", length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    @Column(name = "region", nullable = false, length = 128)
    private String region;
    @Column(name = "state", nullable = false, length = 128)
    private String state;
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    @Column(name = "contact_email", length = 128)
    private String contactEmail;
    @Column(name = "contact_phone", length = 64)
    private String contactPhone;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Institution() {
    }

    public Institution(String code, String name, String region, String state, String address, String contactEmail, String contactPhone, LocalDateTime createdAt) {
        this.code = code;
        this.name = name;
        this.region = region;
        this.state = state;
        this.address = address;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.createdAt = createdAt;
    }

    public String getCode() {
        return this.code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegion() {
        return this.region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getState() {
        return this.state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getAddress() {
        return this.address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactEmail() {
        return this.contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return this.contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
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
        private String code;
        private String name;
        private String region;
        private String state;
        private String address;
        private String contactEmail;
        private String contactPhone;
        private LocalDateTime createdAt;

        public Builder() {}

        public Builder code(String code) {
            this.code = code;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder state(String state) {
            this.state = state;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder contactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
            return this;
        }

        public Builder contactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Institution build() {
            return new Institution(this.code, this.name, this.region, this.state, this.address, this.contactEmail, this.contactPhone, this.createdAt);
        }
    }

}
