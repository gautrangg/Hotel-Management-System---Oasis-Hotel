package backend.service;

import backend.entity.ServiceCategory;
import backend.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public ServiceCategoryService(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<ServiceCategory> getAll() {
        return categoryRepository.findByIsActiveTrue();
    }

    public ServiceCategory getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public ServiceCategory create(ServiceCategory category) {
        return categoryRepository.save(category);
    }

    public ServiceCategory update(Long id, ServiceCategory updated) {
        ServiceCategory c = getById(id);
        c.setCategoryName(updated.getCategoryName());
        return categoryRepository.save(c);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}
