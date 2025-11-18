package backend.service;

import backend.dto.manager.DashboardDTO;
import backend.entity.*;
import backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingRoomRepository bookingRoomRepository;
    @Autowired
    private StaffRepository staffRepository;

    public DashboardDTO getDashboardData(String period) {
        DashboardDTO dto = new DashboardDTO();
        // Calculate date range
        LocalDateTime[] dateRange = getDateRange(period);
        LocalDateTime startDate = dateRange[0];
        LocalDateTime endDate = dateRange[1];
        // Set period dates
        dto.setPeriodStart(startDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        dto.setPeriodEnd(endDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

        // 1. Total Revenue - FILTER BY PERIOD
        dto.setTotalRevenue(calculateTotalRevenue(startDate, endDate));
        dto.setRevenueChangePercent(calculateRevenueChange(period));


        Map<String, Integer> roomStats = getRoomStats();
        dto.setAvailableRooms(roomStats.getOrDefault("Available", 0));
        dto.setAvailableChangePercent(0.0); // Can calculate if needed
        dto.setOccupiedRooms(roomStats.getOrDefault("Occupied", 0));
        dto.setOccupiedChangePercent(0.0); // Can calculate if needed

        dto.setWorkingStaffToday(getWorkingStaffToday());
        dto.setStaffChangePercent(0.0); // Can calculate if needed

        // 2. Revenue Chart
        dto.setRevenueChart(getRevenueChart(period));

        // 3. Room Status Stats
        dto.setRoomStatusStats(roomStats);

        // 4. Today Bookings
        dto.setTodayBookings(getTodayBookings());


        return dto;
    }

    private BigDecimal calculateTotalRevenue() {
        List<Invoice> paidInvoices = invoiceRepository.findByStatus("PAID");
        return paidInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Double calculateRevenueChange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minusMonths(1);

        BigDecimal currentRevenue = invoiceRepository.findByStatusAndInvoiceDateAfter("PAID", lastMonth.minusMonths(1))
                .stream()
                .filter(i -> i.getInvoiceDate().isAfter(lastMonth))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousRevenue = invoiceRepository.findByStatusAndInvoiceDateAfter("PAID", lastMonth.minusMonths(2))
                .stream()
                .filter(i -> i.getInvoiceDate().isBefore(lastMonth))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (previousRevenue.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        return currentRevenue.subtract(previousRevenue)
                .divide(previousRevenue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .doubleValue();
    }

    private Map<String, Integer> getRoomStats() {
        List<Room> rooms = roomRepository.findByIsActive(true);
        return rooms.stream()
                .collect(Collectors.groupingBy(
                        Room::getStatus,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private Integer getWorkingStaffToday() {
        return staffRepository.countByIsActive(true);
    }

    private List<DashboardDTO.RevenueDataPoint> getRevenueChart(String period) {
        List<DashboardDTO.RevenueDataPoint> dataPoints = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        switch (period.toLowerCase()) {
            case "week":
                // Last 7 days
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime date = now.minusDays(i);
                    LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
                    LocalDateTime endOfDay = date.toLocalDate().atTime(23, 59, 59);

                    BigDecimal revenue = invoiceRepository.findByStatusAndInvoiceDateBetween(
                                    "PAID", startOfDay, endOfDay)
                            .stream()
                            .map(Invoice::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    String label = date.format(DateTimeFormatter.ofPattern("EEE"));
                    dataPoints.add(new DashboardDTO.RevenueDataPoint(label, revenue));
                }
                break;

            case "month":
                // Last 30 days grouped by week
                for (int i = 4; i >= 0; i--) {
                    LocalDateTime weekStart = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
                    LocalDateTime weekEnd = weekStart.plusDays(6);

                    BigDecimal revenue = invoiceRepository.findByStatusAndInvoiceDateBetween(
                                    "PAID", weekStart, weekEnd)
                            .stream()
                            .map(Invoice::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    String label = "Week " + (5 - i);
                    dataPoints.add(new DashboardDTO.RevenueDataPoint(label, revenue));
                }
                break;

            case "year":
                // Last 12 months
                for (int i = 11; i >= 0; i--) {
                    LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).toLocalDate().atStartOfDay();
                    LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

                    BigDecimal revenue = invoiceRepository.findByStatusAndInvoiceDateBetween(
                                    "PAID", monthStart, monthEnd)
                            .stream()
                            .map(Invoice::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    String label = monthStart.format(DateTimeFormatter.ofPattern("MMM"));
                    dataPoints.add(new DashboardDTO.RevenueDataPoint(label, revenue));
                }
                break;
        }

        return dataPoints;
    }

    private List<DashboardDTO.TodayBooking> getTodayBookings() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        List<Booking> todayBookings = bookingRepository.findByCheckinDateBetween(startOfDay, endOfDay);

        List<DashboardDTO.TodayBooking> result = new ArrayList<>();
        for (Booking booking : todayBookings) {
            BookingRoom br = bookingRoomRepository.findFirstByBookingId(booking.getBookingId()).orElse(null);
            if (br != null) {
                Room room = roomRepository.findById(br.getRoomId()).orElse(null);

                DashboardDTO.TodayBooking tb = new DashboardDTO.TodayBooking(
                        booking.getBookingId(),
                        room != null ? room.getRoomNumber() : "N/A",
                        booking.getContactName(),
                        booking.getStatus(),
                        booking.getCheckinDate().format(DateTimeFormatter.ofPattern("HH:mm"))
                );
                result.add(tb);
            }
        }

        return result;
    }


    private LocalDateTime[] getDateRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;

        switch (period.toLowerCase()) {
            case "week":
                start = now.minusDays(6).toLocalDate().atStartOfDay();
                break;
            case "month":
                start = now.minusDays(29).toLocalDate().atStartOfDay();
                break;
            case "year":
                start = now.minusMonths(11).withDayOfMonth(1).toLocalDate().atStartOfDay();
                break;
            default:
                start = now.minusDays(6).toLocalDate().atStartOfDay();
        }

        return new LocalDateTime[]{start, now};
    }

    private BigDecimal calculateTotalRevenue(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByStatusAndInvoiceDateBetween("PAID", start, end)
                .stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}