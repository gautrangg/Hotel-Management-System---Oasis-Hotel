package backend.dto.service;

public class UpdateStatusRequestDTO {
    private String status;

    public UpdateStatusRequestDTO() {
    }

    public UpdateStatusRequestDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}