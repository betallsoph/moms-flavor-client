'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';

export default function IngredientsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Load recipe from RecipeService
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        // Initialize all items as unchecked
        if (found.ingredientsList) {
          const initialState: Record<number, boolean> = {};
          found.ingredientsList.forEach((_: any, idx: number) => {
            initialState[idx] = false;
          });
          setCheckedItems(initialState);
        }
      }
      setLoading(false);
    };
    
    loadRecipe();
    
    // Clear completed timers and active timers when starting fresh
    const userId = auth.currentUser?.uid;
    if (userId) {
      // Clear from Firestore
      firestoreService.clearCookingSession(userId, recipeId).catch(err => 
        console.error('Error clearing session:', err)
      );
    }
    // Always clear localStorage as backup
    localStorage.removeItem(`cook-completed-${recipeId}`);
    localStorage.removeItem(`cook-timers-${recipeId}`);
    
    setLoading(false);
  }, [recipeId]);

  const handleCheck = (index: number) => {
    const updated = { ...checkedItems, [index]: !checkedItems[index] };
    setCheckedItems(updated);
    
    // Check if all are checked
    if (recipe?.ingredientsList) {
      const allCheckedNow = recipe.ingredientsList.every((_, idx) => updated[idx]);
      setAllChecked(allCheckedNow);
    }
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
        icon="🛒"
        title="Chuẩn bị nguyên liệu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {recipe.dishName || recipe.recipeName || 'Công thức'}
          </h2>
          <p className="text-gray-600 mb-8">
            ✓ Kiểm tra từng nguyên liệu khi chuẩn bị xong
          </p>

          {recipe.ingredientsList && recipe.ingredientsList.length > 0 ? (
            <div className="space-y-3 mb-8">
              {recipe.ingredientsList.map((ingredient, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`ingredient-${idx}`}
                    checked={checkedItems[idx] || false}
                    onChange={() => handleCheck(idx)}
                    className="w-6 h-6 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor={`ingredient-${idx}`} className="flex-1 cursor-pointer">
                    <p className="font-semibold text-gray-900">{ingredient.name}</p>
                    <p className="text-sm text-gray-600">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600 mb-8">
              <p>Chưa có nguyên liệu. Vui lòng thêm nguyên liệu trước.</p>
            </div>
          )}

          {/* Special Notes */}
          {recipe.specialNotes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded mb-8">
              <p className="font-semibold text-gray-900 mb-2">✨ Lưu ý đặc biệt:</p>
              <p className="text-gray-700">{recipe.specialNotes}</p>
            </div>
          )}

          {/* Favorite Brands */}
          {recipe.favoriteBrands && recipe.favoriteBrands.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mb-8">
              <p className="font-semibold text-gray-900 mb-3">🏷️ Hãng/thực phẩm quen thuộc:</p>
              <div className="flex flex-wrap gap-2">
                {recipe.favoriteBrands.map((brand, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">Tiến độ chuẩn bị</p>
              <p className="text-2xl font-bold text-orange-600">
                {recipe.ingredientsList ? Object.values(checkedItems).filter(Boolean).length : 0}/{recipe.ingredientsList?.length || 0}
              </p>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: recipe.ingredientsList 
                    ? `${(Object.values(checkedItems).filter(Boolean).length / recipe.ingredientsList.length) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/recipes/${recipeId}`)}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={!allChecked}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục →
            </button>
          </div>

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-gradient-to-br from-orange-100/90 via-amber-50/90 to-pink-100/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 border-2 border-orange-200 animate-slideUp max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Sẵn sàng nấu chưa?</h3>
                  <p className="text-gray-600">
                    Chuẩn bị bắt đầu nấu <span className="font-bold text-orange-600">{recipe.dishName || recipe.recipeName}</span>
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-900">Đã chuẩn bị nguyên liệu</p>
                      <p className="text-sm text-green-700">Tất cả {recipe.ingredientsList?.length || 0} nguyên liệu đã sẵn sàng</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-2xl">👨‍🍳</span>
                    <div>
                      <p className="font-semibold text-orange-900">Sẵn sàng bắt tay vào công việc</p>
                      <p className="text-sm text-orange-700">Bạn sẽ được hướng dẫn từng bước</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💡</span>
                    <span>Mẹo trước khi nấu</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">
                        <strong className="text-blue-900">Mise en place:</strong> Chuẩn bị tất cả nguyên liệu trước khi bắt đầu nấu giúp quá trình nấu suôn sẻ hơn.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">
                        <strong className="text-yellow-900">Chuẩn bị trước:</strong> Nên cắt và chuẩn bị các nguyên liệu có yêu cầu đặc biệt trước (tỏi, hành, v.v.).
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">
                        <strong className="text-green-900">Dụng cụ:</strong> Hãy đảm bảo tất cả dụng cụ nấu nướng đã chuẩn bị sẵn.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">
                        <strong className="text-purple-900">Tự tin:</strong> Đừng sợ nếu chưa thành thạo. Hãy yên tâm thực hiện từng bước và đừng ngần ngại quay lại nếu cần.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={() => router.push(`/cook/${recipeId}/steps/1`)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Bắt đầu nấu! 🚀
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
