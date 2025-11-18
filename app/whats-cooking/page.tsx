'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function WhatsCookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Recipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showMode, setShowMode] = useState<'random' | 'ai'>('random');

  useEffect(() => {
    loadRecipes();
    loadAiRecommendations();
  }, [user]);

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

  const loadAiRecommendations = async () => {
    if (!user) return;

    try {
      setAiLoading(true);
      const response = await fetch(`/api/recommendations?userId=${user.id}&count=3`);
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setAiLoading(false);
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

  const getDifficultyText = (level?: string) => {
    switch (level) {
      case 'very_easy': return 'Rất dễ';
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      case 'very_hard': return 'Rất khó';
      default: return 'N/A';
    }
  };

  const getCookingTimeText = (time?: string) => {
    switch (time) {
      case 'very_fast': return 'Rất nhanh';
      case 'fast': return 'Nhanh';
      case 'medium': return 'Trung bình';
      case 'slow': return 'Chậm';
      case 'very_slow': return 'Rất chậm';
      default: return 'N/A';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Hôm nay nấu gì?
            </h1>
            <p className="text-base text-gray-600">
              Để chúng tôi gợi ý món ngon cho bạn
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowMode('random')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                showMode === 'random'
                  ? 'bg-orange-100 border-2 border-orange-300 text-orange-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ngẫu nhiên
            </button>
            <button
              onClick={() => setShowMode('ai')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                showMode === 'ai'
                  ? 'bg-purple-100 border-2 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              AI thông minh
            </button>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-700 mb-6">
                Chưa có công thức nào. Hãy tạo công thức đầu tiên của bạn!
              </p>
              <button
                onClick={() => router.push('/recipes/new')}
                className="px-8 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
              >
                Tạo công thức mới
              </button>
            </div>
          ) : (
            <>
              {/* Description based on mode */}
              <p className="text-base text-gray-700 text-center mb-8">
                {showMode === 'random'
                  ? 'Dưới đây là những gợi ý ngẫu nhiên cho bạn hôm nay'
                  : 'AI đã phân tích và gợi ý những món phù hợp nhất với bạn'
                }
              </p>

              {/* Random Mode */}
              {showMode === 'random' && suggestedRecipes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {suggestedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      onClick={() => handleCookNow(recipe.id)}
                    >
                      {recipe.coverImage && (
                        <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                          <img
                            src={recipe.coverImage}
                            alt={recipe.dishName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-800 mb-3 text-lg">
                        {recipe.dishName || recipe.recipeName}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="font-semibold text-gray-700">{getCookingTimeText(recipe.cookingTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Độ khó:</span>
                          <span className="font-semibold text-gray-700">{getDifficultyText(recipe.difficulty)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCookNow(recipe.id);
                        }}
                        className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
                      >
                        Nấu ngay
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Mode */}
              {showMode === 'ai' && (
                <>
                  {aiLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner message="AI đang phân tích..." />
                    </div>
                  ) : aiRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {aiRecommendations.map((recipe, index) => (
                        <div
                          key={recipe.id}
                          className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative hover:scale-[1.02]"
                          onClick={() => handleCookNow(recipe.id)}
                        >
                          {/* AI Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-purple-100 border-2 border-purple-300 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                              AI Pick #{index + 1}
                            </div>
                          </div>

                          {recipe.coverImage && (
                            <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                              <img
                                src={recipe.coverImage}
                                alt={recipe.dishName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-bold text-gray-800 mb-3 text-lg">
                            {recipe.dishName || recipe.recipeName}
                          </h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Thời gian:</span>
                              <span className="font-semibold text-gray-700">{getCookingTimeText(recipe.cookingTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Độ khó:</span>
                              <span className="font-semibold text-gray-700">{getDifficultyText(recipe.difficulty)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCookNow(recipe.id);
                            }}
                            className="w-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
                          >
                            Nấu ngay
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-base text-gray-700 mb-6">
                        Chưa có gợi ý AI. Hãy nấu thử một vài món để AI học sở thích của bạn!
                      </p>
                      <button
                        onClick={() => setShowMode('random')}
                        className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
                      >
                        Xem gợi ý ngẫu nhiên
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons - Show for Random mode */}
              {showMode === 'random' && suggestedRecipes.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="px-8 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
                  >
                    Gợi ý khác
                  </button>
                  <button
                    onClick={() => router.push('/recipes/select-to-cook')}
                    className="px-8 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
                  >
                    Xem tất cả công thức
                  </button>
                </div>
              )}

              {/* Action Buttons - Show for AI mode */}
              {showMode === 'ai' && aiRecommendations.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={loadAiRecommendations}
                    className="px-8 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-purple-700"
                  >
                    Làm mới gợi ý AI
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    </div>
  );
}
