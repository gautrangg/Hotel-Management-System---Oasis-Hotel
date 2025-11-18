package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Cấu hình CORS áp dụng toàn bộ project
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS cho chatbot - không cần credentials
        registry.addMapping("/api/v1/chat/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);

        // CORS cho các API còn lại - cần credentials (login, auth, etc)
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:61924", "http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // Cấu hình Resource Handlers cho static files
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/upload/avatar/**")
                .addResourceLocations("file:upload/avatar/");

        registry.addResourceHandler("/upload/rooms/**")
                .addResourceLocations("file:upload/rooms/");

        registry.addResourceHandler("/upload/service/**")
                .addResourceLocations("file:upload/service/");
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
