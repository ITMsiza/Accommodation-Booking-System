package com.stayease.controller;

import com.stayease.dto.request.ReviewDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.User;
import com.stayease.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/rooms/{roomId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Review endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.ReviewResponse>>> getRoomReviews(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(reviewService.getRoomReviews(roomId, page, size)));
    }

    @PostMapping
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReviewResponse>> submitReview(
            @PathVariable UUID roomId,
            @Valid @RequestBody ReviewDtos.CreateReviewRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDtos.ApiResponse.success(reviewService.submitReview(roomId, request, currentUser), "Review submitted for moderation"));
    }
}
