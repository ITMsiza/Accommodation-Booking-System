package com.stayease.dto.response;

import com.stayease.entity.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class ResponseDtos {

    @Data
    @Builder
    public static class ApiResponse<T> {
        private T data;
        private String message;
        private OffsetDateTime timestamp;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder()
                    .data(data)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        public static <T> ApiResponse<T> success(T data, String message) {
            return ApiResponse.<T>builder()
                    .data(data)
                    .message(message)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }
    }

    @Data
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UserResponse user;
    }

    @Data
    @Builder
    public static class UserResponse {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String phone;
        private String role;
        private boolean isActive;
        private boolean notifyEmail;
        private boolean notifyPush;
        private OffsetDateTime createdAt;

        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .role(user.getRole().getName())
                    .isActive(user.isActive())
                    .notifyEmail(user.isNotifyEmail())
                    .notifyPush(user.isNotifyPush())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    public static class AmenityResponse {
        private Integer id;
        private String name;
        private String iconKey;

        public static AmenityResponse from(Amenity a) {
            return AmenityResponse.builder()
                    .id(a.getId())
                    .name(a.getName())
                    .iconKey(a.getIconKey())
                    .build();
        }
    }

    @Data
    @Builder
    public static class RoomPhotoResponse {
        private UUID id;
        private String url;
        private Short displayOrder;
    }

    @Data
    @Builder
    public static class RoomResponse {
        private UUID id;
        private String roomNumber;
        private String name;
        private String type;
        private Short floor;
        private Short capacityAdults;
        private Short capacityChildren;
        private BigDecimal pricePerNight;
        private String description;
        private boolean isActive;
        private Set<AmenityResponse> amenities;
        private List<RoomPhotoResponse> photos;
        private Double averageRating;
        private Long reviewCount;
        private OffsetDateTime createdAt;
    }

    @Data
    @Builder
    public static class ReservationResponse {
        private UUID id;
        private UserResponse user;
        private RoomResponse room;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Short numAdults;
        private Short numChildren;
        private String status;
        private BigDecimal totalPrice;
        private BigDecimal cancellationFee;
        private String specialRequests;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private int nights;
    }

    @Data
    @Builder
    public static class ReviewResponse {
        private UUID id;
        private String authorName;
        private UUID userId;
        private UUID roomId;
        private Short ratingOverall;
        private Short ratingCleanliness;
        private Short ratingComfort;
        private Short ratingLocation;
        private Short ratingStaff;
        private String comment;
        private boolean isAnonymous;
        private String status;
        private OffsetDateTime createdAt;
    }

    @Data
    @Builder
    public static class NotificationResponse {
        private UUID id;
        private String type;
        private String title;
        private String body;
        private boolean isRead;
        private UUID reservationId;
        private OffsetDateTime createdAt;
    }

    @Data
    @Builder
    public static class DashboardStatsResponse {
        private long bookingsToday;
        private long bookingsThisMonth;
        private BigDecimal revenueThisMonth;
        private BigDecimal revenuePrevMonth;
        private double revenueChangePercent;
        private long totalRooms;
        private long activeRooms;
        private long totalUsers;
        private OccupancyStats occupancy;
    }

    @Data
    @Builder
    public static class OccupancyStats {
        private double overallOccupancyRate;
        private List<RoomTypeOccupancy> byRoomType;
    }

    @Data
    @Builder
    public static class RoomTypeOccupancy {
        private String roomType;
        private double occupancyRate;
    }

    @Data
    @Builder
    public static class AvailabilityResponse {
        private UUID roomId;
        private List<DateAvailability> dates;
    }

    @Data
    @Builder
    public static class DateAvailability {
        private LocalDate date;
        private String status; // AVAILABLE, BOOKED
    }

    @Data
    @Builder
    public static class AuditLogResponse {
        private Long id;
        private String oldStatus;
        private String newStatus;
        private String changedBy;
        private String note;
        private OffsetDateTime changedAt;
    }

    @Data
    @Builder
    public static class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
