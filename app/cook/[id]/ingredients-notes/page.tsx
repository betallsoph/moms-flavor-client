'use client';

import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, GradientButton } from '@/components/ui';

export default function IngredientsNotesPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  return (
    <PageContainer>
      <PageHeader
        icon="💡"
        title="Lưu ý nguyên liệu"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/cook/${recipeId}/ingredients`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Một vài lưu ý khi chuẩn bị
          </h2>
          <p className="text-gray-600 mb-8">
            Đọc kỹ các lưu ý dưới đây để đạt kết quả tốt nhất
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-semibold text-blue-900 mb-1">💡 Mẹo:</p>
              <p className="text-gray-700">Chuẩn bị tất cả nguyên liệu trước khi bắt đầu nấu (mise en place) giúp quá trình nấu suôn sẻ hơn.</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="font-semibold text-yellow-900 mb-1">⚠️ Cảnh báo:</p>
              <p className="text-gray-700">Nên cắt và chuẩn bị các nguyên liệu có yêu cầu đặc biệt trước (tỏi, hành, v.v.).</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="font-semibold text-green-900 mb-1">✅ Sẵn sàng:</p>
              <p className="text-gray-700">Hãy đảm bảo tất cả dụng cụ nấu nướng đã chuẩn bị sẵn.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/cook/${recipeId}/ingredients`)}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => router.push(`/cook/${recipeId}/overview`)}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
