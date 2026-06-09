package com.stayease.repository;

import com.stayease.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByRoomIdAndStatus(UUID roomId, Review.Status status, Pageable pageable);

    boolean existsByReservationId(UUID reservationId);

    Optional<Review> findByReservationId(UUID reservationId);

    @Query("""
        SELECT AVG(r.ratingOverall) FROM Review r
        WHERE r.room.id = :roomId AND r.status = 'APPROVED'
        """)
    Double findAverageRatingByRoomId(@Param("roomId") UUID roomId);

    @Query("""
        SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.room
        WHERE r.room.id = :roomId AND r.status = 'APPROVED'
        """)
    Page<Review> findApprovedByRoomId(@Param("roomId") UUID roomId, Pageable pageable);

    long countByRoomIdAndStatus(UUID roomId, Review.Status status);

    Page<Review> findByStatus(Review.Status status, Pageable pageable);
}
