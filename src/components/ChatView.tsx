
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

const ChatView: React.FC<{
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}> = ({ history, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white text-center">Asistente de Chef</h3>
      </div>
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-white'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-md p-3 rounded-lg bg-gray-800 text-white">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="¿Puedo sustituir el pollo por tofu?"
            className="flex-grow w-full p-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors duration-300 text-white resize-none"
            rows={1}
            disabled={isLoading}
            aria-label="Escribe tu pregunta al asistente de chef"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#D4AF37] text-black font-bold p-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c09d2e] flex-shrink-0"
            aria-label="Enviar mensaje"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
