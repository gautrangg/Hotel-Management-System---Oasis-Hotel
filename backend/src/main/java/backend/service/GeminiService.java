package backend.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import backend.dto.chat.ChatResponseDTO;
import backend.dto.chat.ChatMessageDTO;
import backend.dto.room.RoomTypeSearchResultDTO;
import backend.entity.Customer;
import backend.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Service
public class GeminiService {

	private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

	@Value("${gemini.api.key}")
	private String apiKey;

	@Value("${gemini.api.url}")
	private String apiUrl;

	private final LocalChatHistoryService chatHistoryService;
	private final RoomSearchService roomSearchService;
	private final CustomerService customerService;
	private final BookingService bookingService;
	private final OkHttpClient httpClient;
	private String hotelContext;

	public GeminiService(LocalChatHistoryService chatHistoryService, RoomSearchService roomSearchService, CustomerService customerService, BookingService bookingService) {
		this.chatHistoryService = chatHistoryService;
		this.roomSearchService = roomSearchService;
		this.customerService = customerService;
		this.bookingService = bookingService;
		this.httpClient = new OkHttpClient.Builder()
				.connectTimeout(30, TimeUnit.SECONDS)
				.writeTimeout(30, TimeUnit.SECONDS)
				.readTimeout(30, TimeUnit.SECONDS)
				.build();
		loadHotelContext();
	}

	private void loadHotelContext() {
		try {
			String path = "src/main/resources/data/hotel-info.txt";
			hotelContext = Files.readString(Paths.get(path), StandardCharsets.UTF_8);
		} catch (IOException e) {
			log.error("Failed to load hotel context", e);
			hotelContext = "Khách sạn Oasis Hotel - Khách sạn 5 sao cao cấp.";
		}
	}

	public ChatResponseDTO chat(String conversationId, String userMessage) {
		try {
			log.info("Processing chat message for conversation {}: {}", conversationId, userMessage);
			
			// Get conversation history from local storage BEFORE adding current message
			List<ChatMessageDTO> history = chatHistoryService.getRecentChatHistory(conversationId, 20);
			// Reverse to get chronological order (oldest first)
			java.util.Collections.reverse(history);

			// Build Gemini request with function calling
			JsonObject requestBody = buildGeminiRequest(history, userMessage);

			// Call Gemini API
			String responseText = callGeminiApi(requestBody);

			// Parse response and handle function calling
			ChatResponseDTO response = parseGeminiResponse(conversationId, responseText);

			// Save both user and assistant messages to local storage AFTER getting response
			chatHistoryService.addMessage(conversationId, "user", userMessage);
			chatHistoryService.addMessage(conversationId, "assistant", response.getMessage());

			response.setConversationId(conversationId);
			return response;
		} catch (Exception e) {
			log.error("Error in chat method for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.", conversationId, null, null);
		}
	}

