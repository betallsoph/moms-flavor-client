'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer, PageHeader, LoadingSpinner, ActionCard } from '@/components/ui';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner color="border-blue-600" />;
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      {/* Floating User Menu */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => router.push('/profile')}
          className="text-right hover:bg-white/90 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl transition-all shadow-sm border border-gray-200"
        >
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <Image
            src="/assets/logo/logo8.png"
            alt="Mom's Flavor Logo"
            width={270}
            height={270}
            className="object-contain"
          />
        </div>

        {/* Top Row - Diary & What to Cook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActionCard
            onClick={() => router.push('/cooking-diary')}
            imageSrc="/assets/sticker2/cháo thập cẩm.png"
            title="Nhật ký & Kỷ niệm"
            description="Xem lại hành trình nấu ăn của bạn"
            borderColor="border-purple-200 hover:border-purple-400"
            bgColor="from-purple-100 to-pink-100"
          />

          <ActionCard
            onClick={() => router.push('/whats-cooking')}
            imageSrc="/assets/sticker2/gà kho xã ớt.png"
            title="Hôm nay nấu gì?"
            description="Gợi ý ngẫu nhiên món ăn"
            borderColor="border-orange-200 hover:border-orange-400"
            bgColor="from-orange-100 to-amber-100"
          />
        </div>

        {/* Bottom Row - Shopping & Recipes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActionCard
            onClick={() => router.push('/recipes')}
            imageSrc="/assets/sticker2/phở bò.png"
            title="Danh sách công thức"
            description="Khám phá và quản lý các công thức của bạn"
            borderColor="border-green-200 hover:border-green-400"
            bgColor="from-green-100 to-emerald-100"
          />
          <ActionCard
            onClick={() => router.push('/shopping-assistant')}
            imageSrc="/assets/sticker2/rau muống xào tỏi.png"
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
