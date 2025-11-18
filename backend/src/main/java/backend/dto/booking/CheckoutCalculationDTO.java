package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CheckoutCalculationDTO {
    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal deposit;
    private BigDecimal lateCheckoutFee;
    private BigDecimal earlyCheckoutPenalty;
    private BigDecimal finalAmount;
    private String checkoutScenario;
    private String description;
    private long numberOfNights;
    private long hoursLate;
    private LocalDateTime actualCheckoutTime;
    private LocalDateTime expectedCheckoutTime;
    
    // Formatted date strings for frontend display
    private String formattedActualCheckoutTime;
    private String formattedExpectedCheckoutTime;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Constructors
    public CheckoutCalculationDTO() {}

    public CheckoutCalculationDTO(BigDecimal roomTotal, BigDecimal serviceTotal, BigDecimal deposit, 
                                 BigDecimal lateCheckoutFee, BigDecimal earlyCheckoutPenalty, 
                                 BigDecimal finalAmount, String checkoutScenario, String description,
                                 long numberOfNights, long hoursLate, LocalDateTime actualCheckoutTime,
                                 LocalDateTime expectedCheckoutTime) {
        this.roomTotal = roomTotal;
        this.serviceTotal = serviceTotal;
        this.deposit = deposit;
        this.lateCheckoutFee = lateCheckoutFee;
        this.earlyCheckoutPenalty = earlyCheckoutPenalty;
        this.finalAmount = finalAmount;
        this.checkoutScenario = checkoutScenario;
        this.description = description;
        this.numberOfNights = numberOfNights;
        this.hoursLate = hoursLate;
        this.actualCheckoutTime = actualCheckoutTime;
        this.expectedCheckoutTime = expectedCheckoutTime;
    }

    // Getters and Setters
    public BigDecimal getRoomTotal() { return roomTotal; }
    public void setRoomTotal(BigDecimal roomTotal) { this.roomTotal = roomTotal; }

    public BigDecimal getServiceTotal() { return serviceTotal; }
    public void setServiceTotal(BigDecimal serviceTotal) { this.serviceTotal = serviceTotal; }

    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

    public BigDecimal getLateCheckoutFee() { return lateCheckoutFee; }
    public void setLateCheckoutFee(BigDecimal lateCheckoutFee) { this.lateCheckoutFee = lateCheckoutFee; }

    public BigDecimal getEarlyCheckoutPenalty() { return earlyCheckoutPenalty; }
    public void setEarlyCheckoutPenalty(BigDecimal earlyCheckoutPenalty) { this.earlyCheckoutPenalty = earlyCheckoutPenalty; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public String getCheckoutScenario() { return checkoutScenario; }
    public void setCheckoutScenario(String checkoutScenario) { this.checkoutScenario = checkoutScenario; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public long getNumberOfNights() { return numberOfNights; }
    public void setNumberOfNights(long numberOfNights) { this.numberOfNights = numberOfNights; }

    public long getHoursLate() { return hoursLate; }
    public void setHoursLate(long hoursLate) { this.hoursLate = hoursLate; }

    public LocalDateTime getActualCheckoutTime() { return actualCheckoutTime; }
    public void setActualCheckoutTime(LocalDateTime actualCheckoutTime) { 
        this.actualCheckoutTime = actualCheckoutTime;
        this.formattedActualCheckoutTime = actualCheckoutTime != null ? actualCheckoutTime.format(DATE_TIME_FORMATTER) : null;
    }

    public LocalDateTime getExpectedCheckoutTime() { return expectedCheckoutTime; }
    public void setExpectedCheckoutTime(LocalDateTime expectedCheckoutTime) { 
        this.expectedCheckoutTime = expectedCheckoutTime;
        this.formattedExpectedCheckoutTime = expectedCheckoutTime != null ? expectedCheckoutTime.format(DATE_TIME_FORMATTER) : null;
    }
    
    // Formatted date getters
    public String getFormattedActualCheckoutTime() { return formattedActualCheckoutTime; }
    public void setFormattedActualCheckoutTime(String formattedActualCheckoutTime) { this.formattedActualCheckoutTime = formattedActualCheckoutTime; }
    
    public String getFormattedExpectedCheckoutTime() { return formattedExpectedCheckoutTime; }
    public void setFormattedExpectedCheckoutTime(String formattedExpectedCheckoutTime) { this.formattedExpectedCheckoutTime = formattedExpectedCheckoutTime; }
}

