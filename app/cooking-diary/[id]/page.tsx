'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 text-center">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Lịch sử nấu
              </h1>
            </div>
            <p className="text-gray-600 mb-6">Chưa có lần nấu nào cho món này</p>
            <button
              onClick={() => router.push('/cooking-diary')}
              className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
            >
              Quay lại nhật ký
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {dishName}
            </h1>
            <p className="text-base text-gray-600">
              Đã nấu {entries.length} lần
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 relative"
              >
                {/* Entry Number Badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  #{entries.length - index}
                </div>

                {/* Date */}
                <div className="mb-4 ml-4">
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(entry.timestamp)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.cookDate}
                  </p>
                </div>

                {/* Images */}
                {entry.images && entry.images.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>Hình ảnh kết quả ({entry.images.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {entry.images.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative rounded-xl overflow-hidden shadow-md border-2 border-purple-200">
                          <img
                            src={imageUrl}
                            alt={`${dishName} - Lần ${entries.length - index} - Ảnh ${imgIndex + 1}`}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mistakes */}
                {entry.mistakes && entry.mistakes.trim() && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Sai sót</h3>
                    <div className="bg-white border border-orange-200 rounded-lg p-3">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.mistakes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {entry.improvements && entry.improvements.trim() && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">Cải thiện</h3>
                    <div className="bg-white border border-green-200 rounded-lg p-3">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.improvements}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {entries[0]?.recipeId && (
              <button
                onClick={() => router.push(`/recipes/${entries[0].recipeId}`)}
                className="px-8 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-purple-700"
              >
                Xem công thức
              </button>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/cooking-diary')}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
          >
            Quay lại nhật ký
          </button>
        </div>
      </main>
    </div>
  );
}
