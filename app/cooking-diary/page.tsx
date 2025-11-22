'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface GroupedEntries {
  [monthYear: string]: CookingEntry[];
}

type TabType = 'by-recipe' | 'timeline';

const STICKER_IMAGES = [
  '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_34 PM.png',
  '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_37 PM.png',
  '/assets/sticker1/ChatGPT Image Nov 4, 2025, 10_24_54 PM.png',
  '/assets/sticker1/canh chua.png',
  '/assets/sticker2/ChatGPT Image Nov 4, 2025, 09_34_35 PM.png',
  '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_27_58 PM.png',
  '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_42_08 PM.png',
  '/assets/sticker2/tobboki.png',
  '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_35_51 PM.png',
  '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_42_01 PM.png',
  '/assets/sticker3/ChatGPT Image Nov 4, 2025, 09_34_31 PM.png',
  '/assets/sticker3/ChatGPT Image Nov 4, 2025, 10_24_56 PM.png',
];

const getStickerSrc = (seed: string, offset = 0) => {
  if (!STICKER_IMAGES.length) return '';
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash + offset) % STICKER_IMAGES.length;
  return encodeURI(STICKER_IMAGES[index]);
};

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Nhật ký nấu & Kỷ niệm
            </h1>
            <p className="text-base text-gray-600">
              Xem lại hành trình nấu ăn của bạn
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Đang tải nhật ký..." />
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-5xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chưa có lịch sử nấu nào
              </h3>
              <p className="text-gray-600 mb-8">
                Hãy nấu một món ăn và ghi lại kinh nghiệm của bạn!
              </p>
              <button
                onClick={() => router.push('/recipes')}
                className="px-8 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-purple-700"
              >
                Xem danh sách công thức
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('by-recipe')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'by-recipe'
                      ? 'bg-purple-100 border-2 border-purple-300 text-purple-700'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Theo món ăn
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-purple-100 border-2 border-purple-300 text-purple-700'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Timeline
                </button>
              </div>

            {/* By Recipe Tab */}
            {activeTab === 'by-recipe' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipeGroups.map((group) => (
                  <div
                    key={group.recipeId}
                    className="bg-white rounded-2xl shadow-md border-2 border-purple-200 overflow-hidden transition-all duration-300 group hover:border-purple-400 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-6 border-b border-purple-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {group.dishName}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm font-semibold text-gray-700">Lần gần nhất:</span>
                          <span className="text-sm">{group.latestEntry.cookDate}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          Đã nấu {group.count} lần
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/cooking-diary/${group.recipeId}`)}
                        className="w-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200 font-bold py-3 rounded-xl hover:shadow-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-300 hover:scale-105"
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
                        <div className="bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 font-bold py-2 px-6 rounded-full shadow-md border-2 border-purple-300">
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
                              className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 p-4 text-left group hover:scale-[1.03]"
                            >
                              {/* Story Card */}
                              <div className="space-y-3">
                                {/* Image or Icon */}
                                <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                                  {entry.images && entry.images.length > 0 ? (
                                    <img
                                      src={entry.images[0]}
                                      alt={entry.dishName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={getStickerSrc(entry.id)}
                                      alt="Cooking sticker"
                                      className="w-20 h-20 object-contain opacity-90"
                                    />
                                  )}
                                </div>

                                {/* Dish Name */}
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-2 transition-colors">
                                  {entry.dishName}
                                </h3>

                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-semibold text-gray-700">Ngày nấu:</span>
                                  <span>{formatDate(entry.cookDate)}</span>
                                </div>

                                {/* Quick Info */}
                                <div className="flex gap-2 flex-wrap">
                                  {entry.mistakes && entry.mistakes.trim() && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                                      Có ghi chú
                                    </span>
                                  )}
                                  {entry.images && entry.images.length > 0 && (
                                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full border border-pink-200">
                                      {entry.images.length} ảnh
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
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    </div>
  );
}
