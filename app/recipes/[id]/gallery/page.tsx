'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import ImageUpload from '@/components/ImageUpload';
import type { Recipe } from '@/types/recipe';

export default function GalleryPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image states
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        setCoverImage(found.coverImage || '');
        setGalleryImages(found.galleryImages || []);
      }
      setLoading(false);
    };

    loadRecipe();
  }, [recipeId]);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with images using RecipeService
    try {
      await RecipeService.update(recipeId, {
        coverImage: coverImage,
        galleryImages: galleryImages,
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}`);
  };

  // Handle cover image upload
  const handleCoverImageUpload = (imageUrl: string) => {
    console.log('✅ Cover image uploaded:', imageUrl);
    setCoverImage(imageUrl);
  };

  // Handle gallery image upload
  const handleGalleryImageUpload = (imageUrl: string) => {
    console.log('✅ Gallery image uploaded:', imageUrl);
    setGalleryImages([...galleryImages, imageUrl]);
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    const newGalleryImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newGalleryImages);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công thức</p>
          <button
            onClick={() => router.push('/recipes')}
            className="px-6 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {recipe.dishName || recipe.recipeName || 'Công thức'}
            </h2>
            <p className="text-gray-600">
              Thêm hình ảnh để làm công thức sinh động hơn
            </p>
          </div>

          <div className="space-y-8">
            {/* Cover Image Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ảnh bìa công thức
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ảnh chính đại diện cho món ăn của bạn. Hình ảnh này sẽ hiển thị ở danh sách công thức.
              </p>

              {coverImage ? (
                <div className="relative inline-block">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="max-w-full h-auto rounded-xl border-2 border-orange-200"
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <ImageUpload
                  folder="recipes"
                  onUploadComplete={handleCoverImageUpload}
                  maxSizeMB={5}
                  label="Chọn ảnh bìa"
                />
              )}
            </div>

            {/* Gallery Images Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ảnh bổ sung ({galleryImages.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Thêm nhiều hình ảnh chi tiết: từng bước nấu, nguyên liệu, kết quả cuối cùng, hoặc cách bày trí món ăn.
              </p>

              {/* Upload new image - always visible at top */}
              <div className="mb-6">
                <ImageUpload
                  folder="recipes"
                  onUploadComplete={handleGalleryImageUpload}
                  maxSizeMB={5}
                  label="Thêm ảnh"
                />
              </div>

              {/* Existing gallery images */}
              {galleryImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Đã thêm {galleryImages.length} ảnh:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Gợi ý: Thêm 3-5 ảnh để giới thiệu công thức của bạn một cách chi tiết và sinh động
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-8 mt-8 border-t-2 border-gray-200">
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Tiếp tục'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/recipes')}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm"
            >
              Lưu và tiếp tục sau
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
