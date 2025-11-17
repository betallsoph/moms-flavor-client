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
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');

  const loadRecipes = async () => {
    const data = await RecipeService.getAll();
    setRecipes(data);
    setLoading(false);
  };

  // Get unique instructors
  const instructors = recipes
    .map(r => r.instructor)
    .filter((instructor): instructor is string => !!instructor && instructor.trim() !== '')
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  // Filter recipes by selected instructor
  const filteredRecipes = selectedInstructor === '' || selectedInstructor === 'all'
    ? recipes
    : recipes.filter(r => r.instructor === selectedInstructor);

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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <LoadingSpinner message="Đang tải công thức..." />
        ) : recipes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-5xl">📖</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có công thức nào
              </h3>
              <p className="text-gray-600 mb-8">
                Hãy tạo công thức đầu tiên của bạn!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/recipes/new')}
                  className="w-full max-w-sm mx-auto block p-4 bg-green-100 hover:bg-green-200 border-2 border-green-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-green-700"
                >
                  Thêm công thức đầu tiên
                </button>

                <button
                  onClick={() => router.push('/home')}
                  className="w-full max-w-sm mx-auto block p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm"
                >
                  Quay lại trang chủ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filter Dropdown and Back to Home Button - Spans all columns */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
              {instructors.length > 0 && (
                <div className="relative md:col-span-1 lg:col-span-2">
                  <style jsx>{`
                    #instructor-filter option {
                      padding: 12px 16px;
                      font-weight: 600;
                      font-size: 18px;
                      background-color: #f0fdf4;
                      color: #15803d;
                    }
                    #instructor-filter option:hover {
                      background-color: #dcfce7;
                    }
                    #instructor-filter option:checked {
                      background-color: #bbf7d0;
                      color: #166534;
                    }
                  `}</style>
                  <select
                    id="instructor-filter"
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="w-full h-full px-4 py-4 pr-10 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-xl font-bold text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 appearance-none cursor-pointer transition-all hover:border-green-400 shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2316a34a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    <option value="" disabled>Chọn người hướng dẫn cụ thể ở đây!</option>
                    <option value="all">Tất cả</option>
                    {instructors.map((instructor) => (
                      <option key={instructor} value={instructor}>
                        {instructor}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Back to Home Button */}
              <button
                onClick={() => router.push('/home')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-lg md:col-span-1 lg:col-span-1"
              >
                Quay lại trang chủ
              </button>
            </div>

            {/* Add Recipe Card */}
            <div
              onClick={() => router.push('/recipes/new')}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md border-2 border-dashed border-green-300 overflow-hidden transition-all duration-300 cursor-pointer hover:border-green-500 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center h-[280px]"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-bold text-green-700 text-lg">Thêm công thức mới</p>
              </div>
            </div>

            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => {
                  localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                  router.push(`/recipes/${recipe.id}`);
                }}
                className="bg-white rounded-2xl shadow-md border-2 border-green-200 overflow-hidden transition-all duration-300 group cursor-pointer hover:border-green-400 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-[280px]"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3 border-b border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                    {recipe.dishName}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    {recipe.instructor && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                        👤 {recipe.instructor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-5 py-3 space-y-2 flex-1 overflow-hidden">
                  {/* Difficulty & Cooking Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Độ khó:</span>
                      <span className="text-sm text-gray-600">
                        {recipe.difficulty === 'very_easy' && '⭐ Rất dễ'}
                        {recipe.difficulty === 'easy' && '⭐⭐ Dễ'}
                        {recipe.difficulty === 'medium' && '⭐⭐⭐ Trung bình'}
                        {recipe.difficulty === 'hard' && '⭐⭐⭐⭐ Khó'}
                        {recipe.difficulty === 'very_hard' && '⭐⭐⭐⭐⭐ Rất khó'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Thời gian:</span>
                      <span className="text-sm text-gray-600">
                        {recipe.cookingTime === 'very_fast' && '⚡ Rất nhanh'}
                        {recipe.cookingTime === 'fast' && '⏱️ Nhanh'}
                        {recipe.cookingTime === 'medium' && '🕐 Trung bình'}
                        {recipe.cookingTime === 'slow' && '⏳ Chậm'}
                        {recipe.cookingTime === 'very_slow' && '🕰️ Rất chậm'}
                      </span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Mô tả:</h4>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {recipe.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </main>
    </PageContainer>
  );
}
