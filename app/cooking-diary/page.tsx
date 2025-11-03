'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

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

export default function CookingDiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CookingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = () => {
    // Load cooking entries from localStorage
    const diaryData = localStorage.getItem('cooking-diary') || '[]';
    const diary: CookingEntry[] = JSON.parse(diaryData);
    
    // Sort by date descending (newest first)
    diary.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setEntries(diary);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  // Reload entries when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadEntries();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDelete = (id: string) => {
    const confirmed = confirm('Bạn có chắc muốn xóa entry này?');
    if (confirmed) {
      const updated = entries.filter((e) => e.id !== id);
      localStorage.setItem('cooking-diary', JSON.stringify(updated));
      setEntries(updated);
    }
  };

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

  return (
    <PageContainer>
      <PageHeader
        icon="📔"
        title="Nhật ký nấu"
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <LoadingSpinner message="Đang tải nhật ký..." />
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có lịch sử nấu nào
              </h3>
              <p className="text-gray-500 mb-8">
                Hãy nấu một món ăn và ghi lại kinh nghiệm của bạn!
              </p>
              <GradientButton onClick={() => router.push('/recipes')}>
                Xem danh sách công thức
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-purple-100 hover:border-purple-300 overflow-hidden transition-all group cursor-default"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {entry.dishName}
                  </h3>
                  <div className="text-sm text-gray-600">
                    📅 {formatDate(entry.timestamp)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 space-y-3">
                  {/* Mistakes */}
                  {entry.mistakes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">⚠️ Sai sót:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {entry.mistakes}
                      </p>
                    </div>
                  )}

                  {/* Improvements */}
                  {entry.improvements && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">💡 Rút kinh nghiệm:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {entry.improvements}
                      </p>
                    </div>
                  )}

                  {/* Image Count */}
                  {entry.imageCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                      <span>📸</span>
                      <span>{entry.imageCount} ảnh được lưu</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => router.push(`/cooking-diary/${entry.id}`)}
                    className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex-1 bg-red-100 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageContainer>
  );
}