	private JsonObject buildGeminiRequest(List<ChatMessageDTO> history, String userMessage) {
		JsonObject request = new JsonObject();

		// System instruction (context)
		String systemPrompt = String.format("""
				Bạn là trợ lý ảo thân thiện của Khách sạn Oasis Hotel.
				Nhiệm vụ của bạn là hỗ trợ khách hàng về thông tin khách sạn, dịch vụ, và đặt phòng.
				
				Hãy:
				- Trả lời bằng tiếng Việt một cách lịch sự và chuyên nghiệp
				- Chỉ trả lời các câu hỏi liên quan đến khách sạn
				- Sử dụng thông tin từ CONTEXT bên dưới
				- QUAN TRỌNG: Khi khách hỏi về phòng trống hoặc muốn tìm phòng, BẮT BUỘC phải gọi function 'searchAvailableRooms' ngay lập tức
				- QUAN TRỌNG: Khi khách nói "điều hướng", "đưa đến", "chuyển đến", "đặt phòng" -> BẮT BUỘC gọi function 'navigateToBooking'
				
				CONTEXT (Thông tin khách sạn):
				---
				%s
				---
				
				QUY TẮC FUNCTION CALLING:
				1. Nếu khách hỏi về phòng trống/tìm phòng với ngày cụ thể -> GỌI NGAY searchAvailableRooms
				2. Nếu khách hỏi về giá phòng -> GỌI NGAY searchAvailableRooms với ngày mẫu
				3. Nếu khách nói "điều hướng", "đưa đến trang đặt phòng", "chuyển đến booking", "tôi muốn đặt phòng" -> GỌI NGAY navigateToBooking
				4. Nếu khách hỏi "hôm nay là ngày bao nhiêu", "ngày hiện tại" -> GỌI NGAY getCurrentDate
				5. Nếu khách hỏi về thông tin cá nhân, "tôi là ai", "thông tin của tôi" -> GỌI NGAY identifyCustomer
				6. Nếu khách hỏi về booking, "đặt phòng của tôi", "lịch sử đặt phòng" -> GỌI NGAY getCustomerBookings
				7. KHÔNG BAO GIỜ chỉ trả lời bằng text khi có thể gọi function
				8. Khi gọi navigateToBooking, sử dụng ngày từ conversation history nếu có
				9. QUAN TRỌNG: Khi khách nói "tìm phòng từ hôm nay", "tìm phòng từ ngày mai", "tìm phòng 3 hôm" -> BẮT BUỘC gọi searchAvailableRooms với ngày tính từ hôm nay
				""", hotelContext);

		JsonObject systemInstruction = new JsonObject();
		JsonObject systemInstructionParts = new JsonObject();
		systemInstructionParts.addProperty("text", systemPrompt);
		JsonArray systemInstructionPartsArray = new JsonArray();
		systemInstructionPartsArray.add(systemInstructionParts);
		systemInstruction.add("parts", systemInstructionPartsArray);

		request.add("system_instruction", systemInstruction);

		// Build conversation contents
		JsonArray contents = new JsonArray();

		// Add all history messages
		for (ChatMessageDTO msg : history) {
			JsonObject message = new JsonObject();
			message.addProperty("role", msg.getRole().equals("assistant") ? "model" : "user");

			JsonObject part = new JsonObject();
			part.addProperty("text", msg.getContent());

			JsonArray parts = new JsonArray();
			parts.add(part);
			message.add("parts", parts);

			contents.add(message);
		}

		// Add current user message
		JsonObject userMsg = new JsonObject();
		userMsg.addProperty("role", "user");
		JsonObject userPart = new JsonObject();
		userPart.addProperty("text", userMessage);
		JsonArray userParts = new JsonArray();
		userParts.add(userPart);
		userMsg.add("parts", userParts);
		contents.add(userMsg);

		request.add("contents", contents);

		// Add function declarations
		JsonArray tools = new JsonArray();
		JsonObject tool = new JsonObject();
		JsonArray functionDeclarations = new JsonArray();

		// Function 1: Search available rooms
		JsonObject searchRoomsFunction = new JsonObject();
		searchRoomsFunction.addProperty("name", "searchAvailableRooms");
		searchRoomsFunction.addProperty("description",
				"Tìm kiếm phòng khách sạn còn trống theo ngày check-in, check-out và từ khóa. BẮT BUỘC gọi function này khi khách hỏi về phòng trống, giá phòng, hoặc muốn tìm phòng cho ngày cụ thể. QUAN TRỌNG: Khi khách nói 'tìm phòng từ hôm nay', 'tìm phòng từ ngày mai', 'tìm phòng 3 hôm' -> TÍNH TOÁN ngày từ hôm nay và gọi function này.");

		JsonObject searchRoomsParams = new JsonObject();
		searchRoomsParams.addProperty("type", "object");

		JsonObject searchRoomsProperties = new JsonObject();

		JsonObject checkInDateProp = new JsonObject();
		checkInDateProp.addProperty("type", "string");
		checkInDateProp.addProperty("description", "Ngày check-in, định dạng YYYY-MM-DD");
		searchRoomsProperties.add("checkInDate", checkInDateProp);

		JsonObject checkOutDateProp = new JsonObject();
		checkOutDateProp.addProperty("type", "string");
		checkOutDateProp.addProperty("description", "Ngày check-out, định dạng YYYY-MM-DD");
		searchRoomsProperties.add("checkOutDate", checkOutDateProp);

		JsonObject keywordsProp = new JsonObject();
		keywordsProp.addProperty("type", "array");
		JsonObject keywordsItems = new JsonObject();
		keywordsItems.addProperty("type", "string");
		keywordsProp.add("items", keywordsItems);
		keywordsProp.addProperty("description",
				"Từ khóa tìm kiếm (VD: 'deluxe', 'suite', 'family'). Có thể để trống để tìm tất cả.");
		searchRoomsProperties.add("keywords", keywordsProp);

		searchRoomsParams.add("properties", searchRoomsProperties);

		JsonArray requiredParams = new JsonArray();
		requiredParams.add("checkInDate");
		requiredParams.add("checkOutDate");
		searchRoomsParams.add("required", requiredParams);

		searchRoomsFunction.add("parameters", searchRoomsParams);
		functionDeclarations.add(searchRoomsFunction);

		// Function 2: Navigate to booking page
		JsonObject navigateFunction = new JsonObject();
		navigateFunction.addProperty("name", "navigateToBooking");
		navigateFunction.addProperty("description",
				"Điều hướng người dùng đến trang đặt phòng với thông tin check-in, check-out đã được cung cấp. BẮT BUỘC gọi khi khách nói 'điều hướng', 'đưa đến trang đặt phòng', 'chuyển đến booking', 'tôi muốn đặt phòng'. Sử dụng ngày từ conversation history nếu có.");

		JsonObject navigateParams = new JsonObject();
		navigateParams.addProperty("type", "object");

		JsonObject navigateProperties = new JsonObject();

		JsonObject navCheckInProp = new JsonObject();
		navCheckInProp.addProperty("type", "string");
		navCheckInProp.addProperty("description", "Ngày check-in, định dạng YYYY-MM-DD");
		navigateProperties.add("checkInDate", navCheckInProp);

		JsonObject navCheckOutProp = new JsonObject();
		navCheckOutProp.addProperty("type", "string");
		navCheckOutProp.addProperty("description", "Ngày check-out, định dạng YYYY-MM-DD");
		navigateProperties.add("checkOutDate", navCheckOutProp);

		navigateParams.add("properties", navigateProperties);

		// Make parameters optional since we can extract from history
		JsonArray navRequiredParams = new JsonArray();
		// No required parameters - we can extract from history
		navigateParams.add("required", navRequiredParams);

		navigateFunction.add("parameters", navigateParams);
		functionDeclarations.add(navigateFunction);

		// Function 3: Get current date
		JsonObject currentDateFunction = new JsonObject();
		currentDateFunction.addProperty("name", "getCurrentDate");
		currentDateFunction.addProperty("description", "Lấy ngày hiện tại thời gian thực. Gọi khi khách hỏi 'hôm nay là ngày bao nhiêu', 'ngày hiện tại'.");

		JsonObject currentDateParams = new JsonObject();
		currentDateParams.addProperty("type", "object");
		currentDateParams.add("properties", new JsonObject());
		currentDateParams.add("required", new JsonArray());
		currentDateFunction.add("parameters", currentDateParams);
		functionDeclarations.add(currentDateFunction);

		// Function 4: Calculate dates from relative terms
		JsonObject calculateDatesFunction = new JsonObject();
		calculateDatesFunction.addProperty("name", "calculateDatesFromRelative");
		calculateDatesFunction.addProperty("description", "Tính toán ngày check-in và check-out từ các cụm từ tương đối như 'hôm nay', 'ngày mai', '3 hôm sau'. Gọi khi khách nói 'tìm phòng từ hôm nay', 'tìm phòng từ ngày mai', 'tìm phòng 3 hôm'.");

		JsonObject calculateDatesParams = new JsonObject();
		calculateDatesParams.addProperty("type", "object");

		JsonObject calculateDatesProperties = new JsonObject();
		JsonObject startTermProp = new JsonObject();
		startTermProp.addProperty("type", "string");
		startTermProp.addProperty("description", "Cụm từ chỉ ngày bắt đầu: 'hôm nay', 'ngày mai', 'ngày kia'");
		calculateDatesProperties.add("startTerm", startTermProp);

		JsonObject durationProp = new JsonObject();
		durationProp.addProperty("type", "string");
		durationProp.addProperty("description", "Thời gian lưu trú: '1 hôm', '2 hôm', '3 hôm', '1 tuần'");
		calculateDatesProperties.add("duration", durationProp);

		calculateDatesParams.add("properties", calculateDatesProperties);
		calculateDatesParams.add("required", new JsonArray());
		calculateDatesFunction.add("parameters", calculateDatesParams);
		functionDeclarations.add(calculateDatesFunction);

		// Function 5: Identify customer
		JsonObject identifyCustomerFunction = new JsonObject();
		identifyCustomerFunction.addProperty("name", "identifyCustomer");
		identifyCustomerFunction.addProperty("description", "Xác định thông tin khách hàng từ conversation. Gọi khi khách hỏi 'tôi là ai', 'thông tin của tôi', 'profile của tôi'.");

		JsonObject identifyCustomerParams = new JsonObject();
		identifyCustomerParams.addProperty("type", "object");

		JsonObject identifyCustomerProperties = new JsonObject();
		JsonObject customerIdProp = new JsonObject();
		customerIdProp.addProperty("type", "string");
		customerIdProp.addProperty("description", "ID khách hàng (nếu có)");
		identifyCustomerProperties.add("customerId", customerIdProp);

		identifyCustomerParams.add("properties", identifyCustomerProperties);
		identifyCustomerParams.add("required", new JsonArray());
		identifyCustomerFunction.add("parameters", identifyCustomerParams);
		functionDeclarations.add(identifyCustomerFunction);

		// Function 6: Get customer bookings
		JsonObject getBookingsFunction = new JsonObject();
		getBookingsFunction.addProperty("name", "getCustomerBookings");
		getBookingsFunction.addProperty("description", "Lấy lịch sử đặt phòng của khách hàng. Gọi khi khách hỏi 'đặt phòng của tôi', 'lịch sử booking', 'phòng đã đặt'.");

		JsonObject getBookingsParams = new JsonObject();
		getBookingsParams.addProperty("type", "object");

		JsonObject getBookingsProperties = new JsonObject();
		JsonObject bookingsCustomerIdProp = new JsonObject();
		bookingsCustomerIdProp.addProperty("type", "string");
		bookingsCustomerIdProp.addProperty("description", "ID khách hàng (nếu có)");
		getBookingsProperties.add("customerId", bookingsCustomerIdProp);

		getBookingsParams.add("properties", getBookingsProperties);
		getBookingsParams.add("required", new JsonArray());
		getBookingsFunction.add("parameters", getBookingsParams);
		functionDeclarations.add(getBookingsFunction);

		tool.add("function_declarations", functionDeclarations);
		tools.add(tool);
		request.add("tools", tools);

		// Generation config
		JsonObject generationConfig = new JsonObject();
		generationConfig.addProperty("temperature", 0.7);
		generationConfig.addProperty("topK", 40);
		generationConfig.addProperty("topP", 0.95);
		generationConfig.addProperty("maxOutputTokens", 1024);
		request.add("generationConfig", generationConfig);

		return request;
	}

