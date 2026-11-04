
package com.smartqueue.backend.service;

import com.smartqueue.backend.dto.CreateQueueRequest;
import com.smartqueue.backend.dto.JoinQueueRequest;
import com.smartqueue.backend.dto.QueueResponse;
import com.smartqueue.backend.dto.TicketResponse;
import com.smartqueue.backend.entity.Queue;
import com.smartqueue.backend.entity.Ticket;
import com.smartqueue.backend.enums.TicketStatus;
import com.smartqueue.backend.repository.QueueRepository;
import com.smartqueue.backend.repository.TicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


import java.time.Duration;
import java.time.LocalDateTime;

import com.smartqueue.backend.entity.Organization;
import com.smartqueue.backend.entity.QueueAdmin;
import com.smartqueue.backend.repository.OrganizationRepository;
import com.smartqueue.backend.repository.QueueAdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final TicketRepository ticketRepository;
    private final OrganizationRepository organizationRepository;
    private final QueueAdminRepository queueAdminRepository;
    private final PasswordEncoder passwordEncoder;

    public QueueService(
        QueueRepository queueRepository,
        TicketRepository ticketRepository,
        OrganizationRepository organizationRepository,
        QueueAdminRepository queueAdminRepository,
        PasswordEncoder passwordEncoder
        ) {
        this.queueRepository = queueRepository;
        this.ticketRepository = ticketRepository;
        this.organizationRepository = organizationRepository;
        this.queueAdminRepository = queueAdminRepository;
        this.passwordEncoder = passwordEncoder;
        }

    // Create a new queue
    @Transactional
        public QueueResponse createQueue(
                CreateQueueRequest request,
                Long organizationId
        ) {
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Organization not found"
                ));

        String adminUsername = request.adminUsername().trim();

        if (organizationRepository.existsByOwnerUsername(adminUsername)
                || queueAdminRepository.existsByUsername(adminUsername)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Admin username is already taken"
                );
        }

        Queue queue = new Queue(request.name().trim());
        queue.setOrganization(organization);

        Queue savedQueue = queueRepository.save(queue);

        QueueAdmin admin = new QueueAdmin(
                adminUsername,
                passwordEncoder.encode(request.adminPassword()),
                savedQueue
        );

        queueAdminRepository.save(admin);

        return mapQueueResponse(savedQueue);
        }

    // Get all queues
    @Transactional(readOnly = true)
    public List<QueueResponse> getAllQueues() {

        return queueRepository.findAll()
                .stream()
                .map(this::mapQueueResponse)
                .toList();
    }

    // Get one queue using its ID (public QR page)
