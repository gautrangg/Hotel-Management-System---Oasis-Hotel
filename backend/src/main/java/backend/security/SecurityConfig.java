package backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtUtil);

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth
                        // Public static and auth endpoints
                        .requestMatchers(
                                "/upload/**",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/staff/login",
                                "/api/feedbacks/latest",
                                "/api/v1/chat/**"
                        ).permitAll()

                        // Public catalog (read-only)
                        .requestMatchers(HttpMethod.GET,
                                "/api/roomtypes/**",
                                "/api/rooms",
                                "/api/rooms/*",
                                "/api/rooms/by-type/**",
                                "/api/rooms/*/schedule",
                                "/api/roomtypes/*/schedules",
                                "/api/rooms/search",
                                "/api/rooms/search-available/**",
                                "/api/price-adjustments/**"
                        ).permitAll()

                        // Booking & payment (authenticated roles)
                        .requestMatchers(HttpMethod.POST, "/api/bookings/initiate/**", "/api/bookings/confirm")
                            .hasAnyRole("CUSTOMER", "RECEPTIONIST", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,
                                "/api/bookings/my-bookings/**",
                                "/api/bookings/confirmation-details/**",
                                "/api/bookings/*/detail"
                        ).hasAnyRole("CUSTOMER", "RECEPTIONIST", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/bookings/cancel-pending/**",
                                "/api/bookings/*/service-requests/**"
                        ).hasAnyRole("CUSTOMER", "RECEPTIONIST", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/my-bookings/cancel/**")
                            .hasAnyRole("CUSTOMER", "RECEPTIONIST", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/payment/create-payment-intent")
                            .hasAnyRole("CUSTOMER", "RECEPTIONIST", "MANAGER", "ADMIN")

                        // Staff schedule/requests
                        .requestMatchers(
                                "/api/history-change-shift-requests/**",
                                "/api/edit-schedule-requests/**",
                                "/api/edit-leave-requests/**",
                                "/api/schedule-requests/**",
                                "/api/history-leave-requests/**",
                                "/api/shift/**",
                                "/api/leave-requests/**",
                                "/api/change-shift-requests/**",
                                "/api/delete-schedule-requests/**",
                                "/api/staff-shift/**",
                                "/api/bookings/reception-create/**"
                        ).hasAnyRole("HOUSEKEEPER", "RECEPTIONIST", "SERVICE STAFF", "MANAGER", "ADMIN")

                        // Housekeeping
                        .requestMatchers(HttpMethod.GET, "/api/staffs/available-housekeepers")
                            .hasAnyRole("RECEPTIONIST", "MANAGER", "HOUSEKEEPER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/housekeeping/**")
                            .hasAnyRole("HOUSEKEEPER", "MANAGER", "RECEPTIONIST", "ADMIN")

                        // Customers (managed by staff)
                        .requestMatchers(HttpMethod.POST, "/api/customers/create")
                            .hasAnyRole("RECEPTIONIST", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/customers/*/update")
                            .hasAnyRole("RECEPTIONIST", "MANAGER", "ADMIN")

                        // Dashboard (management)
                        .requestMatchers(HttpMethod.GET, "/api/dashboard", "/api/dashboard/**")
                            .hasAnyRole("MANAGER", "ADMIN")

                        // Auth 'me' endpoints
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/auth/staff/me")
                            .hasAnyRole("RECEPTIONIST", "MANAGER", "HOUSEKEEPER", "SERVICE STAFF", "ADMIN")

                        // Any other API requires authentication
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}