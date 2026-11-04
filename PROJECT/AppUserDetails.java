
package com.smartqueue.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AppUserDetails implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final String role;
    private final Long organizationId;
    private final Long queueId;

    public AppUserDetails(
            Long userId,
            String username,
            String password,
            String role,
            Long organizationId,
            Long queueId
    ) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.organizationId = organizationId;
        this.queueId = queueId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public Long getQueueId() {
        return queueId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
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
