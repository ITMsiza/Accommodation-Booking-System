package com.stayease.controller;

import com.stayease.dto.request.RoomDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room management endpoints")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Search and list rooms")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.RoomResponse>>> searchRooms(
            @ModelAttribute RoomDtos.RoomSearchRequest request) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(roomService.searchRooms(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room details")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.RoomResponse>> getRoom(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(roomService.getRoomById(id)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get room availability calendar")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.AvailabilityResponse>> getAvailability(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(roomService.getRoomAvailability(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new room (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.RoomResponse>> createRoom(
            @Valid @RequestBody RoomDtos.CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDtos.ApiResponse.success(roomService.createRoom(request), "Room created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update room (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.RoomResponse>> updateRoom(
            @PathVariable UUID id, @Valid @RequestBody RoomDtos.UpdateRoomRequest request) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(roomService.updateRoom(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete room (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null, "Room deleted"));
    }

    @PostMapping("/{id}/photos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add room photo (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.RoomResponse>> addPhoto(
            @PathVariable UUID id, @RequestParam String url) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(roomService.addPhoto(id, url)));
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove room photo (Admin)")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> removePhoto(
            @PathVariable UUID id, @PathVariable UUID photoId) {
        roomService.removePhoto(id, photoId);
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null, "Photo removed"));
    }
}
