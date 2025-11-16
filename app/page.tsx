'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer, LoadingSpinner, GradientButton } from '@/components/ui';

export default function WelcomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner color="border-orange-600" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                <span className="text-6xl">🍳</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xl">✨</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent animate-gradient">
              Mom's Flavor
            </h1>
            <p className="text-gray-700 text-xl md:text-2xl mb-4 font-medium">
              Nơi lưu giữ hương vị gia đình
            </p>
            <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
              Ghi lại công thức, chia sẻ kỷ niệm và khám phá niềm vui nấu ăn mỗi ngày
            </p>
          </div>

          {/* Features Preview Cards */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📔</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Nhật ký nấu ăn</h3>
                <p className="text-sm text-gray-600">Lưu lại từng khoảnh khắc đáng nhớ</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">AI thông minh</h3>
                <p className="text-sm text-gray-600">Gợi ý món ăn phù hợp với bạn</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Quản lý công thức</h3>
                <p className="text-sm text-gray-600">Tổ chức và tìm kiếm dễ dàng</p>
              </div>
            </div>
          )}

          {/* User Actions */}
          {user ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-100 shadow-xl max-w-md mx-auto">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Xin chào,</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {user.name} 👋
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <GradientButton
                  onClick={() => router.push('/home')}
                  fullWidth={true}
                  size="lg"
                >
                  🏠 Vào trang chủ
                </GradientButton>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-100 shadow-xl max-w-md mx-auto">
              <p className="text-gray-700 mb-6 text-lg font-medium">
                Bắt đầu hành trình khám phá ẩm thực của bạn
              </p>
              <div className="flex flex-col gap-3">
                <GradientButton
                  onClick={() => router.push('/auth/login')}
                  fullWidth={true}
                  size="lg"
                >
                  🚀 Đăng nhập
                </GradientButton>
                <GradientButton
                  onClick={() => router.push('/auth/register')}
                  gradient="from-green-600 to-emerald-600"
                  fullWidth={true}
                  size="lg"
                >
                  🎉 Đăng ký ngay
                </GradientButton>
              </div>
              <p className="text-xs text-gray-500 mt-6">
                Miễn phí sử dụng • Không giới hạn công thức
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-gray-500 text-sm">
            <p>Made with ❤️ for home cooks everywhere</p>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
