package com.stayease.scheduler;

import com.stayease.entity.Reservation;
import com.stayease.repository.ReservationRepository;
import com.stayease.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckInReminderScheduler {

    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 10 * * *") // 10 AM daily
    @Transactional
    public void sendCheckInReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> upcoming = reservationRepository.findCheckInsForDate(tomorrow);

        for (Reservation reservation : upcoming) {
            try {
                notificationService.createNotification(
                        reservation.getUser(),
                        "CHECKIN_REMINDER",
                        "Check-in Tomorrow",
                        "Reminder: Your check-in at " + reservation.getRoom().getName() +
                        " is tomorrow, " + tomorrow + ". We look forward to welcoming you!",
                        reservation
                );
            } catch (Exception e) {
                log.error("Failed to send check-in reminder for reservation {}", reservation.getId(), e);
            }
        }

        log.info("Sent {} check-in reminders", upcoming.size());
    }

    @Scheduled(cron = "0 0 12 * * *") // Noon daily
    @Transactional
    public void markNoShows() {
        LocalDate today = LocalDate.now();
        List<Reservation> noShows = reservationRepository.findNoShowCandidates(today);

        for (Reservation reservation : noShows) {
            reservation.setStatus(Reservation.Status.NO_SHOW);
            reservationRepository.save(reservation);
            log.info("Marked reservation {} as NO_SHOW", reservation.getId());
        }
    }
}
