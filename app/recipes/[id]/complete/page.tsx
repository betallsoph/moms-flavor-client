'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui';
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công thức</p>
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
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image inside modal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full p-2 border-2 border-orange-300 rounded-lg">
                <Image
                  src="/assets/background/ingredient.png"
                  alt="Ingredients Illustration"
                  width={500}
                  height={500}
                  className="object-contain w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Form inside modal */}
            <div>
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
              <label className="block text-sm font-semibold text-orange-700 mb-4">
                Nguyên liệu
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
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Số lượng"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                        className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Đơn vị"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-200 rounded-lg transition-colors text-sm font-semibold"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addIngredient}
                className="w-full px-4 py-3 border-2 border-dashed border-orange-300 text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-all hover:scale-[1.02]"
              >
                Thêm nguyên liệu
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
                  className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                  style={{
                    backgroundImage: hasBrands
                      ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                      : 'none'
                  }}
                />
                <label htmlFor="hasBrands" className="text-sm font-semibold text-orange-700 cursor-pointer">
                  Có hãng/thực phẩm quen thuộc
                </label>
              </div>

              {hasBrands && (
                <input
                  type="text"
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  placeholder="Nhập hãng/thực phẩm, cách nhau bằng dấu phẩy. VD: Ajinomoto, Maggi, Tôm tươi, Gà ta"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
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
                  className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                  style={{
                    backgroundImage: hasSpecialNotes
                      ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                      : 'none'
                  }}
                />
                <label htmlFor="hasNotes" className="text-sm font-semibold text-orange-700 cursor-pointer">
                  Có lưu ý đặc biệt từ người hướng dẫn
                </label>
              </div>

              {hasSpecialNotes && (
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Nhập lưu ý đặc biệt, mẹo nấu, hoặc những điều cần chú ý..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Tiếp tục thêm các bước nấu'}
              </button>
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
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm"
              >
                Lưu và tiếp tục sau
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
