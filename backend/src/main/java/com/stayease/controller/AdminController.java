package com.stayease.controller;

import com.stayease.dto.request.ReviewDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.service.AdminService;
import com.stayease.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only endpoints")
public class AdminController {

    private final AdminService adminService;
    private final ReviewService reviewService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(adminService.getUsers(search, page, size)));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.UserResponse>> updateUserStatus(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("isActive");
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(adminService.updateUserStatus(id, active)));
    }

    @GetMapping("/reviews/pending")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.ReviewResponse>>> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(reviewService.getPendingReviews(page, size)));
    }

    @PatchMapping("/reviews/{id}/status")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReviewResponse>> updateReviewStatus(
            @PathVariable UUID id, @Valid @RequestBody ReviewDtos.UpdateReviewStatusRequest request) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(reviewService.updateStatus(id, request)));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null, "Review deleted"));
    }
}
