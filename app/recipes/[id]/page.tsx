'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  difficulty?: string;
  cookingTime?: string;
  estimatedTime?: string;
  instructor?: string;
  description?: string;
  ingredientsList?: Array<{ name: string; quantity: string; unit: string }>;
  favoriteBrands?: string[];
  specialNotes?: string;
  instructions?: string;
  tips?: string;
  createdAt: string;
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadRecipe = async () => {
      setLoading(true);
      setRecipe(null); // Clear previous recipe first
      
      const found = await RecipeService.getById(recipeId);
      if (mounted) {
        if (found) {
          setRecipe(found);
        }
        setLoading(false);
      }
    };
    
    loadRecipe();

    // Reload recipe when window gets focus (user returns from another tab)
    const handleFocus = () => {
      loadRecipe();
    };
    
    // Reload when localStorage changes (for non-authenticated users)
    const handleStorageChange = () => {
      loadRecipe();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      mounted = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [recipeId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công thức</p>
            <GradientButton onClick={() => router.push('/recipes')}>
              Quay lại
            </GradientButton>
          </div>
        </div>
      </PageContainer>
    );
  }

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
      case 'very_fast': return '⚡ Rất nhanh (< 15 phút)';
      case 'fast': return '⏱️ Nhanh (15-30 phút)';
      case 'medium': return '🕐 Trung bình (30-60 phút)';
      case 'slow': return '⏳ Chậm (1-2 giờ)';
      case 'very_slow': return '🕰️ Rất chậm (> 2 giờ)';
      default: return 'N/A';
    }
  };

  const getNextCompletionPage = () => {
    // Check which sections are missing
    if (!recipe.ingredientsList || recipe.ingredientsList.length === 0) {
      return `/recipes/${recipeId}/complete`;
    }
    if (!recipe.instructions) {
      return `/recipes/${recipeId}/instructions`;
    }
    // All sections complete
    return `/recipes/${recipeId}`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Chi tiết công thức"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push('/recipes'),
        }}
        rightContent={
          <button
            onClick={() => router.push(`/recipes/${recipeId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            <span>✏️</span>
            <span className="text-sm">Sửa</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Avatar Section */}
        <div className="mb-12 text-center">
          <div className="inline-block w-48 h-48 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-9xl">🍳</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Hình đại diện (chưa có ảnh thật)</p>
        </div>

        {/* Dish Name */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {recipe.dishName || recipe.recipeName || 'Không xác định'}
          </h2>
          {recipe.dishName && recipe.recipeName && recipe.dishName !== recipe.recipeName && (
            <p className="text-lg text-gray-600">
              Công thức: {recipe.recipeName}
            </p>
          )}
        </div>

        {/* Quick Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Difficulty */}
          <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Độ khó</p>
            <p className="text-2xl font-bold text-orange-600">
              {getDifficultyText(recipe.difficulty)}
            </p>
          </div>

          {/* Cooking Time */}
          <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Thời gian nấu</p>
            <p className="text-lg font-bold text-orange-600">
              {getCookingTimeText(recipe.cookingTime)}
            </p>
            {recipe.estimatedTime && (
              <p className="text-xs text-gray-500 mt-2">({recipe.estimatedTime})</p>
            )}
          </div>

          {/* Instructor */}
          <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Người hướng dẫn</p>
            <p className="text-xl font-bold text-orange-600">
              👤 {recipe.instructor || 'Không xác định'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Mô tả</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {recipe.description || 'Không có mô tả'}
          </p>
        </div>

        {/* Ingredients Section - Placeholder */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🛒</span> Nguyên liệu
          </h3>
          {recipe.ingredientsList && recipe.ingredientsList.length > 0 ? (
            <div className="space-y-3">
              {recipe.ingredientsList.map((ingredient, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                  <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{ingredient.name}</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p className="font-semibold">{ingredient.quantity}</p>
                    <p className="text-xs text-gray-500">{ingredient.unit}</p>
                  </div>
                </div>
              ))}
              {recipe.favoriteBrands && recipe.favoriteBrands.length > 0 && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">🏷️ Hãng/thực phẩm quen thuộc:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.favoriteBrands.map((brand, idx) => (
                      <span key={idx} className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {recipe.specialNotes && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">✨ Lưu ý đặc biệt:</p>
                  <p className="text-gray-700 bg-amber-50 rounded-lg p-4">{recipe.specialNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
              <p>Chưa thêm nguyên liệu. Nhấn "Hoàn chỉnh công thức" để thêm.</p>
            </div>
          )}
        </div>

        {/* Instructions Section - Placeholder */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>👨‍🍳</span> Cách làm
          </h3>
          {recipe.instructions ? (
            <div className="space-y-4">
              {(() => {
                try {
                  const instructions = JSON.parse(recipe.instructions);
                  return Array.isArray(instructions) && 
                    instructions.map((instruction: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 pt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          {instruction.title && (
                            <p className="font-bold text-gray-900 mb-1">{instruction.title}</p>
                          )}
                          <p className="text-gray-700 leading-relaxed">{instruction.description}</p>
                          {instruction.needsTime && instruction.duration && (
                            <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                              <span>⏱️</span>
                              <span className="font-semibold">{instruction.duration}</span>
                            </p>
                          )}
                          {instruction.hasNote && instruction.note && (
                            <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                              <span>📝</span>
                              <span className="font-semibold">{instruction.note}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ));
                } catch {
                  return <p className="text-gray-600">Không thể hiển thị các bước nấu</p>;
                }
              })()}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
              <p>Chưa thêm các bước nấu. Nhấn "Hoàn chỉnh công thức" để thêm.</p>
            </div>
          )}
        </div>

        {/* Tips Section - Highlighted */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl shadow-xl border-2 border-yellow-300 p-10 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">✨</span>
            Bí kíp của {recipe.instructor || 'Mẹ'}
          </h3>
          <div className="bg-white rounded-xl p-6 border-l-4 border-yellow-400">
            {recipe.tips ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{recipe.tips}</p>
            ) : (
              <p className="text-gray-600">
                Chưa có bí kíp. Nhấn "Hoàn chỉnh công thức" để thêm những mẹo vặt và kinh nghiệm nấu ăn!
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => router.push(`/cook/${recipeId}/ingredients`)}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-4 px-12 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            <span>🍳</span>
            <span>Nấu món này</span>
          </button>
          <button
            onClick={() => router.push(getNextCompletionPage())}
            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-12 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            <span>✏️</span>
            <span>Hoàn chỉnh công thức ngay</span>
          </button>
        </div>
      </main>
    </PageContainer>
  );
}
