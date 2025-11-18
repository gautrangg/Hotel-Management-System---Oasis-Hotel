/**
 * Chatbot API Utilities
 * Helper functions for interacting with the chatbot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Send a message to the chatbot
 * @param {string} message - The user's message
 * @param {string} conversationId - Unique conversation identifier
 * @returns {Promise<Object>} - Chat response
 */
export const sendMessage = async (message, conversationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversationId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Check chatbot service health
 * @returns {Promise<boolean>} - True if service is healthy
 */
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/health`);
        return response.ok;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};

/**
 * Get or create a conversation ID
 * @returns {string} - Conversation ID
 */
export const getConversationId = () => {
    let convId = localStorage.getItem('chatbot_conversation_id');
    if (!convId) {
        convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatbot_conversation_id', convId);
    }
    return convId;
};

/**
 * Clear conversation history (reset conversation)
 */
export const resetConversation = () => {
    localStorage.removeItem('chatbot_conversation_id');
    return getConversationId();
};

export default {
    sendMessage,
    checkHealth,
    getConversationId,
    resetConversation,
};

