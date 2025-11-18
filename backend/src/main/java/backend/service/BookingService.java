package backend.service;

import backend.dto.booking.*;
import backend.dto.payment.InvoiceDetailDTO;
import backend.entity.*;
import backend.repository.*;
import backend.dto.booking.BookingDetailFullDTO;
import jakarta.mail.MessagingException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final InvoiceRepository invoiceRepository;
    private final GuestDetailRepository guestDetailRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceRepository serviceRepository;
    private final RoomImageRepository roomImageRepository;
    private final PriceAdjustmentService priceAdjustmentService;
    private final EmailService emailService;

    public BookingService(BookingRepository bookingRepository, BookingRoomRepository bookingRoomRepository, RoomRepository roomRepository, CustomerRepository customerRepository, RoomTypeRepository roomTypeRepository, InvoiceRepository invoiceRepository, GuestDetailRepository guestDetailRepository, ServiceRequestRepository serviceRequestRepository, ServiceRepository serviceRepository, RoomImageRepository roomImageRepository, PriceAdjustmentService priceAdjustmentService, EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.bookingRoomRepository = bookingRoomRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.invoiceRepository = invoiceRepository;
        this.guestDetailRepository = guestDetailRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.serviceRepository = serviceRepository;
        this.roomImageRepository = roomImageRepository;
        this.priceAdjustmentService = priceAdjustmentService;
        this.emailService = emailService;
    }


    public List<Room> getAvailableRooms(Long roomTypeId, LocalDateTime checkinDate, LocalDateTime checkoutDate) {
        if (checkinDate == null || checkoutDate == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required.");
        }
        if (!checkinDate.isBefore(checkoutDate)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }
        return roomRepository.findAvailableRoomsByRoomTypeAndDateRange(roomTypeId, checkinDate, checkoutDate);
    }

    public List<BookingCheckInInfoDTO> getCheckInList() {
        List<Booking> bookings = bookingRepository.findConfirmedBookingsForCheckinOnDate(LocalDate.now());
        if (bookings.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> bookingIds = bookings.stream().map(Booking::getBookingId).collect(Collectors.toList());

        Map<Long, BookingRoom> bookingRoomMap = bookingRoomRepository.findByBookingIdIn(bookingIds)
                .stream()
                .collect(Collectors.toMap(BookingRoom::getBookingId, br -> br, (br1, br2) -> br1)); // Giữ lại cái đầu tiên nếu có trùng lặp

        List<Long> roomIds = bookingRoomMap.values().stream().map(BookingRoom::getRoomId).collect(Collectors.toList());
        Map<Long, Room> roomMap = roomRepository.findAllById(roomIds).stream()
                .collect(Collectors.toMap(Room::getRoomId, room -> room));

        List<Long> roomTypeIds = roomMap.values().stream().map(Room::getRoomTypeId).collect(Collectors.toList());
        Map<Long, RoomType> roomTypeMap = roomTypeRepository.findAllById(roomTypeIds).stream()
                .collect(Collectors.toMap(RoomType::getRoomTypeId, rt -> rt));

        List<Long> customerIds = bookings.stream().map(Booking::getCustomerId).collect(Collectors.toList());
        Map<Long, Customer> customerMap = customerRepository.findAllById(customerIds).stream()
                .collect(Collectors.toMap(Customer::getCustomerId, c -> c));


        return bookings.stream().map(booking -> {
            BookingRoom bookingRoom = bookingRoomMap.get(booking.getBookingId());
            if (bookingRoom == null) return null;

            Room room = roomMap.get(bookingRoom.getRoomId());
            if (room == null) return null;

            RoomType roomType = roomTypeMap.get(room.getRoomTypeId());
            if (roomType == null) return null;

            Customer customer = customerMap.get(booking.getCustomerId());

            BookingCheckInInfoDTO dto = new BookingCheckInInfoDTO();
            dto.setBookingId(booking.getBookingId());
            
            dto.setCustomerName(booking.getContactName());
            dto.setCustomerPhone(booking.getContactPhone());
            dto.setCustomerEmail(booking.getContactEmail());
            
            if (customer != null) {
                dto.setCustomerCitizenId(customer.getCitizenId());
            }
            
            dto.setDeposit(booking.getDeposit());
            dto.setCheckinDate(booking.getCheckinDate().toLocalDate());
            dto.setCheckoutDate(booking.getCheckoutDate().toLocalDate());
            dto.setRoomTypeName(roomType != null ? roomType.getRoomTypeName() : null);
            dto.setRoomNumber(room != null ? room.getRoomNumber() : null);
            dto.setAdult(booking.getAdult());
            dto.setChildren(booking.getChildren());
            dto.setPrice(roomType.getPrice());
            BigDecimal totalPriceForStay = priceAdjustmentService.calculateTotalPrice(
                    roomType.getPrice(),
                    booking.getCheckinDate().toLocalDate(),
                    booking.getCheckoutDate().toLocalDate()
            );
            dto.setTotalPrice(totalPriceForStay);
            dto.setRoomId(room != null ? room.getRoomId() : null);
            dto.setRoomTypeId(roomType != null ? roomType.getRoomTypeId() : null);
            return dto;
        }).filter(dto -> dto != null).collect(Collectors.toList());
    }

    @Transactional
    public void performCheckIn(Long bookingId, CheckInRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking ID not found: " + bookingId));

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is not in 'Confirmed' status. Current status: " + booking.getStatus());
        }

        Room roomToAssign = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));

        if (!"AVAILABLE".equalsIgnoreCase(roomToAssign.getStatus()) && !"CLEANING".equalsIgnoreCase(roomToAssign.getStatus())) {
            throw new IllegalStateException("Room " + roomToAssign.getRoomNumber() + " not ready to check-in. Current status: " + roomToAssign.getStatus());
        }

        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId).stream().findFirst()
                .orElseThrow(() -> new RuntimeException("BookingRoom not found for Booking ID: " + bookingId));

        booking.setStatus("Checked-in");

        if (request.getDeposit() != null && request.getDeposit().compareTo(booking.getDeposit()) != 0) {
            // Log warning nếu cần thiết
        }

        roomToAssign.setStatus("Occupied");

        bookingRoom.setRoomId(roomToAssign.getRoomId());
        if (request.getActualCheckin() != null) {
            bookingRoom.setActualCheckin(request.getActualCheckin());
        } else {
            bookingRoom.setActualCheckin(LocalDateTime.now());
        }
        bookingRoom.setStatus("Checked-in");

        if (request.getGuestDetails() != null && !request.getGuestDetails().isEmpty()) {
            List<GuestDetail> existingGuests = guestDetailRepository.findByBookingId(bookingId);
            guestDetailRepository.deleteAll(existingGuests);

            for (GuestDetailDTO guestDTO : request.getGuestDetails()) {
                if (guestDTO.getFullName() != null && !guestDTO.getFullName().trim().isEmpty()) {
                    GuestDetail newGuestDetail = new GuestDetail();
                    newGuestDetail.setBookingId(bookingId);
                    newGuestDetail.setFullName(guestDTO.getFullName().trim());
                    newGuestDetail.setGender(guestDTO.getGender());
                    newGuestDetail.setCitizenId(guestDTO.getCitizenId());
                    guestDetailRepository.save(newGuestDetail);
                }
            }
        }

        bookingRepository.save(booking);
        roomRepository.save(roomToAssign);
        bookingRoomRepository.save(bookingRoom);
    }

    /**
     * GET /check-out-list:
        Gọi: truy vấn DB và trả về danh sách booking đang "Checked-in" => BookingRepository.findByStatus("CHECKED-IN")
        Trả về: List<BookingCheckOutInfoDTO>.
     */
    public List<BookingCheckOutInfoDTO> getCheckOutList() {
        List<Booking> bookings = bookingRepository.findByStatus("CHECKED-IN");
        if (bookings.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> bookingIds = bookings.stream().map(Booking::getBookingId).collect(Collectors.toList());

        List<BookingRoom> allBookingRooms = bookingRoomRepository.findByBookingIdIn(bookingIds);

        List<Long> roomIds = allBookingRooms.stream().map(BookingRoom::getRoomId).collect(Collectors.toList());
        Map<Long, Room> roomMap = roomRepository.findAllById(roomIds).stream()
                .collect(Collectors.toMap(Room::getRoomId, room -> room));

        Map<Long, List<BookingRoom>> bookingRoomsByBookingId = allBookingRooms.stream()
                .collect(Collectors.groupingBy(BookingRoom::getBookingId));

        return bookings.stream().map(booking -> {
            List<BookingRoom> related = bookingRoomsByBookingId
                    .getOrDefault(booking.getBookingId(), new ArrayList<>());

            BookingRoom br = related.isEmpty() ? null : related.get(0);

            String roomNumber = (br == null)
                    ? ""
                    : roomMap.get(br.getRoomId()).getRoomNumber();

            BookingCheckOutInfoDTO dto = new BookingCheckOutInfoDTO();
            dto.setBookingId(booking.getBookingId());
            dto.setBookingRoomId(br != null ? br.getBookingRoomId() : null);
            dto.setCustomerName(booking.getContactName());
            dto.setCustomerPhone(booking.getContactPhone());
            dto.setRooms(roomNumber);
            dto.setCheckinDate(booking.getCheckinDate());
            dto.setCheckoutDate(booking.getCheckoutDate());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Logic: Tính toán "tạm thời".
        Tính số đêm (numberOfNights) từ actualCheckin đến LocalDate.now() (Hôm nay).
        Tính tổng tiền phòng (roomTotal) dựa trên số đêm này.
        Tính tổng dịch vụ (serviceTotal) chỉ cho các dịch vụ "Completed" hoặc "In Progress".
        Trả về: InvoiceDetailDTO với các số liệu tạm tính này.
     */
    public InvoiceDetailDTO getInvoiceDetails(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Không tìm thấy booking."));
        // Lấy booking room đầu tiên gắn với booking này
        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId).stream().findFirst().orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết phòng đã đặt."));
        LocalDateTime actualCheckin = bookingRoom.getActualCheckin();
        if (actualCheckin == null) {
            throw new IllegalStateException("Customer has not checked in, cannot calculate invoice.");
        }

        // --- Tính tiền phòng ---
        // Mặc định là 1 đêm nếu check-in và check-out trong cùng ngày
        long numberOfNights = ChronoUnit.DAYS.between(actualCheckin.toLocalDate(), LocalDate.now());
        if (numberOfNights == 0) {
            numberOfNights = 1;
        }

        Room room = roomRepository.findById(bookingRoom.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
        BigDecimal roomTotal = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                actualCheckin.toLocalDate(),
                LocalDate.now()
        );

        // --- Tính tiền dịch vụ ---
        // Chỉ tính các service có trạng thái "Completed" hoặc "In Progress" (case-insensitive)
        List<ServiceRequest> allServiceRequests = serviceRequestRepository.findByBookingId(bookingId);
        BigDecimal serviceTotal = BigDecimal.ZERO;
        List<InvoiceDetailDTO.ServiceChargeDTO> serviceCharges = new ArrayList<>();
        for (ServiceRequest sr : allServiceRequests) {
            String status = sr.getStatus();
            // Chỉ tính các service có trạng thái "Completed" hoặc "In Progress"
            if ("Completed".equalsIgnoreCase(status) || "In Progress".equalsIgnoreCase(status)) {
                backend.entity.Service service = serviceRepository.findById(sr.getServiceId()).orElseThrow();
                BigDecimal total = service.getPricePerUnit().multiply(BigDecimal.valueOf(sr.getQuantity()));
                serviceTotal = serviceTotal.add(total);
                serviceCharges.add(new InvoiceDetailDTO.ServiceChargeDTO(service.getServiceName(), sr.getQuantity(), service.getPricePerUnit(), total));
            }
        }

        // --- Tổng hợp hóa đơn ---
        InvoiceDetailDTO invoiceDTO = new InvoiceDetailDTO();
        invoiceDTO.setBookingId(bookingId);
        invoiceDTO.setCustomerName(booking.getContactName());
        invoiceDTO.setActualCheckin(actualCheckin);
        invoiceDTO.setExpectedCheckoutDate(booking.getCheckoutDate());
        invoiceDTO.setRoomCharges(List.of(new InvoiceDetailDTO.RoomChargeDTO(room.getRoomNumber(), roomType.getRoomTypeName(), roomType.getPrice(), numberOfNights, roomTotal)));
        invoiceDTO.setUsedServices(serviceCharges);

        BigDecimal subTotal = roomTotal.add(serviceTotal);
        BigDecimal deposit = booking.getDeposit() != null ? booking.getDeposit() : BigDecimal.ZERO;

        invoiceDTO.setSubTotal(subTotal);
        invoiceDTO.setDeposit(deposit);
        invoiceDTO.setTotalAmount(subTotal);
        // ================================================================

        return invoiceDTO;
    }

    /**
     * Tính toán deposit một cách nhất quán
     */
    private BigDecimal calculateDeposit(BigDecimal roomPricePerNight, long numberOfNights) {
        BigDecimal totalAmount = roomPricePerNight.multiply(BigDecimal.valueOf(numberOfNights));
        BigDecimal depositRate = BigDecimal.valueOf(0.3); // 30%
        return totalAmount.multiply(depositRate).setScale(0, RoundingMode.HALF_UP);
    }


    /**
     * POST /{bookingId}/calculate-checkout:
        Gọi: bookingService.calculateCheckout(bookingId, actualCheckoutTime).
        Trả về: CheckoutCalculationDTO (kết quả tính toán).
     */
    public CheckoutCalculationDTO calculateCheckout(Long bookingId, LocalDateTime actualCheckoutTime) {
        
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Không tìm thấy booking."));
        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId).stream().findFirst().orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết phòng đã đặt."));
        
        LocalDateTime actualCheckin = bookingRoom.getActualCheckin();
        if (actualCheckin == null) {
            throw new IllegalStateException("Customer has not checked in, cannot calculate invoice.");
        }

        // Lấy thông tin phòng và giá
        Room room = roomRepository.findById(bookingRoom.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
        BigDecimal roomPricePerNight = roomType.getPrice();

        // Tính số đêm đã ở thực tế (từ check-in đến checkout thực tế)
        long actualNights = ChronoUnit.DAYS.between(actualCheckin.toLocalDate(), actualCheckoutTime.toLocalDate());
        if (actualNights == 0) {
            actualNights = 1; // Tối thiểu 1 đêm
        }

        // Tính số đêm dự kiến (từ booking)
        long expectedNights = ChronoUnit.DAYS.between(booking.getCheckinDate().toLocalDate(), booking.getCheckoutDate().toLocalDate());
        if (expectedNights == 0) {
            expectedNights = 1;
        }


        BigDecimal roomTotal = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                actualCheckin.toLocalDate(),
                actualCheckoutTime.toLocalDate()
        );
        BigDecimal fullBookingRoomTotal = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                booking.getCheckinDate().toLocalDate(),
                booking.getCheckoutDate().toLocalDate()
        );

        // Chỉ tính các service có trạng thái "Completed" hoặc "In Progress" (case-insensitive)
        List<ServiceRequest> allServiceRequests = serviceRequestRepository.findByBookingId(bookingId);
        BigDecimal serviceTotal = BigDecimal.ZERO;
        for (ServiceRequest sr : allServiceRequests) {
            String status = sr.getStatus();
            // Chỉ tính các service có trạng thái "Completed" hoặc "In Progress"
            if ("Completed".equalsIgnoreCase(status) || "In Progress".equalsIgnoreCase(status)) {
                backend.entity.Service service = serviceRepository.findById(sr.getServiceId()).orElseThrow();
                BigDecimal total = service.getPricePerUnit().multiply(BigDecimal.valueOf(sr.getQuantity()));
                serviceTotal = serviceTotal.add(total);
            }
        }

        // Lấy tiền cọc và validate
        BigDecimal deposit = booking.getDeposit() != null ? booking.getDeposit() : BigDecimal.ZERO;
        
        // Validate deposit không được âm
        if (deposit.compareTo(BigDecimal.ZERO) < 0) {
            deposit = BigDecimal.ZERO;
        }

        // Xác định kịch bản checkout - LOGIC MỚI
        LocalDate actualCheckoutDate = actualCheckoutTime.toLocalDate();
        LocalDate expectedCheckoutDate = booking.getCheckoutDate().toLocalDate();
        LocalTime actualCheckoutTimeOfDay = actualCheckoutTime.toLocalTime();
        LocalTime standardCheckoutTime = LocalTime.of(12, 0);

        CheckoutCalculationDTO calculation = new CheckoutCalculationDTO();
        calculation.setRoomTotal(roomTotal);
        calculation.setServiceTotal(serviceTotal);
        calculation.setDeposit(deposit);
        calculation.setNumberOfNights(actualNights);
        calculation.setActualCheckoutTime(actualCheckoutTime);
        calculation.setExpectedCheckoutTime(booking.getCheckoutDate());

        BigDecimal finalAmount;
        String scenario;
        String description;

        if (actualCheckoutDate.isBefore(expectedCheckoutDate)) {
            // Kịch bản 1: Check-out sớm (trước ngày dự kiến)
            scenario = "EARLY_CHECKOUT";
            description = "Early checkout: Calculate full room price based on booking and services";
            roomTotal = fullBookingRoomTotal;
            calculation.setRoomTotal(roomTotal);
            calculation.setEarlyCheckoutPenalty(BigDecimal.ZERO);
            calculation.setLateCheckoutFee(BigDecimal.ZERO);
            calculation.setHoursLate(0);
            
            // Tổng tiền = Tiền phòng (đầy đủ) + Dịch vụ - Tiền cọc
            finalAmount = roomTotal.add(serviceTotal).subtract(deposit);
            
        } else if (actualCheckoutDate.equals(expectedCheckoutDate) && actualCheckoutTimeOfDay.isBefore(standardCheckoutTime)) {
            // Kịch bản 2: Check-out đúng giờ (cùng ngày, trước 12:00)
            scenario = "ON_TIME_CHECKOUT";
            description = "On-time checkout: Calculate normal price, minus deposit";
            calculation.setEarlyCheckoutPenalty(BigDecimal.ZERO);
            calculation.setLateCheckoutFee(BigDecimal.ZERO);
            calculation.setHoursLate(0);
            
            
            // Tổng tiền = Tiền phòng + Dịch vụ - Tiền cọc
            finalAmount = roomTotal.add(serviceTotal).subtract(deposit);
            
        } else {
            // Kịch bản 3: Check-out muộn (cùng ngày sau 12:00 HOẶC muộn nhiều ngày)
            scenario = "LATE_CHECKOUT";
            
            // Tính số giờ muộn từ thời điểm checkout chuẩn của ngày dự kiến
            LocalDateTime expectedStandardCheckout = expectedCheckoutDate.atTime(standardCheckoutTime);
            long hoursLate = ChronoUnit.HOURS.between(expectedStandardCheckout, actualCheckoutTime);
            
            
            // Nếu checkout muộn nhiều ngày, tính số giờ muộn chính xác
            if (actualCheckoutDate.isAfter(expectedCheckoutDate)) {
                // Tính số ngày muộn
                long daysLate = ChronoUnit.DAYS.between(expectedCheckoutDate, actualCheckoutDate);
                // Tính số giờ muộn = số ngày muộn * 24 + số giờ muộn trong ngày cuối
                long hoursLateInLastDay = ChronoUnit.HOURS.between(
                    actualCheckoutDate.atTime(standardCheckoutTime), 
                    actualCheckoutTime
                );
                hoursLate = (daysLate * 24) + hoursLateInLastDay;
                
            }
            
            // Chỉ tính phí trả muộn nếu thực sự muộn (không tính âm)
            if (hoursLate <= 0) {
                hoursLate = 0; // Không muộn thì không tính phí
            }
            
            // Chỉ tính phí trả muộn nếu thực sự muộn
            BigDecimal lateCheckoutFee = BigDecimal.ZERO;
            if (hoursLate > 0) {
                // Phí trả muộn = số giờ muộn × 10% giá phòng
                BigDecimal lateFeePerHour = roomPricePerNight.multiply(BigDecimal.valueOf(0.1));
                lateCheckoutFee = lateFeePerHour.multiply(BigDecimal.valueOf(hoursLate));
                
                
                // Cập nhật mô tả dựa trên số ngày muộn
                if (actualCheckoutDate.isAfter(expectedCheckoutDate)) {
                    long daysLate = ChronoUnit.DAYS.between(expectedCheckoutDate, actualCheckoutDate);
                    description = String.format("Late checkout %d days %d hours: Calculate normal price + late fee (10%% room price/hour), minus deposit", 
                        daysLate, hoursLate % 24);
                } else {
                    description = String.format("Late checkout %d hours: Calculate normal price + late fee (10%% room price/hour), minus deposit", hoursLate);
                }
            } else {
                // Checkout đúng giờ hoặc sớm hơn
                scenario = "ON_TIME_CHECKOUT";
                description = "On-time checkout: Calculate normal price, minus deposit";
            }
            
            calculation.setHoursLate(hoursLate);
            calculation.setLateCheckoutFee(lateCheckoutFee);
            calculation.setEarlyCheckoutPenalty(BigDecimal.ZERO);
            
            // Tổng tiền = Tiền phòng + Dịch vụ + Phí trả muộn - Tiền cọc
            finalAmount = roomTotal.add(serviceTotal).add(lateCheckoutFee).subtract(deposit);
        }

        calculation.setFinalAmount(finalAmount);
        calculation.setCheckoutScenario(scenario);
        calculation.setDescription(description);


        return calculation;
    }

    /*
    * BE (Service): BookingService.performCheckOut() (một hàm @Transactional) được thực thi:

    Lưu pendingServices vào DB.

    Hủy các dịch vụ "Pending" khác.

    Tính toán lại toàn bộ chi phí (để bảo mật, không tin tưởng số tiền FE gửi).

    Lưu Invoice cuối cùng với trạng thái "PAID".

    Cập nhật Booking thành "Checked-out".

    Cập nhật BookingRoom (lưu actualCheckout time).

    FE (Hook): Nhận 'OK', đóng modal, và gọi lại fetchCheckOutList() để làm mới danh sách.
     */
    @Transactional
    public void performCheckOut(Long bookingId, CheckOutRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking ID not found: " + bookingId));
        if (!"CHECKED-IN".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is not in 'Checked-in' status.");
        }

        // Sử dụng thời gian checkout từ request hoặc thời gian hiện tại
        LocalDateTime actualCheckoutTime = request.getActualCheckoutTime() != null ? 
            request.getActualCheckoutTime() : LocalDateTime.now();

        // 1. Lưu các dịch vụ được thêm vào phút cuối
        if (request.getFinalServices() != null && !request.getFinalServices().isEmpty()) {
            for (CheckOutRequestDTO.FinalServiceDTO serviceDTO : request.getFinalServices()) {
                ServiceRequest newServiceRequest = new ServiceRequest();
                newServiceRequest.setBookingId(bookingId);
                newServiceRequest.setServiceId(serviceDTO.getServiceId());
                newServiceRequest.setQuantity(serviceDTO.getQuantity());
                newServiceRequest.setStatus("Completed");
                newServiceRequest.setRequestTime(LocalDateTime.now());
                serviceRequestRepository.save(newServiceRequest);
            }
        }
        // =======================================================

        // 1.5. Hủy tất cả các service còn lại có trạng thái "Pending" hoặc "Assigned" (case-insensitive)
        List<ServiceRequest> allServices = serviceRequestRepository.findByBookingId(bookingId);
        for (ServiceRequest sr : allServices) {
            String status = sr.getStatus();
            // Hủy các service có trạng thái "Pending" hoặc "Assigned"
            if (status != null && ("Pending".equalsIgnoreCase(status) || "Assigned".equalsIgnoreCase(status))) {
                sr.setStatus("Cancelled");
                serviceRequestRepository.save(sr);
            }
        }

        // 2. Tính toán checkout với logic mới
        CheckoutCalculationDTO checkoutCalculation = calculateCheckout(bookingId, actualCheckoutTime);
        
        // Thêm penalty từ request nếu có
        if (request.getPenalty() != null && request.getPenalty().compareTo(BigDecimal.ZERO) > 0) {
            checkoutCalculation.setFinalAmount(checkoutCalculation.getFinalAmount().add(request.getPenalty()));
        }

        // 3. Tạo và lưu hóa đơn
        Invoice invoice = invoiceRepository.findByBookingId(bookingId).orElse(new Invoice());
        invoice.setBookingId(bookingId);
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setTotalAmount(checkoutCalculation.getFinalAmount());
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice.setStatus("PAID");
        
        invoiceRepository.save(invoice);

        // 4. Cập nhật trạng thái Booking
        booking.setStatus("Checked-out");
        bookingRepository.save(booking);

        // 5. Cập nhật BookingRoom và Room với thời gian checkout thực tế
        List<BookingRoom> bookingRooms = bookingRoomRepository.findByBookingId(bookingId);
        for (BookingRoom br : bookingRooms) {
            br.setActualCheckout(actualCheckoutTime);
            br.setStatus("Checked-out");
            bookingRoomRepository.save(br);
        }
    }

    public List<Booking> getBookingsByCustomerId(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }
    
    public List<BookingDetailDTO> getBookingDetailsByCustomerId(Long customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerId(customerId);

        return bookings.stream().map(booking -> {
            BookingDetailDTO dto = new BookingDetailDTO();

            dto.setBookingId(booking.getBookingId());
            dto.setCheckinDate(booking.getCheckinDate());
            dto.setCheckoutDate(booking.getCheckoutDate());
            dto.setAdult(booking.getAdult());
            dto.setChildren(booking.getChildren());
            dto.setDeposit(booking.getDeposit());
            dto.setStatus(booking.getStatus());
            dto.setCreateAt(booking.getCreateAt());
            dto.setContactName(booking.getContactName());
            dto.setContactPhone(booking.getContactPhone());
            dto.setContactEmail(booking.getContactEmail());

            long numberOfNights = ChronoUnit.DAYS.between(
                    booking.getCheckinDate().toLocalDate(),
                    booking.getCheckoutDate().toLocalDate()
            );
            if (numberOfNights <= 0) numberOfNights = 1;

            BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(booking.getBookingId())
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (bookingRoom != null) {
                Room room = roomRepository.findById(bookingRoom.getRoomId()).orElse(null);
                if (room != null) {
                    dto.setRoomNumber(room.getRoomNumber());

                    RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElse(null);
                    if (roomType != null) {
                        dto.setRoomTypeName(roomType.getRoomTypeName());

                        BigDecimal finalTotalPrice = priceAdjustmentService.calculateTotalPrice(
                                roomType.getPrice(),
                                booking.getCheckinDate().toLocalDate(),
                                booking.getCheckoutDate().toLocalDate()
                        );
                        dto.setTotalPrice(finalTotalPrice);

                        List<RoomImage> images = roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId());
                        if (images != null && !images.isEmpty()) {
                            dto.setRoomTypeImageUrl(images.get(0).getImage());
                        } else {
                            dto.setRoomTypeImageUrl("https://placehold.co/200x150?text=No+Image");
                        }
                    }
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        String currentStatus = booking.getStatus();

        if ("CHECKED-IN".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot cancel booking that has checked in.");
        }

        if ("CHECKED-OUT".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot cancel booking that has checked out.");
        }

        if ("CANCELLED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Booking has already been cancelled.");
        }

        if (!"CONFIRMED".equalsIgnoreCase(currentStatus) && !"PENDING".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot cancel booking in status '" + currentStatus + "'.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        bookingRoomRepository.findByBookingId(bookingId).forEach(bookingRoom -> {
            bookingRoom.setStatus("CANCELLED");
            bookingRoomRepository.save(bookingRoom);
        });
    }

    @Transactional
    public Booking createBooking(BookingRequestDTO request) {
        Booking newBooking = new Booking();
        newBooking.setCustomerId(request.getCustomerId());

        newBooking.setContactName(request.getCustomerName());
        newBooking.setContactPhone(request.getCustomerPhone());
        newBooking.setContactEmail(request.getCustomerEmail());

        newBooking.setCheckinDate(request.getCheckinDate());
        newBooking.setCheckoutDate(request.getCheckoutDate());
        newBooking.setAdult(request.getAdult());
        newBooking.setChildren(request.getChildren());
        
        // Tính deposit đúng 30% thay vì dùng từ request
        Room room = roomRepository.findById(request.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
        BigDecimal adjustedTotalForStay = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                request.getCheckinDate().toLocalDate(),
                request.getCheckoutDate().toLocalDate()
        );
        BigDecimal adjustedDeposit = priceAdjustmentService.calculateDeposit(adjustedTotalForStay);
        newBooking.setDeposit(adjustedDeposit);
        
        newBooking.setStatus("CONFIRMED");
        newBooking.setCreateAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(newBooking);

        BookingRoom bookingRoom = new BookingRoom();
        bookingRoom.setBookingId(savedBooking.getBookingId());
        bookingRoom.setRoomId(request.getRoomId());
        bookingRoom.setStatus("BOOKED");

        bookingRoomRepository.save(bookingRoom);

        Invoice invoice = new Invoice();
        invoice.setBookingId(savedBooking.getBookingId());
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setTotalAmount(request.getDepositAmount());
        invoice.setPaymentMethod("Stripe");
        invoice.setPaymentIntentId(request.getPaymentIntentId());
        invoice.setStatus("Paid");

        invoiceRepository.save(invoice);

        return savedBooking;
    }

    @Transactional
    public Booking initiateBooking(Long customerId, Long roomId, LocalDateTime checkinDate, LocalDateTime checkoutDate, Integer adult, Integer children) {
        List<String> conflictingStatuses = List.of("PENDING", "CONFIRMED", "CHECKED-IN");

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                roomId, checkinDate, checkoutDate, conflictingStatuses
        );

        if (!overlappingBookings.isEmpty()) {
            throw new IllegalStateException(
                    "Sorry, this room has just been booked or is in the process of being checked out. Please choose another room or try again later."
            );
        }
        Booking newBooking = new Booking();
        newBooking.setCustomerId(customerId);
        newBooking.setCheckinDate(checkinDate);
        newBooking.setCheckoutDate(checkoutDate);
        newBooking.setAdult(adult);
        newBooking.setChildren(children);
        newBooking.setStatus("PENDING");
        newBooking.setCreateAt(LocalDateTime.now());
        Booking pendingBooking = bookingRepository.save(newBooking);

        BookingRoom bookingRoom = new BookingRoom();
        bookingRoom.setBookingId(pendingBooking.getBookingId());
        bookingRoom.setRoomId(roomId);
        bookingRoom.setStatus("LOCKED");
        bookingRoomRepository.save(bookingRoom);

        return pendingBooking;
    }



    // Book Off
    @Transactional
    public Booking confirmReceptionBooking(Long bookingId, String customerName, String customerEmail, String customerPhone, String paymentMethod, Long staffId) {

        Booking bookingToConfirm = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Booking ID: " + bookingId));

        if (!"PENDING".equals(bookingToConfirm.getStatus())) {
            throw new IllegalStateException("This booking is not in payment pending status.");
        }

        bookingToConfirm.setContactName(customerName);
        bookingToConfirm.setContactPhone(customerPhone);
        bookingToConfirm.setContactEmail(customerEmail);
        bookingToConfirm.setStatus("CONFIRMED");

        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId).get(0);
        Room room = roomRepository.findById(bookingRoom.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();

        // dùng hàm utils của priceAdjust để tính total price, deposit
        BigDecimal finalTotalPrice = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                bookingToConfirm.getCheckinDate().toLocalDate(),
                bookingToConfirm.getCheckoutDate().toLocalDate()
        );
        BigDecimal depositAmount = priceAdjustmentService.calculateDeposit(finalTotalPrice);
        bookingToConfirm.setDeposit(depositAmount);

        Booking savedBooking = bookingRepository.save(bookingToConfirm);

        bookingRoom.setStatus("CONFIRMED");
        bookingRoomRepository.save(bookingRoom);

        Invoice invoice = new Invoice();
        invoice.setBookingId(savedBooking.getBookingId());
        invoice.setStaffId(staffId);
        invoice.setInvoiceType("Deposit");
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setTotalAmount(depositAmount);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setStatus("PAID");
        invoiceRepository.save(invoice);

        String htmlContent = "<h2>Booking Confirmed!</h2>"
                + "<p>Dear <b>" + customerName + "</b>,</p>"
                + "<p>Thank you for booking with <b>Oasis Hotel</b>. Here are your booking details:</p>"
                + "<ul>"
                + "<li><b>Room Number:</b> " + room.getRoomNumber() + "</li>"
                + "<li><b>Room Type:</b> " + roomType.getRoomTypeName() + "</li>"
                + "<li><b>Check-in:</b> " + savedBooking.getCheckinDate().toLocalDate() + "</li>"
                + "<li><b>Check-out:</b> " + savedBooking.getCheckoutDate().toLocalDate() + "</li>"
                + "<li><b>Total Price:</b> " + finalTotalPrice + " VND</li>"
                + "<li><b>Deposit Paid:</b> " + depositAmount + " VND</li>"
                + "<li><b>Payment Method:</b>"+ paymentMethod +"</li>"
                + "</ul>"
                + "<p>Please arrive on time and enjoy your stay!</p>"
                + "<p>Best regards,<br>Oasis Hotel</p>";

        try {
            emailService.sendHtmlEmail(customerEmail, "Booking Confirmed - Oasis Hotel", htmlContent);
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        return savedBooking;
    }

    // Book onl
    @Transactional
    public Booking confirmBooking(Long bookingId, String customerName, String customerEmail, String customerPhone, String paymentIntentId) {

        Booking bookingToConfirm = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy booking ID: " + bookingId));

        if (!"PENDING".equals(bookingToConfirm.getStatus())) {
            throw new IllegalStateException("Booking này không ở trạng thái chờ thanh toán.");
        }

        bookingToConfirm.setContactName(customerName);
        bookingToConfirm.setContactPhone(customerPhone);
        bookingToConfirm.setContactEmail(customerEmail);
        bookingToConfirm.setStatus("CONFIRMED");

        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId).get(0);
        Room room = roomRepository.findById(bookingRoom.getRoomId()).orElseThrow();
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElseThrow();
        BigDecimal finalTotalPrice = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                bookingToConfirm.getCheckinDate().toLocalDate(),
                bookingToConfirm.getCheckoutDate().toLocalDate()
        );
        BigDecimal depositAmount = priceAdjustmentService.calculateDeposit(finalTotalPrice);
        bookingToConfirm.setDeposit(depositAmount);

        Booking savedBooking = bookingRepository.save(bookingToConfirm);

        bookingRoom.setStatus("CONFIRMED");
        bookingRoomRepository.save(bookingRoom);

        Invoice invoice = new Invoice();
        invoice.setBookingId(savedBooking.getBookingId());
        invoice.setInvoiceType("Deposit");
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setTotalAmount(depositAmount);
        invoice.setPaymentMethod("Credit Card");
        invoice.setPaymentIntentId(paymentIntentId);
        invoice.setStatus("PAID");
        invoiceRepository.save(invoice);

        String htmlContent = "<h2>Booking Confirmed!</h2>"
                + "<p>Dear <b>" + customerName + "</b>,</p>"
                + "<p>Thank you for booking with <b>Oasis Hotel</b>. Here are your booking details:</p>"
                + "<ul>"
                + "<li><b>Room Number:</b> " + room.getRoomNumber() + "</li>"
                + "<li><b>Room Type:</b> " + roomType.getRoomTypeName() + "</li>"
                + "<li><b>Check-in:</b> " + savedBooking.getCheckinDate().toLocalDate() + "</li>"
                + "<li><b>Check-out:</b> " + savedBooking.getCheckoutDate().toLocalDate() + "</li>"
                + "<li><b>Total Price:</b> " + finalTotalPrice + " VND</li>"
                + "<li><b>Deposit Paid:</b> " + depositAmount + " VND</li>"
                + "<li><b>Payment Method:</b> Credit Card</li>"
                + "</ul>"
                + "<p>Please arrive on time and enjoy your stay!</p>"
                + "<p>Best regards,<br>Oasis Hotel</p>";

        try {
            emailService.sendHtmlEmail(customerEmail, "Booking Confirmed - Oasis Hotel", htmlContent);
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        return savedBooking;
    }


    @Transactional
    public void cancelAndPurgePendingBooking(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalStateException("Booking not found with ID: " + bookingId));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("User does not have permission to cancel this booking.");
        }

        if (booking.getStatus().equalsIgnoreCase("PENDING")) {
            bookingRoomRepository.deleteAllByBookingId(bookingId);
            bookingRepository.delete(booking);
        } else {
            System.out.println("Attempted to delete a non-pending booking. No action taken. ID: " + bookingId);
        }
    }

    @Transactional(readOnly = true)
    public BookingDetailDTO getBookingDetailsForConfirmation(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking with ID " + bookingId + " not found."));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You are not authorized to view this booking.");
        }

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("This booking is no longer in a pending state and cannot be confirmed.");
        }

        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(booking.getBookingId()).get(0);

        Room room = roomRepository.findById(bookingRoom.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room details not found for room ID: " + bookingRoom.getRoomId()));

        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Room type details not found for room type ID: " + room.getRoomTypeId()));

        Optional<RoomImage> firstImage = roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId())
                .stream()
                .findFirst();

        LocalDate checkinDate = booking.getCheckinDate().toLocalDate();
        LocalDate checkoutDate = booking.getCheckoutDate().toLocalDate();

        BigDecimal finalTotalPrice = priceAdjustmentService.calculateTotalPrice(
                roomType.getPrice(),
                checkinDate,
                checkoutDate
        );

        BigDecimal finalDepositAmount = priceAdjustmentService.calculateDeposit(finalTotalPrice);

        BookingDetailDTO dto = new BookingDetailDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCheckinDate(booking.getCheckinDate());
        dto.setCheckoutDate(booking.getCheckoutDate());
        dto.setAdult(booking.getAdult());
        dto.setChildren(booking.getChildren());
        dto.setStatus(booking.getStatus());
        dto.setCreateAt(booking.getCreateAt());

        dto.setTotalPrice(finalTotalPrice);
        dto.setDeposit(finalDepositAmount);

        dto.setRoomTypeBasePrice(roomType.getPrice());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomTypeName(roomType.getRoomTypeName());

        firstImage.ifPresent(image ->
                dto.setRoomTypeImageUrl("http://localhost:8080/upload/rooms/" + image.getImage())
        );

        return dto;
    }

    public List<ActiveRoomBookingDTO> getActiveRoomsForCustomer(Long customerId) {
        return bookingRepository.findActiveRoomsByCustomerId(customerId, LocalDateTime.now());
    }
    // ============================================================
