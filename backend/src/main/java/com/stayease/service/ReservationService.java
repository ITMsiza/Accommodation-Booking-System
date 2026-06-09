package com.stayease.service;

import com.stayease.dto.request.ReservationDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.*;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.BookingConflictException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationAuditLogRepository auditLogRepository;
    private final RoomRepository roomRepository;
    private final NotificationService notificationService;

    @Transactional
    public ResponseDtos.ReservationResponse createReservation(
            ReservationDtos.CreateReservationRequest req, User currentUser) {

        validateDates(req.getCheckInDate(), req.getCheckOutDate());

        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", req.getRoomId().toString()));

        if (!room.isActive()) {
            throw new BadRequestException("Room is not available");
        }

        // Check capacity
        int totalGuests = req.getNumAdults() + (req.getNumChildren() != null ? req.getNumChildren() : 0);
        if (req.getNumAdults() > room.getCapacityAdults()) {
            throw new BadRequestException("Room capacity exceeded for adults");
        }

        // Check availability
        checkAvailability(room.getId(), req.getCheckInDate(), req.getCheckOutDate(), null);

        long nights = ChronoUnit.DAYS.between(req.getCheckInDate(), req.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Reservation reservation = Reservation.builder()
                .user(currentUser)
                .room(room)
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .numAdults(req.getNumAdults())
                .numChildren(req.getNumChildren() != null ? req.getNumChildren() : 0)
                .totalPrice(totalPrice)
                .specialRequests(req.getSpecialRequests())
                .status(Reservation.Status.PENDING)
                .build();

        reservationRepository.save(reservation);

        // Audit log
        saveAuditLog(reservation, null, Reservation.Status.PENDING, currentUser, "Reservation created");

        // Notify
        notificationService.createNotification(
                currentUser, "BOOKING_CREATED", "Booking Confirmed",
                "Your reservation #" + reservation.getId().toString().substring(0, 8).toUpperCase() +
                " for " + room.getName() + " has been created.",
                reservation
        );

        return toResponse(reservation);
    }

    @Transactional
    public ResponseDtos.ReservationResponse updateReservation(
            UUID id, ReservationDtos.UpdateReservationRequest req, User currentUser) {

        Reservation reservation = getReservationOrThrow(id);
        checkOwnershipOrAdmin(reservation, currentUser);

        if (reservation.getStatus() != Reservation.Status.PENDING &&
            reservation.getStatus() != Reservation.Status.CONFIRMED) {
            throw new BadRequestException("Cannot modify a " + reservation.getStatus() + " reservation");
        }

        // Check 24-hour window
        if (ChronoUnit.HOURS.between(OffsetDateTime.now(), reservation.getCheckInDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset())) < 24) {
            throw new BadRequestException("Cannot modify reservation within 24 hours of check-in");
        }

        Reservation.Status oldStatus = reservation.getStatus();

        if (req.getRoomId() != null) {
            Room room = roomRepository.findById(req.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room", req.getRoomId().toString()));
            reservation.setRoom(room);
        }
        if (req.getCheckInDate() != null) reservation.setCheckInDate(req.getCheckInDate());
        if (req.getCheckOutDate() != null) reservation.setCheckOutDate(req.getCheckOutDate());
        if (req.getNumAdults() != null) reservation.setNumAdults(req.getNumAdults());
        if (req.getNumChildren() != null) reservation.setNumChildren(req.getNumChildren());
        if (req.getSpecialRequests() != null) reservation.setSpecialRequests(req.getSpecialRequests());

        // Re-validate availability
        checkAvailability(reservation.getRoom().getId(),
                reservation.getCheckInDate(), reservation.getCheckOutDate(), id);

        long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
        reservation.setTotalPrice(reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights)));

        reservationRepository.save(reservation);
        saveAuditLog(reservation, oldStatus, reservation.getStatus(), currentUser, "Reservation modified");

        return toResponse(reservation);
    }

    @Transactional
    public ResponseDtos.ReservationResponse updateStatus(
            UUID id, ReservationDtos.UpdateStatusRequest req, User currentUser) {

        Reservation reservation = getReservationOrThrow(id);
        Reservation.Status oldStatus = reservation.getStatus();
        reservation.setStatus(req.getStatus());

        // Apply cancellation fee if applicable
        if (req.getStatus() == Reservation.Status.CANCELLED) {
            long hoursUntilCheckIn = ChronoUnit.HOURS.between(
                    OffsetDateTime.now(),
                    reservation.getCheckInDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset())
            );
            if (hoursUntilCheckIn < 24) {
                reservation.setCancellationFee(reservation.getRoom().getPricePerNight());
            }
        }

        reservationRepository.save(reservation);
        saveAuditLog(reservation, oldStatus, req.getStatus(), currentUser, req.getNote());

        notificationService.createNotification(
                reservation.getUser(),
                "BOOKING_STATUS_CHANGED",
                "Booking Status Updated",
                "Your reservation status has been updated to " + req.getStatus().name(),
                reservation
        );

        return toResponse(reservation);
    }

    @Transactional
    public void cancelReservation(UUID id, User currentUser) {
        Reservation reservation = getReservationOrThrow(id);
        checkOwnershipOrAdmin(reservation, currentUser);

        if (reservation.getStatus() == Reservation.Status.CANCELLED) {
            throw new BadRequestException("Reservation is already cancelled");
        }
        if (reservation.getStatus() == Reservation.Status.CHECKED_OUT) {
            throw new BadRequestException("Cannot cancel a completed reservation");
        }

        Reservation.Status oldStatus = reservation.getStatus();
        reservation.setStatus(Reservation.Status.CANCELLED);

        long hoursUntilCheckIn = ChronoUnit.HOURS.between(
                OffsetDateTime.now(),
                reservation.getCheckInDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset())
        );
        if (hoursUntilCheckIn < 24) {
            reservation.setCancellationFee(reservation.getRoom().getPricePerNight());
        }

        reservationRepository.save(reservation);
        saveAuditLog(reservation, oldStatus, Reservation.Status.CANCELLED, currentUser, "Cancelled by user/admin");

        notificationService.createNotification(
                reservation.getUser(),
                "BOOKING_CANCELLED",
                "Booking Cancelled",
                "Your reservation for " + reservation.getRoom().getName() + " has been cancelled.",
                reservation
        );
    }

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.ReservationResponse> getMyReservations(
            User user, int page, int size) {

        Page<Reservation> p = reservationRepository.findByUserId(
                user.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return toPageResponse(p);
    }

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.ReservationResponse> getAllReservations(
            String status, UUID userId, UUID roomId, String fromDate, String toDate, int page, int size) {

        Reservation.Status statusEnum = status != null ? Reservation.Status.valueOf(status) : null;
        LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : null;
        LocalDate to = toDate != null ? LocalDate.parse(toDate) : null;

        Page<Reservation> p = reservationRepository.findAllFiltered(
                statusEnum, userId, roomId, from, to,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return toPageResponse(p);
    }

    @Transactional(readOnly = true)
    public ResponseDtos.ReservationResponse getReservationById(UUID id, User currentUser) {
        Reservation reservation = getReservationOrThrow(id);
        checkOwnershipOrAdmin(reservation, currentUser);
        return toResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<ResponseDtos.AuditLogResponse> getAuditLog(UUID id) {
        return auditLogRepository.findByReservationIdOrderByChangedAtDesc(id).stream()
                .map(log -> ResponseDtos.AuditLogResponse.builder()
                        .id(log.getId())
                        .oldStatus(log.getOldStatus() != null ? log.getOldStatus().name() : null)
                        .newStatus(log.getNewStatus().name())
                        .changedBy(log.getChangedByUser() != null ? log.getChangedByUser().getFullName() : "System")
                        .note(log.getNote())
                        .changedAt(log.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private void checkAvailability(UUID roomId, LocalDate checkIn, LocalDate checkOut, UUID excludeId) {
        List<Reservation> conflicts = reservationRepository.findConflicting(roomId, checkIn, checkOut, excludeId);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Room is not available for the selected dates");
        }
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out must be after check-in");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights > 30) {
            throw new BadRequestException("Maximum stay is 30 nights");
        }
    }

    private Reservation getReservationOrThrow(UUID id) {
        return reservationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id.toString()));
    }

    private void checkOwnershipOrAdmin(Reservation reservation, User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !reservation.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }
    }

    private void saveAuditLog(Reservation reservation, Reservation.Status oldStatus,
                              Reservation.Status newStatus, User changedBy, String note) {
        auditLogRepository.save(ReservationAuditLog.builder()
                .reservation(reservation)
                .changedByUser(changedBy)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(note)
                .build());
    }

    private ResponseDtos.ReservationResponse toResponse(Reservation r) {
        long nights = ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate());

        ResponseDtos.RoomResponse roomResp = ResponseDtos.RoomResponse.builder()
                .id(r.getRoom().getId())
                .roomNumber(r.getRoom().getRoomNumber())
                .name(r.getRoom().getName())
                .type(r.getRoom().getType().name())
                .floor(r.getRoom().getFloor())
                .pricePerNight(r.getRoom().getPricePerNight())
                .build();

        return ResponseDtos.ReservationResponse.builder()
                .id(r.getId())
                .user(ResponseDtos.UserResponse.from(r.getUser()))
                .room(roomResp)
                .checkInDate(r.getCheckInDate())
                .checkOutDate(r.getCheckOutDate())
                .numAdults(r.getNumAdults())
                .numChildren(r.getNumChildren())
                .status(r.getStatus().name())
                .totalPrice(r.getTotalPrice())
                .cancellationFee(r.getCancellationFee())
                .specialRequests(r.getSpecialRequests())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .nights((int) nights)
                .build();
    }

    private ResponseDtos.PageResponse<ResponseDtos.ReservationResponse> toPageResponse(Page<Reservation> p) {
        return ResponseDtos.PageResponse.<ResponseDtos.ReservationResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }
}
