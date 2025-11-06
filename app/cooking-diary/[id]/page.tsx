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

export default function CookingDiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string; // Now treating ID as recipeId

  const [entries, setEntries] = useState<CookingEntry[]>([]); // Multiple entries
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dishName, setDishName] = useState<string>('');

  // Wait for auth state to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      if (userId) {
        // Load all entries for this recipe from Firestore
        try {
          console.log('🔥 Loading all diary entries for recipe:', recipeId);
          const firestoreEntries = await firestoreService.getRecipeDiaryEntries(userId, recipeId);
          setEntries(firestoreEntries);
          if (firestoreEntries.length > 0) {
            setDishName(firestoreEntries[0].dishName);
          }
          console.log('✅ Loaded', firestoreEntries.length, 'entries');
        } catch (error) {
          console.error('❌ Error loading diary entries from Firestore:', error);
          setEntries([]);
        }
      } else {
        // Fallback to localStorage
        console.log('📦 Loading from localStorage');
        const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
        const found = diary.filter((e: CookingEntry) => e.recipeId === recipeId);
        setEntries(found);
        if (found.length > 0) {
          setDishName(found[0].dishName);
        }
      }
      setLoading(false);
    };

    if (userId !== null) {
      loadEntries();
    }
  }, [recipeId, userId]);

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

  if (entries.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          icon="📔"
          title="Lịch sử nấu"
          backButton={{
            label: 'Quay lại',
            onClick: () => router.push('/cooking-diary'),
          }}
        />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <p className="text-gray-600">Chưa có lần nấu nào cho món này</p>
          </div>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="📔"
        title={`Lịch sử nấu: ${dishName}`}
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push('/cooking-diary'),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Timeline Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{dishName}</h1>
          <p className="text-gray-600">
            Đã nấu {entries.length} lần
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {entries.map((entry, index) => (
            <div 
              key={entry.id}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 relative"
            >
              {/* Entry Number Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                #{entries.length - index}
              </div>

              {/* Date */}
              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900">
                  📅 {formatDate(entry.timestamp)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {entry.cookDate}
                </p>
              </div>

              {/* Images */}
              {entry.images && entry.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📸</span>
                    <span>Hình ảnh kết quả ({entry.images.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {entry.images.map((imageUrl, imgIndex) => (
                      <div key={imgIndex} className="relative rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
                        <img
                          src={imageUrl}
                          alt={`${dishName} - Lần ${entries.length - index} - Ảnh ${imgIndex + 1}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mistakes */}
              {entry.mistakes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Sai sót</span>
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {entry.mistakes}
                    </p>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {entry.improvements && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>✨</span>
                    <span>Cải thiện</span>
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {entry.improvements}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => router.push('/cooking-diary')}
            className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Quay lại danh sách
          </button>
          {entries[0]?.recipeId && (
            <button
              onClick={() => router.push(`/recipes/${entries[0].recipeId}`)}
              className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Xem công thức →
            </button>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