// METHOD 1: GET BOOKING DETAIL FULL
// ============================================================
    @Transactional(readOnly = true)
    public BookingDetailFullDTO getBookingDetailFull(Long bookingId, Long customerId) {
        // 1. Lấy Booking và kiểm tra quyền truy cập
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You are not authorized to view this booking.");
        }

        // 2. Lấy BookingRoom (actual check-in/out)
        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Room information not found for this booking."));

        // 3. Lấy Room info
        Room room = roomRepository.findById(bookingRoom.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found."));

        // 4. Lấy RoomType info
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId())
                .orElseThrow(() -> new RuntimeException("Room type not found."));

        // 5. Lấy Room Image
        List<RoomImage> roomImages = roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId());
        String roomImageUrl = roomImages.isEmpty()
                ? "https://placehold.co/400x300?text=No+Image"
                : "http://localhost:8080/upload/rooms/" + roomImages.get(0).getImage();

        // 6. Lấy Service Requests
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findByBookingId(bookingId);
        List<BookingDetailFullDTO.ServiceRequestDTO> serviceDTOs = new ArrayList<>();
        BigDecimal servicesTotal = BigDecimal.ZERO;

        for (ServiceRequest sr : serviceRequests) {
            backend.entity.Service service = serviceRepository.findById(sr.getServiceId())
                    .orElse(null);
            if (service != null) {
                BookingDetailFullDTO.ServiceRequestDTO serviceDTO = new BookingDetailFullDTO.ServiceRequestDTO();
                serviceDTO.setRequestId(sr.getRequestId());
                serviceDTO.setServiceId(sr.getServiceId());
                serviceDTO.setServiceName(service.getServiceName());
                serviceDTO.setImageUrl(service.getImage() != null
                        ? "http://localhost:8080/upload/service/" + service.getImage()
                        : "https://placehold.co/200x150?text=Service");
                serviceDTO.setQuantity(sr.getQuantity());
                serviceDTO.setUnitPrice(service.getPricePerUnit());

                BigDecimal totalPrice = service.getPricePerUnit().multiply(BigDecimal.valueOf(sr.getQuantity()));
                serviceDTO.setTotalPrice(totalPrice);
                serviceDTO.setStatus(sr.getStatus());
                serviceDTO.setRequestTime(sr.getRequestTime());
                serviceDTO.setNote(sr.getNote());

                serviceDTOs.add(serviceDTO);

                // Chỉ cộng vào invoice nếu status = "COMPLETED"
                if ("COMPLETED".equalsIgnoreCase(sr.getStatus())) {
                    servicesTotal = servicesTotal.add(totalPrice);
                }
            }
        }

        // 7. Tính toán Invoice Data
        BookingDetailFullDTO.InvoiceDataDTO invoiceData = new BookingDetailFullDTO.InvoiceDataDTO();
        invoiceData.setInvoiceId("INV-" + bookingId);

        // Invoice date: chỉ hiển thị khi đã checkout
        if (bookingRoom.getActualCheckout() != null) {
            invoiceData.setInvoiceDate(bookingRoom.getActualCheckout());
        }

        // Tính số đêm
        long numberOfNights = 1;
        if (bookingRoom.getActualCheckin() != null) {
            LocalDateTime checkoutTime = bookingRoom.getActualCheckout() != null
                    ? bookingRoom.getActualCheckout()
                    : LocalDateTime.now();
            numberOfNights = ChronoUnit.DAYS.between(
                    bookingRoom.getActualCheckin().toLocalDate(),
                    checkoutTime.toLocalDate()
            );
            if (numberOfNights <= 0) numberOfNights = 1;
        } else {
            // Nếu chưa check-in, dùng booking date
            numberOfNights = ChronoUnit.DAYS.between(
                    booking.getCheckinDate().toLocalDate(),
                    booking.getCheckoutDate().toLocalDate()
            );
            if (numberOfNights <= 0) numberOfNights = 1;
        }

        // Room price (adjusted total for the relevant date range)
        BigDecimal adjustedRoomTotal;
        if (bookingRoom.getActualCheckin() != null) {
            LocalDateTime checkoutTime = bookingRoom.getActualCheckout() != null
                    ? bookingRoom.getActualCheckout()
                    : LocalDateTime.now();
            adjustedRoomTotal = priceAdjustmentService.calculateTotalPrice(
                    roomType.getPrice(),
                    bookingRoom.getActualCheckin().toLocalDate(),
                    checkoutTime.toLocalDate()
            );
        } else {
            adjustedRoomTotal = priceAdjustmentService.calculateTotalPrice(
                    roomType.getPrice(),
                    booking.getCheckinDate().toLocalDate(),
                    booking.getCheckoutDate().toLocalDate()
            );
        }
        invoiceData.setRoomPrice(adjustedRoomTotal);
        invoiceData.setNumberOfNights(numberOfNights);

        // Late checkout fee (Standard checkout 12:00 PM, 100,000 VND/hour)
        BigDecimal lateCheckoutFee = BigDecimal.ZERO;
        if (bookingRoom.getActualCheckout() != null) {
            LocalDateTime standardCheckout = bookingRoom.getActualCheckout().toLocalDate().atTime(12, 0);
            if (bookingRoom.getActualCheckout().isAfter(standardCheckout)) {
                long hoursLate = ChronoUnit.HOURS.between(standardCheckout, bookingRoom.getActualCheckout());
                if (hoursLate > 0) {
                    lateCheckoutFee = BigDecimal.valueOf(hoursLate * 100000);
                }
            }
        }
        invoiceData.setLateCheckoutFee(lateCheckoutFee);

        // Deposit (30%)
        BigDecimal deposit = booking.getDeposit() != null ? booking.getDeposit() : BigDecimal.ZERO;
        invoiceData.setDeposit(deposit);

        // Services total (chỉ COMPLETED)
        invoiceData.setServicesTotal(servicesTotal);

        // Total amount = Adjusted Room + Late Fee - Deposit + Services (COMPLETED only)
        BigDecimal totalAmount = adjustedRoomTotal
                .add(lateCheckoutFee)
                .subtract(deposit)
                .add(servicesTotal);
        invoiceData.setTotalAmount(totalAmount);

        // 8. Build DTO
        BookingDetailFullDTO dto = new BookingDetailFullDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setStatus(booking.getStatus());
        dto.setCreateAt(booking.getCreateAt());
        dto.setCheckinDate(booking.getCheckinDate());
        dto.setCheckoutDate(booking.getCheckoutDate());
        dto.setAdult(booking.getAdult());
        dto.setChildren(booking.getChildren());
        dto.setActualCheckin(bookingRoom.getActualCheckin());
        dto.setActualCheckout(bookingRoom.getActualCheckout());

        // Room info
        BookingDetailFullDTO.RoomInfoDTO roomInfo = new BookingDetailFullDTO.RoomInfoDTO();
        roomInfo.setRoomId(room.getRoomId());
        roomInfo.setRoomNumber(room.getRoomNumber());
        roomInfo.setRoomTypeName(roomType.getRoomTypeName());
        roomInfo.setPricePerNight(roomType.getPrice());
        roomInfo.setDescription(roomType.getDescription());
        roomInfo.setImageUrl(roomImageUrl);
        dto.setRoom(roomInfo);

        // Customer info
        BookingDetailFullDTO.CustomerInfoDTO customerInfo = new BookingDetailFullDTO.CustomerInfoDTO();
        customerInfo.setName(booking.getContactName());
        customerInfo.setPhone(booking.getContactPhone());
        customerInfo.setEmail(booking.getContactEmail());
        dto.setCustomer(customerInfo);

        // Services
        dto.setServices(serviceDTOs);

        // Invoice data
        dto.setInvoiceData(invoiceData);

        return dto;
    }

    // ============================================================
