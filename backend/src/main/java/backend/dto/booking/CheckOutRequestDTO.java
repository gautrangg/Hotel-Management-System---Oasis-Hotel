package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CheckOutRequestDTO {
    private String paymentMethod;
    private List<FinalServiceDTO> finalServices;
    private LocalDateTime actualCheckoutTime;
    private BigDecimal penalty;
    private PaymentDetailsDTO paymentDetails;

    public static class FinalServiceDTO {
        private Long serviceId;
        private int quantity;

        // Getters & Setters
        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class PaymentDetailsDTO {
        private BigDecimal cashReceived;
        private BigDecimal changeAmount;

        // Getters & Setters
        public BigDecimal getCashReceived() { return cashReceived; }
        public void setCashReceived(BigDecimal cashReceived) { this.cashReceived = cashReceived; }
        public BigDecimal getChangeAmount() { return changeAmount; }
        public void setChangeAmount(BigDecimal changeAmount) { this.changeAmount = changeAmount; }
    }

    // Getters & Setters
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public List<FinalServiceDTO> getFinalServices() { return finalServices; }
    public void setFinalServices(List<FinalServiceDTO> finalServices) { this.finalServices = finalServices; }
    public LocalDateTime getActualCheckoutTime() { return actualCheckoutTime; }
    public void setActualCheckoutTime(LocalDateTime actualCheckoutTime) { this.actualCheckoutTime = actualCheckoutTime; }
    public BigDecimal getPenalty() { return penalty; }
    public void setPenalty(BigDecimal penalty) { this.penalty = penalty; }
    public PaymentDetailsDTO getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(PaymentDetailsDTO paymentDetails) { this.paymentDetails = paymentDetails; }
}