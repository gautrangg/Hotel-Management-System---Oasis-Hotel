import React, { useState, useEffect } from 'react';
import ChatBotBubble from './ChatBotBubble';
import ChatWindow from './ChatWindow';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    useEffect(() => {
        // Get or create conversation ID
        let convId = localStorage.getItem('chatbot_conversation_id');
        if (!convId) {
            // Generate a simple UUID
            convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot_conversation_id', convId);
        }
        setConversationId(convId);
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    if (!conversationId) {
        return null; // Don't render until conversation ID is ready
    }

    return (
        <>
            {isOpen && (
                <ChatWindow
                    onClose={() => setIsOpen(false)}
                    conversationId={conversationId}
                />
            )}
            {!isOpen && <ChatBotBubble onClick={toggleChat} />}
        </>
    );
};

export default ChatBot;

