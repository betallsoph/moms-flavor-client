'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';

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

export default function CookModePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recipe from RecipeService
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        // Parse instructions
        if (found.instructions) {
          try {
            const parsed = JSON.parse(found.instructions);
            setInstructions(Array.isArray(parsed) ? parsed : []);
          } catch {
            setInstructions([]);
          }
        }
      }
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId]);

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
        icon="🍳"
        title="Chế độ nấu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            🍳 {recipe.dishName || recipe.recipeName || 'Công thức'}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Hướng dẫn từng bước nấu ăn
          </p>

          <div className="space-y-4">
            {/* Step 1: Prepare Ingredients */}
            <button
              onClick={() => router.push(`/cook/${recipeId}/ingredients`)}
              className="w-full p-6 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🛒</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Chuẩn bị nguyên liệu</p>
                  <p className="text-sm text-gray-600">Xem danh sách và xác nhận chuẩn bị xong</p>
                </div>
                <div className="text-xl">→</div>
              </div>
            </button>

            {/* Step 2: Review Steps Overview */}
            <button
              onClick={() => router.push(`/cook/${recipeId}/overview`)}
              className="w-full p-6 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📋</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Sơ lược các bước nấu</p>
                  <p className="text-sm text-gray-600">Xem toàn bộ các bước trước khi bắt đầu</p>
                </div>
                <div className="text-xl">→</div>
              </div>
            </button>

            {/* Step 3: Start Cooking */}
            <button
              onClick={() => router.push(`/cook/${recipeId}/start-confirmation`)}
              className="w-full p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors text-left bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Bắt đầu nấu</p>
                  <p className="text-sm text-gray-600">Chuẩn bị bắt đầu công việc nấu nướng</p>
                </div>
                <div className="text-xl">→</div>
              </div>
            </button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>Mẹo:</strong> Bạn có thể quay lại các trang trước bất cứ lúc nào nếu muốn xem lại nguyên liệu hoặc các bước.
            </p>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