// METHOD 2: DELETE SERVICE REQUEST
// ============================================================
    @Transactional
    public void deleteServiceRequest(Long bookingId, Long requestId, Long customerId) {
        // 1. Kiểm tra booking có thuộc về customer không
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new SecurityException("You are not authorized to delete this service request");
        }

        // 2. Lấy service request
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        // 3. Kiểm tra service request có thuộc về booking không
        if (!serviceRequest.getBookingId().equals(bookingId)) {
            throw new SecurityException("Service request does not belong to this booking");
        }

        // 4. Chỉ cho phép xóa nếu status = PENDING (case-insensitive)
        if (!"PENDING".equalsIgnoreCase(serviceRequest.getStatus())) {
            throw new IllegalStateException("Only pending service requests can be deleted. Current status: " + serviceRequest.getStatus());
        }

        // 5. Xóa service request
        serviceRequestRepository.delete(serviceRequest);
    }

    // ============================================================
    // ADMIN METHODS
    // ============================================================
    
    
    @Transactional(readOnly = true)
    public Page<AdminBookingListDTO> getBookingsForAdmin(String searchTerm, String status, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findBookingsForAdmin(searchTerm, status, pageable);
        
        return bookings.map(booking -> {
            BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(booking.getBookingId())
                    .stream().findFirst().orElse(null);
            
            String roomNumber = null;
            String roomTypeName = null;
            if (bookingRoom != null) {
                Room room = roomRepository.findById(bookingRoom.getRoomId()).orElse(null);
                if (room != null) {
                    roomNumber = room.getRoomNumber();
                    RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElse(null);
                    if (roomType != null) {
                        roomTypeName = roomType.getRoomTypeName();
                    }
                }
            }
            
            return new AdminBookingListDTO(
                booking.getBookingId(),
                booking.getContactName(),
                booking.getContactPhone(),
                booking.getContactEmail(),
                roomNumber,
                roomTypeName,
                booking.getCheckinDate(),
                booking.getCheckoutDate(),
                booking.getStatus(),
                booking.getDeposit(),
                booking.getCreateAt(),
                (booking.getAdult() != null ? booking.getAdult() : 0) + (booking.getChildren() != null ? booking.getChildren() : 0)
            );
        });
    }
    
   
    @Transactional(readOnly = true)
    public AdminBookingDetailDTO getBookingDetailForAdmin(Long bookingId) {
        Booking booking = bookingRepository.findBookingDetailForAdmin(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        // Lấy thông tin phòng
        BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId)
                .stream().findFirst().orElse(null);
        
        String roomNumber = null;
        String roomTypeName = null;
        BigDecimal roomPrice = null;
        RoomType roomType = null;
        if (bookingRoom != null) {
            Room room = roomRepository.findById(bookingRoom.getRoomId()).orElse(null);
            if (room != null) {
                roomNumber = room.getRoomNumber();
                roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElse(null);
                if (roomType != null) {
                    roomTypeName = roomType.getRoomTypeName();
                    roomPrice = roomType.getPrice();
                }
            }
        }
        
        // Lấy thông tin khách hàng
        Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
        
        // Lấy danh sách GuestDetails
        List<GuestDetail> guestDetails = guestDetailRepository.findByBookingId(bookingId);
        List<AdminBookingDetailDTO.GuestDetailDTO> guestDetailDTOs = guestDetails.stream()
                .map(gd -> new AdminBookingDetailDTO.GuestDetailDTO(
                    gd.getGuestDetailId(),
                    gd.getFullName(),
                    gd.getGender(),
                    gd.getCitizenId()
                ))
                .collect(Collectors.toList());
        
        // Lấy danh sách ServiceRequests
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findByBookingId(bookingId);
        List<AdminBookingDetailDTO.ServiceRequestDTO> serviceRequestDTOs = serviceRequests.stream()
                .map(sr -> {
                    backend.entity.Service service = serviceRepository.findById(sr.getServiceId()).orElse(null);
                    String serviceName = service != null ? service.getServiceName() : "Unknown Service";
                    BigDecimal unitPrice = service != null ? service.getPricePerUnit() : BigDecimal.ZERO;
                    BigDecimal totalPrice = sr.getQuantity() != null && unitPrice != null 
                        ? unitPrice.multiply(BigDecimal.valueOf(sr.getQuantity()))
                        : BigDecimal.ZERO;
                    
                    AdminBookingDetailDTO.ServiceRequestDTO dto = new AdminBookingDetailDTO.ServiceRequestDTO();
                    dto.setServiceRequestId(sr.getRequestId());
                    dto.setServiceName(serviceName);
                    dto.setQuantity(sr.getQuantity());
                    dto.setUnitPrice(unitPrice);
                    dto.setTotalPrice(totalPrice);
                    dto.setStatus(sr.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());
        
        // Tạo DTO
        AdminBookingDetailDTO dto = new AdminBookingDetailDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCustomerName(customer != null ? customer.getFullName() : booking.getContactName());
        dto.setCustomerPhone(customer != null ? customer.getPhone() : booking.getContactPhone());
        dto.setCustomerEmail(customer != null ? customer.getEmail() : booking.getContactEmail());
        dto.setCustomerCitizenId(customer != null ? customer.getCitizenId() : null);
        dto.setRoomNumber(roomNumber);
        dto.setRoomTypeName(roomTypeName);
        dto.setRoomPrice(roomPrice);
        dto.setRoomId(bookingRoom != null ? bookingRoom.getRoomId() : null);
        dto.setRoomTypeId(roomType != null ? roomType.getRoomTypeId() : null);
        dto.setCheckinDate(booking.getCheckinDate());
        dto.setCheckoutDate(booking.getCheckoutDate());
        dto.setActualCheckin(bookingRoom != null ? bookingRoom.getActualCheckin() : null);
        dto.setActualCheckout(bookingRoom != null ? bookingRoom.getActualCheckout() : null);
        dto.setStatus(booking.getStatus());
        dto.setDeposit(booking.getDeposit());
        dto.setCreateAt(booking.getCreateAt());
        dto.setNumberOfGuests((booking.getAdult() != null ? booking.getAdult() : 0) + (booking.getChildren() != null ? booking.getChildren() : 0));
        dto.setContactName(booking.getContactName());
        dto.setContactPhone(booking.getContactPhone());
        dto.setContactEmail(booking.getContactEmail());
        dto.setGuestDetails(guestDetailDTOs);
        dto.setServiceRequests(serviceRequestDTOs);
        
        return dto;
    }
    
    @Transactional
    public void updateBookingForAdmin(Long bookingId, AdminBookingUpdateDTO updateDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (updateDTO.getCheckinDate() != null) {
            booking.setCheckinDate(updateDTO.getCheckinDate());
        }
        if (updateDTO.getCheckoutDate() != null) {
            booking.setCheckoutDate(updateDTO.getCheckoutDate());
        }
        if (updateDTO.getStatus() != null) {
            booking.setStatus(updateDTO.getStatus());
        }
        if (updateDTO.getDeposit() != null) {
            booking.setDeposit(updateDTO.getDeposit());
        }
        if (updateDTO.getContactName() != null) {
            booking.setContactName(updateDTO.getContactName());
        }
        if (updateDTO.getContactPhone() != null) {
            booking.setContactPhone(updateDTO.getContactPhone());
        }
        if (updateDTO.getContactEmail() != null) {
            booking.setContactEmail(updateDTO.getContactEmail());
        }
        
        if (updateDTO.getRoomId() != null) {
            BookingRoom bookingRoom = bookingRoomRepository.findByBookingId(bookingId)
                    .stream().findFirst().orElse(null);
            if (bookingRoom != null) {
                bookingRoom.setRoomId(updateDTO.getRoomId());
                bookingRoomRepository.save(bookingRoom);
            }
        }
        
        bookingRepository.save(booking);
        
        if (updateDTO.getGuestDetails() != null) {
            List<GuestDetail> existingGuests = guestDetailRepository.findByBookingId(bookingId);
            guestDetailRepository.deleteAll(existingGuests);
            
            for (AdminBookingUpdateDTO.GuestDetailUpdateDTO guestDTO : updateDTO.getGuestDetails()) {
                if (guestDTO.getFullName() != null && !guestDTO.getFullName().trim().isEmpty()) {
                    GuestDetail newGuestDetail = new GuestDetail();
                    newGuestDetail.setBookingId(bookingId);
                    newGuestDetail.setFullName(guestDTO.getFullName().trim());
                    newGuestDetail.setGender(guestDTO.getGender());
                    newGuestDetail.setCitizenId(guestDTO.getCitizenId());
                    guestDetailRepository.save(newGuestDetail);
                }
            }
        }
        
        if (updateDTO.getPendingServices() != null && !updateDTO.getPendingServices().isEmpty()) {
            for (AdminBookingUpdateDTO.ServiceRequestDTO serviceDTO : updateDTO.getPendingServices()) {
                ServiceRequest newServiceRequest = new ServiceRequest();
                newServiceRequest.setBookingId(bookingId);
                newServiceRequest.setServiceId(serviceDTO.getServiceId());
                newServiceRequest.setQuantity(serviceDTO.getQuantity());
                newServiceRequest.setStatus("COMPLETED"); 
                newServiceRequest.setRequestTime(LocalDateTime.now());
                serviceRequestRepository.save(newServiceRequest);
            }
        }
    }
}