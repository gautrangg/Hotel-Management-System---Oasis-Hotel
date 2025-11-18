import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/chatbot/ChatWindow.css';

const ChatWindow = ({ onClose, conversationId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history from localStorage
    useEffect(() => {
        const loadChatHistory = () => {
            try {
                const savedMessages = localStorage.getItem(`chat_history_${conversationId}`);
                if (savedMessages) {
                    const parsedMessages = JSON.parse(savedMessages);
                    setMessages(parsedMessages);
                } else {
                    // Welcome message for new conversation
                    const welcomeMessage = {
                        role: 'assistant',
                        content: 'Xin chào! 👋 Tôi là trợ lý ảo của Oasis Hotel. Tôi có thể giúp gì cho bạn hôm nay?',
                        timestamp: new Date().toISOString(),
                    };
                    setMessages([welcomeMessage]);
                    saveChatHistory([welcomeMessage]);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                // Fallback to welcome message
                const welcomeMessage = {
                    role: 'assistant',
                    content: 'Xin chào! 👋 Tôi là trợ lý ảo của Oasis Hotel. Tôi có thể giúp gì cho bạn hôm nay?',
                    timestamp: new Date().toISOString(),
                };
                setMessages([welcomeMessage]);
            }
        };

        loadChatHistory();
    }, [conversationId]);

    // Save chat history to localStorage
    const saveChatHistory = (messagesToSave) => {
        try {
            localStorage.setItem(`chat_history_${conversationId}`, JSON.stringify(messagesToSave));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    // Clear chat history
    const clearChatHistory = () => {
        try {
            localStorage.removeItem(`chat_history_${conversationId}`);
            const welcomeMessage = {
                role: 'assistant',
                content: 'Xin chào! 👋 Tôi là trợ lý ảo của Oasis Hotel. Tôi có thể giúp gì cho bạn hôm nay?',
                timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
            saveChatHistory([welcomeMessage]);
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
        setInputMessage('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/v1/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversationId: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const assistantMessage = {
                role: 'assistant',
                content: data.message,
                timestamp: new Date().toISOString(),
            };

            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            saveChatHistory(updatedMessages);

            // Handle navigation action
            if (data.action === 'NAVIGATE' && data.payload) {
                const url = data.payload.url || data.payload;
                const checkInDate = data.payload.checkInDate;
                const checkOutDate = data.payload.checkOutDate;

                // Delay navigation slightly so user sees the message
                setTimeout(() => {
                    if (checkInDate && checkOutDate) {
                        navigate(`${url}?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
                    } else {
                        navigate(url);
                    }
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                timestamp: new Date().toISOString(),
            };
            const errorMessages = [...newMessages, errorMessage];
            setMessages(errorMessages);
            saveChatHistory(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <div className="chat-header-info">
                    <div className="chat-header-avatar">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <div className="chat-header-text">
                        <h3>Oasis Hotel AI</h3>
                        <span className="chat-status">
                            <span className="status-dot"></span>
                            Đang hoạt động
                        </span>
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button 
                        className="chat-clear-btn" 
                        onClick={clearChatHistory}
                        title="Xóa lịch sử chat"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M19 7H18V6C18 4.9 17.1 4 16 4H8C6.9 4 6 4.9 6 6V7H5C4.4 7 4 7.4 4 8S4.4 9 5 9H6V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V9H19C19.6 9 20 8.6 20 8S19.6 7 19 7ZM8 6H16V7H8V6ZM16 18H8V9H16V18Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <button className="chat-close-btn" onClick={onClose}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="chat-window-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            message.role === 'user'
                                ? 'chat-message-user'
                                : 'chat-message-assistant'
                        }`}
                    >
                        <div className="chat-message-content">
                            <div className="chat-message-bubble">
                                <p>{message.content}</p>
                            </div>
                            <span className="chat-message-time">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message chat-message-assistant">
                        <div className="chat-message-content">
                            <div className="chat-message-bubble">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-window-input">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    rows="1"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="chat-send-btn"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;

