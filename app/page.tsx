'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner, GradientButton } from '@/components/ui';

export default function WelcomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner color="border-blue-600" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <main className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">🍳</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Mom's Flavor
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Chào mừng đến với ứng dụng công thức nấu ăn
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-gray-700 mb-6">
              Xin chào, <span className="font-semibold text-orange-600">{user.name}</span>! 👋
            </p>
            <div className="flex gap-4 justify-center">
              <GradientButton onClick={() => router.push('/home')}>
                Vào trang chủ
              </GradientButton>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="px-6 py-3 bg-white border-2 border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <GradientButton onClick={() => router.push('/auth/login')}>
              Đăng nhập
            </GradientButton>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Đăng ký
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
