package com.stayease.repository;

import com.stayease.entity.ReservationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationAuditLogRepository extends JpaRepository<ReservationAuditLog, Long> {

    List<ReservationAuditLog> findByReservationIdOrderByChangedAtDesc(UUID reservationId);
}
