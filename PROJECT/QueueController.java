
package com.smartqueue.backend.controller;

import com.smartqueue.backend.dto.CreateQueueRequest;
import com.smartqueue.backend.dto.JoinQueueRequest;
import com.smartqueue.backend.dto.QueueResponse;
import com.smartqueue.backend.dto.TicketResponse;
import com.smartqueue.backend.security.AppUserDetails;
import com.smartqueue.backend.service.QueueService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/queues")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    // Only the organisation owner can create queues.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QueueResponse createQueue(
            @Valid @RequestBody CreateQueueRequest request,
            Authentication authentication
    ) {
        AppUserDetails user = getCurrentUser(authentication);

        if (!"OWNER".equals(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the organisation owner can create queues"
            );
        }

        return queueService.createQueue(
                request,
                user.getOrganizationId()
        );
    }

    // Public queue list for customer-facing pages.
   // Public: get only the queue associated with a QR code.
@GetMapping("/{queueId}/public")
public QueueResponse getPublicQueue(@PathVariable Long queueId) {
    return queueService.getPublicQueue(queueId);
}
    // Private: get queues belonging to the logged-in owner
    @GetMapping("/mine")
    public List<QueueResponse> getMyQueues(Authentication authentication) {

        AppUserDetails user = getCurrentUser(authentication);

        if (!"OWNER".equals(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the organisation owner can view these queues"
            );
        }

        return queueService.getQueuesByOrganization(
                user.getOrganizationId()
        );
    }

    // Public: customers can join a queue.
    @PostMapping("/{queueId}/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse joinQueue(
            @PathVariable Long queueId,
            @Valid @RequestBody JoinQueueRequest request
    ) {
        return queueService.joinQueue(queueId, request);
    }

    // Public: customers can track their tickets.
    @GetMapping("/{queueId}/tickets/{tokenNumber}")
    public TicketResponse getTicket(
            @PathVariable Long queueId,
            @PathVariable Integer tokenNumber
    ) {
        return queueService.getTicket(queueId, tokenNumber);
    }

    // Queue admin: call next customer.
    @PostMapping("/{queueId}/next")
    public TicketResponse callNext(
            @PathVariable Long queueId,
            Authentication authentication
    ) {
        requireAssignedQueueAdmin(authentication, queueId);
        return queueService.callNext(queueId);
    }

    // Queue admin: mark customer as served.
    @PutMapping("/{queueId}/tickets/{tokenNumber}/serve")
    public TicketResponse markServed(
            @PathVariable Long queueId,
            @PathVariable Integer tokenNumber,
            Authentication authentication
    ) {
        requireAssignedQueueAdmin(authentication, queueId);
        return queueService.markServed(queueId, tokenNumber);
    }

    // Queue admin: skip customer.
    @PutMapping("/{queueId}/tickets/{tokenNumber}/skip")
    public TicketResponse skipTicket(
            @PathVariable Long queueId,
            @PathVariable Integer tokenNumber,
            Authentication authentication
    ) {
        requireAssignedQueueAdmin(authentication, queueId);
        return queueService.skipTicket(queueId, tokenNumber);
    }

    // Queue admin: view tickets in their assigned queue.
    @GetMapping("/{queueId}/tickets")
    public List<TicketResponse> getQueueTickets(
            @PathVariable Long queueId,
            Authentication authentication
    ) {
        requireAssignedQueueAdmin(authentication, queueId);
        return queueService.getQueueTickets(queueId);
    }

    private AppUserDetails getCurrentUser(Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof AppUserDetails user)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in"
            );
        }

        return user;
    }

    private void requireAssignedQueueAdmin(
            Authentication authentication,
            Long requestedQueueId
    ) {
        AppUserDetails user = getCurrentUser(authentication);

        if (!"QUEUE_ADMIN".equals(user.getRole())
                || user.getQueueId() == null
                || !user.getQueueId().equals(requestedQueueId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to manage this queue"
            );
        }
    }
}
