package backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.dto.chat.ChatRequestDTO;
import backend.dto.chat.ChatResponseDTO;
import backend.service.GeminiService;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(
	origins = "*", 
	allowedHeaders = "*", 
	methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
	allowCredentials = "false"
)
public class ChatController {

	private final GeminiService geminiService;

	public ChatController(GeminiService geminiService) {
		this.geminiService = geminiService;
	}

	@PostMapping
	public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
		try {
			if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
				return ResponseEntity.badRequest()
						.body(new ChatResponseDTO("Message cannot be blank", request.getConversationId(), null,
								null));
			}

			if (request.getConversationId() == null || request.getConversationId().trim().isEmpty()) {
				return ResponseEntity.badRequest().body(
						new ChatResponseDTO("Conversation ID cannot be empty", request.getConversationId(), null,
								null));
			}

			ChatResponseDTO response = geminiService.chat(request.getConversationId(), request.getMessage());
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
					.body(new ChatResponseDTO("An error occurred: " + e.getMessage(), request.getConversationId(), null,
							null));
		}
	}

	@GetMapping("/health")
	public ResponseEntity<String> health() {
		return ResponseEntity.ok("Chat service is running");
	}
}

