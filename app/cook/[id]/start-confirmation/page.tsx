'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

interface Instruction {
  id: string;
  step: number;
}

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  instructions?: string;
  createdAt: string;
}

export default function StartConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recipe from localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const found = recipes.find((r: Recipe) => r.id === recipeId);
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
  }, [recipeId]);

  const handleStartCooking = () => {
    if (instructions.length > 0) {
      router.push(`/cook/${recipeId}/steps/${instructions[0].step}`);
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
        icon="🚀"
        title="Bắt đầu nấu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/cook/${recipeId}/overview`),
        }}
      />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sẵn sàng nấu chưa?
            </h2>
            <p className="text-gray-600 mb-8">
              Chuẩn bị bắt đầu nấu <span className="font-bold text-orange-600">{recipe.dishName || recipe.recipeName}</span>
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-900">Đã chuẩn bị nguyên liệu</p>
                <p className="text-sm text-green-700">Tất cả nguyên liệu đã sẵn sàng</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-blue-900">Đã xem sơ lược</p>
                <p className="text-sm text-blue-700">{instructions.length} bước nấu đang chờ</p>
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

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-dashed border-yellow-300 p-6 rounded-lg mb-8">
            <p className="text-sm text-center">
              <span className="block font-semibold text-gray-900 mb-2">💡 Mẹo:</span>
              <span className="text-gray-700">Đừng sợ nếu chưa thành thạo. Hãy yên tâm thực hiện từng bước và đừng ngần ngại quay lại nếu cần.</span>
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/cook/${recipeId}/overview`)}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={handleStartCooking}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              Bắt đầu ngay! 🚀
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
