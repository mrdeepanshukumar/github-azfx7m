import React from 'react';

interface ChatMessageProps {
  role: string;
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-lg max-w-[80%] ${
        isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
      }`}>
        {content}
      </div>
    </div>
  );
};