	private String callGeminiApi(JsonObject requestBody) {
		try {
			String url = apiUrl + "?key=" + apiKey;

			RequestBody body = RequestBody.create(requestBody.toString(),
					MediaType.parse("application/json; charset=utf-8"));

			Request request = new Request.Builder().url(url).post(body).build();

			try (Response response = httpClient.newCall(request).execute()) {
				if (!response.isSuccessful()) {
					String errorBody = response.body() != null ? response.body().string() : "No error body";
					log.error("Gemini API error: " + response.code() + " - " + errorBody);
					throw new RuntimeException("Gemini API call failed");
				}
				String responseBody = response.body() != null ? response.body().string() : "";
				return responseBody;
			}
		} catch (Exception e) {
			log.error("Error calling Gemini API", e);
			throw new RuntimeException("Failed to call Gemini API: " + e.getMessage());
		}
	}

	private ChatResponseDTO parseGeminiResponse(String conversationId, String responseText) {
		try {
			log.debug("Parsing Gemini response for conversation {}: {}", conversationId, responseText);
			
			JsonObject jsonResponse = JsonParser.parseString(responseText).getAsJsonObject();

			if (!jsonResponse.has("candidates") || jsonResponse.getAsJsonArray("candidates").isEmpty()) {
				log.warn("No candidates in Gemini response for conversation {}", conversationId);
				return new ChatResponseDTO("Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.", conversationId,
						null, null);
			}

			JsonObject firstCandidate = jsonResponse.getAsJsonArray("candidates").get(0).getAsJsonObject();
			JsonObject content = firstCandidate.getAsJsonObject("content");
			JsonArray parts = content.getAsJsonArray("parts");

			if (parts.isEmpty()) {
				log.warn("No parts in Gemini response for conversation {}", conversationId);
				return new ChatResponseDTO("Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.", conversationId,
						null, null);
			}

			JsonObject firstPart = parts.get(0).getAsJsonObject();

			// Check if it's a function call
			if (firstPart.has("functionCall")) {
				JsonObject functionCall = firstPart.getAsJsonObject("functionCall");
				String functionName = functionCall.get("name").getAsString();
				JsonObject args = functionCall.getAsJsonObject("args");
				
				log.info("Function call detected: {} with args: {}", functionName, args);
				return handleFunctionCall(conversationId, functionName, args);
			}

			// Regular text response
			if (firstPart.has("text")) {
				String text = firstPart.get("text").getAsString();
				log.debug("Text response for conversation {}: {}", conversationId, text);
				return new ChatResponseDTO(text, conversationId, null, null);
			}

			log.warn("Unknown response format for conversation {}", conversationId);
			return new ChatResponseDTO("Xin lỗi, tôi không hiểu yêu cầu của bạn.", conversationId, null, null);

		} catch (Exception e) {
			log.error("Error parsing Gemini response for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi xử lý phản hồi.", conversationId, null, null);
		}
	}

