package backend;

import backend.service.EmailService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "backend")
public class EmailTest {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(EmailTest.class, args);
        EmailService emailService = context.getBean(EmailService.class);
        emailService.sendSimpleEmail("", "Test Email", "Hi from Spring!");
    }
}
