import React from 'react';

type Props = {
  children: React.ReactNode;
  variant?: 'white' | 'light-gray';
};

export default function PageContainer({
  children,
  variant = 'white'
}: Props) {
  const bgClass = variant === 'light-gray'
    ? 'bg-gray-50'
    : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} relative`}>
      {children}
    </div>
  );
}
