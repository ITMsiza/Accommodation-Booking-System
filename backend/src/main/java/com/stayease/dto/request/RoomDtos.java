package com.stayease.dto.request;

import com.stayease.entity.Room;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

public class RoomDtos {

    @Data
    public static class CreateRoomRequest {
        @NotBlank
        @Size(max = 20)
        private String roomNumber;

        @NotBlank
        @Size(max = 255)
        private String name;

        @NotNull
        private Room.RoomType type;

        @NotNull
        @Min(1)
        @Max(100)
        private Short floor;

        @NotNull
        @Min(1)
        @Max(10)
        private Short capacityAdults;

        @Min(0)
        @Max(10)
        private Short capacityChildren = 0;

        @NotNull
        @DecimalMin("1.00")
        @DecimalMax("99999.99")
        private BigDecimal pricePerNight;

        private String description;

        private Set<Integer> amenityIds;
    }

    @Data
    public static class UpdateRoomRequest {
        @Size(max = 255)
        private String name;

        private Room.RoomType type;

        @Min(1)
        @Max(100)
        private Short floor;

        @Min(1)
        @Max(10)
        private Short capacityAdults;

        @Min(0)
        @Max(10)
        private Short capacityChildren;

        @DecimalMin("1.00")
        @DecimalMax("99999.99")
        private BigDecimal pricePerNight;

        private String description;

        private Set<Integer> amenityIds;
    }

    @Data
    public static class RoomSearchRequest {
        private String checkIn;
        private String checkOut;
        private Integer adults;
        private Integer children;
        private Room.RoomType type;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private String sortBy;     // price_asc, price_desc, rating, name
        private Integer page = 0;
        private Integer size = 12;
    }
}
