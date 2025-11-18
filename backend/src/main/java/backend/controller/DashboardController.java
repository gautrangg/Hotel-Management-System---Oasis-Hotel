package backend.controller;

import backend.dto.manager.DashboardDTO;
import backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> getDashboardData(@RequestParam(defaultValue = "week") String period) {
        try {
            DashboardDTO data = dashboardService.getDashboardData(period);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error loading dashboard: " + e.getMessage());
        }
    }
}