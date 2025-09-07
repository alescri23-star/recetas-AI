
import React from 'react';

interface SpinnerProps {
  message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#D4AF37]"></div>
      <p className="mt-4 text-lg text-gray-300 font-semibold">{message}</p>
    </div>
  );
};

export default Spinner;
