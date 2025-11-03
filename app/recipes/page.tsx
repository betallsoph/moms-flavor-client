'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { Recipe } from '@/types/recipe';
import { RecipeService } from '@/libs/recipeService';

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = async () => {
    const data = await RecipeService.getAll();
    setRecipes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // Reload recipes when page regains focus (coming back from edit)
  useEffect(() => {
    const handleFocus = () => {
      loadRecipes();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [toDeleteTitle, setToDeleteTitle] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const found = recipes.find((r) => r.id === id);
    const title = found?.dishName || 'công thức này';
    setToDeleteId(id);
    setToDeleteTitle(title);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    await RecipeService.delete(toDeleteId);
    await loadRecipes();
    // reset modal state
    setConfirmOpen(false);
    setToDeleteId(null);
    setToDeleteTitle(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
    setToDeleteTitle(null);
  };

  return (
    <PageContainer>
      <ConfirmModal
        open={confirmOpen}
        title={`Xóa công thức`}
        description={toDeleteTitle ? `Bạn có chắc muốn xóa "${toDeleteTitle}"? Hành động này không thể hoàn tác.` : undefined}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <PageHeader
        icon="📚"
        title="Danh sách công thức"
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <LoadingSpinner message="Đang tải công thức..." />
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📖</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có công thức nào
              </h3>
              <p className="text-gray-500 mb-8">
                Hãy tạo công thức đầu tiên của bạn!
              </p>
              <GradientButton onClick={() => router.push('/recipes/new')}>
                Thêm công thức đầu tiên
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-orange-100 hover:border-orange-300 overflow-hidden transition-all group cursor-default"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4 border-b border-orange-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {recipe.dishName}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                    {recipe.instructor && (
                      <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
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
                        {recipe.difficulty === 'very_easy' && '⭐ Rất dễ'}
                        {recipe.difficulty === 'easy' && '⭐⭐ Dễ'}
                        {recipe.difficulty === 'medium' && '⭐⭐⭐ Trung bình'}
                        {recipe.difficulty === 'hard' && '⭐⭐⭐⭐ Khó'}
                        {recipe.difficulty === 'very_hard' && '⭐⭐⭐⭐⭐ Rất khó'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Thời gian:</span>
                      <span className="text-xs text-gray-600">
                        {recipe.cookingTime === 'very_fast' && '⚡ Rất nhanh'}
                        {recipe.cookingTime === 'fast' && '⏱️ Nhanh'}
                        {recipe.cookingTime === 'medium' && '🕐 Trung bình'}
                        {recipe.cookingTime === 'slow' && '⏳ Chậm'}
                        {recipe.cookingTime === 'very_slow' && '🕰️ Rất chậm'}
                      </span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Mô tả:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => {
                      // Store selected recipe and navigate to detail view
                      localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                      router.push(`/recipes/${recipe.id}`);
                    }}
                    className="flex-1 bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="flex-1 bg-red-100 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Recipe Button (Floating) */}
        {recipes.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <GradientButton onClick={() => router.push('/recipes/new')}>
                <span>➕</span>
                <span className="ml-2">Thêm công thức mới</span>
              </GradientButton>
            </div>

            {/* Suggestion Card */}
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 p-8">
              <div className="flex gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    Ở trang này có thể thêm một thanh tìm kiếm, và chia người chỉ công thức nấu ra sao cho nhìn dễ hơn thay vì gắn tag như hiện tại nhỉ?...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
