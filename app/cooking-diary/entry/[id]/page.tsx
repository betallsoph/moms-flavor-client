'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';

interface CookingEntry {
  id: string;
  recipeId: string;
  dishName: string;
  cookDate: string;
  mistakes: string;
  improvements: string;
  images: string[];
  timestamp: string;
}

export default function CookingDiaryEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<CookingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Wait for auth state to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadEntry = async () => {
      if (userId) {
        try {
          console.log('🔥 Loading diary entry:', entryId);
          const diaryEntry = await firestoreService.getDiaryEntry(userId, entryId);
          setEntry(diaryEntry);
          console.log('✅ Loaded entry:', diaryEntry);
        } catch (error) {
          console.error('❌ Error loading diary entry:', error);
          setEntry(null);
        }
      } else {
        // Fallback to localStorage
        console.log('📦 Loading from localStorage');
        const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
        const found = diary.find((e: CookingEntry) => e.id === entryId);
        setEntry(found || null);
      }
      setLoading(false);
    };

    if (userId !== null) {
      loadEntry();
    }
  }, [entryId, userId]);

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
          title="Không tìm thấy"
          backButton={{
            label: 'Quay lại',
            onClick: () => router.push('/cooking-diary'),
          }}
        />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">Không tìm thấy nhật ký này.</p>
            <button
              onClick={() => router.push('/cooking-diary')}
              className="mt-6 bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Quay lại nhật ký
            </button>
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
          label: 'Quay lại',
          onClick: () => router.push('/cooking-diary'),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          {/* Header with dish name and date */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {entry.dishName}
            </h1>
            <p className="text-gray-700 flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(entry.cookDate)}</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Images Gallery */}
            {entry.images && entry.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span>📸</span>
                  <span>Hình ảnh món ăn</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {entry.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-colors"
                    >
                      <img
                        src={image}
                        alt={`${entry.dishName} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mistakes */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>📝</span>
                <span>Những điều cần lưu ý</span>
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.mistakes?.trim() || 'Không có sai sót đặc biệt'}
                </p>
              </div>
            </div>

            {/* Improvements */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>💡</span>
                <span>Cải thiện lần sau</span>
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.improvements?.trim() || 'Không có cải thiện đặc biệt'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push('/cooking-diary')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                Quay lại nhật ký
              </button>
              <button
                onClick={() => router.push(`/recipes/${entry.recipeId}`)}
                className="flex-1 bg-white border-2 border-purple-300 text-purple-700 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Xem công thức gốc
              </button>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
