package backend.controller;

import backend.entity.ServiceCategory;
import backend.service.ServiceCategoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service-categories")
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    public ServiceCategoryController(ServiceCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<ServiceCategory> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public ServiceCategory getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    // ================== CREATE ==================
    @PostMapping(consumes = {"multipart/form-data"})
    public ServiceCategory create(
            @RequestParam("categoryName") String categoryName,
            @RequestParam(value = "description", required = false) String description
    ) {
        ServiceCategory category = new ServiceCategory();
        category.setCategoryName(categoryName);
        category.setDescription(description);
        category.setActive(true);
        return categoryService.create(category);
    }

    // ================== UPDATE ==================
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ServiceCategory update(
            @PathVariable Long id,
            @RequestParam("categoryName") String categoryName,
            @RequestParam(value = "description", required = false) String description
    ) {
        ServiceCategory category = new ServiceCategory();
        category.setCategoryName(categoryName);
        category.setDescription(description);
        return categoryService.update(id, category);
    }

    // ================== DELETE ==================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
