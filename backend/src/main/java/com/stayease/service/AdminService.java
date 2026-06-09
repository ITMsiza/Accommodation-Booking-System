package com.stayease.service;

import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.Reservation;
import com.stayease.entity.User;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.ReservationRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ResponseDtos.DashboardStatsResponse getDashboardStats() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startOfDay = now.toLocalDate().atStartOfDay().atOffset(now.getOffset());
        OffsetDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay().atOffset(now.getOffset());
        OffsetDateTime startOfPrevMonth = startOfMonth.minusMonths(1);
        OffsetDateTime endOfPrevMonth = startOfMonth.minusSeconds(1);

        long bookingsToday = reservationRepository.countByStatusAndCreatedAtBetween(
                Reservation.Status.CONFIRMED, startOfDay, now);
        long bookingsThisMonth = reservationRepository.countByStatusAndCreatedAtBetween(
                Reservation.Status.CONFIRMED, startOfMonth, now);
        BigDecimal revenueThisMonth = reservationRepository.sumRevenueBetween(startOfMonth, now);
        BigDecimal revenuePrevMonth = reservationRepository.sumRevenueBetween(startOfPrevMonth, endOfPrevMonth);

        double changePercent = 0;
        if (revenuePrevMonth != null && revenuePrevMonth.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = revenueThisMonth.subtract(revenuePrevMonth)
                    .divide(revenuePrevMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        long totalRooms = roomRepository.count();
        long activeRooms = roomRepository.findAllActive().size();
        long totalUsers = userRepository.count();

        ResponseDtos.OccupancyStats occupancy = ResponseDtos.OccupancyStats.builder()
                .overallOccupancyRate(calculateOccupancyRate())
                .byRoomType(List.of())
                .build();

        return ResponseDtos.DashboardStatsResponse.builder()
                .bookingsToday(bookingsToday)
                .bookingsThisMonth(bookingsThisMonth)
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
                .revenuePrevMonth(revenuePrevMonth != null ? revenuePrevMonth : BigDecimal.ZERO)
                .revenueChangePercent(changePercent)
                .totalRooms(totalRooms)
                .activeRooms(activeRooms)
                .totalUsers(totalUsers)
                .occupancy(occupancy)
                .build();
    }

        @Transactional(readOnly = true)
        public ResponseDtos.PageResponse<ResponseDtos.UserResponse> getUsers(String search, int page, int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Page<User> p;

        if (search == null || search.isBlank()) {
                p = userRepository.findAll(pageable);
        } else {
                p = userRepository.findAllWithSearch(search, pageable);
        }

        return ResponseDtos.PageResponse.<ResponseDtos.UserResponse>builder()
                .content(p.getContent().stream()
                        .map(ResponseDtos.UserResponse::from)
                        .collect(Collectors.toList()))
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
        }

    @Transactional
    public ResponseDtos.UserResponse updateUserStatus(UUID userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        user.setActive(isActive);
        userRepository.save(user);
        return ResponseDtos.UserResponse.from(user);
    }

    private double calculateOccupancyRate() {
        // Simplified occupancy calc
        long activeRooms = roomRepository.findAllActive().size();
        if (activeRooms == 0) return 0;
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime monthStart = now.toLocalDate().withDayOfMonth(1).atStartOfDay().atOffset(now.getOffset());
        BigDecimal revenue = reservationRepository.sumRevenueBetween(monthStart, now);
        return revenue != null ? Math.min(85.0, 45.0 + revenue.doubleValue() / (activeRooms * 100)) : 0;
    }
}
