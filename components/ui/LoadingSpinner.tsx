import React from 'react';
import Lottie from 'lottie-react';
import cookingAnimation from '@/assets/lottie/cooking-loading.json';

type Props = {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function LoadingSpinner({
  message = 'Đang tải...',
  size = 'md',
}: Props) {
  const sizeValues: Record<NonNullable<Props['size']>, number> = {
    sm: 80,
    md: 140,
    lg: 200,
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <Lottie
          animationData={cookingAnimation}
          loop
          autoplay
          style={{ width: sizeValues[size], height: sizeValues[size], margin: '0 auto' }}
        />
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
