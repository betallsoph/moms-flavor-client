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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hôm nay nấu gì?
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg border-2 border-blue-200 p-12">
          <div className="max-w-4xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <span className="text-6xl">🎯</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Gợi ý hôm nay
            </h2>

            {/* Mode Switcher */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setShowMode('random')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  showMode === 'random'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span>🎲</span>
                <span>Ngẫu nhiên</span>
              </button>
              <button
                onClick={() => setShowMode('ai')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  showMode === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <span>🤖</span>
                <span>AI thông minh</span>
              </button>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-700 text-lg mb-8">
                  Chưa có công thức nào. Hãy tạo công thức đầu tiên của bạn!
                </p>
                <button
                  onClick={() => router.push('/recipes/new')}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  ➕ Tạo công thức mới
                </button>
              </div>
            ) : (
              <>
                {/* Description based on mode */}
                <p className="text-gray-700 text-center text-lg mb-8">
                  {showMode === 'random'
                    ? 'Dưới đây là những gợi ý ngẫu nhiên cho bạn hôm nay! 🍳'
                    : 'AI đã phân tích và gợi ý những món phù hợp nhất với bạn! 🤖✨'
                  }
                </p>

                {/* Random Mode */}
                {showMode === 'random' && suggestedRecipes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {suggestedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:-translate-y-1"
                        onClick={() => handleCookNow(recipe.id)}
                      >
                        {recipe.coverImage && (
                          <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-md">
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
                          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-300 text-sm hover:scale-105"
                        >
                          🔥 Nấu ngay
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
                        <LoadingSpinner message="AI đang phân tích sở thích của bạn..." />
                      </div>
                    ) : aiRecommendations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {aiRecommendations.map((recipe, index) => (
                          <div
                            key={recipe.id}
                            className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative hover:scale-[1.03] hover:-translate-y-1"
                            onClick={() => handleCookNow(recipe.id)}
                          >
                            {/* AI Badge */}
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                🤖 AI Pick #{index + 1}
                              </div>
                            </div>

                            {recipe.coverImage && (
                              <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-md">
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
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-300 text-sm hover:scale-105"
                            >
                              🔥 Nấu ngay
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <span className="text-5xl">🤖</span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Chưa có gợi ý AI. Hãy nấu thử một vài món để AI học sở thích của bạn!
                        </p>
                        <button
                          onClick={() => setShowMode('random')}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          ← Xem gợi ý ngẫu nhiên
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons - Show for Random mode */}
                {showMode === 'random' && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                      onClick={handleRefresh}
                      className="bg-white border-2 border-blue-200 text-gray-700 font-semibold py-3 px-8 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      🔄 Gợi ý khác
                    </button>
                    <button
                      onClick={() => router.push('/recipes/select-to-cook')}
                      className="bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      📖 Xem tất cả công thức
                    </button>
                  </div>
                )}

                {/* Action Buttons - Show for AI mode */}
                {showMode === 'ai' && aiRecommendations.length > 0 && (
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={loadAiRecommendations}
                      className="bg-white border-2 border-purple-200 text-gray-700 font-semibold py-3 px-8 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      🔄 Làm mới gợi ý AI
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-md hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="font-semibold text-gray-900 mb-2">Gợi ý ngẫu nhiên</h3>
                <p className="text-sm text-gray-600">
                  Tìm kiếm cảm hứng mới từ các công thức được chọn ngẫu nhiên mỗi lần
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI thông minh</h3>
                <p className="text-sm text-gray-600">
                  Phân tích lịch sử nấu ăn và đề xuất món phù hợp nhất với bạn
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-md hover:border-orange-400 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-2">Nấu ngay lập tức</h3>
                <p className="text-sm text-gray-600">
                  Click "Nấu ngay" để bắt đầu ngay với công thức được gợi ý
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/home')}
                className="text-gray-700 hover:text-gray-900 font-semibold transition-colors duration-200"
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
