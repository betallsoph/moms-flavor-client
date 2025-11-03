'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

interface Instruction {
  id: string;
  step: number;
  title: string;
  hasDescription?: boolean;
  description: string;
  needsTime?: boolean;
  duration?: string;
  hasNote?: boolean;
  note?: string;
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
  ingredientsList?: Array<{ name: string; quantity: string; unit: string }>;
  favoriteBrands?: string[];
  specialNotes?: string;
  instructions?: string;
  tips?: string;
  createdAt: string;
}

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    // Load recipe from localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const found = recipes.find((r: Recipe) => r.id === recipeId);
    if (found) {
      setRecipe(found);
      // Parse instructions if they exist
      if (found.instructions) {
        try {
          setInstructions(JSON.parse(found.instructions));
        } catch {
          // If not JSON, treat as plain text
          setInstructions([
            {
              id: '1',
              step: 1,
              title: '',
              description: found.instructions,
            },
          ]);
        }
      }
    }
    setLoading(false);
  }, [recipeId]);

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      {
        id: Date.now().toString(),
        step: instructions.length + 1,
        title: '',
        hasDescription: false,
        description: '',
        needsTime: false,
        duration: '',
        hasNote: false,
        note: '',
      },
    ]);
  };

  const removeInstruction = (id: string) => {
    const updated = instructions.filter(ing => ing.id !== id);
    // Reorder steps
    setInstructions(updated.map((ing, idx) => ({ ...ing, step: idx + 1 })));
  };

  const updateInstruction = (id: string, field: keyof Instruction, value: string | boolean) => {
    setInstructions(instructions.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with instructions
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const index = recipes.findIndex((r: Recipe) => r.id === recipeId);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        instructions: JSON.stringify(instructions.filter(ing => ing.description.trim())),
      };
      localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    setSaving(false);

    // Trigger window focus event to refresh detail page
    setTimeout(() => {
      window.dispatchEvent(new Event('focus'));
    }, 100);

    router.push(`/recipes/${recipeId}`);
  };

  const handleContinueToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with instructions
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const index = recipes.findIndex((r: Recipe) => r.id === recipeId);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        instructions: JSON.stringify(instructions.filter(ing => ing.description.trim())),
      };
      localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    setSaving(false);

    // Trigger window focus event to refresh detail page
    setTimeout(() => {
      window.dispatchEvent(new Event('focus'));
    }, 100);

    router.push(`/recipes/${recipeId}/gallery`);
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
        icon="👨‍🍳"
        title="Các bước nấu"
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
              Nhập các bước nấu từng bước một
            </p>
          </div>

          <form className="space-y-6">
            {/* Instructions List */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Các bước nấu *
              </label>

              {instructions.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">Chưa có bước nấu nào. Hãy thêm bước đầu tiên.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {instructions.map((instruction) => (
                    <div key={instruction.id} className="border border-orange-100 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-white">
                      <div className="flex gap-3 items-start mb-3">
                        <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 pt-0.5">
                          {instruction.step}
                        </div>
                        <input
                          type="text"
                          value={instruction.title}
                          onChange={(e) => updateInstruction(instruction.id, 'title', e.target.value)}
                          placeholder="Tiêu đề bước này (VD: Chuẩn bị nguyên liệu)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(instruction.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Description checkbox and textarea */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id={`desc-${instruction.id}`}
                            checked={instruction.hasDescription || false}
                            onChange={(e) => updateInstruction(instruction.id, 'hasDescription', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label htmlFor={`desc-${instruction.id}`} className="text-sm text-gray-700 cursor-pointer font-semibold">
                            📝 Mô tả cụ thể
                          </label>
                        </div>
                        
                        {instruction.hasDescription && (
                          <textarea
                            value={instruction.description}
                            onChange={(e) => updateInstruction(instruction.id, 'description', e.target.value)}
                            placeholder="Mô tả chi tiết bước này..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                          />
                        )}
                      </div>
                      
                      {/* Time checkbox and input */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`time-${instruction.id}`}
                            checked={instruction.needsTime || false}
                            onChange={(e) => updateInstruction(instruction.id, 'needsTime', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label htmlFor={`time-${instruction.id}`} className="text-sm text-gray-700 cursor-pointer">
                            ⏱️ Cần thời gian chính xác
                          </label>
                        </div>
                        
                        {instruction.needsTime && (
                          <input
                            type="text"
                            value={instruction.duration || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'duration', e.target.value)}
                            placeholder="VD: 10 phút, 30 giây, 2 giờ..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        )}
                      </div>

                      {/* Note checkbox and input */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`note-${instruction.id}`}
                            checked={instruction.hasNote || false}
                            onChange={(e) => updateInstruction(instruction.id, 'hasNote', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label htmlFor={`note-${instruction.id}`} className="text-sm text-gray-700 cursor-pointer">
                            📝 Lưu ý
                          </label>
                        </div>
                        
                        {instruction.hasNote && (
                          <input
                            type="text"
                            value={instruction.note || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'note', e.target.value)}
                            placeholder="VD: Không nên xáo quá kỹ, thêm muối vào cuối..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addInstruction}
                className="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
              >
                + Thêm bước nấu
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 justify-end">
              <button
                onClick={handleSaveAndContinue}
                disabled={saving || instructions.filter(ing => ing.description.trim()).length === 0}
                className="bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu và tiếp tục sau'}
              </button>
              <button
                onClick={handleContinueToGallery}
                disabled={saving || instructions.filter(ing => ing.description.trim()).length === 0}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Thêm bí kíp và hình ảnh'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageContainer>
  );
}
