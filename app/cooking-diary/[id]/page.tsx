'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';

interface CookingEntry {
  id: string;
  recipeId: string;
  dishName: string;
  cookDate: string;
  mistakes: string;
  improvements: string;
  imageCount: number;
  timestamp: string;
}

export default function CookingDiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<CookingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load entry from localStorage
    const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
    const found = diary.find((e: CookingEntry) => e.id === entryId);
    setEntry(found || null);
    setLoading(false);
  }, [entryId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!entry) {
    return (
      <PageContainer>
        <PageHeader
          icon="📔"
          title="Chi tiết nhật ký"
          backButton={{
            label: 'Quay lại',
            onClick: () => router.push('/cooking-diary'),
          }}
        />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <p className="text-gray-600">Không tìm thấy entry này</p>
          </div>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="📔"
        title="Chi tiết nhật ký"
        backButton={{
          label: 'Quay lại danh sách',
          onClick: () => router.push('/cooking-diary'),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {entry.dishName}
            </h1>
            <p className="text-gray-600">
              📅 {formatDate(entry.timestamp)}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Mistakes */}
            {entry.mistakes && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Sai sót</span>
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.mistakes}
                  </p>
                </div>
              </div>
            )}

            {/* Improvements */}
            {entry.improvements && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  <span>Rút kinh nghiệm - Cải thiện</span>
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.improvements}
                  </p>
                </div>
              </div>
            )}

            {/* Image Count */}
            {entry.imageCount > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📸</span>
                  <span>Hình ảnh ({entry.imageCount})</span>
                </h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-gray-700">
                    Đã lưu {entry.imageCount} hình ảnh từ lần nấu này
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4">
            <button
              onClick={() => router.push('/cooking-diary')}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Quay lại danh sách
            </button>
            {entry.recipeId && (
              <button
                onClick={() => router.push(`/recipes/${entry.recipeId}`)}
                className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Xem công thức →
              </button>
            )}
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
