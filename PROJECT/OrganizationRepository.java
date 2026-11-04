
package com.smartqueue.backend.repository;

import com.smartqueue.backend.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository
        extends JpaRepository<Organization, Long> {

    Optional<Organization> findByOwnerUsername(String ownerUsername);

    boolean existsByOwnerUsername(String ownerUsername);
}
