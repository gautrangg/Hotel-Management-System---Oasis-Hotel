import React from 'react';
import '@assets/chatbot/ChatBotBubble.css';

const ChatBotBubble = ({ onClick, hasUnread }) => {
    return (
        <div className="chatbot-bubble" onClick={onClick}>
            <div className="chatbot-bubble-icon">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="chatbot-icon"
                >
                    <path
                        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
                        fill="currentColor"
                    />
                    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
                </svg>
            </div>
            {hasUnread && <div className="chatbot-bubble-badge"></div>}
            <div className="chatbot-bubble-tooltip">Trò chuyện với AI</div>
        </div>
    );
};

export default ChatBotBubble;

