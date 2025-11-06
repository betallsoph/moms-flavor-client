'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
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

export default function CookingDiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Wait for auth state to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const loadEntries = async () => {
    if (userId) {
      // Load from Firestore
      try {
        console.log('🔥 Loading diary entries from Firestore for user:', userId);
        const firestoreEntries = await firestoreService.getUserDiaryEntries(userId);
        console.log('✅ Loaded', firestoreEntries.length, 'entries from Firestore');
        setEntries(firestoreEntries);
      } catch (error) {
        console.error('❌ Error loading diary entries from Firestore:', error);
        setEntries([]);
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      console.log('📦 Loading from localStorage (no user logged in)');
      const diaryData = localStorage.getItem('cooking-diary') || '[]';
      const diary: CookingEntry[] = JSON.parse(diaryData);
      diary.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEntries(diary);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (userId !== null) {
      loadEntries();
    }
  }, [userId]);

  // Reload entries when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadEntries();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Bạn có chắc muốn xóa entry này?');
    if (!confirmed) return;
    
    const userId = auth.currentUser?.uid;
    
    if (userId) {
      // Delete from Firestore
      try {
        await firestoreService.deleteDiaryEntry(userId, id);
        setEntries(entries.filter((e) => e.id !== id));
      } catch (error) {
        console.error('Error deleting diary entry:', error);
      }
    } else {
      // Delete from localStorage
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

  // Group entries by recipeId
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.recipeId]) {
      acc[entry.recipeId] = [];
    }
    acc[entry.recipeId].push(entry);
    return acc;
  }, {} as Record<string, CookingEntry[]>);

  // Convert to array and sort by latest timestamp
  const recipeGroups = Object.entries(groupedEntries).map(([recipeId, entries]) => ({
    recipeId,
    dishName: entries[0].dishName,
    count: entries.length,
    latestEntry: entries[0], // Already sorted by timestamp desc
    latestMistakes: entries[0].mistakes,
    latestImprovements: entries[0].improvements,
  })).sort((a, b) => 
    new Date(b.latestEntry.timestamp).getTime() - new Date(a.latestEntry.timestamp).getTime()
  );

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
        ) : recipeGroups.length === 0 ? (
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
            {recipeGroups.map((group) => (
              <div
                key={group.recipeId}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-purple-100 hover:border-purple-300 overflow-hidden transition-all group cursor-default"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {group.dishName}
                  </h3>
                  <div className="text-sm text-gray-600">
                    📅 {formatDate(group.latestEntry.timestamp)}
                  </div>
                  <div className="text-sm font-semibold text-purple-600 mt-2">
                    🍳 Đã nấu {group.count} lần
                  </div>
                </div>

                {/* Card Body - Latest Entry Preview */}
                <div className="px-6 py-4 space-y-3">
                  {/* Mistakes */}
                  {group.latestMistakes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">⚠️ Lần gần nhất:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {group.latestMistakes}
                      </p>
                    </div>
                  )}

                  {/* Improvements */}
                  {group.latestImprovements && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">✨ Cải thiện:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {group.latestImprovements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => router.push(`/cooking-diary/${group.recipeId}`)}
                    className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Xem lịch sử ({group.count})
                  </button>
                  <button
                    onClick={() => router.push(`/recipes/${group.recipeId}`)}
                    className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    📖
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
