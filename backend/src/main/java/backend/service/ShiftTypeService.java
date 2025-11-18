package backend.service;

import backend.entity.ShiftType;
import backend.repository.ShiftTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ShiftTypeService {

    @Autowired
    private final ShiftTypeRepository shiftTypeRepository;

    public ShiftTypeService(ShiftTypeRepository shiftTypeRepository) {
        this.shiftTypeRepository = shiftTypeRepository;
    }

    public List<ShiftType> getAllShiftTypes() {
        return shiftTypeRepository.findAll();
    }

    public Optional<ShiftType> getShiftTypeById(Long id) {
        return shiftTypeRepository.findById(id);
    }

    public ShiftType createShiftType(ShiftType shiftType) {
        if (shiftTypeRepository.existsByShiftTypeName(shiftType.getShiftTypeName())) {
            throw new RuntimeException("ShiftType name already exists");
        }
        return shiftTypeRepository.save(shiftType);
    }

    public ShiftType updateShiftType(Long id, ShiftType shiftType) {
        ShiftType existing = shiftTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShiftType not found"));
        existing.setShiftTypeName(shiftType.getShiftTypeName());
        return shiftTypeRepository.save(existing);
    }

    public void deleteShiftType(Long id) {
        shiftTypeRepository.deleteById(id);
    }

}
