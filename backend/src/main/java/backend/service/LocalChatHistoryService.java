package backend.service;

import backend.dto.chat.ChatMessageDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LocalChatHistoryService {

    // In-memory storage cho chat history
    // Key: conversationId, Value: List of ChatMessageDTO
    private final Map<String, List<ChatMessageDTO>> chatHistories = new ConcurrentHashMap<>();
    
    // Giới hạn số lượng tin nhắn tối đa cho mỗi conversation (tránh memory leak)
    private static final int MAX_MESSAGES_PER_CONVERSATION = 50;

    /**
     * Thêm tin nhắn vào lịch sử chat
     */
    public void addMessage(String conversationId, String role, String content) {
        if (conversationId == null || conversationId.trim().isEmpty()) {
            log.warn("Conversation ID is null or empty");
            return;
        }
        
        ChatMessageDTO message = new ChatMessageDTO();
        message.setRole(role);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        
        chatHistories.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(message);
        
        // Giới hạn số lượng tin nhắn để tránh memory leak
        List<ChatMessageDTO> messages = chatHistories.get(conversationId);
        if (messages.size() > MAX_MESSAGES_PER_CONVERSATION) {
            // Giữ lại MAX_MESSAGES_PER_CONVERSATION tin nhắn gần nhất
            messages.subList(0, messages.size() - MAX_MESSAGES_PER_CONVERSATION).clear();
        }
        
        log.debug("Added message to conversation {}: {} - {}", conversationId, role, content.substring(0, Math.min(50, content.length())));
    }

    /**
     * Lấy lịch sử chat của một conversation
     */
    public List<ChatMessageDTO> getChatHistory(String conversationId) {
        if (conversationId == null || conversationId.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<ChatMessageDTO> history = chatHistories.getOrDefault(conversationId, new ArrayList<>());
        log.debug("Retrieved {} messages for conversation {}", history.size(), conversationId);
        return new ArrayList<>(history); // Return copy để tránh modification
    }

    /**
     * Lấy lịch sử chat gần nhất (giới hạn số lượng)
     */
    public List<ChatMessageDTO> getRecentChatHistory(String conversationId, int limit) {
        List<ChatMessageDTO> history = getChatHistory(conversationId);
        
        if (history.size() <= limit) {
            return history;
        }
        
        // Lấy limit tin nhắn gần nhất
        return history.subList(history.size() - limit, history.size());
    }

    /**
     * Xóa lịch sử chat của một conversation
     */
    public void clearChatHistory(String conversationId) {
        if (conversationId != null && !conversationId.trim().isEmpty()) {
            chatHistories.remove(conversationId);
            log.debug("Cleared chat history for conversation {}", conversationId);
        }
    }

    /**
     * Xóa tất cả lịch sử chat (cleanup)
     */
    public void clearAllChatHistories() {
        chatHistories.clear();
        log.info("Cleared all chat histories");
    }

    /**
     * Lấy số lượng conversation đang active
     */
    public int getActiveConversationCount() {
        return chatHistories.size();
    }

    /**
     * Lấy tổng số tin nhắn trong tất cả conversation
     */
    public int getTotalMessageCount() {
        return chatHistories.values().stream()
                .mapToInt(List::size)
                .sum();
    }

    /**
     * Cleanup các conversation cũ (không có hoạt động trong X giờ)
     */
    public void cleanupOldConversations(int hoursThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        
        chatHistories.entrySet().removeIf(entry -> {
            List<ChatMessageDTO> messages = entry.getValue();
            if (messages.isEmpty()) {
                return true;
            }
            
            // Kiểm tra tin nhắn cuối cùng
            ChatMessageDTO lastMessage = messages.get(messages.size() - 1);
            boolean shouldRemove = lastMessage.getCreatedAt().isBefore(threshold);
            
            if (shouldRemove) {
                log.debug("Removing old conversation: {} (last message: {})", 
                    entry.getKey(), lastMessage.getCreatedAt());
            }
            
            return shouldRemove;
        });
    }
}
