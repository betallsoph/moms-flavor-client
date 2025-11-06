'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  difficulty?: string;
  cookingTime?: string;
  description?: string;
  instructor?: string;
  createdAt: string;
}

export default function SelectToCookPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      const data = JSON.parse(localStorage.getItem('recipes') || '[]');
      setRecipes(data);
      setLoading(false);
    };
    loadRecipes();
  }, []);

  const getDifficultyText = (level?: string) => {
    switch (level) {
      case 'very_easy': return '⭐ Rất dễ';
      case 'easy': return '⭐⭐ Dễ';
      case 'medium': return '⭐⭐⭐ Trung bình';
      case 'hard': return '⭐⭐⭐⭐ Khó';
      case 'very_hard': return '⭐⭐⭐⭐⭐ Rất khó';
      default: return 'N/A';
    }
  };

  const getCookingTimeText = (time?: string) => {
    switch (time) {
      case 'very_fast': return '⚡ Rất nhanh';
      case 'fast': return '⏱️ Nhanh';
      case 'medium': return '🕐 Trung bình';
      case 'slow': return '⏳ Chậm';
      case 'very_slow': return '🕰️ Rất chậm';
      default: return 'N/A';
    }
  };

  return (
    <PageContainer>
      <PageHeader
        icon="🍳"
        title="Chọn một món để bắt đầu nấu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push('/home'),
        }}
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <LoadingSpinner message="Đang tải công thức..." />
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📖</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có công thức nào
              </h3>
              <p className="text-gray-500 mb-8">
                Hãy tạo công thức đầu tiên của bạn!
              </p>
              <button
                onClick={() => router.push('/recipes/new')}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                Tạo công thức đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => router.push(`/cook/${recipe.id}/ingredients`)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-orange-100 hover:border-orange-300 overflow-hidden transition-all group text-left"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4 border-b border-orange-200 min-h-[120px]">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1">
                    {recipe.dishName || recipe.recipeName}
                  </h3>
                  {recipe.instructor && (
                    <div className="overflow-hidden">
                      <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-medium inline-block max-w-full truncate">
                        👤 {recipe.instructor}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      {getCookingTimeText(recipe.cookingTime)}
                    </span>
                  </div>
                  {recipe.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </PageContainer>
  );
}
