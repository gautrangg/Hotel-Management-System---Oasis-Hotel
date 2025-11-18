package backend.controller;

import backend.dto.payment.InvoiceViewDTO;
import backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor

public class InvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping("/view/booking/{bookingId}")
    public ResponseEntity<InvoiceViewDTO> getInvoiceView(@PathVariable Long bookingId) {
        InvoiceViewDTO invoiceData = invoiceService.getInvoiceForBooking(bookingId);
        return ResponseEntity.ok(invoiceData);
    }
}
