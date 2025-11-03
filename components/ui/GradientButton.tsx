import React from 'react';

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  className?: string;
};

export default function GradientButton({
  onClick,
  children,
  type = 'button',
  disabled = false,
  fullWidth = false,
  size = 'md',
  gradient = 'from-orange-600 to-amber-600',
  className = '',
}: Props) {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-3 px-8 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r ${gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
