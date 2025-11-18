import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatBot from './ChatBot';

const ChatBotWrapper = () => {
    const location = useLocation();

    // Only show chatbot on customer pages (not on staff pages)
    const isStaffPage = location.pathname.startsWith('/staff');

    if (isStaffPage) {
        return null;
    }

    return <ChatBot />;
};

export default ChatBotWrapper;