@Transactional(readOnly = true)
public QueueResponse getPublicQueue(Long queueId) {
    Queue queue = queueRepository.findById(queueId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Queue not found"
            ));

    return mapQueueResponse(queue);
}
    // Get queues belonging to one organization
        @Transactional(readOnly = true)
        public List<QueueResponse> getQueuesByOrganization(Long organizationId) {

        return queueRepository.findByOrganization_Id(organizationId)
                .stream()
                .map(this::mapQueueResponse)
                .toList();
        }

    // Customer joins a queue
    @Transactional
    public TicketResponse joinQueue(
            Long queueId,
            JoinQueueRequest request
    ) {

        // Lock queue row to prevent simultaneous token allocation
        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Queue not found"
                ));

        if (!Boolean.TRUE.equals(queue.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This queue is currently inactive"
            );
        }

        // Allocate the next token
        Integer tokenNumber = queue.getNextTokenNumber();

        // Increment token counter
        queue.setNextTokenNumber(tokenNumber + 1);

        // Save updated queue counter
        queueRepository.save(queue);

        // Create customer ticket
        Ticket ticket = new Ticket(
                queue,
                tokenNumber,
                request.customerName().trim()
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        // Calculate current customer position
        long position = ticketRepository
                .countByQueueIdAndStatusAndTokenNumberLessThan(
                        queueId,
                        TicketStatus.WAITING,
                        tokenNumber
                ) + 1;

        return mapTicketResponse(savedTicket, (int) position);
    }

    // Find a customer's ticket
    @Transactional(readOnly = true)
    public TicketResponse getTicket(
            Long queueId,
            Integer tokenNumber
    ) {

        Ticket ticket = ticketRepository
                .findByQueueIdAndTokenNumber(queueId, tokenNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        Integer position = null;

        if (ticket.getStatus() == TicketStatus.WAITING) {

            long count = ticketRepository
                    .countByQueueIdAndStatusAndTokenNumberLessThan(
                            queueId,
                            TicketStatus.WAITING,
                            tokenNumber
                    );

            position = (int) count + 1;
        }

        return mapTicketResponse(ticket, position);
    }

    // Staff: Get all tickets in a queue
    @Transactional(readOnly = true)
    public List<TicketResponse> getQueueTickets(Long queueId) {

        queueRepository.findById(queueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Queue not found"
                ));

        List<Ticket> tickets =
                ticketRepository.findByQueueIdOrderByTokenNumberAsc(queueId);

        int waitingPosition = 0;

        List<TicketResponse> responses = new java.util.ArrayList<>();

        for (Ticket ticket : tickets) {

            Integer position = null;

            if (ticket.getStatus() == TicketStatus.WAITING) {
                waitingPosition++;
                position = waitingPosition;
            }

            responses.add(mapTicketResponse(ticket, position));
        }

        return responses;
    }

    // Convert Queue entity to response DTO
    
    
    // Staff: Call the next waiting customer
    @Transactional
    public TicketResponse callNext(Long queueId) {

        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Queue not found"
                ));

        // Do not call another customer while someone is being served
        List<Ticket> servingTickets =
                ticketRepository.findByQueueIdAndStatusOrderByTokenNumberAsc(
                        queueId,
                        TicketStatus.SERVING
                );

        if (!servingTickets.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A customer is already being served. Complete or skip them first."
            );
        }

        // Find the earliest waiting customer
        List<Ticket> waitingTickets =
                ticketRepository.findByQueueIdAndStatusOrderByTokenNumberAsc(
                        queueId,
                        TicketStatus.WAITING
                );

        if (waitingTickets.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No waiting customers in this queue"
            );
        }

        Ticket nextTicket = waitingTickets.get(0);
        nextTicket.setStatus(TicketStatus.SERVING);
        nextTicket.setCalledAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(nextTicket);

        return mapTicketResponse(savedTicket, null);
    }

    // Staff: Mark a currently serving customer as completed
    @Transactional
    public TicketResponse markServed(Long queueId, Integer tokenNumber) {

        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Queue not found"
                ));

        Ticket ticket = ticketRepository
                .findByQueueIdAndTokenNumber(queueId, tokenNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        if (ticket.getStatus() != TicketStatus.SERVING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only a currently serving customer can be marked as done"
            );
        }

        LocalDateTime completedTime = LocalDateTime.now();

        ticket.setStatus(TicketStatus.DONE);
        ticket.setCompletedAt(completedTime);

        if (ticket.getCalledAt() != null) {
            long duration = Duration.between(
                    ticket.getCalledAt(),
                    completedTime
            ).getSeconds();

            ticket.setServiceDurationSeconds(duration);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapTicketResponse(savedTicket, null);
    }

    // Staff: Skip a waiting or currently serving customer
    @Transactional
    public TicketResponse skipTicket(Long queueId, Integer tokenNumber) {

        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Queue not found"
                ));

        Ticket ticket = ticketRepository
                .findByQueueIdAndTokenNumber(queueId, tokenNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        if (ticket.getStatus() != TicketStatus.WAITING
                && ticket.getStatus() != TicketStatus.SERVING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only waiting or serving customers can be skipped"
            );
        }

        ticket.setStatus(TicketStatus.SKIPPED);
        ticket.setCompletedAt(LocalDateTime.now());

        if (ticket.getCalledAt() != null) {
            long duration = Duration.between(
                    ticket.getCalledAt(),
                    ticket.getCompletedAt()
            ).getSeconds();

            ticket.setServiceDurationSeconds(duration);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapTicketResponse(savedTicket, null);
    }


    private QueueResponse mapQueueResponse(Queue queue) {

        return new QueueResponse(
                queue.getId(),
                queue.getName(),
                queue.getNextTokenNumber(),
                queue.getActive(),
                queue.getCreatedAt()
        );
    }

    // Convert Ticket entity to response DTO
    
    // Convert Ticket entity to response DTO with live queue information
    private TicketResponse mapTicketResponse(
            Ticket ticket,
            Integer position
    ) {

        Long queueId = ticket.getQueue().getId();

        // Find the currently serving customer
        List<Ticket> servingTickets =
                ticketRepository.findByQueueIdAndStatusOrderByTokenNumberAsc(
                        queueId,
                        TicketStatus.SERVING
                );

        Integer currentlyServingToken = servingTickets.isEmpty()
                ? null
                : servingTickets.get(0).getTokenNumber();

        // Calculate average service duration from completed tickets
        List<Ticket> completedTickets =
                ticketRepository.findByQueueIdAndStatusOrderByTokenNumberAsc(
                        queueId,
                        TicketStatus.DONE
                );

        double averageDurationSeconds = completedTickets.stream()
                .filter(t -> t.getServiceDurationSeconds() != null)
                .filter(t -> t.getServiceDurationSeconds() > 0)
                .mapToLong(Ticket::getServiceDurationSeconds)
                .average()
                .orElse(300.0); // Default: 5 minutes

        // Calculate estimated waiting time
        Integer estimatedWaitMinutes = null;

        if (ticket.getStatus() == TicketStatus.WAITING) {

            int waitingCustomersAhead = Math.max(
                    0,
                    (position == null ? 1 : position) - 1
            );

            int currentlyServingCount = servingTickets.isEmpty() ? 0 : 1;

            double totalWaitSeconds = averageDurationSeconds
                    * (waitingCustomersAhead + currentlyServingCount);

            estimatedWaitMinutes = (int) Math.ceil(
                    totalWaitSeconds / 60.0
            );
        } else if (ticket.getStatus() == TicketStatus.SERVING) {
            estimatedWaitMinutes = 0;
        }

        return new TicketResponse(
                ticket.getId(),
                queueId,
                ticket.getQueue().getName(),
                ticket.getTokenNumber(),
                ticket.getCustomerName(),
                ticket.getStatus(),
                position,
                currentlyServingToken,
                estimatedWaitMinutes,
                ticket.getJoinedAt()
        );
    }

}
