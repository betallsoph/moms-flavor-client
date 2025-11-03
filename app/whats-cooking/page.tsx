'use client';

import { useRouter } from 'next/navigation';

export default function WhatsCookingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Back Button */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">Quay lại</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hôm nay nấu gì?
              </h1>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-6xl">🎯</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Gợi ý hôm nay
            </h2>
            
            <p className="text-gray-600 text-center text-lg mb-12">
              Tính năng gợi ý công thức hàng ngày sẽ sớm có mặt. 
              Hãy quay lại sau để khám phá các món ăn tuyệt vời!
            </p>
            <p className="text-xs text-gray-400 text-center">Chỗ này áp dụng Naver AiTEMS vô được nè</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Feature Card 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="font-semibold text-gray-900 mb-2">Gợi ý ngẫu nhiên</h3>
                <p className="text-sm text-gray-600">
                  Tìm kiếm cảm hứng từ các công thức được chọn ngẫu nhiên
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                <div className="text-3xl mb-3">🌶️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Lọc theo mức độ cay</h3>
                <p className="text-sm text-gray-600">
                  Chọn công thức phù hợp với khẩu vị của bạn
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Nấu nhanh</h3>
                <p className="text-sm text-gray-600">
                  Tìm những công thức có thể hoàn thành trong 30 phút
                </p>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
