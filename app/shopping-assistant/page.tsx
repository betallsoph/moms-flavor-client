'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';


type SmartShoppingCategory = {
  category: string;
  items: Array<{
    name: string;
    quantity: string;
    reasoning?: string;
    forDishes?: string[];
  }>;
};

type SmartShoppingResponse = {
  fromRecipes: SmartShoppingCategory[];
  aiSuggestions: SmartShoppingCategory[];
  advice?: string;
};

type SavedRecipe = {
  id: string;
  dishName: string;
  ingredients: { name: string; quantity: string; unit: string }[];
};


interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: 'rau-cu' | 'thit-ca' | 'gia-vi' | 'khac';
  checked: boolean;
  createdAt: string;
}

const CATEGORIES = {
  'rau-cu': { name: 'Rau - Củ', emoji: '🥬' },
  'thit-ca': { name: 'Thịt - Cá', emoji: '🥩' },
  'gia-vi': { name: 'Gia vị', emoji: '🧂' },
  'khac': { name: 'Khác', emoji: '📦' },
};

export default function ShoppingAssistantPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'rau-cu' | 'thit-ca' | 'gia-vi' | 'khac'>('khac');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [customDishes, setCustomDishes] = useState<string[]>([]);
  const [customDishInput, setCustomDishInput] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [mealCount, setMealCount] = useState(1);
  const [aiPlanning, setAiPlanning] = useState(false);
  const [aiPlanError, setAiPlanError] = useState('');
  const [aiResult, setAiResult] = useState<SmartShoppingResponse | null>(null);
  const [aiChecklist, setAiChecklist] = useState<Record<string, boolean>>({});

  const loadItems = () => {
    const saved = localStorage.getItem('shopping-list') || '[]';
    const parsed = JSON.parse(saved);
    setItems(parsed);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipes = await RecipeService.getAll();
        const processed: SavedRecipe[] = recipes
          .filter(r => r.dishName || r.recipeName)
          .map(r => ({
            id: r.id,
            dishName: (r.dishName || r.recipeName || '').trim(),
            ingredients: (r.ingredientsList || []).map(ing =>
              typeof ing === 'string'
                ? { name: ing, quantity: '', unit: '' }
                : { name: ing.name, quantity: ing.quantity || '', unit: ing.unit || '' }
            ),
          }));
        setSavedRecipes(processed);
      } catch (error) {
        console.error('Error loading recipes for shopping assistant:', error);
      }
    };
    fetchRecipes();
  }, []);

  const saveItems = (updatedItems: ShoppingItem[]) => {
    localStorage.setItem('shopping-list', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      quantity: newItemQuantity,
      unit: newItemUnit,
      category: newItemCategory,
      checked: false,
      createdAt: new Date().toISOString(),
    };

    saveItems([...items, newItem]);
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('');
    setNewItemCategory('khac');
    setShowAddForm(false);
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const handleClearCompleted = () => {
    saveItems(items.filter((item) => !item.checked));
  };

  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleAddCustomDish = () => {
    const value = customDishInput.trim();
    if (!value) return;
    if (!customDishes.includes(value)) {
      setCustomDishes((prev) => [...prev, value]);
    }
    setCustomDishInput('');
  };

  const handleRemoveCustomDish = (dishName: string) => {
    setCustomDishes((prev) => prev.filter((d) => d !== dishName));
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
  };

  const handleGenerateAiList = async () => {
    if (selectedRecipeIds.length === 0 && customDishes.length === 0) {
      setAiPlanError('Hãy chọn ít nhất một món bạn muốn nấu.');
      return;
    }
    setAiPlanError('');
    setAiPlanning(true);
    setAiChecklist({});

    // Chuẩn bị data từ công thức đã lưu
    const selectedRecipesData = savedRecipes
      .filter((r) => selectedRecipeIds.includes(r.id))
      .map((r) => ({
        dishName: r.dishName,
        ingredients: r.ingredients,
        isFromSavedRecipe: true,
      }));

    try {
      const res = await fetch('/api/assistant/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishes: selectedRecipesData,
          otherDishes: customDishes,
          people: peopleCount,
          meals: mealCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không tạo được danh sách đi chợ');
      }
      setAiResult(data);
    } catch (error: any) {
      setAiResult(null);
      setAiPlanError(error.message || 'AI không thể tạo danh sách lúc này. Thử lại sau nhé.');
    } finally {
      setAiPlanning(false);
    }
  };

  const toggleAiChecklist = (key: string) => {
    setAiChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Group items by category
  const itemsByCategory = Object.keys(CATEGORIES).reduce((acc, category) => {
    acc[category as keyof typeof CATEGORIES] = items.filter((item) => item.category === category);
    return acc;
  }, {} as Record<keyof typeof CATEGORIES, ShoppingItem[]>);

  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-2">
              Trợ lý đi chợ
            </h1>
            <p className="text-base text-gray-600">
              Lập danh sách mua sắm thông minh với AI
            </p>
          </div>

          {/* Progress */}
              {items.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <span>Đã mua:</span>
                    <span className="font-bold text-blue-700">{checkedCount}</span>
                    <span>/</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="max-w-md mx-auto relative h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* AI Planner Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-gray-900">AI Lên danh sách đi chợ</p>
                <p className="text-sm text-gray-600">
                  Chọn món từ công thức đã lưu (lấy nguyên liệu chính xác) hoặc nhập món khác.
                </p>
              </div>
              {(selectedRecipeIds.length > 0 || customDishes.length > 0) && (
                <button
                  type="button"
                  onClick={() => { setSelectedRecipeIds([]); setCustomDishes([]); }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Chọn từ công thức đã lưu (có nguyên liệu chi tiết)</p>
                {savedRecipes.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Bạn chưa có công thức nào. Hãy thêm vài món để lấy nguyên liệu chính xác, hoặc nhập thủ công bên dưới.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {savedRecipes.map((recipe) => {
                      const isSelected = selectedRecipeIds.includes(recipe.id);
                      return (
                        <button
                          type="button"
                          key={recipe.id}
                          onClick={() => toggleRecipeSelection(recipe.id)}
                          className={`text-xs sm:text-sm px-3 py-2 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <span className="block font-medium">{recipe.dishName}</span>
                          <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                            {recipe.ingredients.length} nguyên liệu
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thêm món khác (AI sẽ ước lượng)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customDishInput}
                    onChange={(e) => setCustomDishInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDish()}
                    placeholder="VD: Lẩu hải sản"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDish}
                    className="px-6 py-3 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-700 rounded-xl font-bold transition-all hover:scale-[1.02]"
                  >
                    Thêm món
                  </button>
                </div>

                {/* Selected recipes */}
                {selectedRecipeIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {savedRecipes.filter(r => selectedRecipeIds.includes(r.id)).map((recipe) => (
                      <span
                        key={recipe.id}
                        className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700 flex items-center gap-2"
                      >
                        {recipe.dishName}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipe(recipe.id)}
                          className="text-blue-500 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom dishes */}
                {customDishes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customDishes.map((dish) => (
                      <span
                        key={dish}
                        className="px-3 py-1 bg-orange-100 rounded-full text-sm text-orange-700 flex items-center gap-2"
                      >
                        {dish} <span className="text-xs text-orange-500">(AI ước lượng)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomDish(dish)}
                          className="text-orange-500 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Số người ăn</label>
                  <input
                    type="number"
                    min={1}
                    value={peopleCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setPeopleCount(Number.isNaN(value) ? 1 : Math.max(1, value));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Số bữa cần nấu</label>
                  <input
                    type="number"
                    min={1}
                    value={mealCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setMealCount(Number.isNaN(value) ? 1 : Math.max(1, value));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiList}
                disabled={aiPlanning}
                className="w-full py-3 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-700 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {aiPlanning ? 'AI đang lập danh sách...' : 'AI lên danh sách đi chợ'}
              </button>

              {aiPlanError && <p className="text-sm text-red-600">{aiPlanError}</p>}
            </div>

            {aiResult && (
              <div className="space-y-6 pt-4 border-t border-blue-100">
                {/* Nguyên liệu từ công thức đã lưu */}
                {aiResult.fromRecipes && aiResult.fromRecipes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xl">📖</span>
                      Nguyên liệu từ công thức đã lưu
                    </h3>
                    {aiResult.fromRecipes.map((category, catIndex) => (
                      <div key={`recipe-${category.category}-${catIndex}`} className="bg-white border-2 border-blue-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-gray-900">{category.category}</p>
                          <span className="text-xs text-blue-600 font-medium">{category.items.length} nguyên liệu</span>
                        </div>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => {
                            const checkboxKey = `recipe-${catIndex}-${itemIndex}`;
                            return (
                              <label
                                key={checkboxKey}
                                className="flex gap-3 items-start border border-blue-100 rounded-xl p-3 hover:border-blue-300 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!aiChecklist[checkboxKey]}
                                  onChange={() => toggleAiChecklist(checkboxKey)}
                                  className="mt-1 w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    <span className="text-sm text-gray-600">{item.quantity}</span>
                                  </div>
                                  {item.forDishes && item.forDishes.length > 0 && (
                                    <p className="text-xs text-blue-500 mt-1">
                                      Dùng cho: {item.forDishes.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nguyên liệu cho món chưa có công thức */}
                {aiResult.aiSuggestions && aiResult.aiSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      Nguyên liệu cho món chưa có công thức
                      <span className="text-sm font-normal text-purple-600">(AI ước lượng)</span>
                    </h3>
                    {aiResult.aiSuggestions.map((category, catIndex) => (
                      <div key={`ai-${category.category}-${catIndex}`} className="bg-white border-2 border-purple-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-gray-900">{category.category}</p>
                          <span className="text-xs text-purple-600 font-medium">{category.items.length} nguyên liệu</span>
                        </div>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => {
                            const checkboxKey = `ai-${catIndex}-${itemIndex}`;
                            return (
                              <label
                                key={checkboxKey}
                                className="flex gap-3 items-start border border-purple-100 rounded-xl p-3 hover:border-purple-300 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!aiChecklist[checkboxKey]}
                                  onChange={() => toggleAiChecklist(checkboxKey)}
                                  className="mt-1 w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    <span className="text-sm text-gray-600">{item.quantity}</span>
                                  </div>
                                  {item.reasoning && (
                                    <p className="text-xs text-purple-500 mt-1">
                                      {item.reasoning}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Không có kết quả */}
                {(!aiResult.fromRecipes || aiResult.fromRecipes.length === 0) &&
                  (!aiResult.aiSuggestions || aiResult.aiSuggestions.length === 0) && (
                  <p className="text-sm text-gray-500">AI chưa trả danh sách nguyên liệu nào.</p>
                )}

                {aiResult.advice && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">Mẹo từ AI</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{aiResult.advice}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Shopping List */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Danh sách thủ công</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-700 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
              >
                + Thêm món
              </button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-4xl mb-3 opacity-60">🛒</div>
                <p className="text-gray-500">Chưa có gì trong danh sách thủ công</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(CATEGORIES).map(([categoryKey, categoryInfo]) => {
                  const categoryItems = itemsByCategory[categoryKey as keyof typeof CATEGORIES];
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={categoryKey} className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xl">{categoryInfo.emoji}</span>
                        <h3 className="text-sm font-bold text-gray-700">
                          {categoryInfo.name}
                        </h3>
                        <div className="ml-auto text-xs text-blue-600 font-medium">
                          {categoryItems.length}
                        </div>
                      </div>

                      {/* Category Items */}
                      <div className="space-y-2">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`group relative bg-white border-2 border-blue-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-blue-300 ${
                              item.checked ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleToggleItem(item.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                                  item.checked
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-blue-300 bg-white'
                                } flex items-center justify-center transition-all hover:scale-110`}
                              >
                                {item.checked && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>

                              {/* Item Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-gray-900 ${item.checked ? 'line-through' : ''}`}>
                                  {item.name}
                                </p>
                                {(item.quantity || item.unit) && (
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {item.quantity} {item.unit}
                                  </p>
                                )}
                              </div>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition-all hover:bg-red-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Clear Completed Button */}
                {checkedCount > 0 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleClearCompleted}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl border-2 border-red-200 text-sm font-bold hover:bg-red-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Xoá đã mua ({checkedCount})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Link to "Hôm nay nấu gì?" for ingredient-based cooking */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Có nguyên liệu, không biết nấu gì?</p>
              <p className="text-sm text-gray-600">AI sẽ gợi ý món ăn dựa trên nguyên liệu bạn đang có</p>
            </div>
            <button
              onClick={() => router.push('/whats-cooking?tab=ingredients')}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            >
              Đến Hôm nay nấu gì?
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>


      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-6 sm:p-8 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Thêm món mới</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên món</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Cà chua"
                  className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setNewItemCategory(key as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        newItemCategory === key
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-lg">{val.emoji}</span>
                      <span className="text-sm font-medium">{val.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="kg"
                    className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="w-full py-3.5 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-700 font-bold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
