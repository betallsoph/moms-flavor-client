'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import { LoadingSpinner } from '@/components/ui';

export default function WhatsCookingPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await RecipeService.getAll();
      setRecipes(allRecipes);
      
      // Get 3 random recipes for suggestions
      if (allRecipes.length > 0) {
        const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
        setSuggestedRecipes(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (recipes.length > 0) {
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setSuggestedRecipes(shuffled.slice(0, 3));
    }
  };

  const handleCookNow = (recipeId: string) => {
    router.push(`/cook/${recipeId}/start-confirmation`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header - Simple, no back button */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xl">🎨</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hôm nay nấu gì?
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12">
          <div className="max-w-4xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-6xl">🎯</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Gợi ý hôm nay
            </h2>
            
            {recipes.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-8">
                  Chưa có công thức nào. Hãy tạo công thức đầu tiên của bạn!
                </p>
                <button
                  onClick={() => router.push('/recipes/new')}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  ➕ Tạo công thức mới
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center text-lg mb-8">
                  Dưới đây là những gợi ý món ăn cho bạn hôm nay! 🍳
                </p>

                {/* Suggested Recipes */}
                {suggestedRecipes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {suggestedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleCookNow(recipe.id)}
                      >
                        {recipe.coverImage && (
                          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={recipe.coverImage}
                              alt={recipe.dishName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-3xl mb-3">
                          {recipe.dishName?.includes('gà') ? '🍗' : 
                           recipe.dishName?.includes('cá') ? '🐟' :
                           recipe.dishName?.includes('rau') ? '🥬' :
                           recipe.dishName?.includes('canh') ? '🍲' : '🍽️'}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">
                          {recipe.dishName || recipe.recipeName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <span>⏱️</span>
                          <span>
                            {recipe.cookingTime === 'very_fast' ? '< 15 phút' :
                             recipe.cookingTime === 'fast' ? '15-30 phút' :
                             recipe.cookingTime === 'medium' ? '30-60 phút' :
                             recipe.cookingTime === 'slow' ? '1-2 giờ' : '> 2 giờ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                          <span>⭐</span>
                          <span>
                            {recipe.difficulty === 'very_easy' ? 'Rất dễ' :
                             recipe.difficulty === 'easy' ? 'Dễ' :
                             recipe.difficulty === 'medium' ? 'Trung bình' :
                             recipe.difficulty === 'hard' ? 'Khó' : 'Rất khó'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCookNow(recipe.id);
                          }}
                          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-md transition-shadow text-sm"
                        >
                          🔥 Nấu ngay
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    🔄 Gợi ý khác
                  </button>
                  <button
                    onClick={() => router.push('/recipes/select-to-cook')}
                    className="bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    📖 Xem tất cả công thức
                  </button>
                </div>
              </>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="font-semibold text-gray-900 mb-2">Gợi ý ngẫu nhiên</h3>
                <p className="text-sm text-gray-600">
                  Tìm kiếm cảm hứng từ các công thức được chọn ngẫu nhiên
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                <div className="text-3xl mb-3">🌶️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Lọc theo mức độ cay</h3>
                <p className="text-sm text-gray-600">
                  Chọn công thức phù hợp với khẩu vị của bạn
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Nấu nhanh</h3>
                <p className="text-sm text-gray-600">
                  Tìm những công thức có thể hoàn thành trong 30 phút
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/home')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Quay lại Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
