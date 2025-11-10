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

interface GroupedEntries {
  [monthYear: string]: CookingEntry[];
}

type TabType = 'by-recipe' | 'timeline';

export default function CookingDiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('by-recipe');

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

  // Group entries by recipeId for "By Recipe" tab
  const groupedByRecipe = entries.reduce((acc, entry) => {
    if (!acc[entry.recipeId]) {
      acc[entry.recipeId] = [];
    }
    acc[entry.recipeId].push(entry);
    return acc;
  }, {} as Record<string, CookingEntry[]>);

  const recipeGroups = Object.entries(groupedByRecipe).map(([recipeId, entries]) => ({
    recipeId,
    dishName: entries[0].dishName,
    count: entries.length,
    latestEntry: entries[0],
  })).sort((a, b) => 
    new Date(b.latestEntry.timestamp).getTime() - new Date(a.latestEntry.timestamp).getTime()
  );

  // Group entries by month/year for "Timeline" tab
  const groupEntriesByMonth = (): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.cookDate);
      const monthYear = date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(entry);
    });
    
    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const groupedByMonth = groupEntriesByMonth();
  const monthKeys = Object.keys(groupedByMonth);

  return (
    <PageContainer>
      <PageHeader
        icon="📔"
        title="Nhật ký nấu & Kỷ niệm"
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
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
          <>
            {/* Tabs */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setActiveTab('by-recipe')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'by-recipe'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📚</span>
                  <span>Theo món ăn</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Timeline</span>
                </span>
              </button>
            </div>

            {/* By Recipe Tab */}
            {activeTab === 'by-recipe' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipeGroups.map((group) => (
                  <div
                    key={group.recipeId}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg border border-purple-100 hover:border-purple-300 overflow-hidden transition-all group"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {group.dishName}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span>📅</span>
                          <span className="text-sm">Lần gần nhất: {group.latestEntry.cookDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🍳</span>
                          <span className="text-sm font-semibold text-purple-600">
                            Đã nấu {group.count} lần
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/cooking-diary/${group.recipeId}`)}
                        className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Xem lịch sử nấu ({group.count})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-12">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Hành trình nấu ăn của bạn
                  </h2>
                  <p className="text-gray-600">
                    {entries.length} món đã nấu
                  </p>
                </div>

                {/* Timeline by Month */}
                {monthKeys.map((monthYear) => {
                  const monthEntries = groupedByMonth[monthYear];
                  
                  return (
                    <div key={monthYear} className="relative">
                      {/* Month Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-6 rounded-full shadow-md">
                          {monthYear}
                        </div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-200 to-transparent"></div>
                      </div>

                      {/* Horizontal Scrollable Timeline */}
                      <div className="relative">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                          {monthEntries.map((entry) => (
                            <button
                              key={entry.id}
                              onClick={() => router.push(`/cooking-diary/entry/${entry.id}`)}
                              className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-xl border-2 border-purple-100 hover:border-purple-300 transition-all p-4 text-left group"
                            >
                              {/* Story Card */}
                              <div className="space-y-3">
                                {/* Image or Icon */}
                                <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden">
                                  {entry.images && entry.images.length > 0 ? (
                                    <img 
                                      src={entry.images[0]} 
                                      alt={entry.dishName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-5xl">🍳</span>
                                  )}
                                </div>

                                {/* Dish Name */}
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                                  {entry.dishName}
                                </h3>

                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>📅</span>
                                  <span>{formatDate(entry.cookDate)}</span>
                                </div>

                                {/* Quick Info */}
                                <div className="flex gap-2 flex-wrap">
                                  {entry.mistakes && entry.mistakes.trim() && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                      📝 Ghi chú
                                    </span>
                                  )}
                                  {entry.images && entry.images.length > 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                      📸 {entry.images.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </PageContainer>
  );
}
