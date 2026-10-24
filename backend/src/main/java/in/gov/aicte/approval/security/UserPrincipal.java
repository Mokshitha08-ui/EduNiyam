package in.gov.aicte.approval.security;

import in.gov.aicte.approval.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final String id;
    private final String name;
    private final String email;
    private final String password;
    private final String role;
    private final String department;
    private final String region;
    private final String institutionCode;
    private final String institutionName;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String name, String email, String password, String role,
                         String department, String region, String institutionCode,
                         String institutionName, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.region = region;
        this.institutionCode = institutionCode;
        this.institutionName = institutionName;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());
        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getDepartment(),
                user.getRegion(),
                user.getInstitutionCode(),
                user.getInstitutionName(),
                Collections.singletonList(authority)
        );
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getRegion() {
        return region;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
