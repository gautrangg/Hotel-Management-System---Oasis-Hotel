package backend.dto.payment;

import backend.dto.schedule.ServiceDetailDTO;
import backend.dto.booking.SummaryDTO;
import backend.dto.customer.CustomerInfoDTO;
import backend.dto.room.RoomDetailDTO;

import java.time.LocalDateTime;
import java.util.List;

public class InvoiceViewDTO {
    private CustomerInfoDTO customer;
    private RoomDetailDTO room;
    private List<ServiceDetailDTO> services;
    private SummaryDTO summary;
    private String paymentStatus;
    private String receptionist;
    private LocalDateTime actualCheckin;

    public InvoiceViewDTO() {
    }

    public CustomerInfoDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerInfoDTO customer) {
        this.customer = customer;
    }

    public RoomDetailDTO getRoom() {
        return room;
    }

    public void setRoom(RoomDetailDTO room) {
        this.room = room;
    }

    public List<ServiceDetailDTO> getServices() {
        return services;
    }

    public void setServices(List<ServiceDetailDTO> services) {
        this.services = services;
    }

    public SummaryDTO getSummary() {
        return summary;
    }

    public void setSummary(SummaryDTO summary) {
        this.summary = summary;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getReceptionist() {
        return receptionist;
    }

    public void setReceptionist(String receptionist) {
        this.receptionist = receptionist;
    }

    public LocalDateTime getActualCheckin() {
        return actualCheckin;
    }

    public void setActualCheckin(LocalDateTime actualCheckin) {
        this.actualCheckin = actualCheckin;
    }
}