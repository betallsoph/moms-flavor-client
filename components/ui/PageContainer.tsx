import React from 'react';

type Props = {
  children: React.ReactNode;
  gradient?: string;
};

export default function PageContainer({ 
  children, 
  gradient = 'from-orange-50 via-white to-amber-50' 
}: Props) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient}`}>
      {children}
    </div>
  );
}
