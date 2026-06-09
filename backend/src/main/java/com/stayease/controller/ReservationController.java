package com.stayease.controller;

import com.stayease.dto.request.ReservationDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.User;
import com.stayease.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Reservation management endpoints")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all reservations (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.ReservationResponse>>> getAllReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID roomId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                reservationService.getAllReservations(status, userId, roomId, fromDate, toDate, page, size)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's reservations")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.ReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                reservationService.getMyReservations(currentUser, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get reservation by ID")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReservationResponse>> getReservation(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                reservationService.getReservationById(id, currentUser)));
    }

    @PostMapping
    @Operation(summary = "Create new reservation")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationDtos.CreateReservationRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDtos.ApiResponse.success(
                        reservationService.createReservation(request, currentUser), "Reservation created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modify reservation")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReservationResponse>> updateReservation(
            @PathVariable UUID id,
            @Valid @RequestBody ReservationDtos.UpdateReservationRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                reservationService.updateReservation(id, request, currentUser)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update reservation status (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.ReservationResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ReservationDtos.UpdateStatusRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                reservationService.updateStatus(id, request, currentUser)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel reservation")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> cancelReservation(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        reservationService.cancelReservation(id, currentUser);
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null, "Reservation cancelled"));
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit log (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<List<ResponseDtos.AuditLogResponse>>> getAuditLog(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(reservationService.getAuditLog(id)));
    }
}
