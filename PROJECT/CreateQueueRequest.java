
package com.smartqueue.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateQueueRequest(

        @NotBlank(message = "Queue name is required")
        @Size(max = 100, message = "Queue name cannot exceed 100 characters")
        String name,

        @NotBlank(message = "Admin username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String adminUsername,

        @NotBlank(message = "Admin password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String adminPassword

) {
}
