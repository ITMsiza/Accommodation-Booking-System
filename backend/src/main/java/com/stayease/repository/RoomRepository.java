package com.stayease.repository;

import com.stayease.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    
    @Query("""
        SELECT DISTINCT r FROM Room r
        LEFT JOIN FETCH r.amenities a
        WHERE r.isActive = true
        AND (:type IS NULL OR r.type = :type)
        AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
        AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
        AND (:adults IS NULL OR r.capacityAdults >= :adults)
        AND (:children IS NULL OR r.capacityChildren >= :children)
        AND (:checkIn IS NULL OR :checkOut IS NULL OR r.id NOT IN (
            SELECT res.room.id FROM Reservation res
            WHERE res.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
            AND res.checkInDate < :checkOut
            AND res.checkOutDate > :checkIn
        ))
        """)
    Page<Room> findAvailableRooms(
            @Param("type") Room.RoomType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("adults") Integer adults,
            @Param("children") Integer children,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            Pageable pageable
    );

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.amenities LEFT JOIN FETCH r.photos WHERE r.id = :id")
    java.util.Optional<Room> findByIdWithDetails(@Param("id") UUID id);

    boolean existsByRoomNumber(String roomNumber);

    @Query("SELECT r FROM Room r WHERE r.isActive = true ORDER BY r.pricePerNight ASC")
    List<Room> findAllActive();
}
