
package com.smartqueue.backend.repository;

import com.smartqueue.backend.entity.Queue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface QueueRepository extends JpaRepository<Queue, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM Queue q WHERE q.id = :id")
    Optional<Queue> findByIdForUpdate(@Param("id") Long id);
    List<Queue> findByOrganization_Id(Long organizationId);
}
