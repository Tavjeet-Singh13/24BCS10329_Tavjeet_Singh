
package com.smartqueue.backend.dto;

public record AuthResponse(
        String username,
        String role,
        Long organizationId,
        Long queueId
) {
}
