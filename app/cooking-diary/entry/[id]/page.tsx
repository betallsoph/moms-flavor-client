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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 text-center">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Không tìm thấy
              </h1>
            </div>
            <p className="text-gray-600 text-lg mb-6">Không tìm thấy nhật ký này.</p>
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
              {entry.dishName}
            </h1>
            <p className="text-base text-gray-600">
              {formatDate(entry.cookDate)}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Images Gallery */}
            {entry.images && entry.images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900">
                  Hình ảnh món ăn
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {entry.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-colors"
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
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">
                Những điều cần lưu ý
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {entry.mistakes?.trim() || 'Không có sai sót đặc biệt'}
                </p>
              </div>
            </div>

            {/* Improvements */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">
                Cải thiện lần sau
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {entry.improvements?.trim() || 'Không có cải thiện đặc biệt'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <button
                onClick={() => router.push(`/recipes/${entry.recipeId}`)}
                className="px-8 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-purple-700"
              >
                Xem công thức gốc
              </button>
            </div>
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
