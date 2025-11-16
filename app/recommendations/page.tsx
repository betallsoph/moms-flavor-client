'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { Recipe } from '@/types/recipe';
import { useAuth } from '@/contexts/AuthContext';

interface RecommendationResponse {
  source: 'aitems' | 'fallback';
  count: number;
  recommendations: (Recipe & { recommendationScore?: number })[];
  message?: string;
  error?: string;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<(Recipe & { recommendationScore?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'aitems' | 'fallback'>('fallback');
  const [message, setMessage] = useState<string>('');

  const loadRecommendations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations?userId=${user.id}&count=12`);
      const data: RecommendationResponse = await response.json();

      setRecommendations(data.recommendations || []);
      setSource(data.source || 'fallback');
      setMessage(data.message || '');
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  // Helper: Format difficulty display
  const formatDifficulty = (difficulty?: string) => {
    switch (difficulty) {
      case 'very_easy': return '⭐ Rất dễ';
      case 'easy': return '⭐⭐ Dễ';
      case 'medium': return '⭐⭐⭐ Trung bình';
      case 'hard': return '⭐⭐⭐⭐ Khó';
      case 'very_hard': return '⭐⭐⭐⭐⭐ Rất khó';
      default: return '⭐⭐⭐ Trung bình';
    }
  };

  // Helper: Format cooking time display
  const formatCookingTime = (cookingTime?: string) => {
    switch (cookingTime) {
      case 'very_fast': return '⚡ Rất nhanh';
      case 'fast': return '⏱️ Nhanh';
      case 'medium': return '🕐 Trung bình';
      case 'slow': return '⏳ Chậm';
      case 'very_slow': return '🕰️ Rất chậm';
      default: return '🕐 Trung bình';
    }
  };

  if (!user) {
    return (
      <PageContainer>
        <PageHeader
          icon="🤖"
          title="Gợi ý món ăn"
          backButton={{
            label: 'Quay lại trang chủ',
            onClick: () => router.push('/home'),
          }}
        />
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔒</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Vui lòng đăng nhập
              </h3>
              <p className="text-gray-500 mb-8">
                Bạn cần đăng nhập để xem gợi ý món ăn được cá nhân hóa
              </p>
              <GradientButton onClick={() => router.push('/auth/login')}>
                Đăng nhập ngay
              </GradientButton>
            </div>
          </div>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="🤖"
        title="Gợi ý món ăn AI"
        subtitle={
          source === 'aitems'
            ? 'Dự đoán dựa trên lịch sử nấu ăn và sở thích của bạn'
            : 'Các món ăn phù hợp với kỹ năng của bạn'
        }
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Info Banner */}
        {message && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {message}
                </p>
                {source === 'fallback' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Để nhận gợi ý AI thông minh hơn, hãy cấu hình NAVER AiTEMS trong settings.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Đang tìm món ăn phù hợp với bạn..." />
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🍳</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có gợi ý nào
              </h3>
              <p className="text-gray-500 mb-8">
                Hãy thêm công thức và nấu thử một vài món để nhận gợi ý cá nhân hóa!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <GradientButton onClick={() => router.push('/recipes/new')}>
                  Thêm công thức
                </GradientButton>
                <button
                  onClick={() => router.push('/recipes')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Xem danh sách công thức
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl border border-purple-100 hover:border-purple-300 overflow-hidden transition-all group cursor-default relative"
                >
                  {/* AI Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span>🤖</span>
                      <span>AI Pick #{index + 1}</span>
                    </div>
                  </div>

                  {/* Recommendation Score (if available) */}
                  {recipe.recommendationScore && source === 'aitems' && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                        {Math.round(recipe.recommendationScore * 100)}% match
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-purple-200 pt-12">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {recipe.dishName || 'Untitled'}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                      {recipe.instructor && (
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          👤 {recipe.instructor}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4 space-y-3">
                    {/* Difficulty & Cooking Time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Độ khó:</span>
                        <span className="text-xs text-gray-600">
                          {formatDifficulty(recipe.difficulty)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Thời gian:</span>
                        <span className="text-xs text-gray-600">
                          {formatCookingTime(recipe.cookingTime)}
                        </span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {recipe.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Mô tả:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {recipe.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                        router.push(`/recipes/${recipe.id}`);
                      }}
                      className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                        router.push(`/cook/${recipe.id}/ingredients`);
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-sm"
                    >
                      🍳 Nấu thử
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Card */}
            <div className="mt-12">
              <div className="max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300 p-8">
                <div className="flex gap-4">
                  <div className="text-4xl">🧠</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Cách AI đưa ra gợi ý
                    </h3>
                    <ul className="text-gray-700 leading-relaxed space-y-2 text-sm">
                      {source === 'aitems' ? (
                        <>
                          <li>✅ <strong>Lịch sử nấu ăn:</strong> Phân tích các món bạn đã nấu và đánh giá cao</li>
                          <li>✅ <strong>Độ khó phù hợp:</strong> Đề xuất món phù hợp với kỹ năng hiện tại của bạn</li>
                          <li>✅ <strong>Sở thích cá nhân:</strong> Dựa trên nguyên liệu và món ăn bạn yêu thích</li>
                          <li>✅ <strong>Thời gian nấu:</strong> Ưu tiên các món phù hợp với thời gian bạn thường có</li>
                        </>
                      ) : (
                        <>
                          <li>📊 <strong>Chưa nấu:</strong> Hiển thị các món bạn chưa thử trong công thức</li>
                          <li>📊 <strong>Độ khó tăng dần:</strong> Sắp xếp từ dễ đến khó để phù hợp với người mới</li>
                          <li>💡 <strong>Nâng cấp:</strong> Cấu hình NAVER AiTEMS để nhận gợi ý thông minh hơn!</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </PageContainer>
  );
}
