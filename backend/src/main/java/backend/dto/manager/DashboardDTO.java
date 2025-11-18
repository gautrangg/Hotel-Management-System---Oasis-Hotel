package backend.dto.manager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    // KPI Cards
    private BigDecimal totalRevenue;
    private Double revenueChangePercent;
    private Integer availableRooms;
    private Double availableChangePercent;
    private Integer occupiedRooms;
    private Double occupiedChangePercent;
    private Integer workingStaffToday;
    private Double staffChangePercent;
    private String periodStart;
    private String periodEnd;
    // Chart Data
    private List<RevenueDataPoint> revenueChart;
    private Map<String, Integer> roomStatusStats;
    private List<TodayBooking> todayBookings;

    // Inner Classes
    public static class RevenueDataPoint {
        private String label;
        private BigDecimal revenue;

        public RevenueDataPoint() {}

        public RevenueDataPoint(String label, BigDecimal revenue) {
            this.label = label;
            this.revenue = revenue;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class TodayBooking {
        private Long bookingId;
        private String roomNumber;
        private String customerName;
        private String status;
        private String checkInTime;

        public TodayBooking() {}

        public TodayBooking(Long bookingId, String roomNumber, String customerName,
                            String status, String checkInTime) {
            this.bookingId = bookingId;
            this.roomNumber = roomNumber;
            this.customerName = customerName;
            this.status = status;
            this.checkInTime = checkInTime;
        }

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCheckInTime() { return checkInTime; }
        public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }
    }

    // Getters and Setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public Double getRevenueChangePercent() { return revenueChangePercent; }
    public void setRevenueChangePercent(Double revenueChangePercent) {
        this.revenueChangePercent = revenueChangePercent;
    }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }

    public Double getAvailableChangePercent() { return availableChangePercent; }
    public void setAvailableChangePercent(Double availableChangePercent) {
        this.availableChangePercent = availableChangePercent;
    }

    public Integer getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(Integer occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public Double getOccupiedChangePercent() { return occupiedChangePercent; }
    public void setOccupiedChangePercent(Double occupiedChangePercent) {
        this.occupiedChangePercent = occupiedChangePercent;
    }

    public Integer getWorkingStaffToday() { return workingStaffToday; }
    public void setWorkingStaffToday(Integer workingStaffToday) {
        this.workingStaffToday = workingStaffToday;
    }

    public Double getStaffChangePercent() { return staffChangePercent; }
    public void setStaffChangePercent(Double staffChangePercent) {
        this.staffChangePercent = staffChangePercent;
    }

    public List<RevenueDataPoint> getRevenueChart() { return revenueChart; }
    public void setRevenueChart(List<RevenueDataPoint> revenueChart) {
        this.revenueChart = revenueChart;
    }

    public Map<String, Integer> getRoomStatusStats() { return roomStatusStats; }
    public void setRoomStatusStats(Map<String, Integer> roomStatusStats) {
        this.roomStatusStats = roomStatusStats;
    }

    public List<TodayBooking> getTodayBookings() { return todayBookings; }
    public void setTodayBookings(List<TodayBooking> todayBookings) {
        this.todayBookings = todayBookings;
    }
    public String getPeriodStart() { return periodStart; }
    public void setPeriodStart(String periodStart) { this.periodStart = periodStart; }
    public String getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(String periodEnd) { this.periodEnd = periodEnd; }
}