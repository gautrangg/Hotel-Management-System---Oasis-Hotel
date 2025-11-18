package backend.service;

import backend.entity.RoomImage;
import backend.repository.RoomImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomImageService {

    @Autowired
    private RoomImageRepository roomImageRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<String> getImageNamesByRoomTypeId(Long roomTypeId) {
        List<RoomImage> images = roomImageRepository.findByRoomTypeId(roomTypeId);
        return images.stream().map(RoomImage::getImage).collect(Collectors.toList());
    }

    public List<RoomImage> getImagesByRoomTypeId(Long roomTypeId) {
        return roomImageRepository.findByRoomTypeId(roomTypeId);
    }

    public RoomImage uploadImage(Long roomTypeId, MultipartFile file) {
        String filename = fileStorageService.store(file);

        RoomImage roomImage = new RoomImage();
        roomImage.setRoomTypeId(roomTypeId);
        roomImage.setImage(filename);

        return roomImageRepository.save(roomImage);
    }

    public void deleteImage(Long imageId) {
        RoomImage image = roomImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        fileStorageService.delete(image.getImage());

        roomImageRepository.delete(image);
    }
}