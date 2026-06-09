package com.stayease.service;

import com.stayease.dto.request.RoomDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.Amenity;
import com.stayease.entity.Room;
import com.stayease.entity.RoomPhoto;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.ReservationRepository;
import com.stayease.repository.ReviewRepository;
import com.stayease.repository.RoomRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public ResponseDtos.PageResponse<ResponseDtos.RoomResponse> searchRooms(RoomDtos.RoomSearchRequest req) {
        LocalDate checkIn = parseDate(req.getCheckIn());
        LocalDate checkOut = parseDate(req.getCheckOut());

        Sort sort = switch (req.getSortBy() != null ? req.getSortBy() : "name") {
            case "price_asc" -> Sort.by("pricePerNight").ascending();
            case "price_desc" -> Sort.by("pricePerNight").descending();
            default -> Sort.by("name").ascending();
        };

        PageRequest pageable = PageRequest.of(
                req.getPage() != null ? req.getPage() : 0,
                req.getSize() != null ? req.getSize() : 12,
                sort
        );

        System.out.println("TYPE: " + req.getType());
        System.out.println("CHECKIN: " + req.getCheckIn());
        System.out.println("ADULTS: " + req.getAdults());

        Page<Room> page = roomRepository.findAvailableRooms(
                req.getType(),
                req.getMinPrice(),
                req.getMaxPrice(),
                req.getAdults(),
                req.getChildren(),
                checkIn,
                checkOut,
                pageable
        );
       

        List<ResponseDtos.RoomResponse> rooms = page.getContent().stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());

        return ResponseDtos.PageResponse.<ResponseDtos.RoomResponse>builder()
                .content(rooms)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ResponseDtos.RoomResponse getRoomById(UUID id) {
        Room room = roomRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id.toString()));
        return toRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public ResponseDtos.AvailabilityResponse getRoomAvailability(UUID roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", roomId.toString()));

        LocalDate from = LocalDate.now();
        LocalDate to = from.plusMonths(6);

        var reservations = reservationRepository.findForCalendar(roomId, from, to);
        Set<LocalDate> bookedDates = new HashSet<>();
        reservations.forEach(r -> {
            LocalDate d = r.getCheckInDate();
            while (d.isBefore(r.getCheckOutDate())) {
                bookedDates.add(d);
                d = d.plusDays(1);
            }
        });

        List<ResponseDtos.DateAvailability> dates = new ArrayList<>();
        LocalDate d = from;
        while (!d.isAfter(to)) {
            dates.add(ResponseDtos.DateAvailability.builder()
                    .date(d)
                    .status(bookedDates.contains(d) ? "BOOKED" : "AVAILABLE")
                    .build());
            d = d.plusDays(1);
        }

        return ResponseDtos.AvailabilityResponse.builder()
                .roomId(roomId)
                .dates(dates)
                .build();
    }

    @Transactional
    public ResponseDtos.RoomResponse createRoom(RoomDtos.CreateRoomRequest req) {
        if (roomRepository.existsByRoomNumber(req.getRoomNumber())) {
            throw new BadRequestException("Room number already exists: " + req.getRoomNumber());
        }

        Room room = Room.builder()
                .roomNumber(req.getRoomNumber())
                .name(req.getName())
                .type(req.getType())
                .floor(req.getFloor())
                .capacityAdults(req.getCapacityAdults())
                .capacityChildren(req.getCapacityChildren())
                .pricePerNight(req.getPricePerNight())
                .description(req.getDescription())
                .build();

        if (req.getAmenityIds() != null) {
            Set<Amenity> amenities = req.getAmenityIds().stream()
                    .map(id -> entityManager.getReference(Amenity.class, id))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        roomRepository.save(room);
        return toRoomResponse(roomRepository.findByIdWithDetails(room.getId()).orElseThrow());
    }

    @Transactional
    public ResponseDtos.RoomResponse updateRoom(UUID id, RoomDtos.UpdateRoomRequest req) {
        Room room = roomRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id.toString()));

        if (req.getName() != null) room.setName(req.getName());
        if (req.getType() != null) room.setType(req.getType());
        if (req.getFloor() != null) room.setFloor(req.getFloor());
        if (req.getCapacityAdults() != null) room.setCapacityAdults(req.getCapacityAdults());
        if (req.getCapacityChildren() != null) room.setCapacityChildren(req.getCapacityChildren());
        if (req.getPricePerNight() != null) room.setPricePerNight(req.getPricePerNight());
        if (req.getDescription() != null) room.setDescription(req.getDescription());
        if (req.getAmenityIds() != null) {
            Set<Amenity> amenities = req.getAmenityIds().stream()
                    .map(aid -> entityManager.getReference(Amenity.class, aid))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        roomRepository.save(room);
        return toRoomResponse(roomRepository.findByIdWithDetails(id).orElseThrow());
    }

    @Transactional
    public void deleteRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id.toString()));
        room.setActive(false);
        roomRepository.save(room);
    }

    @Transactional
    public ResponseDtos.RoomResponse addPhoto(UUID roomId, String url) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", roomId.toString()));

        List<RoomPhoto> photos = room.getPhotos();
        if (photos != null && photos.size() >= 10) {
            throw new BadRequestException("Maximum 10 photos per room");
        }

        RoomPhoto photo = RoomPhoto.builder()
                .room(room)
                .url(url)
                .displayOrder((short) (photos == null ? 0 : photos.size()))
                .build();

        entityManager.persist(photo);
        return toRoomResponse(roomRepository.findByIdWithDetails(roomId).orElseThrow());
    }

    @Transactional
    public void removePhoto(UUID roomId, UUID photoId) {
        RoomPhoto photo = entityManager.find(RoomPhoto.class, photoId);
        if (photo == null || !photo.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Photo", photoId.toString());
        }
        entityManager.remove(photo);
    }

    private ResponseDtos.RoomResponse toRoomResponse(Room room) {
        Double avgRating = reviewRepository.findAverageRatingByRoomId(room.getId());
        long reviewCount = reviewRepository.countByRoomIdAndStatus(room.getId(), com.stayease.entity.Review.Status.APPROVED);

        Set<ResponseDtos.AmenityResponse> amenities = Optional.ofNullable(room.getAmenities())
                .orElse(new HashSet<>()).stream()
                .map(ResponseDtos.AmenityResponse::from)
                .collect(Collectors.toSet());

        List<ResponseDtos.RoomPhotoResponse> photos = Optional.ofNullable(room.getPhotos())
                .orElse(new ArrayList<>()).stream()
                .map(p -> ResponseDtos.RoomPhotoResponse.builder()
                        .id(p.getId())
                        .url(p.getUrl())
                        .displayOrder(p.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());

        return ResponseDtos.RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .name(room.getName())
                .type(room.getType().name())
                .floor(room.getFloor())
                .capacityAdults(room.getCapacityAdults())
                .capacityChildren(room.getCapacityChildren())
                .pricePerNight(room.getPricePerNight())
                .description(room.getDescription())
                .isActive(room.isActive())
                .amenities(amenities)
                .photos(photos)
                .averageRating(avgRating)
                .reviewCount(reviewCount)
                .createdAt(room.getCreatedAt())
                .build();
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date format: " + dateStr);
        }
    }
}
