'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer, PageHeader, LoadingSpinner, ActionCard } from '@/components/ui';

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return <LoadingSpinner color="border-blue-600" />;
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        icon="🏠"
        title="Trang chủ"
        rightContent={
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-right hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Top Row - Diary & What to Cook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActionCard
            onClick={() => router.push('/cooking-diary')}
            icon="📔"
            decorIcon="✨"
            title="Nhật ký & Kỷ niệm"
            description="Xem lại hành trình nấu ăn của bạn"
            borderColor="border-purple-200 hover:border-purple-400"
            bgColor="from-purple-100 to-pink-100"
          />

          <ActionCard
            onClick={() => router.push('/whats-cooking')}
            icon="👨‍🍳"
            decorIcon="🎯"
            title="Hôm nay nấu gì?"
            description="Gợi ý món ăn phù hợp với bạn"
            borderColor="border-orange-200 hover:border-orange-400"
            bgColor="from-orange-100 to-amber-100"
          />
        </div>

        {/* Bottom Row - Shopping & Recipes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActionCard
            onClick={() => router.push('/recipes')}
            icon="📚"
            decorIcon="🔍"
            title="Danh sách công thức"
            description="Khám phá và quản lý các công thức của bạn"
            borderColor="border-green-200 hover:border-green-400"
            bgColor="from-green-100 to-emerald-100"
          />
          <ActionCard
            onClick={() => router.push('/shopping-assistant')}
            icon="🛒"
            decorIcon="🧺"
            title="Trợ lý đi chợ"
            description="Lập danh sách mua sắm thông minh"
            borderColor="border-blue-200 hover:border-blue-400"
            bgColor="from-blue-100 to-cyan-100"
          />
        </div>
      </main>
    </PageContainer>
  );
}