	private ChatResponseDTO handleFunctionCall(String conversationId, String functionName, JsonObject args) {
		try {
			log.info("Handling function call: {} for conversation {}", functionName, conversationId);
			
			return switch (functionName) {
				case "searchAvailableRooms" -> handleSearchAvailableRooms(conversationId, args);
				case "navigateToBooking" -> handleNavigateToBooking(conversationId, args);
				case "getCurrentDate" -> handleGetCurrentDate(conversationId, args);
				case "calculateDatesFromRelative" -> handleCalculateDatesFromRelative(conversationId, args);
				case "identifyCustomer" -> handleIdentifyCustomer(conversationId, args);
				case "getCustomerBookings" -> handleGetCustomerBookings(conversationId, args);
				default -> {
					log.warn("Unknown function call: {} for conversation {}", functionName, conversationId);
					yield new ChatResponseDTO("Xin lỗi, tôi không thể thực hiện hành động này.", conversationId, null, null);
				}
			};
		} catch (Exception e) {
			log.error("Error handling function call: {} for conversation {}", functionName, conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi thực hiện hành động.", conversationId, null, null);
		}
	}

	private ChatResponseDTO handleSearchAvailableRooms(String conversationId, JsonObject args) {
		try {
			log.info("Searching available rooms for conversation {} with args: {}", conversationId, args);
			
			String checkInDateStr = args.get("checkInDate").getAsString();
			String checkOutDateStr = args.get("checkOutDate").getAsString();

			LocalDate checkInDate = LocalDate.parse(checkInDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
			LocalDate checkOutDate = LocalDate.parse(checkOutDateStr, DateTimeFormatter.ISO_LOCAL_DATE);

			List<String> keywords = new ArrayList<>();
			if (args.has("keywords") && !args.get("keywords").isJsonNull()) {
				JsonArray keywordsArray = args.getAsJsonArray("keywords");
				for (int i = 0; i < keywordsArray.size(); i++) {
					keywords.add(keywordsArray.get(i).getAsString());
				}
			}

			log.info("Searching rooms from {} to {} with keywords: {}", checkInDate, checkOutDate, keywords);

			List<RoomTypeSearchResultDTO> availableRooms = roomSearchService.searchAvailableRoomTypes(checkInDate,
					checkOutDate, keywords);

			log.info("Found {} available room types for conversation {}", availableRooms.size(), conversationId);

			if (availableRooms.isEmpty()) {
				String message = String.format(
						"Rất tiếc, hiện tại không có phòng trống từ %s đến %s. Bạn có thể thử tìm kiếm với ngày khác không?",
						checkInDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
						checkOutDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
				return new ChatResponseDTO(message, conversationId, null, null);
			}

			// Format response message
			StringBuilder message = new StringBuilder();
			message.append(String.format("Tuyệt vời! Tôi tìm thấy %d loại phòng còn trống từ %s đến %s:\n\n",
					availableRooms.size(),
					checkInDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
					checkOutDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));

			for (RoomTypeSearchResultDTO room : availableRooms) {
				message.append(String.format("🏨 %s\n", room.getRoomTypeName()));
				message.append(String.format("   - Giá: %,d VNĐ/đêm\n", room.getPrice().longValue()));
				message.append(String.format("   - Sức chứa: %d người lớn, %d trẻ em\n", room.getAdult(),
						room.getChildren()));
				message.append(String.format("   - Số phòng còn trống: %d\n", room.getAvailableRooms().size()));
				if (room.getDescription() != null && !room.getDescription().isEmpty()) {
					String shortDesc = room.getDescription().length() > 100
							? room.getDescription().substring(0, 100) + "..."
							: room.getDescription();
					message.append(String.format("   - Mô tả: %s\n", shortDesc));
				}
				message.append("\n");
			}

			message.append("Bạn có muốn đặt phòng không? Tôi có thể hướng dẫn bạn đến trang đặt phòng! 😊");

			return new ChatResponseDTO(message.toString(), conversationId, null, null);
		} catch (Exception e) {
			log.error("Error in handleSearchAvailableRooms for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi tìm kiếm phòng.", conversationId, null, null);
		}
	}

	private ChatResponseDTO handleNavigateToBooking(String conversationId, JsonObject args) {
		try {
			log.info("Handling navigation to booking for conversation {} with args: {}", conversationId, args);
			
			String checkInDateStr;
			String checkOutDateStr;
			
			// Try to get dates from args first
			if (args.has("checkInDate") && args.has("checkOutDate")) {
				checkInDateStr = args.get("checkInDate").getAsString();
				checkOutDateStr = args.get("checkOutDate").getAsString();
				log.info("Using dates from args: {} to {}", checkInDateStr, checkOutDateStr);
			} else {
				// Extract dates from conversation history
				List<ChatMessageDTO> history = chatHistoryService.getChatHistory(conversationId);
				String[] extractedDates = extractDatesFromHistory(history);
				
				if (extractedDates != null && extractedDates.length == 2) {
					checkInDateStr = extractedDates[0];
					checkOutDateStr = extractedDates[1];
					log.info("Extracted dates from history: {} to {}", checkInDateStr, checkOutDateStr);
				} else {
					log.warn("Could not extract dates from history for conversation {}, using default dates", conversationId);
					// Use default dates for testing
					checkInDateStr = "2025-10-27";
					checkOutDateStr = "2025-10-30";
				}
			}

			Map<String, String> payload = new HashMap<>();
			payload.put("checkInDate", checkInDateStr);
			payload.put("checkOutDate", checkOutDateStr);
			payload.put("url", "/search");

			String message = "Tôi sẽ đưa bạn đến trang tìm kiếm phòng ngay bây giờ! 🎉";

			return new ChatResponseDTO(message, conversationId, "NAVIGATE", payload);
		} catch (Exception e) {
			log.error("Error in handleNavigateToBooking for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi điều hướng đến trang đặt phòng.", conversationId, null, null);
		}
	}
	
	/**
	 * Extract check-in and check-out dates from conversation history
	 */
	private String[] extractDatesFromHistory(List<ChatMessageDTO> history) {
		try {
			log.info("Extracting dates from history with {} messages", history.size());
			
			// Look for date patterns in recent messages
			for (int i = history.size() - 1; i >= Math.max(0, history.size() - 10); i--) {
				ChatMessageDTO msg = history.get(i);
				if (msg.getRole().equals("user")) {
					String content = msg.getContent().toLowerCase();
					log.debug("Checking message: {}", content);
					
					// Pattern 1: "27/10/2025" format
					if (content.contains("/") && content.contains("2025")) {
						String[] dates = extractDatesFromText(content);
						if (dates != null && dates.length == 2) {
							log.info("Found dates from text pattern: {} to {}", dates[0], dates[1]);
							return dates;
						}
					}
					
					// Pattern 2: "2025-10-27" format
					if (content.contains("2025-10-")) {
						String[] dates = extractDatesFromISOFormat(content);
						if (dates != null && dates.length == 2) {
							log.info("Found dates from ISO format: {} to {}", dates[0], dates[1]);
							return dates;
						}
					}
				}
			}
			
			// If no dates found, return null to trigger error message
			log.warn("No dates found in conversation history");
			return null;
			
		} catch (Exception e) {
			log.error("Error extracting dates from history", e);
			return null;
		}
	}
	
	/**
	 * Extract dates from text like "3 ngày từ 27/10/2025" or "27/10/2025 đến 30/10/2025"
	 */
	private String[] extractDatesFromText(String text) {
		try {
			log.debug("Extracting dates from text: {}", text);
			
			// Pattern 1: "3 ngày từ 27/10/2025" - calculate end date
			Pattern pattern1 = Pattern.compile("(\\d+)\\s*ngày\\s*từ\\s*(\\d{1,2})/(\\d{1,2})/(\\d{4})");
			Matcher matcher1 = pattern1.matcher(text);
			
			if (matcher1.find()) {
				int days = Integer.parseInt(matcher1.group(1));
				String day = matcher1.group(2);
				String month = matcher1.group(3);
				String year = matcher1.group(4);
				
				// Calculate end date
				LocalDate startDate = LocalDate.of(Integer.parseInt(year), Integer.parseInt(month), Integer.parseInt(day));
				LocalDate endDate = startDate.plusDays(days);
				
				String date1 = String.format("%s-%s-%s", year, month, day);
				String date2 = String.format("%04d-%02d-%02d", endDate.getYear(), endDate.getMonthValue(), endDate.getDayOfMonth());
				
				log.info("Calculated dates from '{} days from' pattern: {} to {}", days, date1, date2);
				return new String[]{date1, date2};
			}
			
			// Pattern 2: "27/10/2025 đến 30/10/2025" or "27/10/2025-30/10/2025"
			Pattern pattern2 = Pattern.compile("(\\d{1,2})/(\\d{1,2})/(\\d{4})[\\s-đến]*?(\\d{1,2})/(\\d{1,2})/(\\d{4})");
			Matcher matcher2 = pattern2.matcher(text);
			
			if (matcher2.find()) {
				String day1 = matcher2.group(1);
				String month1 = matcher2.group(2);
				String year1 = matcher2.group(3);
				String day2 = matcher2.group(4);
				String month2 = matcher2.group(5);
				String year2 = matcher2.group(6);
				
				// Convert to ISO format
				String date1 = String.format("%s-%s-%s", year1, month1, day1);
				String date2 = String.format("%s-%s-%s", year2, month2, day2);
				
				log.info("Found dates from range pattern: {} to {}", date1, date2);
				return new String[]{date1, date2};
			}
			
			log.debug("No date pattern matched in text: {}", text);
			return null;
		} catch (Exception e) {
			log.error("Error extracting dates from text: {}", text, e);
			return null;
		}
	}
	
	/**
	 * Extract dates from ISO format like "2025-10-28" to "2025-10-31"
	 */
	private String[] extractDatesFromISOFormat(String text) {
		try {
			// Pattern: YYYY-MM-DD to YYYY-MM-DD
			Pattern pattern = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})[\\s-]*?(\\d{4}-\\d{2}-\\d{2})");
			Matcher matcher = pattern.matcher(text);
			
			if (matcher.find()) {
				return new String[]{matcher.group(1), matcher.group(2)};
			}
			
			return null;
		} catch (Exception e) {
			log.error("Error extracting dates from ISO format: {}", text, e);
			return null;
		}
	}
	
	/**
	 * Handle get current date function
	 */
	private ChatResponseDTO handleGetCurrentDate(String conversationId, @SuppressWarnings("unused") JsonObject args) {
		try {
			log.info("Getting current date for conversation {}", conversationId);
			
			LocalDate today = LocalDate.now();
			String formattedDate = today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
			String dayOfWeek = today.getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.forLanguageTag("vi"));
			
			String message = String.format("Hôm nay là %s, ngày %s", dayOfWeek, formattedDate);
			
			return new ChatResponseDTO(message, conversationId, null, null);
		} catch (Exception e) {
			log.error("Error in handleGetCurrentDate for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi lấy ngày hiện tại.", conversationId, null, null);
		}
	}
	
