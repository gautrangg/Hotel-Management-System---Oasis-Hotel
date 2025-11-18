package backend.dto.booking;

public class SummaryDTO {
    private String room;
    private String service;
    private String addtionalFee;
    private String penalty;
    private String deposit;
    private String total;

    public SummaryDTO() {
    }

    public String getPenalty() {
        return penalty;
    }

    public void setPenalty(String penalty) {
        this.penalty = penalty;
    }

    public String getAddtionalFee() {
        return addtionalFee;
    }

    public void setAddtionalFee(String addtionalFee) {
        this.addtionalFee = addtionalFee;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getDeposit() {
        return deposit;
    }

    public void setDeposit(String deposit) {
        this.deposit = deposit;
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }
}
