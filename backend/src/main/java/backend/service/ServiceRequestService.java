package backend.service;

import backend.constants.ServiceRequestStatus;
import backend.entity.*;
import backend.repository.BookingRepository;
import backend.repository.BookingRoomRepository;
import backend.repository.CustomerRepository;
import backend.repository.RoomRepository;
import backend.repository.ServiceRepository;
import backend.repository.ServiceRequestRepository;
import backend.repository.StaffRepository;
import backend.dto.service.ServiceRequestInfoDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final EmailService emailService;

    public ServiceRequestService(ServiceRequestRepository requestRepository,
                                 BookingRepository bookingRepository,
                                 ServiceRepository serviceRepository,
                                 BookingRoomRepository bookingRoomRepository,
                                 RoomRepository roomRepository,
                                 CustomerRepository customerRepository,
                                 StaffRepository staffRepository,
                                 EmailService emailService) {
        this.requestRepository = requestRepository;
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.bookingRoomRepository = bookingRoomRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.emailService = emailService;
    }


    public List<ServiceRequest> getAll() {
        return requestRepository.findAll();
    }

    public ServiceRequest getById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public ServiceRequest create(ServiceRequest request) {
        return requestRepository.save(request);
    }

    /**
     * Update whole ServiceRequest by id. Only updates fields provided in the payload.
     * Throws IllegalArgumentException if request not found.
     */
    public ServiceRequest update(Long id, ServiceRequest updated) {
        ServiceRequest existing = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ServiceRequest not found with id: " + id));

        // copy fields (keep id unchanged)
        existing.setBookingId(updated.getBookingId());
        existing.setServiceId(updated.getServiceId());
        existing.setStaffId(updated.getStaffId());
        existing.setQuantity(updated.getQuantity());
        existing.setExpectedTime(updated.getExpectedTime());
        existing.setRequestTime(updated.getRequestTime());
        existing.setNote(updated.getNote());
        existing.setStatus(updated.getStatus());

        return requestRepository.save(existing);
    }

    /**
     * Update status of a service request with validation
     *
     * @param id     request id
     * @param status new status (must be one of: Pending, On Progress, Completed, Cancelled)
     * @return updated ServiceRequest
     * @throws IllegalArgumentException if status is invalid
     */
    public ServiceRequest updateStatus(Long id, String status) {
        if (!ServiceRequestStatus.isValid(status)) {
            throw new IllegalArgumentException(
                    "Invalid status. Valid statuses are: " + ServiceRequestStatus.getValidStatusesString()
            );
        }

        ServiceRequest req = getById(id);
        req.setStatus(status.trim());
        return requestRepository.save(req);
    }

    public void delete(Long id) {
        requestRepository.deleteById(id);
    }

    public ServiceRequest createRequest(Long serviceId, Long bookingId, Integer quantity, String note, LocalDateTime expectedTime) {
        if (expectedTime != null) {
            backend.entity.Service service = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service with ID " + serviceId + " not found."));
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking with ID " + bookingId + " not found."));

            LocalTime requestedTime = expectedTime.toLocalTime();
            if (service.getAvailableStartTime() != null && service.getAvailableEndTime() != null) {
                if (requestedTime.isBefore(service.getAvailableStartTime()) || requestedTime.isAfter(service.getAvailableEndTime())) {
                    throw new IllegalArgumentException(
                            "Expected time is outside the service's available hours (" +
                                    service.getAvailableStartTime() + " - " + service.getAvailableEndTime() + ")."
                    );
                }
            }

            if (expectedTime.isBefore(booking.getCheckinDate()) || expectedTime.isAfter(booking.getCheckoutDate())) {
                throw new IllegalArgumentException(
                        "Expected time must be within your check-in and check-out period."
                );
            }
        }

        ServiceRequest req = new ServiceRequest();
        req.setBookingId(bookingId);
        req.setServiceId(serviceId);
        req.setQuantity(quantity);
        req.setNote(note);
        req.setExpectedTime(expectedTime);
        req.setRequestTime(LocalDateTime.now());
        req.setStatus("Pending");

        return requestRepository.save(req);
    }

    /**
     * Get aggregated service request info for all service requests
     */
    public List<ServiceRequestInfoDTO> getAllServiceRequestDetails() {
        List<ServiceRequest> requests = requestRepository.findAll();
        List<ServiceRequestInfoDTO> result = new ArrayList<>();

        for (ServiceRequest r : requests) {
            if (!"Completed".equalsIgnoreCase(r.getStatus())) {
                String customerName = "";
                String customerAvatar = "";
                if (r.getBookingId() != null) {
                    Booking booking = bookingRepository.findById(r.getBookingId()).orElse(null);
                    if (booking != null && booking.getCustomerId() != null) {
                        Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
                        if (customer != null) {
                            customerName = customer.getFullName();
                            customerAvatar = customer.getAvatar();
                        }
                    }
                }

                String roomNumber = "";
                if (r.getBookingId() != null) {
                    BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(r.getBookingId()).orElse(null);
                    if (bookingRoom != null && bookingRoom.getRoomId() != null) {
                        roomNumber = roomRepository.findById(bookingRoom.getRoomId()).map(backend.entity.Room::getRoomNumber).orElse(null);
                    }
                }

                String serviceName = "";
                String serviceImage = "";
                if (r.getServiceId() != null) {
                    backend.entity.Service service = serviceRepository.findById(r.getServiceId()).orElse(null);
                    if (service != null) {
                        serviceName = service.getServiceName();
                        serviceImage = service.getImage();
                    }
                }

                String staffName = "";
                if (r.getStaffId() != null) {
                    staffName = staffRepository.findById(r.getStaffId()).map(backend.entity.Staff::getFullName).orElse(null);
                }

                ServiceRequestInfoDTO dto = new ServiceRequestInfoDTO(
                        r.getRequestId(),
                        customerName,
                        roomNumber,
                        serviceName,
                        r.getQuantity(),
                        staffName,
                        r.getStatus(),
                        r.getExpectedTime(),
                        r.getNote(),
                        customerAvatar,
                        serviceImage
                );
                result.add(dto);
            }
        }

        return result;
    }

