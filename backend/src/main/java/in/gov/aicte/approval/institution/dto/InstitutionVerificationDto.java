package in.gov.aicte.approval.institution.dto;

import java.time.LocalDateTime;

public class InstitutionVerificationDto {

    private String code;
    private String institutionCode;
    private String name;
    private String institutionName;
    private String institutionType;
    private String region;
    private String state;
    private String district;
    private String address;
    private String status;
    private String contactEmail;
    private String contactPhone;
    private LocalDateTime createdAt;
    private String registeredAt;

    // Associated College Representative details
    private String representativeName;
    private String representativeEmail;
    private String representativeDesignation;
    private String representativePhone;
    private String representativeStatus;

    private int documentsCount;
    private String rejectionReason;

    public InstitutionVerificationDto() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
        this.institutionCode = code;
    }

    public String getInstitutionCode() {
        return institutionCode != null ? institutionCode : code;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
        this.code = institutionCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.institutionName = name;
    }

    public String getInstitutionName() {
        return institutionName != null ? institutionName : name;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
        this.name = institutionName;
    }

    public String getInstitutionType() {
        return institutionType;
    }

    public void setInstitutionType(String institutionType) {
        this.institutionType = institutionType;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(String registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public void setRepresentativeName(String representativeName) {
        this.representativeName = representativeName;
    }

    public String getRepresentativeEmail() {
        return representativeEmail;
    }

    public void setRepresentativeEmail(String representativeEmail) {
        this.representativeEmail = representativeEmail;
    }

    public String getRepresentativeDesignation() {
        return representativeDesignation;
    }

    public void setRepresentativeDesignation(String representativeDesignation) {
        this.representativeDesignation = representativeDesignation;
    }

    public String getRepresentativePhone() {
        return representativePhone;
    }

    public void setRepresentativePhone(String representativePhone) {
        this.representativePhone = representativePhone;
    }

    public String getRepresentativeStatus() {
        return representativeStatus;
    }

    public void setRepresentativeStatus(String representativeStatus) {
        this.representativeStatus = representativeStatus;
    }

    public int getDocumentsCount() {
        return documentsCount;
    }

    public void setDocumentsCount(int documentsCount) {
        this.documentsCount = documentsCount;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
