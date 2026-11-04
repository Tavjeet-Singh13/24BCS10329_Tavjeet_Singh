
package com.smartqueue.backend.repository;

import com.smartqueue.backend.entity.Ticket;
import com.smartqueue.backend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByQueueIdAndStatusOrderByTokenNumberAsc(
            Long queueId,
            TicketStatus status
    );

    Optional<Ticket> findByQueueIdAndTokenNumber(
            Long queueId,
            Integer tokenNumber
    );

    long countByQueueIdAndStatusAndTokenNumberLessThan(
            Long queueId,
            TicketStatus status,
            Integer tokenNumber
    );

    List<Ticket> findByQueueIdOrderByTokenNumberAsc(Long queueId);
}
