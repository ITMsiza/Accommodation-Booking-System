package com.stayease.dto.request;

import com.stayease.entity.Review;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

public class ReviewDtos {

    @Data
    public static class CreateReviewRequest {
        @NotNull
        private UUID reservationId;

        @NotNull
        @Min(1)
        @Max(5)
        private Short ratingOverall;

        @Min(1)
        @Max(5)
        private Short ratingCleanliness;

        @Min(1)
        @Max(5)
        private Short ratingComfort;

        @Min(1)
        @Max(5)
        private Short ratingLocation;

        @Min(1)
        @Max(5)
        private Short ratingStaff;

        @Size(max = 2000)
        private String comment;

        private boolean isAnonymous = false;
    }

    @Data
    public static class UpdateReviewStatusRequest {
        @NotNull
        private Review.Status status;
    }
}
