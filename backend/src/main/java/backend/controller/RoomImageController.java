package backend.controller;

import backend.entity.RoomImage;
import backend.service.RoomImageService; // Import service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoomImageController {

    @Autowired
    private RoomImageService roomImageService;

    @GetMapping("/roomtypes/{roomTypeId}/images")
    public ResponseEntity<List<String>> getImageNamesByRoomType(@PathVariable Long roomTypeId) {
        List<String> imageNames = roomImageService.getImageNamesByRoomTypeId(roomTypeId);
        return ResponseEntity.ok(imageNames);
    }

    @GetMapping("/roomtypes/{roomTypeId}/full-images")
    public ResponseEntity<List<RoomImage>> getImagesByRoomType(@PathVariable Long roomTypeId) {
        List<RoomImage> imageNames = roomImageService.getImagesByRoomTypeId(roomTypeId);
        return ResponseEntity.ok(imageNames);
    }

    @PostMapping("/roomtypes/{roomTypeId}/images")
    public ResponseEntity<RoomImage> uploadImage(@PathVariable Long roomTypeId, @RequestParam("file") MultipartFile file) {
        try {
            RoomImage savedImage = roomImageService.uploadImage(roomTypeId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        try {
            roomImageService.deleteImage(imageId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}