package com.stayease.service;

import com.stayease.dto.request.ReviewDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.Reservation;
import com.stayease.entity.Review;
import com.stayease.entity.User;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.ReservationRepository;
import com.stayease.repository.ReviewRepository;
import com.stayease.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public ResponseDtos.ReviewResponse submitReview(
            UUID roomId, ReviewDtos.CreateReviewRequest req, User currentUser) {

        // Validate reservation exists and is checked out
        Reservation reservation = reservationRepository.findByIdWithDetails(req.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", req.getReservationId().toString()));

        if (!reservation.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only review your own stays");
        }
        if (reservation.getStatus() != Reservation.Status.CHECKED_OUT) {
            throw new BadRequestException("You can only review completed stays");
        }
        if (!reservation.getRoom().getId().equals(roomId)) {
            throw new BadRequestException("Reservation does not match room");
        }
        if (reviewRepository.existsByReservationId(req.getReservationId())) {
            throw new BadRequestException("You have already reviewed this stay");
        }

        Review review = Review.builder()
                .reservation(reservation)
                .user(currentUser)
                .room(reservation.getRoom())
                .ratingOverall(req.getRatingOverall())
                .ratingCleanliness(req.getRatingCleanliness())
                .ratingComfort(req.getRatingComfort())
                .ratingLocation(req.getRatingLocation())
                .ratingStaff(req.getRatingStaff())
                .comment(req.getComment())
                .isAnonymous(req.isAnonymous())
                .status(Review.Status.PENDING)
                .build();

        reviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.ReviewResponse> getRoomReviews(
            UUID roomId, int page, int size) {

        Page<Review> p = reviewRepository.findApprovedByRoomId(
                roomId, PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return ResponseDtos.PageResponse.<ResponseDtos.ReviewResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public ResponseDtos.ReviewResponse updateStatus(UUID id, ReviewDtos.UpdateReviewStatusRequest req) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id.toString()));
        review.setStatus(req.getStatus());
        reviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional
    public void deleteReview(UUID id) {
        reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id.toString()));
        reviewRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.ReviewResponse> getPendingReviews(int page, int size) {
        Page<Review> p = reviewRepository.findByStatus(
                Review.Status.PENDING,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseDtos.PageResponse.<ResponseDtos.ReviewResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(p.getNumber()).size(p.getSize())
                .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast())
                .build();
    }

    private ResponseDtos.ReviewResponse toResponse(Review r) {
        String authorName = r.isAnonymous() ? "Anonymous Guest" : r.getUser().getFullName();
        return ResponseDtos.ReviewResponse.builder()
                .id(r.getId())
                .authorName(authorName)
                .userId(r.isAnonymous() ? null : r.getUser().getId())
                .roomId(r.getRoom().getId())
                .ratingOverall(r.getRatingOverall())
                .ratingCleanliness(r.getRatingCleanliness())
                .ratingComfort(r.getRatingComfort())
                .ratingLocation(r.getRatingLocation())
                .ratingStaff(r.getRatingStaff())
                .comment(r.getComment())
                .isAnonymous(r.isAnonymous())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
