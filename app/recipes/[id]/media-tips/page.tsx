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
  createdAt: string;
}

export default function MediaTipsPage() {
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

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
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

    router.push(`/recipes/${recipeId}/gallery`);
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
        title="Bí kíp"
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
              Chia sẻ bí kíp đặc biệt của bạn
            </p>
          </div>

          <form onSubmit={handleSaveAndContinue} className="space-y-6">
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



            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-6">
              <button
                type="button"
                onClick={() => {
                  // Save tips and go to recipes list
                  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                  const index = recipes.findIndex((r: Recipe) => r.id === recipeId);
                  if (index !== -1) {
                    recipes[index] = {
                      ...recipes[index],
                      tips: tips,
                    };
                    localStorage.setItem('recipes', JSON.stringify(recipes));
                  }
                  router.push('/recipes');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Lưu và tiếp tục sau
              </button>
              <GradientButton
                type="submit"
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Tiếp tục thêm hình ảnh'}
              </GradientButton>
            </div>
          </form>
        </div>
      </main>
    </PageContainer>
  );
}
