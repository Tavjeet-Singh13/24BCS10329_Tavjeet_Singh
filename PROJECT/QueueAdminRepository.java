
package com.smartqueue.backend.repository;

import com.smartqueue.backend.entity.QueueAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QueueAdminRepository
        extends JpaRepository<QueueAdmin, Long> {

    Optional<QueueAdmin> findByUsername(String username);

    Optional<QueueAdmin> findByQueueId(Long queueId);

    boolean existsByUsername(String username);

    boolean existsByQueueId(Long queueId);
}
