package backend.service;

import backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.*;

@Service
public class ServiceService {

    private static final String UPLOAD_DIR = "upload/service/";

    @Autowired
    private ServiceRepository serviceRepository;

    public List<backend.entity.Service> getServicesByCategoryId(Long categoryId) {
        return serviceRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    // ===================== GET ALL =====================
    public List<backend.entity.Service> getAllServices() {
        return serviceRepository.findByIsActiveTrue();
    }

    // ===================== GET BY ID =====================
    public Optional<backend.entity.Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    // ===================== CREATE =====================
    public backend.entity.Service addService(
            MultipartFile file,
            Long categoryId,
            String serviceName,
            BigDecimal pricePerUnit,
            String unit,
            String description,
            Boolean needStaff,
            Boolean isActive,
            LocalTime availableStartTime,
            LocalTime availableEndTime
    ) throws Exception {

        String fileName = saveFile(file);

        backend.entity.Service service = new backend.entity.Service();
        service.setCategoryId(categoryId);
        service.setServiceName(serviceName);
        service.setPricePerUnit(pricePerUnit);
        service.setUnit(unit);
        service.setDescription(description);
        service.setNeedStaff(needStaff);
        service.setActive(isActive);
        service.setImage(fileName);
        service.setAvailableStartTime(availableStartTime);
        service.setAvailableEndTime(availableEndTime);

        return serviceRepository.save(service);
    }

    // ===================== UPDATE =====================
    public backend.entity.Service updateService(
            Long id,
            MultipartFile file,
            Long categoryId,
            String serviceName,
            BigDecimal pricePerUnit,
            String unit,
            String description,
            Boolean needStaff,
            Boolean isActive,
            LocalTime availableStartTime,
            LocalTime availableEndTime
    ) throws Exception {

        backend.entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id " + id));

        // Xử lý file ảnh mới (nếu có)
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);

            // Xóa file cũ nếu tồn tại
            if (service.getImage() != null) {
                Path oldFile = Paths.get(UPLOAD_DIR, service.getImage());
                Files.deleteIfExists(oldFile);
            }

            service.setImage(fileName);
        }

        // Cập nhật các trường khác
        service.setCategoryId(categoryId);
        service.setServiceName(serviceName);
        service.setPricePerUnit(pricePerUnit);
        service.setUnit(unit);
        service.setDescription(description);
        service.setNeedStaff(needStaff);
        service.setActive(isActive);
        service.setAvailableStartTime(availableStartTime);
        service.setAvailableEndTime(availableEndTime);

        return serviceRepository.save(service);
    }

    // ===================== DELETE =====================
    public void deleteService(Long id) throws Exception {
        backend.entity.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id " + id));

        // Xóa file ảnh nếu có
        if (service.getImage() != null) {
            Path filePath = Paths.get(UPLOAD_DIR, service.getImage());
            Files.deleteIfExists(filePath);
        }

        serviceRepository.deleteById(id);
    }

    // ===================== PRIVATE: LƯU FILE =====================
    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = Paths.get(UPLOAD_DIR, fileName);
        Files.createDirectories(filePath.getParent());
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }
}