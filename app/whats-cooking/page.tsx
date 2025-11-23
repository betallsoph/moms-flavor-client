'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

type SuggestedDish = {
  dishName: string;
  usedIngredients: string[];
  missingIngredients: string[];
  isFromSavedRecipes: boolean;
  recipeId?: string;
  matchScore: number;
};

type IngredientSuggestionResponse = {
  fromSavedRecipes: SuggestedDish[];
  aiSuggestions: SuggestedDish[];
  advice?: string;
};

export default function WhatsCookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Recipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showMode, setShowMode] = useState<'random' | 'ai' | 'ingredients' | 'mood'>('random');
  const [aiMessage, setAiMessage] = useState('');
  const [storyInputs, setStoryInputs] = useState({
    dishName: '',
    ingredients: '',
    mood: '',
  });
  const [story, setStory] = useState('');
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState('');

  // Ingredient-based cooking states
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [ingredientAnalyzing, setIngredientAnalyzing] = useState(false);
  const [ingredientError, setIngredientError] = useState('');
  const [ingredientResult, setIngredientResult] = useState<IngredientSuggestionResponse | null>(null);
  const [addedToListDialog, setAddedToListDialog] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });

  // Emotion-based search states
  const [moodQuery, setMoodQuery] = useState('');
  const [moodSearching, setMoodSearching] = useState(false);
  const [moodError, setMoodError] = useState('');
  const [moodResults, setMoodResults] = useState<{
    recipeId: string;
    dishName: string;
    matchScore: number;
    matchedTags: string[];
    emotionalConnection: string;
  }[]>([]);

  useEffect(() => {
    loadRecipes();
    loadAiRecommendations();
  }, [user]);

  // Ingredient-based cooking functions
  const handleAddIngredient = () => {
    const value = newIngredient.trim();
    if (!value) return;
    if (!availableIngredients.includes(value)) {
      setAvailableIngredients((prev) => [...prev, value]);
    }
    setNewIngredient('');
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setAvailableIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleAnalyzeIngredients = async () => {
    if (availableIngredients.length === 0) {
      setIngredientError('Hãy nhập ít nhất một nguyên liệu bạn có.');
      return;
    }
    setIngredientError('');
    setIngredientAnalyzing(true);
    setIngredientResult(null);

    try {
      const recipesForAI = recipes.map((r) => ({
        id: r.id,
        dishName: r.dishName || r.recipeName || '',
        ingredients: r.ingredientsList?.map((ing) =>
          typeof ing === 'string' ? ing : ing.name
        ) || [],
      }));

      const res = await fetch('/api/assistant/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: availableIngredients,
          savedRecipes: recipesForAI,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể phân tích nguyên liệu');
      }
      setIngredientResult(data);
    } catch (error: any) {
      setIngredientError(error.message || 'AI không thể phân tích lúc này. Thử lại sau nhé.');
    } finally {
      setIngredientAnalyzing(false);
    }
  };

  const addMissingToShoppingList = (missingIngredients: string[]) => {
    const saved = localStorage.getItem('shopping-list') || '[]';
    const existingItems = JSON.parse(saved);
    const newItems = missingIngredients.map((name, index) => ({
      id: `item-${Date.now()}-${index}`,
      name,
      quantity: '',
      unit: '',
      category: 'khac',
      checked: false,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem('shopping-list', JSON.stringify([...existingItems, ...newItems]));
    setAddedToListDialog({ show: true, count: missingIngredients.length });
  };

  // Emotion-based search function
  const handleMoodSearch = async () => {
    if (!moodQuery.trim()) {
      setMoodError('Hãy nhập tâm trạng hoặc mong muốn của bạn.');
      return;
    }
    if (recipes.length === 0) {
      setMoodError('Bạn chưa có công thức nào. Hãy tạo công thức trước!');
      return;
    }

    setMoodError('');
    setMoodSearching(true);
    setMoodResults([]);

    try {
      const recipesForAI = recipes.map((r) => ({
        id: r.id,
        dishName: r.dishName || r.recipeName || '',
        emotionTags: r.emotionTags || [],
        description: r.description || '',
        specialNotes: r.specialNotes || '',
      }));

      const res = await fetch('/api/assistant/emotion-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodQuery,
          recipes: recipesForAI,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tìm kiếm');
      }
      setMoodResults(data.results || []);
    } catch (error: any) {
      setMoodError(error.message || 'AI không thể tìm kiếm lúc này. Thử lại sau nhé.');
    } finally {
      setMoodSearching(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await RecipeService.getAll();
      setRecipes(allRecipes);

      // Get 3 random recipes for suggestions
      if (allRecipes.length > 0) {
        const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
        setSuggestedRecipes(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAiRecommendations = async () => {
    if (!user) return;

    try {
      setAiLoading(true);
      setAiMessage('');
      const response = await fetch(`/api/recommendations?userId=${user.id}&count=3`);
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
      if (data.message) {
        setAiMessage(data.message);
      }
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setAiMessage('Không lấy được gợi ý AI lúc này. Thử lại sau nhé.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefresh = () => {
    if (recipes.length > 0) {
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setSuggestedRecipes(shuffled.slice(0, 3));
    }
  };

  const handleCookNow = (recipeId: string) => {
    router.push(`/cook/${recipeId}/start-confirmation`);
  };

  const handleGenerateStory = async () => {
    if (!storyInputs.dishName.trim()) {
      setStoryError('Vui lòng nhập tên món ăn');
      return;
    }
    setStory('');
    setStoryError('');
    setStoryLoading(true);
    try {
      const res = await fetch('/api/nostalgia-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: storyInputs.dishName,
          ingredients: storyInputs.ingredients,
          mood: storyInputs.mood,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không tạo được lời dẫn');
      }
      setStory(data.story);
    } catch (error: any) {
      setStoryError(error.message || 'Không tạo được lời dẫn, thử lại nhé');
    } finally {
      setStoryLoading(false);
    }
  };

  const getDifficultyText = (level?: string) => {
    switch (level) {
      case 'very_easy': return 'Rất dễ';
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      case 'very_hard': return 'Rất khó';
      default: return 'N/A';
    }
  };

  const getCookingTimeText = (time?: string) => {
    switch (time) {
      case 'very_fast': return 'Rất nhanh';
      case 'fast': return 'Nhanh';
      case 'medium': return 'Trung bình';
      case 'slow': return 'Chậm';
      case 'very_slow': return 'Rất chậm';
      default: return 'N/A';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Hôm nay nấu gì?
            </h1>
            <p className="text-base text-gray-600">
              Để chúng tôi gợi ý món ngon cho bạn
            </p>
          </div>

          {/* AI Nostalgia Storyteller */}
          <div className="mb-10 bg-gradient-to-br from-rose-50 via-white to-orange-50 border border-orange-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  AI giúp món ăn của bạn có ý nghĩa hơn
                </p>
                <p className="text-sm text-gray-600">
                  Viết đoạn gợi nhớ cảm xúc cho món ăn bạn đang nghĩ đến
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-orange-700 mb-1 block">Tên món</label>
                <input
                  type="text"
                  value={storyInputs.dishName}
                  onChange={(e) => setStoryInputs({ ...storyInputs, dishName: e.target.value })}
                  placeholder="VD: Canh rau tập tàng"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-orange-700 mb-1 block">Nguyên liệu chính (tùy chọn)</label>
                <input
                  type="text"
                  value={storyInputs.ingredients}
                  onChange={(e) => setStoryInputs({ ...storyInputs, ingredients: e.target.value })}
                  placeholder="VD: Rau dền, mướp, tôm khô"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-orange-700 mb-1 block">Tâm trạng / Kỷ niệm (tùy chọn)</label>
                <input
                  type="text"
                  value={storyInputs.mood}
                  onChange={(e) => setStoryInputs({ ...storyInputs, mood: e.target.value })}
                  placeholder="VD: Bữa cơm ngày Tết"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <button
                onClick={handleGenerateStory}
                disabled={storyLoading}
                className="px-6 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl font-semibold text-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {storyLoading ? 'AI đang viết...' : 'AI thổi hồn vào món ăn'}
              </button>
              {storyError && <p className="text-sm text-red-600">{storyError}</p>}
            </div>
            {story && (
              <div className="bg-white border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 italic mb-2">Lời dẫn gợi nhớ</p>
                <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
                  {story}
                </p>
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setShowMode('random')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                showMode === 'random'
                  ? 'bg-orange-100 border-2 border-orange-300 text-orange-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ngẫu nhiên
            </button>
            <button
              onClick={() => setShowMode('ai')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                showMode === 'ai'
                  ? 'bg-purple-100 border-2 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              AI gợi ý
            </button>
            <button
              onClick={() => setShowMode('ingredients')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                showMode === 'ingredients'
                  ? 'bg-orange-100 border-2 border-orange-300 text-orange-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Từ nguyên liệu có sẵn
            </button>
            <button
              onClick={() => setShowMode('mood')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                showMode === 'mood'
                  ? 'bg-rose-100 border-2 border-rose-300 text-rose-700'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Theo tâm trạng
            </button>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-700 mb-6">
                Chưa có công thức nào. Hãy tạo công thức đầu tiên của bạn!
              </p>
              <button
                onClick={() => router.push('/recipes/new')}
                className="px-8 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
              >
                Tạo công thức mới
              </button>
            </div>
          ) : (
            <>
              {/* Description based on mode */}
              <p className="text-base text-gray-700 text-center mb-8">
                {showMode === 'random' && 'Dưới đây là những gợi ý ngẫu nhiên cho bạn hôm nay'}
                {showMode === 'ai' && 'AI đã phân tích và gợi ý những món phù hợp nhất với bạn'}
                {showMode === 'ingredients' && 'Nhập nguyên liệu bạn có, AI sẽ gợi ý món phù hợp'}
                {showMode === 'mood' && 'Hãy cho AI biết tâm trạng của bạn, AI sẽ tìm món ăn phù hợp'}
              </p>

              {/* Random Mode */}
              {showMode === 'random' && suggestedRecipes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {suggestedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      onClick={() => handleCookNow(recipe.id)}
                    >
                      <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-50 flex items-center justify-center">
                        {recipe.coverImage ? (
                          <img
                            src={recipe.coverImage}
                            alt={recipe.dishName || recipe.recipeName || 'Không có hình'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">Không có hình</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-3 text-lg">
                        {recipe.dishName || recipe.recipeName}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="font-semibold text-gray-700">{getCookingTimeText(recipe.cookingTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Độ khó:</span>
                          <span className="font-semibold text-gray-700">{getDifficultyText(recipe.difficulty)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCookNow(recipe.id);
                        }}
                        className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
                      >
                        Nấu ngay
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Mode */}
              {showMode === 'ai' && (
                <>
                  {aiLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner message="AI đang phân tích..." />
                    </div>
                  ) : aiRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {aiRecommendations.map((recipe, index) => (
                        <div
                          key={recipe.id}
                          className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative hover:scale-[1.02]"
                          onClick={() => handleCookNow(recipe.id)}
                        >
                          {/* AI Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-purple-100 border-2 border-purple-300 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                              AI Pick #{index + 1}
                            </div>
                          </div>

                          <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-50 flex items-center justify-center">
                            {recipe.coverImage ? (
                              <img
                                src={recipe.coverImage}
                                alt={recipe.dishName || recipe.recipeName || 'Không có hình'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">Không có hình</span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800 mb-3 text-lg">
                            {recipe.dishName || recipe.recipeName}
                          </h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Thời gian:</span>
                              <span className="font-semibold text-gray-700">{getCookingTimeText(recipe.cookingTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Độ khó:</span>
                              <span className="font-semibold text-gray-700">{getDifficultyText(recipe.difficulty)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCookNow(recipe.id);
                            }}
                            className="w-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
                          >
                            Nấu ngay
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-base text-gray-700 mb-6">
                        {aiMessage || 'Chưa có gợi ý AI. Hãy nấu thử một vài món để AI học sở thích của bạn!'}
                      </p>
                      <button
                        onClick={() => setShowMode('random')}
                        className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
                      >
                        Xem gợi ý ngẫu nhiên
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons - Show for Random mode */}
              {showMode === 'random' && suggestedRecipes.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="px-8 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
                  >
                    Gợi ý khác
                  </button>
                  <button
                    onClick={() => router.push('/recipes')}
                    className="px-8 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
                  >
                    Xem tất cả công thức
                  </button>
                </div>
              )}

              {/* Action Buttons - Show for AI mode */}
              {showMode === 'ai' && aiRecommendations.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={loadAiRecommendations}
                    className="px-8 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-purple-700"
                  >
                    Làm mới gợi ý AI
                  </button>
                </div>
              )}

              {/* Ingredients Mode */}
              {showMode === 'ingredients' && (
                <div className="space-y-6">
                  {/* Input Section */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Bạn có nguyên liệu gì?</p>
                      <p className="text-sm text-gray-600">
                        Nhập các nguyên liệu bạn đang có, AI sẽ gợi ý món ăn và list nguyên liệu còn thiếu.
                      </p>
                    </div>

                    {/* Add Ingredient Input */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                        placeholder="VD: Thịt heo, cà chua, hành..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="px-6 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 rounded-xl font-bold transition-all hover:scale-[1.02]"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Ingredient Tags */}
                    {availableIngredients.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {availableIngredients.map((ingredient) => (
                          <span
                            key={ingredient}
                            className="px-3 py-1.5 bg-orange-100 rounded-full text-sm text-orange-700 font-medium flex items-center gap-2"
                          >
                            {ingredient}
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(ingredient)}
                              className="text-orange-500 hover:text-orange-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAvailableIngredients([])}
                          className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    )}

                    {/* Analyze Button */}
                    <button
                      type="button"
                      onClick={handleAnalyzeIngredients}
                      disabled={ingredientAnalyzing || availableIngredients.length === 0}
                      className="w-full py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {ingredientAnalyzing ? 'AI đang phân tích...' : 'Gợi ý món ăn'}
                    </button>

                    {ingredientError && <p className="text-sm text-red-600">{ingredientError}</p>}
                  </div>

                  {/* Results */}
                  {ingredientResult && (
                    <div className="space-y-6">
                      {/* From Saved Recipes */}
                      {ingredientResult.fromSavedRecipes && ingredientResult.fromSavedRecipes.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-xl">📖</span>
                            Từ công thức đã lưu
                          </h3>
                          <div className="space-y-3">
                            {ingredientResult.fromSavedRecipes.map((dish, index) => (
                              <div
                                key={`saved-${index}`}
                                className="bg-white border-2 border-orange-200 rounded-2xl p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg">{dish.dishName}</p>
                                    <p className="text-sm text-orange-600 font-medium">
                                      Phù hợp {dish.matchScore}%
                                    </p>
                                  </div>
                                  {dish.recipeId && (
                                    <button
                                      onClick={() => router.push(`/recipes/${dish.recipeId}`)}
                                      className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                                    >
                                      Xem công thức
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Nguyên liệu có sẵn: </span>
                                    <span className="text-orange-700 font-medium">
                                      {dish.usedIngredients.join(', ')}
                                    </span>
                                  </div>
                                  {dish.missingIngredients.length > 0 && (
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <span className="text-gray-600">Còn thiếu: </span>
                                        <span className="text-orange-600 font-medium">
                                          {dish.missingIngredients.join(', ')}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => addMissingToShoppingList(dish.missingIngredients)}
                                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 whitespace-nowrap"
                                      >
                                        + Đẩy qua Trợ lý đi chợ
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Suggestions */}
                      {ingredientResult.aiSuggestions && ingredientResult.aiSuggestions.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            Gợi ý từ AI
                          </h3>
                          <div className="space-y-3">
                            {ingredientResult.aiSuggestions.map((dish, index) => (
                              <div
                                key={`ai-${index}`}
                                className="bg-white border-2 border-purple-200 rounded-2xl p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg">{dish.dishName}</p>
                                    <p className="text-sm text-purple-600 font-medium">
                                      Phù hợp {dish.matchScore}%
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Nguyên liệu có sẵn: </span>
                                    <span className="text-green-700 font-medium">
                                      {dish.usedIngredients.join(', ')}
                                    </span>
                                  </div>
                                  {dish.missingIngredients.length > 0 && (
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <span className="text-gray-600">Còn thiếu: </span>
                                        <span className="text-orange-600 font-medium">
                                          {dish.missingIngredients.join(', ')}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => addMissingToShoppingList(dish.missingIngredients)}
                                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 whitespace-nowrap"
                                      >
                                        + Đẩy qua Trợ lý đi chợ
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advice */}
                      {ingredientResult.advice && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-gray-900 mb-1">Mẹo từ AI</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{ingredientResult.advice}</p>
                        </div>
                      )}

                      {/* No results */}
                      {(!ingredientResult.fromSavedRecipes || ingredientResult.fromSavedRecipes.length === 0) &&
                        (!ingredientResult.aiSuggestions || ingredientResult.aiSuggestions.length === 0) && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">AI không tìm thấy món phù hợp. Hãy thử thêm nguyên liệu khác!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mood/Emotion Mode */}
              {showMode === 'mood' && (
                <div className="space-y-6">
                  {/* Input Section */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Hôm nay bạn cảm thấy thế nào?</p>
                      <p className="text-sm text-gray-600">
                        Nhập tâm trạng, cảm xúc hoặc hoàn cảnh của bạn. AI sẽ tìm món ăn phù hợp nhất.
                      </p>
                    </div>

                    {/* Mood Input */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={moodQuery}
                        onChange={(e) => setMoodQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch()}
                        placeholder="VD: Mệt mỏi, cần món gì ấm áp / Nhớ nhà / Trời mưa lạnh..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleMoodSearch}
                        disabled={moodSearching}
                        className="px-6 py-3 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 text-rose-700 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {moodSearching ? 'Đang tìm...' : 'Tìm món'}
                      </button>
                    </div>

                    {/* Quick Mood Suggestions */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500">Gợi ý:</span>
                      {['Nhớ nhà', 'Mệt mỏi', 'Vui vẻ', 'Trời lạnh', 'Buồn', 'Cuối tuần thư giãn'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setMoodQuery(mood)}
                          className="px-3 py-1 bg-white border border-rose-200 rounded-full text-sm text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          {mood}
                        </button>
                      ))}
                    </div>

                    {moodError && <p className="text-sm text-red-600">{moodError}</p>}
                  </div>

                  {/* Results */}
                  {moodResults.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">💝</span>
                        Món ăn phù hợp với tâm trạng của bạn
                      </h3>
                      <div className="space-y-3">
                        {moodResults.map((result, index) => {
                          const recipe = recipes.find((r) => r.id === result.recipeId);
                          return (
                            <div
                              key={result.recipeId}
                              className="bg-white border-2 border-rose-200 rounded-2xl p-4 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => router.push(`/recipes/${result.recipeId}`)}
                            >
                              <div className="flex items-start gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                                  {recipe?.coverImage ? (
                                    <img
                                      src={recipe.coverImage}
                                      alt={result.dishName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                      🍲
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-gray-900 text-lg">{result.dishName}</p>
                                    <span className="text-sm text-rose-600 font-medium">
                                      {result.matchScore}% phù hợp
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2 italic">
                                    "{result.emotionalConnection}"
                                  </p>
                                  {result.matchedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {result.matchedTags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Action */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCookNow(result.recipeId);
                                  }}
                                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 text-rose-700 rounded-xl font-bold text-sm transition-all"
                                >
                                  Nấu ngay
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No results message */}
                  {!moodSearching && moodQuery && moodResults.length === 0 && !moodError && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Không tìm thấy món phù hợp. Hãy thử mô tả tâm trạng khác hoặc thêm công thức mới với emotion tags!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

      {/* Success Dialog */}
      {addedToListDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Thêm thành công!</h3>
              <p className="text-gray-600">
                Đã thêm {addedToListDialog.count} nguyên liệu vào danh sách đi chợ.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setAddedToListDialog({ show: false, count: 0 });
                  router.push('/shopping-assistant');
                }}
                className="w-full py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 rounded-xl font-bold transition-all"
              >
                Qua trang Trợ lý đi chợ
              </button>
              <button
                onClick={() => setAddedToListDialog({ show: false, count: 0 })}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-bold transition-all"
              >
                Ở lại đây
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
