package com.stayease.controller;

import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.User;
import com.stayease.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.PageResponse<ResponseDtos.NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                notificationService.getUserNotifications(currentUser.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ResponseDtos.ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(
                notificationService.getUnreadCount(currentUser.getId())));
    }
  
    @PatchMapping("/{id}/read")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> markAsRead(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ResponseDtos.ApiResponse<Integer>> markAllAsRead(
            @AuthenticationPrincipal User currentUser) {
        int count = notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(count));
    }
}
