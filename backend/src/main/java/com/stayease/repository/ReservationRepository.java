package com.stayease.repository;

import com.stayease.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    Page<Reservation> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT r FROM Reservation r JOIN FETCH r.user JOIN FETCH r.room WHERE r.id = :id")
    Optional<Reservation> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.room.id = :roomId
        AND r.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
        AND r.checkInDate < :checkOut
        AND r.checkOutDate > :checkIn
        AND (:excludeId IS NULL OR r.id != :excludeId)
        """)
    List<Reservation> findConflicting(
            @Param("roomId") UUID roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("excludeId") UUID excludeId
    );

    @Query("""
        SELECT r FROM Reservation r JOIN FETCH r.user JOIN FETCH r.room
        WHERE (:status IS NULL OR r.status = :status)
        AND (:userId IS NULL OR r.user.id = :userId)
        AND (:roomId IS NULL OR r.room.id = :roomId)
        AND (:fromDate IS NULL OR r.checkInDate >= :fromDate)
        AND (:toDate IS NULL OR r.checkInDate <= :toDate)
        """)
    Page<Reservation> findAllFiltered(
            @Param("status") Reservation.Status status,
            @Param("userId") UUID userId,
            @Param("roomId") UUID roomId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.status = 'CONFIRMED'
        AND r.checkInDate = :date
        """)
    List<Reservation> findCheckInsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.status = 'CONFIRMED'
        AND r.checkInDate < :now
        """)
    List<Reservation> findNoShowCandidates(@Param("now") LocalDate now);

    // For availability calendar
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.room.id = :roomId
        AND r.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
        AND r.checkInDate >= :from
        AND r.checkOutDate <= :to
        """)
    List<Reservation> findForCalendar(
            @Param("roomId") UUID roomId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    // Revenue stats
    @Query("""
        SELECT COALESCE(SUM(r.totalPrice), 0) FROM Reservation r
        WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        AND r.createdAt >= :from AND r.createdAt <= :to
        """)
    java.math.BigDecimal sumRevenueBetween(
            @Param("from") java.time.OffsetDateTime from,
            @Param("to") java.time.OffsetDateTime to
    );

    long countByStatusAndCreatedAtBetween(
            Reservation.Status status,
            java.time.OffsetDateTime from,
            java.time.OffsetDateTime to
    );
}
