package backend.controller;

import backend.entity.Customer;
import backend.entity.Role;
import backend.entity.Staff;
import backend.security.JwtUtil;
import backend.service.CustomerService;
import backend.service.StaffService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private JwtUtil jwtUtil;

    // ===================== CUSTOMER =====================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        LocalDate birthDate = null;
        if (body.get("birthDate") != null){
            String birthDate_Str = body.get("birthDate");
            birthDate = LocalDate.parse(birthDate_Str);
        }
        try {
            Customer customer = customerService.register(
                    body.get("name"),
                    body.get("email"),
                    body.get("password"),
                    body.get("phone"),
                    birthDate,
                    body.get("gender"),
                    body.get("address"),
                    body.get("citizenId")
            );
            return ResponseEntity.ok(customer);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody Map<String, String> body) {
        return customerService.login(body.get("email"), body.get("password"))
                .map(c -> {
                    String token = jwtUtil.generateToken(
                            c.getEmail(),
                            Map.of(
                                    "id", c.getCustomerId(),
                                    "name", c.getFullName(),
                                    "role", "CUSTOMER"
                            )
                    );
                    return ResponseEntity.ok(Map.of(
                            "message", "Login success",
                            "token", token
                    ));
                })
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid email or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCustomerMe(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        Claims claims = jwtUtil.extractClaims(token);
        Long customerId = ((Number) claims.get("id")).longValue();

        return customerService.findById(customerId)
                .map(c -> ResponseEntity.ok(Map.of(
                        "id", c.getCustomerId(),
                        "name", c.getFullName(),
                        "email", c.getEmail(),
                        "phone", c.getPhone()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Customer not found")));
    }

    // ===================== STAFF =====================

    @PostMapping("/staff/login")
    public ResponseEntity<?> loginStaff(@RequestBody Map<String, String> body) {
        var loginResult = staffService.loginStaff(body.get("email"), body.get("password"));
        if (loginResult.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        Staff staff = (Staff) loginResult.get().get("staff");
        Role role = (Role) loginResult.get().get("role"); // chỉ có 1 role

        String token = jwtUtil.generateToken(
                staff.getEmail(),
                Map.of(
                        "staffId", staff.getStaffId(),
                        "staffName", staff.getFullName(),
                        "birthDate", staff.getBirthDate() != null ? staff.getBirthDate().toString() : null,
                        "phone", staff.getPhone(),
                        "email", staff.getEmail(),
                        "staffImage", staff.getStaffImage(),
                        "role", role != null ? role.getRoleName() : null
                )
        );

        return ResponseEntity.ok(Map.of(
                "message", "Login success",
                "token", token
        ));
    }

    @GetMapping("/staff/me")
    public ResponseEntity<?> getStaffMe(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        Claims claims = jwtUtil.extractClaims(token);
        Long staffId = ((Number) claims.get("staffId")).longValue();

        Staff staff = staffService.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        return ResponseEntity.ok(Map.of(
                "staffId", staff.getStaffId(),
                "staffName", staff.getFullName(),
                "birthDate", staff.getBirthDate(),
                "phone", staff.getPhone(),
                "email", staff.getEmail(),
                "staffImage", staff.getStaffImage(),
                "roles", claims.get("roles")
        ));
    }


}