//    /**
//     * Assign a staff to a service request. This will set the staffId on the request.
//     * @param requestId id of the ServiceRequest
//     * @param staffId id of the Staff to assign
//     * @return updated ServiceRequest
//     */
//    public ServiceRequest assignStaff(Long requestId, Long staffId) {
//        if (staffId == null) {
//            throw new IllegalArgumentException("staffId is required");
//        }
//
//        boolean staffExists = staffRepository.findById(staffId).isPresent();
//        if (!staffExists) {
//            throw new IllegalArgumentException("Staff with id " + staffId + " not found");
//        }
//
//        ServiceRequest req = getById(requestId);
//        req.setStaffId(staffId);
//        return requestRepository.save(req);
//    }

    /**
     * Get aggregated service request info for requests assigned to a specific staff member.
     * Returns all service requests assigned to the staff, regardless of status.
     * @param staffId The ID of the staff member.
     * @return A list of detailed service request DTOs.
     */
    public List<ServiceRequestInfoDTO> getAssignedServiceRequestDetails(Long staffId) {
        List<ServiceRequest> requests = requestRepository.findByStaffId(staffId);
        List<ServiceRequestInfoDTO> result = new ArrayList<>();

        for (ServiceRequest r : requests) {
            String customerName = "";
            String customerAvatar = "";
            if (r.getBookingId() != null) {
                Booking booking = bookingRepository.findById(r.getBookingId()).orElse(null);
                if (booking != null && booking.getCustomerId() != null) {
                    Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
                    if (customer != null) {
                        customerName = customer.getFullName();
                        customerAvatar = customer.getAvatar();
                    }
                }
            }

            String roomNumber = "";
            if (r.getBookingId() != null) {
                BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(r.getBookingId()).orElse(null);
                if (bookingRoom != null && bookingRoom.getRoomId() != null) {
                    roomNumber = roomRepository.findById(bookingRoom.getRoomId()).map(backend.entity.Room::getRoomNumber).orElse(null);
                }
            }

            String serviceName = "";
            String serviceImage = "";
            if(r.getServiceId() != null) {
                backend.entity.Service service = serviceRepository.findById(r.getServiceId()).orElse(null);
                if (service != null) {
                    serviceName = service.getServiceName();
                    serviceImage = service.getImage();
                }
            }

            String staffName = staffRepository.findById(r.getStaffId()).map(backend.entity.Staff::getFullName).orElse("");

            ServiceRequestInfoDTO dto = new ServiceRequestInfoDTO(
                    r.getRequestId(),
                    customerName,
                    roomNumber,
                    serviceName,
                    r.getQuantity(),
                    staffName,
                    r.getStatus(),
                    r.getExpectedTime(),
                    r.getNote(),
                    customerAvatar,
                    serviceImage
            );
            result.add(dto);
        }

        return result;
    }

    /**
     * Assign a staff to a service request. This will set the staffId on the request.
     * @param requestId id of the ServiceRequest
     * @param staffId id of the Staff to assign
     * @return updated ServiceRequest
     */
    public ServiceRequest assignStaff(Long requestId, Long staffId) {
        if (staffId == null) {
            throw new IllegalArgumentException("staffId is required");
        }

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff with id " + staffId + " not found"));

        ServiceRequest req = getById(requestId);
        req.setStaffId(staffId);
        ServiceRequest savedRequest = requestRepository.save(req);

        // --- Send email for staff ---
        try {
            String staffEmail = staff.getEmail();
            String subject = "New Service Request Assigned";

            Booking booking = bookingRepository.findById(req.getBookingId()).orElse(null);
            String roomNumber = "";
            String customerName = "";
            String customerPhone = "";
            String customerEmail = "";

            if (booking != null) {
                BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(booking.getBookingId()).orElse(null);
                if (bookingRoom != null) {
                    roomNumber = roomRepository.findById(bookingRoom.getRoomId())
                            .map(backend.entity.Room::getRoomNumber).orElse("");
                }

                if (booking.getCustomerId() != null) {
                    Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
                    if (customer != null) {
                        customerName = customer.getFullName();
                        customerPhone = customer.getPhone();
                        customerEmail = customer.getEmail();
                    }
                }
            }

            String body = "<p>Hi " + staff.getFullName() + ",</p>"
                    + "<p>You have been assigned a new service request.</p>"
                    + "<ul>"
                    + "<li>Room: <b>" + roomNumber + "</b></li>"
                    + "<li>Customer: <b>" + customerName + "</b></li>"
                    + "<li>Phone: <b>" + customerPhone + "</b></li>"
                    + "<li>Email: <b>" + customerEmail + "</b></li>"
                    + "<li>Service: <b>" + (req.getServiceId() != null
                    ? serviceRepository.findById(req.getServiceId()).map(s -> s.getServiceName()).orElse("")
                    : "") + "</b></li>"
                    + "<li>Quantity: <b>" + req.getQuantity() + "</b></li>"
                    + "<li>Expected Time: <b>" + (req.getExpectedTime() != null ? req.getExpectedTime() : "") + "</b></li>"
                    + "<li>Note: <b>" + (req.getNote() != null ? req.getNote() : "") + "</b></li>"
                    + "</ul>"
                    + "<p>Please complete this request on time.</p>";

            emailService.sendHtmlEmail(staff.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send email to staff: " + e.getMessage());
        }

        return savedRequest;
    }

//
//    /**
//     * Get aggregated service request info for requests assigned to a specific staff member.
//     * @param staffId The ID of the staff member.
//     * @return A list of detailed service request DTOs.
//     */
//    public List<ServiceRequestInfoDTO> getAssignedServiceRequestDetails(Long staffId) {
//        List<ServiceRequest> requests = requestRepository.findByStaffId(staffId);
//        List<ServiceRequestInfoDTO> result = new ArrayList<>();
//
//        for (ServiceRequest r : requests) {
//            if ("Assigned".equalsIgnoreCase(r.getStatus())) {
//
//                String customerName = "";
//                String customerAvatar = "";
//                if (r.getBookingId() != null) {
//                    Booking booking = bookingRepository.findById(r.getBookingId()).orElse(null);
//                    if (booking != null && booking.getCustomerId() != null) {
//                        Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
//                        if (customer != null) {
//                            customerName = customer.getFullName();
//                            customerAvatar = customer.getAvatar();
//                        }
//                    }
//                }
//
//                String roomNumber = "";
//                if (r.getBookingId() != null) {
//                    BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(r.getBookingId()).orElse(null);
//                    if (bookingRoom != null && bookingRoom.getRoomId() != null) {
//                        roomNumber = roomRepository.findById(bookingRoom.getRoomId()).map(backend.entity.Room::getRoomNumber).orElse(null);
//                    }
//                }
//
//                String serviceName = "";
//                String serviceImage = "";
//                if(r.getServiceId() != null) {
//                    backend.entity.Service service = serviceRepository.findById(r.getServiceId()).orElse(null);
//                    if (service != null) {
//                        serviceName = service.getServiceName();
//                        serviceImage = service.getImage();
//                    }
//                }
//
//                String staffName = staffRepository.findById(r.getStaffId()).map(backend.entity.Staff::getFullName).orElse("");
//
//                ServiceRequestInfoDTO dto = new ServiceRequestInfoDTO(
//                        r.getRequestId(),
//                        customerName,
//                        roomNumber,
//                        serviceName,
//                        r.getQuantity(),
//                        staffName,
//                        r.getStatus(),
//                        r.getExpectedTime(),
//                        r.getNote(),
//                        customerAvatar,
//                        serviceImage
//                );
//                result.add(dto);
//            }
//        }
//
//        return result;
//    }

    /**
     * Update status by a staff member. Staff can only update requests assigned to themselves.
     *
     * @throws IllegalArgumentException if status is invalid
     * @throws SecurityException        if staff is not authorized
     */
    public ServiceRequest updateStatusByStaff(Long requestId, Long staffId, String status) {
        if (staffId == null) throw new SecurityException("Unauthorized: staff information missing");

        if (!ServiceRequestStatus.isValid(status)) {
            throw new IllegalArgumentException(
                    "Invalid status. Valid statuses are: " + ServiceRequestStatus.getValidStatusesString()
            );
        }

        ServiceRequest req = getById(requestId);
        if (req.getStaffId() == null || !req.getStaffId().equals(staffId)) {
            throw new SecurityException("You are not authorized to update this service request");
        }
        req.setStatus(status.trim());
        return requestRepository.save(req);
    }

    /**
     * Mark a service request as completed
     *
     * @param id request id
     * @return updated ServiceRequest
     */
    public ServiceRequest markAsCompleted(Long id) {
        ServiceRequest req = getById(id);
        req.setStatus(ServiceRequestStatus.COMPLETED);
        return requestRepository.save(req);
    }

    /**
     * Get aggregated service request info for completed requests of a specific staff member.
     *
     * @param staffId The ID of the staff member.
     * @return A list of detailed service request DTOs for completed requests.
     */
    public List<ServiceRequestInfoDTO> getCompletedServiceRequestDetails(Long staffId) {
        List<ServiceRequest> requests = requestRepository.findByStaffId(staffId);
        List<ServiceRequestInfoDTO> result = new ArrayList<>();

        for (ServiceRequest r : requests) {
            String status = r.getStatus();
            if (status != null && (status.equalsIgnoreCase("Completed") || status.equalsIgnoreCase("Done"))) {

                String customerName = "";
                String customerAvatar = "";
                if (r.getBookingId() != null) {
                    Booking booking = bookingRepository.findById(r.getBookingId()).orElse(null);
                    if (booking != null && booking.getCustomerId() != null) {
                        Customer customer = customerRepository.findById(booking.getCustomerId()).orElse(null);
                        if (customer != null) {
                            customerName = customer.getFullName();
                            customerAvatar = customer.getAvatar();
                        }
                    }
                }

                String roomNumber = "";
                if (r.getBookingId() != null) {
                    BookingRoom bookingRoom = bookingRoomRepository.findFirstByBookingId(r.getBookingId()).orElse(null);
                    if (bookingRoom != null && bookingRoom.getRoomId() != null) {
                        roomNumber = roomRepository.findById(bookingRoom.getRoomId()).map(backend.entity.Room::getRoomNumber).orElse(null);
                    }
                }

                String serviceName = "";
                String serviceImage = "";
                if (r.getServiceId() != null) {
                    backend.entity.Service service = serviceRepository.findById(r.getServiceId()).orElse(null);
                    if (service != null) {
                        serviceName = service.getServiceName();
                        serviceImage = service.getImage();
                    }
                }

                String staffName = staffRepository.findById(r.getStaffId()).map(backend.entity.Staff::getFullName).orElse("");

                ServiceRequestInfoDTO dto = new ServiceRequestInfoDTO(
                        r.getRequestId(),
                        customerName,
                        roomNumber,
                        serviceName,
                        r.getQuantity(),
                        staffName,
                        r.getStatus(),
                        r.getExpectedTime(),
                        r.getNote(),
                        customerAvatar,
                        serviceImage
                );
                result.add(dto);
            }
        }

        return result;
    }
}