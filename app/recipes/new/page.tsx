'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RecipeService } from '@/libs/recipeService';
import { Recipe } from '@/types/recipe';

export default function NewRecipePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dishName: '',
    recipeName: '',
    sameAsDish: false,
    difficulty: '',
    cookingTime: '',
    estimateTime: false,
    estimatedTime: '',
    instructor: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [existingInstructors, setExistingInstructors] = useState<string[]>([]);
  const [isAddingNewInstructor, setIsAddingNewInstructor] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');

  // Load existing instructors from recipes
  useEffect(() => {
    const loadInstructors = async () => {
      const recipes = await RecipeService.getAll();
      const instructors = recipes
        .map(r => r.instructor)
        .filter((instructor): instructor is string => !!instructor && instructor.trim() !== '')
        .filter((value, index, self) => self.indexOf(value) === index) // unique
        .sort();
      setExistingInstructors(instructors);
    };
    loadInstructors();
  }, []);

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

    try {
      // Generate emotion tags using AI
      let emotionTags: string[] = [];
      try {
        const response = await fetch('/api/assistant/emotion-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dishName: formData.dishName,
            storyOrNote: formData.description,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          emotionTags = data.tags || [];
        }
      } catch (err) {
        console.warn('Could not generate emotion tags:', err);
      }

      // Create recipe with emotion tags
      const newRecipe = await RecipeService.create({
        ...formData,
        emotionTags,
      } as Omit<Recipe, 'id' | 'createdAt'>);

      // Redirect to confirmation page with recipe ID
      router.push(`/recipes/confirm?id=${newRecipe.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Logo and Image inside modal */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/assets/logo/logo66.png"
                  alt="Mom's Flavor Logo"
                  width={365}
                  height={365}
                  className="object-contain"
                />
              </div>

              {/* Image */}
              <div className="relative w-full p-2 border-2 border-orange-300 rounded-lg">
                <Image
                  src="/assets/background/create1.png"
                  alt="Create Recipe Illustration"
                  width={500}
                  height={500}
                  className="object-contain w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Form inside modal */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dish Name */}
            <div>
              <label htmlFor="dishName" className="block text-sm font-semibold text-orange-700 mb-2">
                Tên món
              </label>
              <input
                type="text"
                id="dishName"
                name="dishName"
                value={formData.dishName}
                onChange={handleChange}
                required
                placeholder="Cơm chiên Thái, Phở bò..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              />
            </div>

            {/* Recipe Name */}
            <div>
              <label htmlFor="recipeName" className="block text-sm font-semibold text-orange-700 mb-2">
                Tên công thức
              </label>
              <input
                type="text"
                id="recipeName"
                name="recipeName"
                value={formData.recipeName}
                onChange={handleChange}
                required
                disabled={formData.sameAsDish}
                placeholder="Cơm chiên kiểu nhà hàng, Cá kho nhưng ít cay..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAsDish"
                  name="sameAsDish"
                  checked={formData.sameAsDish}
                  onChange={handleChange}
                  className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                  style={{
                    backgroundImage: formData.sameAsDish
                      ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                      : 'none'
                  }}
                />
                <label htmlFor="sameAsDish" className="text-sm text-orange-700 cursor-pointer">
                  Tương tự tên món
                </label>
              </div>
            </div>

            {/* Difficulty & Cooking Time - Same Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-orange-700 mb-2">
                  Độ khó
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                >
                  <option value="" disabled>Chọn độ khó</option>
                  <option value="very_easy">Rất dễ</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                  <option value="very_hard">Rất khó</option>
                </select>
              </div>

              {/* Cooking Time & Estimated Time */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="cookingTime" className="block text-sm font-semibold text-orange-700 mb-2">
                    Thời gian nấu
                  </label>
                  <select
                    id="cookingTime"
                    name="cookingTime"
                    value={formData.cookingTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  >
                    <option value="" disabled>Chọn thời gian nấu</option>
                    <option value="very_fast">Rất nhanh (&lt; 15 phút)</option>
                    <option value="fast">Nhanh (15-30 phút)</option>
                    <option value="medium">Trung bình (30-60 phút)</option>
                    <option value="slow">Chậm (1-2 giờ)</option>
                    <option value="very_slow">Rất chậm (&gt; 2 giờ)</option>
                  </select>
                </div>

                {/* Estimated Time */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="estimateTime"
                      name="estimateTime"
                      checked={formData.estimateTime}
                      onChange={handleChange}
                      className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                      style={{
                        backgroundImage: formData.estimateTime
                          ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                          : 'none'
                      }}
                    />
                    <label htmlFor="estimateTime" className="text-sm text-orange-700 cursor-pointer">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="block text-sm font-semibold text-orange-700 mb-2">
                Người hướng dẫn
              </label>

              {!isAddingNewInstructor ? (
                /* Dropdown to select existing or add new */
                <div>
                  <select
                    id="instructor-select"
                    value={selectedInstructor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '__ADD_NEW__') {
                        setIsAddingNewInstructor(true);
                        setSelectedInstructor('');
                        setFormData(prev => ({ ...prev, instructor: '' }));
                      } else {
                        setSelectedInstructor(value);
                        setFormData(prev => ({ ...prev, instructor: value }));
                      }
                    }}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base ${!selectedInstructor ? 'text-gray-400' : 'text-gray-900'}`}
                  >
                    <option value="" disabled>Chọn hoặc tạo người hướng dẫn mới</option>
                    {existingInstructors.map((instructor) => (
                      <option key={instructor} value={instructor}>
                        {instructor}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-semibold text-orange-600">
                      + Thêm mới...
                    </option>
                  </select>
                </div>
              ) : (
                /* Input field for new instructor */
                <div className="space-y-2">
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Mẹ, Ông, Bà, Cô, Anh, Chị, Người thân, Bạn bè..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewInstructor(false);
                      setFormData(prev => ({ ...prev, instructor: '' }));
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    ← Quay lại chọn từ danh sách
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-orange-700 mb-2">
                Mô tả món - công thức
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Mô tả về món ăn và công thức nấu..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Đang lưu...' : 'Lưu công thức'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/recipes')}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm"
              >
                Hủy
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
