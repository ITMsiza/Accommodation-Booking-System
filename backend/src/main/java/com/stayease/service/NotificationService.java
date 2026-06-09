package com.stayease.service;

import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.Notification;
import com.stayease.entity.Reservation;
import com.stayease.entity.User;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createNotification(User user, String type, String title, String body, Reservation reservation) {
        if (!user.isNotifyPush()) return;

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .reservation(reservation)
                .build();

        notificationRepository.save(notification);

        // Push via WebSocket
        ResponseDtos.NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                response
        );
    }

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.NotificationResponse> getUserNotifications(
            UUID userId, int page, int size) {

        Page<Notification> p = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return ResponseDtos.PageResponse.<ResponseDtos.NotificationResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId.toString()));
        if (!n.getUser().getId().equals(userId)) {
            throw new com.stayease.exception.ForbiddenException("Access denied");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllReadByUserId(userId);
    }

    /*@Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }*/
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return 0;
    }

    private ResponseDtos.NotificationResponse toResponse(Notification n) {
        return ResponseDtos.NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .isRead(n.isRead())
                .reservationId(n.getReservation() != null ? n.getReservation().getId() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
