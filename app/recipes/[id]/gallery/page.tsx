'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  sameAsdish?: boolean;
  difficulty?: string;
  cookingTime?: string;
  estimateTime?: boolean;
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

export default function GalleryPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tips, setTips] = useState('');

  useEffect(() => {
    // Load recipe from localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const found = recipes.find((r: Recipe) => r.id === recipeId);
    if (found) {
      setRecipe(found);
      setTips(found.tips || '');
    }
    setLoading(false);
  }, [recipeId]);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with tips
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const index = recipes.findIndex((r: Recipe) => r.id === recipeId);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        tips: tips,
      };
      localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    setSaving(false);

    // Trigger window focus event to refresh detail page
    setTimeout(() => {
      window.dispatchEvent(new Event('focus'));
    }, 100);

    router.push(`/recipes/${recipeId}`);
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
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm text-gray-600 font-medium mb-1">Chưa có ảnh bìa</p>
                <p className="text-xs text-gray-500 mb-4">Kéo thả hình ảnh vào đây hoặc nhấn để chọn</p>
                <button
                  type="button"
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                  disabled
                >
                  Thêm ảnh bìa (sắp có)
                </button>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🎬 Ảnh bổ sung
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Thêm nhiều hình ảnh chi tiết: từng bước nấu, nguyên liệu, kết quả cuối cùng, hoặc cách bày trí món ăn.
              </p>
              <div className="space-y-3">
                {/* Placeholder gallery items */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">➕</div>
                  <p className="text-sm text-gray-600 font-medium">Thêm ảnh bổ sung</p>
                  <p className="text-xs text-gray-500 mt-1">Kéo thả hoặc nhấn để chọn hình ảnh</p>
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
