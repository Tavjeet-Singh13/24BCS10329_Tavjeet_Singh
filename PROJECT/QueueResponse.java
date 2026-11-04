
package com.smartqueue.backend.dto;

import java.time.LocalDateTime;

public record QueueResponse(
        Long id,
        String name,
        Integer nextTokenNumber,
        Boolean active,
        LocalDateTime createdAt
) {
}