	/**
	 * Handle calculate dates from relative terms function
	 */
	private ChatResponseDTO handleCalculateDatesFromRelative(String conversationId, @SuppressWarnings("unused") JsonObject args) {
		try {
			log.info("Calculating dates from relative terms for conversation {}", conversationId);
			
			LocalDate today = LocalDate.now();
			String startTerm = args.has("startTerm") ? args.get("startTerm").getAsString() : "hôm nay";
			String duration = args.has("duration") ? args.get("duration").getAsString() : "1 hôm";
			
			LocalDate checkInDate;
			LocalDate checkOutDate;
			
			// Calculate check-in date
			switch (startTerm.toLowerCase()) {
				case "hôm nay":
					checkInDate = today;
					break;
				case "ngày mai":
					checkInDate = today.plusDays(1);
					break;
				case "ngày kia":
					checkInDate = today.plusDays(2);
					break;
				default:
					checkInDate = today;
			}
			
			// Calculate check-out date based on duration
			int days = 1;
			if (duration.contains("hôm")) {
				Pattern pattern = Pattern.compile("(\\d+)\\s*hôm");
				Matcher matcher = pattern.matcher(duration);
				if (matcher.find()) {
					days = Integer.parseInt(matcher.group(1));
				}
			} else if (duration.contains("tuần")) {
				Pattern pattern = Pattern.compile("(\\d+)\\s*tuần");
				Matcher matcher = pattern.matcher(duration);
				if (matcher.find()) {
					days = Integer.parseInt(matcher.group(1)) * 7;
				}
			}
			
			checkOutDate = checkInDate.plusDays(days);
			
			String checkInStr = checkInDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
			String checkOutStr = checkOutDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
			
			log.info("Calculated dates: {} to {}", checkInStr, checkOutStr);
			
			// Now call searchAvailableRooms with calculated dates
			JsonObject searchArgs = new JsonObject();
			searchArgs.addProperty("checkInDate", checkInStr);
			searchArgs.addProperty("checkOutDate", checkOutStr);
			
			return handleSearchAvailableRooms(conversationId, searchArgs);
			
		} catch (Exception e) {
			log.error("Error in handleCalculateDatesFromRelative for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi tính toán ngày.", conversationId, null, null);
		}
	}
	
