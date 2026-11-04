
package com.smartqueue.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "queue_admins",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_queue_admin_queue",
            columnNames = "queue_id"
        )
    }
)
public class QueueAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "queue_id", nullable = false, unique = true)
    private Queue queue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public QueueAdmin() {
    }

    public QueueAdmin(String username, String passwordHash, Queue queue) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.queue = queue;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Queue getQueue() {
        return queue;
    }

    public void setQueue(Queue queue) {
        this.queue = queue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
