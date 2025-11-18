package backend.service;

import backend.dto.booking.SummaryDTO;
import backend.dto.customer.CustomerInfoDTO;
import backend.dto.payment.InvoiceViewDTO;
import backend.dto.room.RoomDetailDTO;
import backend.dto.schedule.ServiceDetailDTO;
import org.springframework.stereotype.Service;
import backend.entity.*;
import backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class InvoiceService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final StaffRepository staffRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceRepository serviceRepository;

    private final PriceAdjustmentService priceAdjustmentService;

    private final DecimalFormat formatter = new DecimalFormat("#,###");
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public InvoiceService(BookingRepository bookingRepository, CustomerRepository customerRepository, InvoiceRepository invoiceRepository, StaffRepository staffRepository, BookingRoomRepository bookingRoomRepository, RoomRepository roomRepository, RoomTypeRepository roomTypeRepository, ServiceRequestRepository serviceRequestRepository, ServiceRepository serviceRepository, PriceAdjustmentService priceAdjustmentService) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.staffRepository = staffRepository;
        this.bookingRoomRepository = bookingRoomRepository;
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.serviceRepository = serviceRepository;
        this.priceAdjustmentService = priceAdjustmentService;
    }

    public InvoiceViewDTO getInvoiceForBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        Invoice invoice = invoiceRepository.findFirstByBookingIdOrderByInvoiceDateDesc(bookingId).orElse(new Invoice());

        Staff receptionist = null;
        if (invoice.getStaffId() != null) {
            receptionist = staffRepository.findById(invoice.getStaffId()).orElse(null);
        }

        BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(bookingId).orElseThrow();
        Room room = roomRepository.findById(bookingRoom.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findByBookingId(bookingId);

        //tính và map sang dto
        InvoiceViewDTO dto = new InvoiceViewDTO();

        BigDecimal totalRoomAmount = BigDecimal.ZERO;
        BigDecimal totalServiceAmount = BigDecimal.ZERO;
        BigDecimal deposit = (booking.getDeposit() == null) ? BigDecimal.ZERO : booking.getDeposit();

        // Customer Info
        CustomerInfoDTO customerInfo = new CustomerInfoDTO();

        customerInfo.setName(booking.getContactName());
        customerInfo.setEmail(booking.getContactEmail());
        customerInfo.setPhone(booking.getContactPhone());
        customerInfo.setCheckIn(booking.getCheckinDate().format(dateFormatter));
        customerInfo.setCheckOut(booking.getCheckoutDate().format(dateFormatter));
        customerInfo.setDeposit(formatCurrencyWithUnit(deposit));
        customerInfo.setAdult(booking.getAdult());
        customerInfo.setChildren(booking.getChildren());
        dto.setCustomer(customerInfo);

        // Room Detail
        RoomDetailDTO roomDetail = new RoomDetailDTO();

        LocalDateTime checkin = booking.getCheckinDate();
        LocalDateTime checkout = booking.getCheckoutDate();
        long nights = ChronoUnit.DAYS.between(checkin.toLocalDate(), checkout.toLocalDate());
        if (nights <= 0) {
            nights = 1;
        }
        roomDetail.setRoomNumber(room.getRoomNumber());
        roomDetail.setType(roomType.getRoomTypeName());
        roomDetail.setPrice(roomType.getPrice());
        roomDetail.setNights((int) nights);

        // dùng hàm util để tính giá nếu có phụ thu, giảm giá
        totalRoomAmount = roomType.getPrice();
        roomDetail.setTotal(totalRoomAmount);
        dto.setRoom(roomDetail);

        // Services
        List<ServiceDetailDTO> serviceDetails = new ArrayList<>();
        for (ServiceRequest req : serviceRequests) {
            if ("Completed".equalsIgnoreCase(req.getStatus()) 
            || "In Progress".equalsIgnoreCase(req.getStatus())) {
                backend.entity.Service service = serviceRepository.findById(req.getServiceId()).orElse(null);

                if (service != null) {
                    ServiceDetailDTO sDto = new ServiceDetailDTO();
                    BigDecimal serviceTotal = service.getPricePerUnit().multiply(new BigDecimal(req.getQuantity()));

                    sDto.setName(service.getServiceName());
                    sDto.setQuantity(req.getQuantity());
                    sDto.setPrice(service.getPricePerUnit());
                    sDto.setTotal(serviceTotal);

                    serviceDetails.add(sDto);
                    totalServiceAmount = totalServiceAmount.add(serviceTotal);
                }
            }
        }
        dto.setServices(serviceDetails);

        // Summary
        SummaryDTO summary = new SummaryDTO();
        BigDecimal finalTotal = priceAdjustmentService.calculateTotalPrice(roomDetail.getPrice(),booking.getCheckinDate().toLocalDate(),booking.getCheckoutDate().toLocalDate());
        BigDecimal final_deposit = booking.getDeposit();
        BigDecimal additionalFee = priceAdjustmentService.calculateTotalAdjustment(roomDetail.getPrice(),booking.getCheckinDate().toLocalDate(),booking.getCheckoutDate().toLocalDate());
//        String totalAmount = formatCurrencyWithUnit(priceAdjustmentService.calculateTotalPrice(roomDetail.getPrice(),booking.getCheckinDate().toLocalDate(),booking.getCheckoutDate().toLocalDate()).add(totalServiceAmount).subtract(final_deposit).add(additionalFee));
        String totalAmount = formatCurrencyWithUnit(roomDetail.getPrice().add(totalServiceAmount).subtract(final_deposit).add(additionalFee));

        summary.setRoom(formatCurrencyWithUnit(totalRoomAmount));
        summary.setService(formatCurrencyWithUnit(totalServiceAmount));
        summary.setDeposit(formatCurrencyWithUnit(final_deposit));
        summary.setTotal(totalAmount);
        summary.setAddtionalFee(additionalFee.toString());
        summary.setPenalty(formatCurrencyWithUnit(invoice.getPenalty()));
        dto.setSummary(summary);

        dto.setPaymentStatus(invoice.getStatus() != null ? invoice.getStatus() : "N/A");
        dto.setReceptionist(receptionist != null ? receptionist.getFullName() : "N/A");

        return dto;
    }

    // convert bigdecimal to string and format
    private String formatCurrencyWithUnit(BigDecimal amount) {
        if (amount == null) return "0 VND";
        return amount + " ";
    }
}
