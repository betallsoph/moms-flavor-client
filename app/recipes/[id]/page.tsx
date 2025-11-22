'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import { authService } from '@/libs/auth';
import ConfirmModal from '@/components/ConfirmModal';

// Sticker images for placeholder
const STICKER_IMAGES = [
  // Sticker1
  '/assets/sticker1/bánh bao thịt trứng.png',
  '/assets/sticker1/bò chiên lá lốt.png',
  '/assets/sticker1/bò lúc lắc.png',
  '/assets/sticker1/bò tảng.png',
  '/assets/sticker1/bún bò.png',
  '/assets/sticker1/canh chua.png',
  '/assets/sticker1/canh gà nấm hương.png',
  '/assets/sticker1/canh khổ qua nhồi thịt.png',
  '/assets/sticker1/càng cua chiên xù.png',
  '/assets/sticker1/càng cua rang muối.png',
  '/assets/sticker1/càng cua sốt bơ tỏi.png',
  '/assets/sticker1/cá chiên.png',
  '/assets/sticker1/cá nục xốt cà.png',
  '/assets/sticker1/cá thu kho.png',
  '/assets/sticker1/cánh gà chiên mắm.png',
  '/assets/sticker1/cơm tấm sườn bì chả.png',
  // Sticker2
  '/assets/sticker2/bánh bao xá xíu.png',
  '/assets/sticker2/bánh canh cua.png',
  '/assets/sticker2/bạch tuộc nướng.png',
  '/assets/sticker2/bí đao xào.png',
  '/assets/sticker2/bò kho.png',
  '/assets/sticker2/bò xào lơ.png',
  '/assets/sticker2/bún mắm.png',
  '/assets/sticker2/canh củ.png',
  '/assets/sticker2/cá kho tiêu.png',
  '/assets/sticker2/cá thu sốt cà.png',
  '/assets/sticker2/cháo thập cẩm.png',
  '/assets/sticker2/chân gà xã tắc.png',
  '/assets/sticker2/cơm chiên dương châu.png',
  '/assets/sticker2/cơm cuộn.png',
  '/assets/sticker2/cua hấp bia.png',
  // Sticker3
  '/assets/sticker3/Gà kho.png',
  '/assets/sticker3/ba chỉ heo quay.png',
  '/assets/sticker3/ba chỉ xào xã ớt.png',
  '/assets/sticker3/bánh xèo.png',
  '/assets/sticker3/bò quấn nấm kim châm.png',
  '/assets/sticker3/bò xào cục.png',
  '/assets/sticker3/bò xào khổ qua.png',
  '/assets/sticker3/bún chả.png',
  '/assets/sticker3/canh đậu khuôn hẹ.png',
  '/assets/sticker3/cà ri bò.png',
  '/assets/sticker3/cá cơm kho.png',
  '/assets/sticker3/cá hồi áp chảo.png',
  '/assets/sticker3/cải thìa xào nấm đông cô.png',
  '/assets/sticker3/cháo trắng.png',
];

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
  const [authInitialized, setAuthInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpdateOptions, setShowUpdateOptions] = useState(false);
  const hasExistingInstructions = useMemo(() => {
    if (!recipe?.instructions) return false;
    try {
      const parsed = JSON.parse(recipe.instructions);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return true;
    }
  }, [recipe?.instructions]);

  // Random sticker for placeholder (changes on each page load)
  const randomSticker = useMemo(() => {
    return STICKER_IMAGES[Math.floor(Math.random() * STICKER_IMAGES.length)];
  }, [recipeId]); // Re-randomize when recipeId changes

  // Wait for auth to initialize first
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Don't load recipe until auth is initialized
    if (!authInitialized) return;

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

    return () => {
      mounted = false;
    };
  }, [recipeId, authInitialized]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công thức</p>
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !recipe) return;

    // Reset file input immediately to allow re-selection of same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      setUploading(true);

      // Get current user ID from auth
      const userId = authService.getCurrentUser()?.id;
      if (!userId) {
        setUploading(false);
        alert('Bạn cần đăng nhập để upload hình ảnh.');
        return;
      }

      console.log('Starting upload...', { fileName: file.name, userId });

      // Upload to Naver via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'recipes');
      formData.append('userId', userId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      console.log('Upload success, updating gallery...', imageUrl);

      // Add new image to gallery
      const updatedGalleryImages = [...(recipe.galleryImages || []), imageUrl];

      // Update Firestore AND local state together
      await RecipeService.update(recipeId, {
        galleryImages: updatedGalleryImages,
      });

      console.log('Gallery updated in Firestore');

      // Update local state - use functional update to avoid stale closure
      setRecipe(prevRecipe => {
        if (!prevRecipe) return prevRecipe;
        return {
          ...prevRecipe,
          galleryImages: updatedGalleryImages,
        };
      });

      console.log('Local state updated, new image count:', updatedGalleryImages.length);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Không thể upload ảnh: ${error.message}`);
    } finally {
      setUploading(false);
    }
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
          {/* Left: Cover Image or Placeholder */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            {recipe.coverImage ? (
              <img
                src={recipe.coverImage}
                alt={recipe.dishName || recipe.recipeName || 'Món ăn'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px] p-12">
                <Image
                  src={randomSticker}
                  alt="Placeholder"
                  width={300}
                  height={300}
                  className="object-contain mb-6"
                />
                <p className="text-xl font-bold text-gray-600">Chưa có hình ảnh</p>
              </div>
            )}
          </div>

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
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
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
                <p className="text-lg font-bold text-orange-600">
                  {recipe.instructor || 'Không xác định'}
                </p>
              </div>

              {/* Difficulty & Cooking Time - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Difficulty */}
                <div className="bg-white rounded-xl shadow-md border border-orange-100 p-3">
                  <p className="text-sm text-gray-600 mb-1">Độ khó</p>
                  <p className="text-lg font-bold text-orange-600">
                    {getDifficultyText(recipe.difficulty)}
                  </p>
                </div>

                {/* Cooking Time */}
                <div className="bg-white rounded-xl shadow-md border border-orange-100 p-3">
                  <p className="text-sm text-gray-600 mb-1">Thời gian nấu</p>
                  <p className="text-lg font-bold text-orange-600">
                    {getCookingTimeText(recipe.cookingTime)}
                    {recipe.estimatedTime && (
                      <span className="text-sm font-normal text-gray-400 ml-1">({recipe.estimatedTime})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
                <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recipe.description || 'Không có mô tả'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Layout - Ingredients & Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Ingredients */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
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
                        <p className="text-base font-semibold text-gray-800">{ingredient.name}</p>
                      </div>
                      <div className="text-right text-gray-600">
                        <p className="text-base font-semibold">{ingredient.quantity}</p>
                        <p className="text-xs text-gray-500">{ingredient.unit}</p>
                      </div>
                    </div>
                  ))}
                  {recipe.favoriteBrands && recipe.favoriteBrands.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-orange-200">
                      <p className="text-sm font-semibold text-gray-800 mb-3">Hãng/thực phẩm quen thuộc:</p>
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
                      <p className="text-sm font-semibold text-gray-800 mb-3">Lưu ý đặc biệt:</p>
                      <p className="text-base text-gray-700 bg-amber-50 rounded-lg p-4">{recipe.specialNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                  <p className="text-base">Chưa thêm nguyên liệu. Nhấn "Hoàn chỉnh công thức" để thêm.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
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
                              {instruction.title ? (
                                <p className="text-base font-bold text-gray-800 mb-1">{instruction.title}</p>
                              ) : (
                                <p className="text-base font-bold text-gray-500 mb-1 italic">Chưa thêm tiêu đề</p>
                              )}
                              {instruction.note ? (
                                <p className="text-base text-gray-700 leading-relaxed">{instruction.note}</p>
                              ) : instruction.description ? (
                                <p className="text-base text-gray-700 leading-relaxed">{instruction.description}</p>
                              ) : (
                                <p className="text-base text-gray-500 leading-relaxed italic">Chưa thêm nội dung</p>
                              )}
                              {instruction.needsTime ? (
                                instruction.duration ? (
                                  <p className="text-sm text-orange-600 mt-2 font-semibold">
                                    Thời gian: {instruction.duration}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500 mt-2 italic">
                                    Thời gian: Chưa thêm
                                  </p>
                                )
                              ) : null}
                            </div>
                          </div>
                        ));
                    } catch {
                      return <p className="text-base text-gray-600">Không thể hiển thị các bước nấu</p>;
                    }
                  })()}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                  <p className="text-base">Chưa thêm các bước nấu. Nhấn "Hoàn chỉnh công thức" để thêm.</p>
                </div>
              )}

              {/* Tips Section - Inside Instructions Card */}
              {recipe.tips && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Lưu ý đặc biệt từ người hướng dẫn:</p>
                  <p className="text-base text-gray-700 bg-amber-50 rounded-lg p-4">{recipe.tips}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Images Section - Grid Layout */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Hình ảnh chi tiết
          </h3>
          {recipe.galleryImages && recipe.galleryImages.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {recipe.galleryImages.map((imageUrl, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(imageUrl)}
                  className="relative rounded-xl overflow-hidden shadow-md border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-300 break-inside-avoid mb-4"
                >
                  <img
                    src={imageUrl}
                    alt={`${recipe.dishName || 'Món ăn'} - Ảnh ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              ))}

              {/* Add more images card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-xl overflow-hidden shadow-md border-2 border-dashed border-orange-300 bg-orange-50 cursor-pointer hover:scale-105 hover:bg-orange-100 transition-all duration-300 break-inside-avoid mb-4 flex items-center justify-center aspect-square"
              >
                <div className="text-center p-6">
                  {uploading ? (
                    <>
                      <div className="w-12 h-12 mx-auto mb-3 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-orange-700">
                        Đang upload...
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-orange-600 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-sm font-bold text-orange-700">
                        Thêm ảnh
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-12 text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-xl font-bold text-gray-600">Chưa có hình ảnh chi tiết</p>
              <p className="text-sm text-gray-500 mt-2">Nhấn "Hoàn chỉnh công thức" để thêm hình ảnh</p>
            </div>
          )}
        </div>

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
                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-2xl hover:bg-gray-200 transition-colors"
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
          <div>
            <button
              onClick={() => {
                if (hasExistingInstructions) {
                  setShowUpdateOptions(prev => !prev);
                } else {
                  router.push(getNextCompletionPage());
                }
              }}
              className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
            >
              {hasExistingInstructions ? 'Cập nhật công thức' : 'Hoàn chỉnh công thức'}
            </button>
            {hasExistingInstructions && showUpdateOptions && (
              <div className="mt-3 bg-white border border-orange-200 rounded-xl p-4 space-y-2 shadow-sm">
                <p className="text-sm text-gray-700 font-semibold">Chọn nội dung cần chỉnh:</p>
                <button
                  onClick={() => {
                    setShowUpdateOptions(false);
                    router.push(`/recipes/${recipeId}/complete`);
                  }}
                  className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg text-orange-700 font-semibold hover:bg-orange-100"
                >
                  Cập nhật nguyên liệu
                </button>
                <button
                  onClick={() => {
                    setShowUpdateOptions(false);
                    router.push(`/recipes/${recipeId}/instructions`);
                  }}
                  className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg text-orange-700 font-semibold hover:bg-orange-100"
                >
                  Cập nhật bước nấu
                </button>
              </div>
            )}
          </div>
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
