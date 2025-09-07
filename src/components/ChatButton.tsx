
import React from 'react';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
      <button
        onClick={onClick}
        className="relative bg-[#D4AF37] text-black w-16 h-16 rounded-full shadow-lg hover:shadow-[#D4AF37]/50 flex items-center justify-center transform hover:scale-110 transition-all duration-300"
        aria-label="Abrir asistente de chef"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-[#D4AF37]"></span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatButton;
