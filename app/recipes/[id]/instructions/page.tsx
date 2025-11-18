'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';

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
  const [hasTips, setHasTips] = useState(false);
  const [tips, setTips] = useState('');

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
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
        // Load tips
        setTips(found.tips || '');
        setHasTips(!!found.tips);
      }
      setLoading(false);
    };

    loadRecipe();
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

    // Update recipe with instructions and tips using RecipeService
    try {
      await RecipeService.update(recipeId, {
        instructions: JSON.stringify(instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim()))),
        tips: hasTips ? tips : '',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}`);
  };

  const handleContinueToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with instructions and tips using RecipeService
    try {
      await RecipeService.update(recipeId, {
        instructions: JSON.stringify(instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim()))),
        tips: hasTips ? tips : '',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}/gallery`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công thức</p>
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {recipe.dishName || recipe.recipeName || 'Công thức'}
            </h2>
            <p className="text-gray-600">
              Nhập các bước nấu từng bước một
            </p>
          </div>

          <form className="space-y-6">
            {/* Instructions List */}
            <div>
              <label className="block text-sm font-semibold text-orange-700 mb-4">
                Các bước nấu
              </label>

              {instructions.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">Chưa có bước nấu nào. Hãy thêm bước đầu tiên.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {instructions.map((instruction) => (
                    <div key={instruction.id} className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50/40">
                      <div className="flex gap-3 items-start mb-3">
                        <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 pt-0.5">
                          {instruction.step}
                        </div>
                        <input
                          type="text"
                          value={instruction.title}
                          onChange={(e) => updateInstruction(instruction.id, 'title', e.target.value)}
                          placeholder="Tiêu đề bước này (VD: Chuẩn bị nguyên liệu)"
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(instruction.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-200 rounded-lg transition-colors text-sm font-semibold flex-shrink-0"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Time checkbox and input */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id={`time-${instruction.id}`}
                            checked={instruction.needsTime || false}
                            onChange={(e) => updateInstruction(instruction.id, 'needsTime', e.target.checked)}
                            className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                            style={{
                              backgroundImage: instruction.needsTime
                                ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                                : 'none'
                            }}
                          />
                          <label htmlFor={`time-${instruction.id}`} className="text-sm text-orange-700 cursor-pointer font-semibold">
                            Cần thời gian chính xác
                          </label>
                        </div>

                        {instruction.needsTime && (
                          <input
                            type="text"
                            value={instruction.duration || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'duration', e.target.value)}
                            placeholder="VD: 10 phút, 30 giây, 2 giờ..."
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        )}
                      </div>

                      {/* Note checkbox and input */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id={`note-${instruction.id}`}
                            checked={instruction.hasNote || false}
                            onChange={(e) => updateInstruction(instruction.id, 'hasNote', e.target.checked)}
                            className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                            style={{
                              backgroundImage: instruction.hasNote
                                ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                                : 'none'
                            }}
                          />
                          <label htmlFor={`note-${instruction.id}`} className="text-sm text-orange-700 cursor-pointer font-semibold">
                            Lưu ý
                          </label>
                        </div>

                        {instruction.hasNote && (
                          <textarea
                            value={instruction.note || ''}
                            onChange={(e) => updateInstruction(instruction.id, 'note', e.target.value)}
                            placeholder="VD: Không nên xáo quá kỹ, thêm muối vào cuối..."
                            rows={2}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
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
                className="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-700 font-bold hover:bg-orange-50 transition-colors"
              >
                Thêm bước nấu
              </button>
            </div>

            {/* Special Notes from Instructor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="hasTips"
                  checked={hasTips}
                  onChange={(e) => setHasTips(e.target.checked)}
                  className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                  style={{
                    backgroundImage: hasTips
                      ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                      : 'none'
                  }}
                />
                <label htmlFor="hasTips" className="text-sm font-semibold text-orange-700 cursor-pointer">
                  Có lưu ý đặc biệt (bí kíp) từ người hướng dẫn
                </label>
              </div>

              {hasTips && (
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="Nhập lưu ý đặc biệt, mẹo nấu, hoặc những điều cần chú ý từ người hướng dẫn..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleContinueToGallery}
                disabled={saving || instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim())).length === 0}
                className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu và thêm hình ảnh'}
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={saving || instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim())).length === 0}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu và quay lại'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
