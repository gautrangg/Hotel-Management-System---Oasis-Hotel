package backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Map<String, Object> claims = jwtUtil.parseToken(token);
                String email = (String) claims.get("sub");
                Integer idInt = (Integer) claims.get("id");
                Long id = idInt != null ? idInt.longValue() : null;
                String role = (String) claims.get("role");
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) claims.get("roles");

                CustomUserDetails userDetails = new CustomUserDetails(id, email, "", role);
                List<SimpleGrantedAuthority> authorities;
                if (roles != null && !roles.isEmpty()) {
                    authorities = roles.stream()
                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.trim().toUpperCase()))
                            .collect(Collectors.toList());
                } else if (role != null) {
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()));
                } else {
                    authorities = List.of();
                }

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }


}
