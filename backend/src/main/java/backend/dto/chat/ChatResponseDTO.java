package backend.dto.chat;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChatResponseDTO {
	private String message;
	private String conversationId;
	private String action; // Optional: for navigation actions
	private Object payload; // Optional: for action data
	
	// Manual constructor to ensure it exists
	public ChatResponseDTO(String message, String conversationId, String action, Object payload) {
		this.message = message;
		this.conversationId = conversationId;
		this.action = action;
		this.payload = payload;
	}
	
	// Manual getters/setters to ensure they exist
	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }
	
	public String getConversationId() { return conversationId; }
	public void setConversationId(String conversationId) { this.conversationId = conversationId; }
	
	public String getAction() { return action; }
	public void setAction(String action) { this.action = action; }
	
	public Object getPayload() { return payload; }
	public void setPayload(Object payload) { this.payload = payload; }
}

