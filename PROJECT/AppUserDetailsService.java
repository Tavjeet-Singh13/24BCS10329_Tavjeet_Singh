
package com.smartqueue.backend.security;

import com.smartqueue.backend.entity.Organization;
import com.smartqueue.backend.entity.QueueAdmin;
import com.smartqueue.backend.repository.OrganizationRepository;
import com.smartqueue.backend.repository.QueueAdminRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final OrganizationRepository organizationRepository;
    private final QueueAdminRepository queueAdminRepository;

    public AppUserDetailsService(
            OrganizationRepository organizationRepository,
            QueueAdminRepository queueAdminRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.queueAdminRepository = queueAdminRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Organization organization = organizationRepository
                .findByOwnerUsername(username)
                .orElse(null);

        if (organization != null) {
            return new AppUserDetails(
                    organization.getId(),
                    organization.getOwnerUsername(),
                    organization.getPasswordHash(),
                    "OWNER",
                    organization.getId(),
                    null
            );
        }

        QueueAdmin admin = queueAdminRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Account not found")
                );

        return new AppUserDetails(
                admin.getId(),
                admin.getUsername(),
                admin.getPasswordHash(),
                "QUEUE_ADMIN",
                admin.getQueue().getOrganization() == null
                        ? null
                        : admin.getQueue().getOrganization().getId(),
                admin.getQueue().getId()
        );
    }
}