	/**
	 * Handle identify customer function
	 */
	private ChatResponseDTO handleIdentifyCustomer(String conversationId, @SuppressWarnings("unused") JsonObject args) {
		try {
			log.info("Identifying customer for conversation {}", conversationId);
			
			// Try to extract customer info from conversation history
			List<ChatMessageDTO> history = chatHistoryService.getChatHistory(conversationId);
			log.info("Extracting customer from {} messages in conversation {}", history.size(), conversationId);
			Customer customer = extractCustomerFromHistory(history);
			
			if (customer != null) {
				String message = String.format("""
					Xin chào %s! 👋
					
					Thông tin của bạn:
					📧 Email: %s
					📱 Số điện thoại: %s
					🆔 CCCD: %s
					📍 Địa chỉ: %s
					
					Tôi có thể giúp gì thêm cho bạn không?
					""", 
					customer.getFullName(),
					customer.getEmail(),
					customer.getPhone(),
					customer.getCitizenId(),
					customer.getAddress() != null ? customer.getAddress() : "Chưa cập nhật"
				);
				
				return new ChatResponseDTO(message, conversationId, null, null);
			} else {
				return new ChatResponseDTO("""
					Xin chào! 👋
					
					Hiện tại tôi chưa thể xác định được thông tin của bạn.
					Để tôi có thể hỗ trợ bạn tốt hơn, bạn có thể:
					- Đăng nhập vào tài khoản của mình
					- Hoặc cung cấp email/số điện thoại để tôi tìm kiếm thông tin
					
					Tôi có thể giúp gì khác cho bạn không?
					""", conversationId, null, null);
			}
		} catch (Exception e) {
			log.error("Error in handleIdentifyCustomer for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi xác định thông tin khách hàng.", conversationId, null, null);
		}
	}
	
