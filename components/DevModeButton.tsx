'use client';

import { useState } from 'react';

interface DevModeButtonProps {
  onFillForm: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function DevModeButton({ 
  onFillForm, 
  position = 'bottom-right' 
}: DevModeButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Chỉ hiển thị trong development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <button
      onClick={onFillForm}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed ${positionClasses[position]} z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95`}
      title="Dev Mode: Auto Fill Form"
    >
      {isHovered ? (
        <span className="flex items-center gap-2 px-2">
          <span className="text-sm font-semibold">Fill Form</span>
          <span className="text-lg">⚡</span>
        </span>
      ) : (
        <span className="text-2xl">🔧</span>
      )}
    </button>
  );
}
