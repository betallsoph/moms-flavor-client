'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';

function ConfirmRecipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');

  const handleComplete = () => {
    // Navigate to recipe completion page (ingredients)
    if (recipeId) {
      router.push(`/recipes/${recipeId}/complete`);
    }
  };

  const handleSkip = () => {
    // Navigate back to recipes list
    router.push('/recipes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-12 text-center">
          {/* Sticker Image */}
          <div className="mb-6 flex justify-center animate-bounce">
            <Image
              src="/assets/sticker2/bò kho.png"
              alt="Celebration"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Main Question */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
            Bạn có muốn thêm các chi tiết để hoàn chỉnh công thức luôn không?
          </h1>

          {/* Buttons - Vertical Stack */}
          <div className="space-y-3">
            {/* Primary Button - Larger */}
            <button
              onClick={handleComplete}
              className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
            >
              Hoàn chỉnh công thức ngay
            </button>

            {/* Secondary Button - Smaller */}
            <button
              onClick={handleSkip}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmRecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmRecipeContent />
    </Suspense>
  );
}
