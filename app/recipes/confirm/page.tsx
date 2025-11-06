'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-12 text-center">
          {/* Celebration Icon */}
          <div className="mb-6 text-6xl animate-bounce">
            ✨
          </div>

          {/* Main Question */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Bạn có muốn thêm các chi tiết để hoàn chỉnh công thức luôn không?
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Các chi tiết như nguyên liệu, các bước thực hiện, hình ảnh, bí kíp, ghi chú... Bạn có thể thêm ngay bây giờ hoặc để sau.
          </p>

          {/* Buttons - Vertical Stack */}
          <div className="space-y-3">
            {/* Primary Button - Larger */}
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              ✍️ Hoàn chỉnh công thức ngay
            </button>

            {/* Secondary Button - Smaller */}
            <button
              onClick={handleSkip}
              className="w-full bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Để sau
            </button>
          </div>

          {/* Footer Hint */}
          <p className="mt-8 text-xs text-gray-400">
            💡 Bạn có thể quay lại thêm chi tiết bất cứ lúc nào
          </p>
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
