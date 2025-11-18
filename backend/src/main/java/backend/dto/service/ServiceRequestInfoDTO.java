package backend.dto.service;

import java.time.LocalDateTime;

public class ServiceRequestInfoDTO {
    private Long requestId;
    private String customerName;
    private String roomNumber;
    private String serviceName;
    private Integer quantity;
    private Long staffId;
    private String staffName;
    private String status;
    private LocalDateTime expectedTime;
    private String note;
    private String customerAvatar;
    private String serviceImage;

    public ServiceRequestInfoDTO() {
    }

    public ServiceRequestInfoDTO(Long requestId, String customerName, String roomNumber, String serviceName, Integer quantity, Long staffId, String staffName, String status, LocalDateTime expectedTime, String note, String customerAvatar, String serviceImage) {
        this.requestId = requestId;
        this.customerName = customerName;
        this.roomNumber = roomNumber;
        this.serviceName = serviceName;
        this.quantity = quantity;
        this.staffId = staffId;
        this.staffName = staffName;
        this.status = status;
        this.expectedTime = expectedTime;
        this.note = note;
        this.customerAvatar = customerAvatar;
        this.serviceImage = serviceImage;
    }

    public ServiceRequestInfoDTO(Long requestId, String customerName, String roomNumber, String serviceName, Integer quantity, String staffName, String status, LocalDateTime expectedTime, String note, String customerAvatar, String serviceImage) {
        this.requestId = requestId;
        this.customerName = customerName;
        this.roomNumber = roomNumber;
        this.serviceName = serviceName;
        this.quantity = quantity;
        this.staffName = staffName;
        this.status = status;
        this.expectedTime = expectedTime;
        this.note = note;
        this.customerAvatar = customerAvatar;
        this.serviceImage = serviceImage;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getExpectedTime() {
        return expectedTime;
    }

    public void setExpectedTime(LocalDateTime expectedTime) {
        this.expectedTime = expectedTime;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getCustomerAvatar() {
        return customerAvatar;
    }

    public void setCustomerAvatar(String customerAvatar) {
        this.customerAvatar = customerAvatar;
    }

    public String getServiceImage() {
        return serviceImage;
    }

    public void setServiceImage(String serviceImage) {
        this.serviceImage = serviceImage;
    }
}