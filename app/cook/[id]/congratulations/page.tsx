'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';

export default function CongratulationsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recipe from RecipeService
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
      }
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center max-w-2xl">
          {/* Celebration Animation */}
          <div className="mb-8 animate-bounce">
            <div className="text-9xl inline-block">🎉</div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tuyệt vời!
          </h1>

          <p className="text-2xl text-orange-600 font-semibold mb-12">
            Bạn đã hoàn thành nấu {recipe?.dishName || recipe?.recipeName || 'món ăn'}
          </p>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-8 mb-12">
            <p className="text-lg text-gray-900 mb-4">
              💪 <strong>Bạn vừa hoàn thành một hành trình nấu ăn tuyệt vời!</strong>
            </p>
            <p className="text-gray-700 mb-4">
              Kinh nghiệm bạn ghi lại sẽ giúp bạn nấu tốt hơn lần sau.
            </p>
            <p className="text-gray-600 text-sm">
              Chuẩn bị nấu một công thức khác? Hãy quay lại và chọn một công thức mới!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                // Clear cache to force reload on recipe detail page
                localStorage.removeItem('selectedRecipe');
                router.push(`/recipes/${recipeId}`);
              }}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-shadow text-lg"
            >
              ← Quay lại chi tiết công thức
            </button>
            <button
              onClick={() => router.push('/recipes')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-shadow text-lg"
            >
              🏠 Quay lại danh sách công thức
            </button>
            <button
              onClick={() => router.push('/home')}
              className="bg-gray-200 text-gray-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-300 transition-colors text-lg"
            >
              👋 Về trang chủ
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-8">
            🌟 Hãy nấu thêm nữa để trở thành một đầu bếp giỏi!
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
