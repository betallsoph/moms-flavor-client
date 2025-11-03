'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/libs/recipeService';
import { Recipe } from '@/types/recipe';

export default function NewRecipePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dishName: '',
    recipeName: '',
    sameAsDish: false,
    difficulty: 'medium',
    cookingTime: 'medium',
    estimateTime: false,
    estimatedTime: '',
    instructor: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Auto sync recipe name with dish name if checkbox is checked
        ...(name === 'sameAsDish' && checked ? { recipeName: prev.dishName } : {}),
      }));
    } else {
      const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Auto sync recipe name if sameAsDish is checked
        ...(name === 'dishName' && prev.sameAsDish ? { recipeName: value } : {}),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create recipe using service
    const newRecipe = await RecipeService.create(formData as Omit<Recipe, 'id' | 'createdAt'>);
    
    setLoading(false);
    // Redirect to confirmation page with recipe ID
    router.push(`/recipes/confirm?id=${newRecipe.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header with Back Button */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">Quay lại trang chủ</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-xl">📝</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Thêm công thức mới
              </h1>
            </div>

            <div className="w-40"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Animated Cooking Illustration */}
              <div className="space-y-6">
                {/* Pot */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Pot body */}
                    <div className="w-32 h-24 bg-gradient-to-b from-orange-400 to-orange-600 rounded-b-3xl shadow-lg border-4 border-orange-700"></div>
                    {/* Pot handle */}
                    <div className="absolute -left-6 top-6 w-8 h-12 border-4 border-orange-700 rounded-full"></div>
                    {/* Steam - Animated */}
                    <div className="absolute -top-8 left-4 space-y-2">
                      <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce opacity-70"></div>
                      <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce opacity-50" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <div className="absolute -top-8 right-4 space-y-2">
                      <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce opacity-70" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce opacity-50" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  </div>
                </div>

                {/* Chef */}
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-pulse">👨‍🍳</div>
                    <p className="text-gray-600 font-medium">Hãy chia sẻ công thức</p>
                    <p className="text-gray-500 text-sm">và ghi nhớ người chỉ nấu</p>
                  </div>
                </div>

                {/* Ingredients Icons - Floating */}
                <div className="flex justify-around px-4">
                  <div className="text-3xl animate-bounce" style={{animationDelay: '0s'}}>🧅</div>
                  <div className="text-3xl animate-bounce" style={{animationDelay: '0.2s'}}>🍅</div>
                  <div className="text-3xl animate-bounce" style={{animationDelay: '0.4s'}}>🧄</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
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
                value={formData.dishName}
                onChange={handleChange}
                required
                placeholder="VD: Cơm chiên Thái, Phở bò..."
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
                value={formData.recipeName}
                onChange={handleChange}
                required
                disabled={formData.sameAsDish}
                placeholder="VD: Cơm chiên kiểu nhà hàng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAsDish"
                  name="sameAsDish"
                  checked={formData.sameAsDish}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="sameAsDish" className="text-sm text-gray-600">
                  Tương tự tên món
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
                value={formData.difficulty}
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
                value={formData.cookingTime}
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
                  checked={formData.estimateTime}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="estimateTime" className="text-sm text-gray-600">
                  Ước lượng thời gian nấu
                </label>
              </div>
              {formData.estimateTime && (
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  placeholder="VD: 45 phút, 1 giờ 30 phút..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
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
                value={formData.instructor}
                onChange={handleChange}
                placeholder="VD: Mẹ, Ông, Bà, Cô, Bạn bè..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Gõ tên để thêm mới hoặc chọn từ danh sách có sẵn
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả món - công thức *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Mô tả về món ăn và công thức nấu..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang lưu...' : 'Lưu công thức'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
