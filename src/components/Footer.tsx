
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 text-center text-gray-500 text-xs border-t border-gray-800">
      <p>&copy; {new Date().getFullYear()} Homsent. Creado con la magia de Gemini.</p>
    </footer>
  );
};

export default Footer;