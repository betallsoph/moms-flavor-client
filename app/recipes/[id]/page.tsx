'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import ConfirmModal from '@/components/ConfirmModal';

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
  coverImage?: string;
  galleryImages?: string[];
  createdAt: string;
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

  const handleDelete = async () => {
    await RecipeService.delete(recipeId);
    setConfirmDeleteOpen(false);
    router.push('/recipes');
  };

  return (
    <PageContainer>
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Xóa công thức"
        description={`Bạn có chắc muốn xóa "${recipe?.dishName || 'công thức này'}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section - Image & Title Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Cover Image */}
          {recipe.coverImage && (
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-200">
              <img
                src={recipe.coverImage}
                alt={recipe.dishName || recipe.recipeName || 'Món ăn'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right: Title & Quick Info */}
          <div className="flex flex-col space-y-6">
            {/* Top Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/recipes')}
                className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-base"
              >
                Quay lại danh sách
              </button>
              <button
                onClick={() => router.push(`/recipes/${recipeId}/edit`)}
                className="px-6 py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 text-base"
              >
                Chỉnh sửa
              </button>
            </div>

            {/* Dish Name */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {recipe.dishName || recipe.recipeName || 'Không xác định'}
              </h2>
              {recipe.dishName && recipe.recipeName && recipe.dishName !== recipe.recipeName && (
                <p className="text-lg text-gray-600">
                  Công thức: {recipe.recipeName}
                </p>
              )}
            </div>

            {/* Quick Info Cards */}
            <div className="space-y-4">
              {/* Instructor - Full Width */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Người hướng dẫn</p>
                <p className="text-xl font-bold text-orange-600">
                  {recipe.instructor || 'Không xác định'}
                </p>
              </div>

              {/* Difficulty & Cooking Time - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Difficulty */}
                <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
                  <p className="text-sm text-gray-600 mb-1">Độ khó</p>
                  <p className="text-xl font-bold text-orange-600">
                    {getDifficultyText(recipe.difficulty)}
                  </p>
                </div>

                {/* Cooking Time */}
                <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
                  <p className="text-sm text-gray-600 mb-1">Thời gian nấu</p>
                  <p className="text-lg font-bold text-orange-600">
                    {getCookingTimeText(recipe.cookingTime)}
                  </p>
                  {recipe.estimatedTime && (
                    <p className="text-xs text-gray-500 mt-1">({recipe.estimatedTime})</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
                <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {recipe.description || 'Không có mô tả'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section - Full Width */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl shadow-xl border-2 border-yellow-300 p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
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
        </div>

        {/* 2 Column Layout - Ingredients & Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Ingredients */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nguyên liệu
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
                      <p className="text-sm font-semibold text-gray-900 mb-3">Hãng/thực phẩm quen thuộc:</p>
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
                      <p className="text-sm font-semibold text-gray-900 mb-3">Lưu ý đặc biệt:</p>
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
          </div>

          {/* Right Column - Instructions */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Cách làm
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
                                <p className="text-sm text-orange-600 mt-2 font-semibold">
                                  Thời gian: {instruction.duration}
                                </p>
                              )}
                              {instruction.hasNote && instruction.note && (
                                <p className="text-sm text-blue-600 mt-2 font-semibold">
                                  Ghi chú: {instruction.note}
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
          </div>
        </div>

        {/* Gallery Images Section - Grid Layout */}
        {recipe.galleryImages && recipe.galleryImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Hình ảnh chi tiết
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recipe.galleryImages.map((imageUrl, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(imageUrl)}
                  className="relative rounded-xl overflow-hidden shadow-md border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-300 aspect-square"
                >
                  <img
                    src={imageUrl}
                    alt={`${recipe.dishName || 'Món ăn'} - Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          >
            <div className="relative max-w-7xl max-h-full">
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold text-2xl hover:bg-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 max-w-md mx-auto mb-12">
          <button
            onClick={() => router.push(`/cook/${recipeId}/ingredients`)}
            className="w-full p-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-red-700"
          >
            Nấu món này
          </button>
          <button
            onClick={() => router.push(getNextCompletionPage())}
            className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
          >
            Hoàn chỉnh công thức
          </button>
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="w-full p-4 bg-red-500 hover:bg-red-600 border-2 border-red-600 rounded-xl transition-all hover:scale-[1.02] font-bold text-white"
          >
            Xóa công thức
          </button>
        </div>
      </main>
    </PageContainer>
  );
}
