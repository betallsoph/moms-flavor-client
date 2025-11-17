'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';
import Image from 'next/image';

const staticStickers = [
  // Top row - more spread out
  { src: '/assets/sticker1/bánh bao thịt trứng.png', delay: 0.8, x: 2, y: 8 },
  { src: '/assets/sticker1/bò chiên lá lốt.png', delay: 1.5, x: 15, y: 4 },
  { src: '/assets/sticker1/bún bò.png', delay: 0.3, x: 28, y: 10 },
  { src: '/assets/sticker1/canh chua.png', delay: 2.1, x: 42, y: 5 },
  { src: '/assets/sticker1/cá chiên.png', delay: 0.6, x: 55, y: 8 },
  { src: '/assets/sticker1/bò lúc lắc.png', delay: 1.8, x: 68, y: 6 },
  { src: '/assets/sticker1/bún bò.png', delay: 1.2, x: 81, y: 9 },
  { src: '/assets/sticker1/canh khổ qua nhồi thịt.png', delay: 0.9, x: 92, y: 7 },

  // Bottom row - more spread out
  { src: '/assets/sticker1/cơm tấm sườn bì chả.png', delay: 0.5, x: 2, y: 76 },
  { src: '/assets/sticker1/canh gà nấm hương.png', delay: 1.9, x: 14, y: 79 },
  { src: '/assets/sticker1/cánh gà chiên mắm.png', delay: 1.1, x: 26, y: 75 },
  { src: '/assets/sticker1/gan xào hành.png', delay: 2.3, x: 38, y: 77 },
  { src: '/assets/sticker1/canh chua.png', delay: 0.4, x: 50, y: 78 },
  { src: '/assets/sticker1/bò chiên lá lốt.png', delay: 1.3, x: 62, y: 76 },
  { src: '/assets/sticker1/càng cua chiên xù.png', delay: 1.6, x: 74, y: 77 },
  { src: '/assets/sticker1/cá nục xốt cà.png', delay: 0.7, x: 86, y: 79 },
];

export default function WelcomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner color="border-blue-600" />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
      {/* Static Stickers - Pop in randomly */}
      {staticStickers.map((sticker, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            animation: `popIn 0.5s ease-out ${sticker.delay}s forwards`,
            opacity: 0,
          }}
        >
          <Image
            src={sticker.src}
            alt="food sticker"
            width={150}
            height={150}
            className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-2xl"
          />
        </div>
      ))}

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6">
        {user ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 shadow-md">
              <p className="text-gray-700 text-lg">
                Xin chào, <span className="font-bold text-orange-600">{user.name}</span>! 👋
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/home')}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                🏠 Vào trang chủ
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/assets/logo/logo8.png"
                alt="Mom's Flavor Logo"
                width={800}
                height={800}
                className="w-80 h-80 md:w-[36rem] md:h-[36rem] object-contain drop-shadow-2xl"
              />
            </div>

            {/* Buttons Column */}
            <div className="flex flex-col gap-4 justify-center -mt-12">
              {/* Login Button */}
              <button
                onClick={() => router.push('/auth/login')}
                className="group px-10 py-5 bg-orange-400 text-white font-semibold rounded-2xl hover:bg-white/40 hover:backdrop-blur-md hover:text-orange-800 hover:scale-105 transition-all border-[3px] border-orange-400"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Image
                      src="/assets/sticker1/bún bò.png"
                      alt="login"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-lg whitespace-nowrap">Đăng nhập</div>
                </div>
              </button>

              {/* Register Button */}
              <button
                onClick={() => router.push('/auth/register')}
                className="group px-10 py-5 bg-white/40 backdrop-blur-md text-orange-800 font-semibold rounded-2xl hover:bg-orange-400 hover:text-white hover:scale-105 transition-all border-[3px] border-orange-400"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Image
                      src="/assets/sticker1/cơm tấm sườn bì chả.png"
                      alt="register"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-lg whitespace-nowrap">Đăng ký</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          60% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
