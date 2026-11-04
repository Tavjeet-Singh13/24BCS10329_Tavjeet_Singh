
package com.smartqueue.backend.entity;

import com.smartqueue.backend.enums.TicketStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "tickets",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_queue_token",
            columnNames = {"queue_id", "token_number"}
        )
    },
    indexes = {
        @Index(
            name = "idx_ticket_queue_status",
            columnList = "queue_id, status"
        )
    }
)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "queue_id", nullable = false)
    private Queue queue;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.WAITING;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "service_duration_seconds")
    private Long serviceDurationSeconds;

    public Ticket() {
    }

    public Ticket(Queue queue, Integer tokenNumber, String customerName) {
        this.queue = queue;
        this.tokenNumber = tokenNumber;
        this.customerName = customerName;
        this.status = TicketStatus.WAITING;
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Queue getQueue() {
        return queue;
    }

    public void setQueue(Queue queue) {
        this.queue = queue;
    }

    public Integer getTokenNumber() {
        return tokenNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public LocalDateTime getCalledAt() {
        return calledAt;
    }

    public void setCalledAt(LocalDateTime calledAt) {
        this.calledAt = calledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getServiceDurationSeconds() {
        return serviceDurationSeconds;
    }

    public void setServiceDurationSeconds(Long serviceDurationSeconds) {
        this.serviceDurationSeconds = serviceDurationSeconds;
    }
}
