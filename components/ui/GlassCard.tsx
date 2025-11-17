import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  intensity?: 'light' | 'medium' | 'strong';
};

export default function GlassCard({
  children,
  className = '',
  onClick,
  hover = true,
  intensity = 'medium'
}: Props) {
  const intensityClasses = {
    light: 'bg-white/10 backdrop-blur-sm',
    medium: 'bg-white/20 backdrop-blur-md',
    strong: 'bg-white/30 backdrop-blur-lg',
  };

  const hoverClasses = hover
    ? 'hover:bg-white/30 hover:shadow-2xl hover:scale-[1.02]'
    : '';

  const baseClasses = `
    ${intensityClasses[intensity]}
    border border-white/20
    rounded-2xl
    shadow-xl
    transition-all
    duration-300
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
