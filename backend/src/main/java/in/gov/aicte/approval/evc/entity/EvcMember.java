package in.gov.aicte.approval.evc.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "staff_evc_members")
public class EvcMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private EvcSchedule schedule;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "role", nullable = false, length = 128)
    private String role;
    @Column(name = "affiliation", length = 255)
    private String affiliation;
    @Column(name = "phone", length = 64)
    private String phone;

    public EvcMember() {
    }

    public EvcMember(Long id, EvcSchedule schedule, String name, String role, String affiliation, String phone) {
        this.id = id;
        this.schedule = schedule;
        this.name = name;
        this.role = role;
        this.affiliation = affiliation;
        this.phone = phone;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvcSchedule getSchedule() {
        return this.schedule;
    }

    public void setSchedule(EvcSchedule schedule) {
        this.schedule = schedule;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAffiliation() {
        return this.affiliation;
    }

    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
    }

    public String getPhone() {
        return this.phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private EvcSchedule schedule;
        private String name;
        private String role;
        private String affiliation;
        private String phone;

        public Builder() {}

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder schedule(EvcSchedule schedule) {
            this.schedule = schedule;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder affiliation(String affiliation) {
            this.affiliation = affiliation;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public EvcMember build() {
            return new EvcMember(this.id, this.schedule, this.name, this.role, this.affiliation, this.phone);
        }
    }

}
