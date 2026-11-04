
package com.smartqueue.backend.dto;

import com.smartqueue.backend.enums.TicketStatus;
import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        Long queueId,
        String queueName,
        Integer tokenNumber,
        String customerName,
        TicketStatus status,
        Integer position,
        Integer currentlyServingToken,
        Integer estimatedWaitMinutes,
        LocalDateTime joinedAt
) {
}
