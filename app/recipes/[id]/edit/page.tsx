'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [formData, setFormData] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setFormData(found);
      }
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => prev ? {
        ...prev,
        [name]: checked,
        ...(name === 'sameAsDish' && checked ? { recipeName: prev.dishName } : {}),
      } : null);
    } else {
      setFormData(prev => prev ? {
        ...prev,
        [name]: value,
        ...(name === 'dishName' && prev.sameAsDish ? { recipeName: value } : {}),
      } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe using RecipeService - extract only the fields that exist in formData
    try {
      const updates: Partial<typeof formData> = {
        dishName: formData.dishName,
        recipeName: formData.recipeName,
        sameAsDish: formData.sameAsDish,
        difficulty: formData.difficulty,
        cookingTime: formData.cookingTime,
        estimateTime: formData.estimateTime,
        estimatedTime: formData.estimatedTime,
        instructor: formData.instructor,
        description: formData.description,
      };
      await RecipeService.update(recipeId, updates);
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!formData) {
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
        icon="✏️"
        title="Sửa công thức"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dish Name */}
            <div>
              <label htmlFor="dishName" className="block text-sm font-semibold text-gray-900 mb-2">
                Tên món *
              </label>
              <input
                type="text"
                id="dishName"
                name="dishName"
                value={formData.dishName || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Recipe Name */}
            <div>
              <label htmlFor="recipeName" className="block text-sm font-semibold text-gray-900 mb-2">
                Tên công thức *
              </label>
              <input
                type="text"
                id="recipeName"
                name="recipeName"
                value={formData.recipeName || ''}
                onChange={handleChange}
                required
                disabled={formData.sameAsDish}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAsDish"
                  name="sameAsDish"
                  checked={formData.sameAsDish || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="sameAsDish" className="text-sm text-gray-600">
                  Cùng tên với tên món
                </label>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-900 mb-2">
                Độ khó *
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty || 'medium'}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="very_easy">⭐ Rất dễ</option>
                <option value="easy">⭐⭐ Dễ</option>
                <option value="medium">⭐⭐⭐ Trung bình</option>
                <option value="hard">⭐⭐⭐⭐ Khó</option>
                <option value="very_hard">⭐⭐⭐⭐⭐ Rất khó</option>
              </select>
            </div>

            {/* Cooking Time */}
            <div>
              <label htmlFor="cookingTime" className="block text-sm font-semibold text-gray-900 mb-2">
                Thời gian nấu *
              </label>
              <select
                id="cookingTime"
                name="cookingTime"
                value={formData.cookingTime || 'medium'}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="very_fast">⚡ Rất nhanh (&lt; 15 phút)</option>
                <option value="fast">⏱️ Nhanh (15-30 phút)</option>
                <option value="medium">🕐 Trung bình (30-60 phút)</option>
                <option value="slow">⏳ Chậm (1-2 giờ)</option>
                <option value="very_slow">🕰️ Rất chậm (&gt; 2 giờ)</option>
              </select>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="estimateTime"
                  name="estimateTime"
                  checked={formData.estimateTime || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="estimateTime" className="text-sm text-gray-600">
                  Ước lượng thời gian
                </label>
              </div>
              {formData.estimateTime && (
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime || ''}
                  onChange={handleChange}
                  placeholder="VD: 45 phút, 1 giờ 30 phút..."
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="block text-sm font-semibold text-gray-900 mb-2">
                Người hướng dẫn
              </label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor || ''}
                onChange={handleChange}
                placeholder="VD: Mẹ, Ông, Bà, Cô, Bạn bè..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả món - công thức *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                required
                placeholder="Mô tả về món ăn và công thức nấu..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/recipes/${recipeId}`)}
                className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageContainer>
  );
}
