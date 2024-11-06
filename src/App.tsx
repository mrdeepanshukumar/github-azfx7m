import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ChatMessage } from './components/ChatMessage';
import { getAIResponse } from './services/ai';

export const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessingStart = () => {
    setChat(prev => [...prev, {
      role: 'assistant',
      content: 'Processing your file... Please wait.'
    }]);
  };

  const handleProcessingComplete = () => {
    setChat(prev => [...prev, {
      role: 'assistant',
      content: 'File processed successfully! You can now ask questions about its content.'
    }]);
  };

  const handleFileUpload = (content: string) => {
    setFileContent(content);
    setChat(prev => [...prev, {
      role: 'system',
      content: `The following is the content of the uploaded file. Please use this as context for answering questions:\n\n${content}`
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessage = { role: 'user', content: message };
    setChat(prev => [...prev, newMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAIResponse([...chat, newMessage]);
      if (aiResponse.trim()) {
        setChat(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}. Please make sure you have configured the OpenRouter API key in your environment variables.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-center">AI Chatbot</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!fileContent && (
          <div className="mb-4">
            <FileUpload 
              onFileUpload={handleFileUpload}
              onProcessingStart={handleProcessingStart}
              onProcessingComplete={handleProcessingComplete}
            />
          </div>
        )}

        {chat.map((msg, index) => (
          msg.role !== 'system' && <ChatMessage key={index} {...msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-3 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-2 bg-blue-500 text-white rounded-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};