import React from 'react';

type Props = {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

export default function LoadingSpinner({ 
  message = 'Đang tải...', 
  size = 'md',
  color = 'border-orange-600'
}: Props) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-solid ${color} border-r-transparent`}></div>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
