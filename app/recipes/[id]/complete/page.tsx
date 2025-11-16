'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

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
  ingredientsList?: Ingredient[];
  favoriteBrands?: string[];
  specialNotes?: string;
  instructions?: string;
  tips?: string;
  createdAt: string;
}

export default function CompleteRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [hasBrands, setHasBrands] = useState(false);
  const [brandsInput, setBrandsInput] = useState('');
  const [hasSpecialNotes, setHasSpecialNotes] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        setIngredients(found.ingredientsList || []);
        setBrandsInput(found.favoriteBrands?.join(', ') || '');
        setHasBrands(!!found.favoriteBrands?.length);
        setSpecialNotes(found.specialNotes || '');
        setHasSpecialNotes(!!found.specialNotes);
      }
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: Date.now().toString(),
        name: '',
        quantity: '',
        unit: '',
      },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with all data using RecipeService
    try {
      await RecipeService.update(recipeId, {
        ingredientsList: ingredients.filter(ing => ing.name.trim()),
        favoriteBrands: hasBrands ? brandsInput.split(',').map(b => b.trim()).filter(b => b) : [],
        specialNotes: hasSpecialNotes ? specialNotes : '',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}/instructions`);
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
        title="Nhập nguyên liệu"
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
              Nhập danh sách nguyên liệu cần thiết để nấu món ăn này
            </p>
          </div>

          <form onSubmit={handleSaveAndContinue} className="space-y-6">
            {/* Ingredients List */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Nguyên liệu *
              </label>

              {ingredients.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">Chưa có nguyên liệu nào. Hãy thêm nguyên liệu đầu tiên.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex gap-2 items-start">
                      <div className="text-sm text-gray-500 w-6 pt-2">{index + 1}.</div>
                      <input
                        type="text"
                        placeholder="Tên nguyên liệu"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Số lượng"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Đơn vị"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addIngredient}
                className="w-full px-4 py-2 border-2 border-dashed border-orange-300 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-sm"
              >
                + Thêm nguyên liệu
              </button>
            </div>

            {/* Favorite Brands & Foods */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="hasBrands"
                  checked={hasBrands}
                  onChange={(e) => setHasBrands(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="hasBrands" className="text-sm font-semibold text-gray-900 cursor-pointer">
                  🏷️ Có hãng/thực phẩm quen thuộc
                </label>
              </div>

              {hasBrands && (
                <div>
                  <input
                    type="text"
                    value={brandsInput}
                    onChange={(e) => setBrandsInput(e.target.value)}
                    placeholder="Nhập hãng/thực phẩm, cách nhau bằng dấu phẩy&#10;VD: Ajinomoto, Maggi, Tôm tươi, Gà ta"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Gợi ý: Nhập những hãng hoặc thực phẩm mà bạn thường dùng cho món này
                  </p>
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="hasNotes"
                  checked={hasSpecialNotes}
                  onChange={(e) => setHasSpecialNotes(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="hasNotes" className="text-sm font-semibold text-gray-900 cursor-pointer">
                  ✨ Có lưu ý đặc biệt từ người hướng dẫn
                </label>
              </div>

              {hasSpecialNotes && (
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Nhập lưu ý đặc biệt, mẹo nấu, hoặc những điều cần chú ý..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-6">
              <button
                type="button"
                onClick={async () => {
                  // Save all data and go to recipes list
                  try {
                    await RecipeService.update(recipeId, {
                      ingredientsList: ingredients.filter(ing => ing.name.trim()),
                      favoriteBrands: hasBrands ? brandsInput.split(',').map(b => b.trim()).filter(b => b) : [],
                      specialNotes: hasSpecialNotes ? specialNotes : '',
                    });
                  } catch (error) {
                    console.error('Error saving recipe:', error);
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
                {saving ? 'Đang lưu...' : 'Tiếp tục thêm các bước nấu'}
              </GradientButton>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Bước tiếp theo:</p>
              <p className="text-sm text-gray-700">
                Sau khi hoàn chỉnh nguyên liệu, bạn có thể tiếp tục thêm hướng dẫn nấu và bí kíp riêng của mình
              </p>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
