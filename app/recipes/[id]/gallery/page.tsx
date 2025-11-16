'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
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
  const [tips, setTips] = useState('');
  
  // Image states
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Dev mode: Auto fill form (gallery page có tips field)
  const handleDevFillForm = () => {
    setTips('Mẹo nhỏ: Khi chụp ảnh món ăn, nên chụp dưới ánh sáng tự nhiên để màu sắc đẹp nhất. Đặt món ăn trên nền sáng để nổi bật hơn.');
  };

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        setTips(found.tips || '');
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

    // Update recipe with tips and images using RecipeService
    try {
      await RecipeService.update(recipeId, {
        tips: tips,
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

  return (
    <PageContainer>
      <PageHeader
        icon="✨"
        title="Bí kíp & Hình ảnh"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {recipe.dishName || recipe.recipeName || 'Công thức'}
            </h2>
            <p className="text-gray-600">
              Chia sẻ bí kíp đặc biệt của bạn và thêm hình ảnh để làm công thức sinh động hơn
            </p>
          </div>

          <div className="space-y-8">
            {/* Tips / Bí kíp */}
            <div>
              <label htmlFor="tips" className="block text-sm font-semibold text-gray-900 mb-3">
                ✨ Bí kíp & lưu ý thêm
              </label>
              <textarea
                id="tips"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="Nhập các bí kíp, mẹo nấu, lưu ý về nguyên liệu, hoặc cách chọn những thứ tốt nhất..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Ví dụ: Hãy chọn trứng gà tươi, không nên xáo quá kỹ nếu muốn trứng béo...
              </p>
            </div>

            {/* Cover Image Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🖼️ Ảnh bìa công thức
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ảnh chính đại diện cho món ăn của bạn. Hình ảnh này sẽ hiển thị ở danh sách công thức.
              </p>
              
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg border-2 border-orange-200"
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🎬 Ảnh bổ sung ({galleryImages.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Thêm nhiều hình ảnh chi tiết: từng bước nấu, nguyên liệu, kết quả cuối cùng, hoặc cách bày trí món ăn.
              </p>
              
              <div className="space-y-4">
                {/* Existing gallery images */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload new image */}
                <div>
                  <ImageUpload
                    folder="recipes"
                    onUploadComplete={handleGalleryImageUpload}
                    maxSizeMB={5}
                    label="Thêm ảnh bổ sung"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                💡 Gợi ý: Thêm 3-5 ảnh để giới thiệu công thức của bạn một cách chi tiết và sinh động
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/recipes')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Lưu và tiếp tục sau
            </button>
            <GradientButton
              onClick={handleSaveAndContinue}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Hoàn chỉnh công thức'}
            </GradientButton>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
