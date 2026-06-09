package com.stayease.dto.request;

import com.stayease.entity.Reservation;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

public class ReservationDtos {

    @Data
    public static class CreateReservationRequest {
        @NotNull
        private UUID roomId;

        @NotNull
        @FutureOrPresent
        private LocalDate checkInDate;

        @NotNull
        @Future
        private LocalDate checkOutDate;

        @NotNull
        @Min(1)
        @Max(10)
        private Short numAdults;

        @Min(0)
        @Max(10)
        private Short numChildren = 0;

        @Size(max = 1000)
        private String specialRequests;
    }

    @Data
    public static class UpdateReservationRequest {
        private UUID roomId;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Short numAdults;
        private Short numChildren;
        private String specialRequests;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull
        private Reservation.Status status;

        @Size(max = 500)
        private String note;
    }
}
