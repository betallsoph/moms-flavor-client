'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';
import { auth } from '@/libs/firebase';
import type { Recipe } from '@/types/recipe';

interface RecommendedRecipe extends Recipe {
  recommendationScore: number;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'aitems' | 'fallback'>('aitems');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Vui lòng đăng nhập để xem gợi ý');
      setLoading(false);
      return;
    }

    try {
      console.log('📥 Loading recommendations for user:', userId);
      
      const response = await fetch(
        `/api/recommendations?userId=${userId}&count=10&fallback=true`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load recommendations');
      }

      const data = await response.json();
      
      setRecommendations(data.recommendations || []);
      setSource(data.source);
      
      console.log('✅ Loaded recommendations:', data);
    } catch (err: any) {
      console.error('❌ Error loading recommendations:', err);
      setError(err.message || 'Có lỗi khi tải gợi ý món ăn');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Rất phù hợp';
    if (score >= 0.6) return 'Phù hợp';
    return 'Có thể thích';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <PageHeader
        icon="🤖"
        title="Gợi ý dành cho bạn"
        backButton={{
          label: 'Trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">
            {source === 'aitems'
              ? '✨ Được chọn bởi AI dựa trên sở thích của bạn'
              : '📊 Các món ăn phổ biến'}
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 text-lg mb-4">❌ {error}</p>
            <button
              onClick={loadRecommendations}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🍳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa có đủ dữ liệu
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy nấu thêm một vài món để AI có thể gợi ý món phù hợp với bạn nhé!
            </p>
            <button
              onClick={() => router.push('/recipes')}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Xem danh sách món ăn
            </button>
          </div>
        ) : (
          <>
            {/* AI Badge */}
            {source === 'aitems' && (
              <div className="mb-6 flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-4">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Được chọn bởi AI
                  </p>
                  <p className="text-sm text-gray-600">
                    Dựa trên {recommendations.length} món ăn phù hợp nhất với bạn
                  </p>
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                >
                  {/* Rank Badge */}
                  <div className="relative">
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg z-10">
                      #{index + 1}
                    </div>
                    
                    {/* Cover Image */}
                    {recipe.coverImage ? (
                      <img
                        src={recipe.coverImage}
                        alt={recipe.dishName}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                        <span className="text-6xl">🍳</span>
                      </div>
                    )}
                    
                    {/* Match Score */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className={`font-semibold text-sm ${getScoreColor(recipe.recommendationScore)}`}>
                        {getScoreLabel(recipe.recommendationScore)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {recipe.dishName || 'Untitled'}
                    </h3>
                    
                    {recipe.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Recipe Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {recipe.difficulty && (
                        <span className="flex items-center gap-1">
                          <span>⚡</span>
                          <span className="capitalize">{recipe.difficulty}</span>
                        </span>
                      )}
                      {recipe.cookingTime && (
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span className="capitalize">{recipe.cookingTime}</span>
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="mt-12 text-center">
              <button
                onClick={loadRecommendations}
                className="bg-white border-2 border-purple-300 text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                🔄 Làm mới gợi ý
              </button>
            </div>
          </>
        )}
      </main>
    </PageContainer>
  );
}

