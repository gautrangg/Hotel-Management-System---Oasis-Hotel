package backend.controller;

import backend.entity.Customer;
import backend.security.JwtUtil;
import backend.service.CustomerService;
import backend.repository.CustomerRepository;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam String query) {
        return ResponseEntity.ok(customerService.searchCustomers(query));
    }

    @GetMapping
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Claims claims = jwtUtil.extractClaims(token);
        Long customerId = ((Number) claims.get("id")).longValue();

        return customerService.findById(customerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomer(@PathVariable Long id) {
        return customerService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new customer with all required fields.
     * POST /api/customers/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        try {
            // Validate required fields
            if (customer.getFullName() == null || customer.getEmail() == null || 
                customer.getPassword() == null) {
                return ResponseEntity.badRequest().body("Full name, email and password are required");
            }

            Customer created = customerService.createCustomer(customer);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating customer");
        }
    }

    /**
     * Update an existing customer by ID with all fields.
     * PUT /api/customers/{id}/update
     */
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        try {
            customer.setCustomerId(id); // ensure ID matches path
            Customer updated = customerService.updateCustomer(id, customer);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating customer");
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Customer updateData) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Claims claims = jwtUtil.extractClaims(token);
        Long customerId = ((Number) claims.get("id")).longValue();

        Customer updated = customerService.updateProfile(customerId, updateData);
        if (updated == null) {
            return ResponseEntity.status(400).body("Update failed");
        }
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestHeader("Authorization") String authHeader,
                                          @RequestParam("file") MultipartFile file) {
        String token = authHeader.substring(7);
        Claims claims = jwtUtil.extractClaims(token);
        Long customerId = ((Number) claims.get("id")).longValue();

        try {
            String filename = customerService.uploadAvatar(customerId, file);
            return ResponseEntity.ok(Map.of("avatarUrl", filename));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Claims claims = jwtUtil.extractClaims(token);
        Long customerId = ((Number) claims.get("id")).longValue();

        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        boolean success = customerService.changePassword(customerId, oldPassword, newPassword);
        if (!success) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }
        return ResponseEntity.ok("Password changed successfully");
    }
}