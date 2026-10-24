package in.gov.aicte.approval.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "staff_requested_intakes")
public class RequestedIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    @Column(name = "course", nullable = false, length = 255)
    private String course;
    @Column(name = "current_intake")
    private int currentIntake = 0;
    @Column(name = "proposed_intake")
    private int proposedIntake = 0;

    public RequestedIntake() {
    }

    public RequestedIntake(Long id, Application application, String course, int currentIntake, int proposedIntake) {
        this.id = id;
        this.application = application;
        this.course = course;
        this.currentIntake = currentIntake;
        this.proposedIntake = proposedIntake;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return this.application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getCourse() {
        return this.course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public int getCurrentIntake() {
        return this.currentIntake;
    }

    public void setCurrentIntake(int currentIntake) {
        this.currentIntake = currentIntake;
    }

    public int getProposedIntake() {
        return this.proposedIntake;
    }

    public void setProposedIntake(int proposedIntake) {
        this.proposedIntake = proposedIntake;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Application application;
        private String course;
        private int currentIntake = 0;
        private int proposedIntake = 0;

        public Builder() {}

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder application(Application application) {
            this.application = application;
            return this;
        }

        public Builder course(String course) {
            this.course = course;
            return this;
        }

        public Builder currentIntake(int currentIntake) {
            this.currentIntake = currentIntake;
            return this;
        }

        public Builder proposedIntake(int proposedIntake) {
            this.proposedIntake = proposedIntake;
            return this;
        }

        public RequestedIntake build() {
            return new RequestedIntake(this.id, this.application, this.course, this.currentIntake, this.proposedIntake);
        }
    }

}