	/**
	 * Handle get customer bookings function
	 */
	private ChatResponseDTO handleGetCustomerBookings(String conversationId, @SuppressWarnings("unused") JsonObject args) {
		try {
			log.info("Getting customer bookings for conversation {}", conversationId);
			
			// Try to extract customer info from conversation history
			List<ChatMessageDTO> history = chatHistoryService.getChatHistory(conversationId);
			Customer customer = extractCustomerFromHistory(history);
			
			if (customer != null) {
				List<Booking> bookings = bookingService.getBookingsByCustomerId(customer.getCustomerId());
				
				if (bookings.isEmpty()) {
					return new ChatResponseDTO(String.format("""
						Xin chào %s! 👋
						
						Hiện tại bạn chưa có đặt phòng nào tại khách sạn của chúng tôi.
						
						Bạn có muốn đặt phòng không? Tôi có thể giúp bạn tìm phòng phù hợp!
						""", customer.getFullName()), conversationId, null, null);
				}
				
				StringBuilder message = new StringBuilder();
				message.append(String.format("Xin chào %s! 👋\n\n", customer.getFullName()));
				message.append(String.format("Bạn có %d đặt phòng:\n\n", bookings.size()));
				
				for (int i = 0; i < bookings.size(); i++) {
					Booking booking = bookings.get(i);
					message.append(String.format("%d. 📅 Booking #%d\n", i + 1, booking.getBookingId()));
					message.append(String.format("   - Ngày nhận phòng: %s\n", 
						booking.getCheckinDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
					message.append(String.format("   - Ngày trả phòng: %s\n", 
						booking.getCheckoutDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
					message.append(String.format("   - Trạng thái: %s\n", booking.getStatus()));
					message.append(String.format("   - Tiền cọc: %,d VNĐ\n\n", booking.getDeposit() != null ? booking.getDeposit().longValue() : 0));
				}
				
				message.append("Bạn có cần hỗ trợ gì thêm về các đặt phòng này không?");
				
				return new ChatResponseDTO(message.toString(), conversationId, null, null);
			} else {
				return new ChatResponseDTO("""
					Xin chào! 👋
					
					Để xem lịch sử đặt phòng, tôi cần xác định được thông tin của bạn.
					Bạn có thể:
					- Đăng nhập vào tài khoản của mình
					- Hoặc cung cấp email/số điện thoại để tôi tìm kiếm
					
					Tôi có thể giúp gì khác cho bạn không?
					""", conversationId, null, null);
			}
		} catch (Exception e) {
			log.error("Error in handleGetCustomerBookings for conversation {}", conversationId, e);
			return new ChatResponseDTO("Xin lỗi, đã xảy ra lỗi khi lấy lịch sử đặt phòng.", conversationId, null, null);
		}
	}
	
	/**
	 * Extract customer information from conversation history
	 */
	private Customer extractCustomerFromHistory(List<ChatMessageDTO> history) {
		try {
			log.info("Extracting customer from {} messages", history.size());
			// Look for email or phone patterns in conversation
			for (ChatMessageDTO msg : history) {
				if (msg.getRole().equals("user")) {
					String content = msg.getContent().toLowerCase();
					log.debug("Checking user message: {}", content);
					
					// Pattern 1: Email
					Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
					Matcher emailMatcher = emailPattern.matcher(content);
					if (emailMatcher.find()) {
						String email = emailMatcher.group();
						log.info("Found email in conversation: {}", email);
						Customer customer = customerService.getByEmail(email);
						if (customer != null) {
							log.info("Found customer with email {}: {}", email, customer.getFullName());
							return customer;
						} else {
							log.warn("No customer found with email: {}", email);
						}
					}
					
					// Pattern 2: Phone number
					Pattern phonePattern = Pattern.compile("\\b(0[35789])[0-9]{8}\\b");
					Matcher phoneMatcher = phonePattern.matcher(content);
					if (phoneMatcher.find()) {
						String phone = phoneMatcher.group();
						log.info("Found phone in conversation: {}", phone);
						return customerService.getByPhone(phone);
					}
				}
			}
			
			return null;
		} catch (Exception e) {
			log.error("Error extracting customer from history", e);
			return null;
		}
	}
}

