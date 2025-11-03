'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

interface Instruction {
  id: string;
  step: number;
  title: string;
  description: string;
  needsTime?: boolean;
  duration?: string;
}

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  instructions?: string;
  createdAt: string;
}

export default function OverviewPage() {
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
        icon="📋"
        title="Sơ lược các bước nấu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/cook/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {recipe.dishName || recipe.recipeName || 'Công thức'}
          </h2>
          <p className="text-gray-600 mb-8">
            Tổng cộng <span className="font-bold text-orange-600">{instructions.length}</span> bước nấu
          </p>

          {instructions.length > 0 ? (
            <div className="space-y-3 mb-8">
              {instructions.map((instruction, idx) => (
                <div key={instruction.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                  <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 pt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    {instruction.title && (
                      <p className="font-semibold text-gray-900">{instruction.title}</p>
                    )}
                    <p className="text-sm text-gray-600">{instruction.description?.substring(0, 100)}...</p>
                    {instruction.needsTime && instruction.duration && (
                      <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{instruction.duration}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600 mb-8">
              <p>Chưa có bước nấu. Vui lòng thêm các bước nấu trước.</p>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded mb-8">
            <p className="text-sm text-blue-900">
              💡 Bạn sẽ đi qua từng bước một, với hướng dẫn chi tiết cho mỗi bước. Hãy đảm bảo bạn đã chuẩn bị tất cả nguyên liệu trước khi bắt đầu.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button
              onClick={() => router.push(`/cook/${recipeId}/start-confirmation`)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-12 rounded-xl hover:shadow-lg transition-shadow"
            >
              Tiếp tục
            </button>
            <button
              onClick={() => router.push(`/cook/${recipeId}/ingredients`)}
              className="bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mx-auto"
            >
              Quay lại
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
